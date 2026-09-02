function getEnvSafe(key: string): string | undefined {
    try {
        return Deno.env.get(key);
    } catch {
        return undefined;
    }
}

const port = parseInt(getEnvSafe("PORT") || "8000");
const dataFile = new URL('./topology.json', import.meta.url).pathname;

export interface Device {
    ip: string;
    hostname?: string;
}

let cachedDevices: Device[] = [];
let scanPromise: Promise<Device[]> | null = null;

async function readTopology() {
    try {
        const text = await Deno.readTextFile(dataFile);
        return JSON.parse(text);
    } catch {
        return { nodes: [], edges: [], nicknames: {} };
    }
}

async function writeTopology(data: any) {
    try {
        await Deno.writeTextFile(dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("[relay] Error writing topology file:", error);
    }
}

function ipToLong(ip: string): number {
    return ip.split('.').reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

function longToIp(long: number): string {
    return [
        (long >>> 24) & 255,
        (long >>> 16) & 255,
        (long >>> 8) & 255,
        long & 255
    ].join('.');
}

function parseCidr(cidr: string): { startLong: number; endLong: number } | null {
    try {
        const [ip, bitsStr] = cidr.trim().split('/');
        const bits = parseInt(bitsStr, 10);
        if (isNaN(bits) || bits < 0 || bits > 32) return null;
        const maskLong = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
        const ipLong = ipToLong(ip);
        const networkLong = (ipLong & maskLong) >>> 0;
        const broadcastLong = (networkLong | (~maskLong >>> 0)) >>> 0;
        return {
            startLong: networkLong + 1,
            endLong: broadcastLong - 1
        };
    } catch {
        return null;
    }
}

async function getNetworkViaShell(): Promise<string | null> {
    try {
        const cmd = new Deno.Command("sh", {
            args: ["-c", "ip -4 -o addr show scope global || ip route show default"],
            stdout: "piped",
            stderr: "null",
        });
        const { stdout, code } = await cmd.output();
        if (code === 0) {
            const output = new TextDecoder().decode(stdout);
            for (const line of output.split("\n")) {
                if (line.includes("docker") || line.includes("veth") || line.includes("br-") || line.includes("virbr")) continue;
                const match = line.match(/inet\s+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\/[0-9]+)/);
                if (match) return match[1];
            }
        }
    } catch {
        // Fallback
    }
    return null;
}

async function getLocalNetworkRange(customCidr?: string | null, reqHeaders?: Headers): Promise<{ startLong: number; endLong: number } | null> {
    if (customCidr) {
        const range = parseCidr(customCidr);
        if (range) return range;
    }

    const scanCidr = getEnvSafe("SCAN_CIDR");
    if (scanCidr) {
        const range = parseCidr(scanCidr);
        if (range) return range;
    }

    if (reqHeaders) {
        const hostHeader = reqHeaders.get("host") || reqHeaders.get("x-forwarded-host") || "";
        const hostMatch = hostHeader.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
        if (hostMatch) {
            const hostIp = `${hostMatch[1]}.${hostMatch[2]}.${hostMatch[3]}.${hostMatch[4]}`;
            if (!hostIp.startsWith("127.")) {
                const range = parseCidr(`${hostMatch[1]}.${hostMatch[2]}.${hostMatch[3]}.0/24`);
                if (range) return range;
            }
        }
    }

    const shellCidr = await getNetworkViaShell();
    if (shellCidr) {
        const range = parseCidr(shellCidr);
        if (range) return range;
    }

    try {
        const interfaces = (Deno as any).networkInterfaces?.();
        if (Array.isArray(interfaces)) {
            for (const netInfo of interfaces) {
                if (
                    netInfo.family === "IPv4" &&
                    !netInfo.address.startsWith("127.") &&
                    !netInfo.name.startsWith("docker") &&
                    !netInfo.name.startsWith("veth") &&
                    !netInfo.name.startsWith("br-")
                ) {
                    const ipLong = ipToLong(netInfo.address);
                    const mask = netInfo.netmask || "255.255.255.0";
                    const maskLong = ipToLong(mask);
                    const networkLong = (ipLong & maskLong) >>> 0;
                    const broadcastLong = (networkLong | (~maskLong >>> 0)) >>> 0;
                    return {
                        startLong: networkLong + 1,
                        endLong: broadcastLong - 1
                    };
                }
            }
        }
    } catch {
        // Fallback
    }

    return parseCidr("192.168.55.0/24");
}

function ipToInAddrArpa(ip: string): string {
    return ip.split('.').reverse().join('.') + '.in-addr.arpa';
}

async function reverseDns(ip: string): Promise<string | undefined> {
    try {
        const arpa = ipToInAddrArpa(ip);
        const hostnames = await Deno.resolveDns(arpa, "PTR");
        if (hostnames && hostnames.length > 0) {
            return hostnames[0].replace(/\.$/, "");
        }
    } catch {
        // Ignore PTR failure
    }
    return undefined;
}

async function pingHost(ip: string): Promise<boolean> {
    try {
        const cmd = new Deno.Command("ping", {
            args: ["-c", "1", "-W", "1", ip],
            stdout: "null",
            stderr: "null",
        });
        const { code } = await cmd.output();
        return code === 0;
    } catch {
        return false;
    }
}

async function checkTcp(ip: string, port: number, timeoutMs = 250): Promise<boolean> {
    try {
        const connPromise = Deno.connect({ hostname: ip, port });
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeoutMs)
        );
        const conn = await Promise.race([connPromise, timeoutPromise]);
        conn.close();
        return true;
    } catch {
        return false;
    }
}

async function isHostAlive(ip: string): Promise<boolean> {
    if (await pingHost(ip)) return true;
    const commonPorts = [80, 443, 22, 53, 445, 4535, 8080, 5000, 3389];
    const checks = commonPorts.map(p => checkTcp(ip, p, 250));
    const results = await Promise.all(checks);
    return results.some(Boolean);
}

async function scanDevice(ip: string): Promise<Device | null> {
    const isAlive = await isHostAlive(ip);
    if (isAlive) {
        const hostname = await reverseDns(ip);
        return { ip, hostname };
    }
    return null;
}

async function runNetworkScan(cidr?: string | null, reqHeaders?: Headers): Promise<Device[]> {
    const range = await getLocalNetworkRange(cidr, reqHeaders);
    if (!range || range.startLong > range.endLong) {
        return [];
    }

    const maxIps = 512;
    const count = Math.min(range.endLong - range.startLong + 1, maxIps);

    const ips: string[] = [];
    for (let i = 0; i < count; i++) {
        ips.push(longToIp(range.startLong + i));
    }

    const concurrencyLimit = 35;
    const foundDevices: Device[] = [];
    let ipIndex = 0;

    async function worker() {
        while (ipIndex < ips.length) {
            const ip = ips[ipIndex++];
            if (ip !== undefined) {
                const device = await scanDevice(ip);
                if (device) {
                    foundDevices.push(device);
                }
            }
        }
    }

    const numWorkers = Math.min(concurrencyLimit, ips.length);
    const workers = Array.from({ length: numWorkers }, () => worker());
    await Promise.all(workers);

    foundDevices.sort((a, b) => ipToLong(a.ip) - ipToLong(b.ip));
    return foundDevices;
}

async function syncMagicDns(nodes?: any[], nicknames?: Record<string, string>, scannedDevices?: Device[]) {
    const relayHost = getEnvSafe("RELAY_HOST") || "127.0.0.1";
    const relayHttpPort = getEnvSafe("HTTP_PORT") || getEnvSafe("RELAY_PORT") || "4535";
    const dnsUrl = `http://${relayHost}:${relayHttpPort}/api/dns/records`;

    const ipMap = new Map<string, { ip: string; hostname?: string; nickname?: string }>();

    if (Array.isArray(nodes)) {
        for (const n of nodes) {
            const nodeData = n.data || {};
            const ip = nodeData.ip || (n.type === 'device' ? n.id : null);
            if (!ip || typeof ip !== 'string' || !ip.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/)) continue;

            const hostname = nodeData.hostname;
            const nickname = (nicknames && (nicknames[n.id] || nicknames[ip])) || nodeData.nickname;

            if (hostname || nickname) {
                ipMap.set(ip, {
                    ip,
                    hostname: hostname || undefined,
                    nickname: nickname || undefined,
                });
            }
        }
    }

    if (nicknames && typeof nicknames === 'object') {
        for (const [ip, nick] of Object.entries(nicknames)) {
            if (typeof ip !== 'string' || !ip.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/) || !nick) continue;
            const existing = ipMap.get(ip) || { ip };
            existing.nickname = nick;
            ipMap.set(ip, existing);
        }
    }

    if (Array.isArray(scannedDevices)) {
        for (const dev of scannedDevices) {
            if (!dev.ip || typeof dev.ip !== 'string') continue;
            const existing = ipMap.get(dev.ip) || { ip: dev.ip };
            if (dev.hostname && !existing.hostname) {
                existing.hostname = dev.hostname;
            }
            const nick = nicknames?.[dev.ip];
            if (nick && !existing.nickname) {
                existing.nickname = nick;
            }
            if (existing.hostname || existing.nickname) {
                ipMap.set(dev.ip, existing);
            }
        }
    }

    const recordsToRegister = Array.from(ipMap.values());
    if (recordsToRegister.length === 0) return;

    try {
        const res = await fetch(dnsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recordsToRegister),
        });
        if (res.ok) {
            const data = await res.json();
            console.log(`[relay] Synced ${recordsToRegister.length} devices with MagicDNS:`, data);
        } else {
            console.warn(`[relay] MagicDNS sync returned status ${res.status}`);
        }
    } catch (err: any) {
        console.warn(`[relay] MagicDNS sync notice: ${err.message}`);
    }
}

function triggerScan(force: boolean = false, cidr?: string | null, reqHeaders?: Headers): Promise<Device[]> {
    if (scanPromise && !force) {
        return scanPromise;
    }
    scanPromise = (async () => {
        try {
            console.log("[relay] Performing network discovery scan...");
            const devices = await runNetworkScan(cidr, reqHeaders);
            cachedDevices = devices;
            console.log(`[relay] Scan completed. Discovered ${devices.length} devices.`);
            const topology = await readTopology();
            syncMagicDns(topology.nodes, topology.nicknames, devices);
            return devices;
        } catch (err) {
            console.error("[relay] Error during network scan:", err);
            return cachedDevices;
        } finally {
            scanPromise = null;
        }
    })();
    return scanPromise;
}

// Initial background scan and topology sync
readTopology().then((data) => {
    if (data && (data.nodes?.length > 0 || Object.keys(data.nicknames || {}).length > 0)) {
        syncMagicDns(data.nodes, data.nicknames);
    }
});
triggerScan();

console.log(`[relay] NetGraph Relay running on port ${port}...`);

Deno.serve({ port }, async (req) => {
    const url = new URL(req.url);
    console.log(`[relay] ${req.method} ${url.pathname}`);

    const headers = new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
    }

    if (
        url.pathname === "/api/net-graph/scan" ||
        url.pathname === "/api/net-graph/servers" ||
        url.pathname.endsWith("/scan") ||
        url.pathname.endsWith("/servers") ||
        url.pathname.includes("/scan") ||
        url.pathname.includes("/servers")
    ) {
        if (req.method === "GET") {
            try {
                const force = url.searchParams.get("refresh") === "true" || url.searchParams.get("force") === "true";
                const cidr = url.searchParams.get("cidr");
                let devices = cachedDevices;
                if (force || cidr) {
                    devices = await triggerScan(true, cidr, req.headers);
                } else if (cachedDevices.length === 0) {
                    devices = scanPromise ? await scanPromise : await triggerScan(false, null, req.headers);
                }
                return new Response(JSON.stringify(devices), { status: 200, headers });
            } catch (e: any) {
                return new Response(JSON.stringify({ error: "Failed to scan network", details: e.message }), { status: 500, headers });
            }
        }
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    }

    if (
        url.pathname === "/api/net-graph/topology" ||
        url.pathname.endsWith("/topology") ||
        url.pathname.includes("/topology")
    ) {
        try {
            if (req.method === "GET") {
                const data = await readTopology();
                return new Response(JSON.stringify(data), { status: 200, headers });
            }
            if (req.method === "POST") {
                const body = await req.json();
                const { nodes, edges, nicknames } = body;
                if (!nodes || !edges) {
                    return new Response(JSON.stringify({ error: "nodes and edges required" }), { status: 400, headers });
                }
                await writeTopology({ nodes, edges, nicknames: nicknames || {} });
                syncMagicDns(nodes, nicknames || {});
                return new Response(JSON.stringify({ success: true }), { status: 200, headers });
            }
            return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
        } catch (e: any) {
            return new Response(JSON.stringify({ error: "Internal error", details: e.message }), { status: 500, headers });
        }
    }

    return new Response("Not Found", { status: 404, headers });
});
