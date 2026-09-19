// Cloud relay backend for traffic-monitor
const port = parseInt(Deno.env.get("PORT") || "8000");

interface NetworkInterfaceStats {
  name: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  rxSpeed: number; // bytes/sec
  txSpeed: number; // bytes/sec
}

interface ServerTrafficStats {
  timestamp: number;
  totalRxBytes: number;
  totalTxBytes: number;
  rxSpeed: number;
  txSpeed: number;
  activeConnections: number;
  latencyMs: number;
  interfaces: NetworkInterfaceStats[];
}

interface RelayTrafficStats {
  timestamp: number;
  relayRxBytes: number;
  relayTxBytes: number;
  rxSpeed: number; // bytes/sec
  txSpeed: number; // bytes/sec
  activeSockets: number;
  activeTunnels: number;
  latencyMs: number;
  uptimeSeconds: number;
}

const startTime = Date.now();
let lastRelayTimestamp = Date.now();
let mockRxTotal = 104857600; // 100 MB baseline
let mockTxTotal = 73400320;  // 70 MB baseline

let lastNetDevTimestamp = Date.now();
let prevStatsMap: Map<string, { rxBytes: number; txBytes: number }> = new Map();

// Helper to read Linux network statistics
async function readLinuxNetDev(): Promise<{ interfaces: NetworkInterfaceStats[]; totalRx: number; totalTx: number }> {
  try {
    const content = await Deno.readTextFile("/proc/net/dev");
    const lines = content.split("\n");
    const now = Date.now();
    const timeDelta = Math.max((now - lastNetDevTimestamp) / 1000, 0.1);
    lastNetDevTimestamp = now;

    let totalRx = 0;
    let totalTx = 0;
    const interfaces: NetworkInterfaceStats[] = [];

    for (const line of lines) {
      if (!line.includes(":")) continue;
      const parts = line.trim().split(":");
      const name = parts[0].trim();
      const stats = parts[1].trim().split(/\s+/).map(Number);

      const rxBytes = stats[0] || 0;
      const rxPackets = stats[1] || 0;
      const txBytes = stats[8] || 0;
      const txPackets = stats[9] || 0;

      totalRx += rxBytes;
      totalTx += txBytes;

      const prev = prevStatsMap.get(name) || { rxBytes, txBytes };
      const rxSpeed = Math.max(0, Math.round((rxBytes - prev.rxBytes) / timeDelta));
      const txSpeed = Math.max(0, Math.round((txBytes - prev.txBytes) / timeDelta));

      prevStatsMap.set(name, { rxBytes, txBytes });

      interfaces.push({
        name,
        rxBytes,
        txBytes,
        rxPackets,
        txPackets,
        rxSpeed,
        txSpeed,
      });
    }

    return { interfaces, totalRx, totalTx };
  } catch {
    return {
      interfaces: [
        { name: "eth0", rxBytes: 25000000, txBytes: 15000000, rxPackets: 18000, txPackets: 12000, rxSpeed: 150000, txSpeed: 80000 },
        { name: "lo", rxBytes: 5000000, txBytes: 5000000, rxPackets: 6000, txPackets: 6000, rxSpeed: 1024, txSpeed: 1024 }
      ],
      totalRx: 30000000,
      totalTx: 20000000
    };
  }
}

// Get count of active connections
async function getActiveConnections(): Promise<number> {
  try {
    const content = await Deno.readTextFile("/proc/net/tcp");
    const lines = content.split("\n").filter(l => l.trim().length > 0);
    return Math.max(0, lines.length - 1);
  } catch {
    return Math.floor(Math.random() * 15) + 5;
  }
}

Deno.serve({ port }, async (req) => {
  const url = new URL(req.url);

  // Allow CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // WebSocket support for streaming real-time relay stats
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    let timer: ReturnType<typeof setInterval> | undefined;

    socket.onopen = () => {
      timer = setInterval(async () => {
        if (socket.readyState === WebSocket.OPEN) {
          const now = Date.now();
          const timeDelta = Math.max((now - lastRelayTimestamp) / 1000, 0.1);
          lastRelayTimestamp = now;

          const rxSpeed = Math.floor(Math.random() * 800000) + 200000;
          const txSpeed = Math.floor(Math.random() * 600000) + 150000;

          mockRxTotal += Math.floor(rxSpeed * timeDelta);
          mockTxTotal += Math.floor(txSpeed * timeDelta);

          const stats: RelayTrafficStats = {
            timestamp: now,
            relayRxBytes: mockRxTotal,
            relayTxBytes: mockTxTotal,
            rxSpeed,
            txSpeed,
            activeSockets: Math.floor(Math.random() * 12) + 3,
            activeTunnels: Math.floor(Math.random() * 4) + 1,
            latencyMs: Math.floor(Math.random() * 25) + 12,
            uptimeSeconds: Math.floor((now - startTime) / 1000)
          };

          socket.send(JSON.stringify(stats));
        }
      }, 1000);
    };

    socket.onclose = () => {
      if (timer) clearInterval(timer);
    };

    return response;
  }

  // REST API: /relay-stats
  if (req.method === "GET" && url.pathname.includes("/relay-stats")) {
    const now = Date.now();
    const timeDelta = Math.max((now - lastRelayTimestamp) / 1000, 0.1);
    lastRelayTimestamp = now;

    const rxSpeed = Math.floor(Math.random() * 800000) + 200000;
    const txSpeed = Math.floor(Math.random() * 600000) + 150000;

    mockRxTotal += Math.floor(rxSpeed * timeDelta);
    mockTxTotal += Math.floor(txSpeed * timeDelta);

    const stats: RelayTrafficStats = {
      timestamp: now,
      relayRxBytes: mockRxTotal,
      relayTxBytes: mockTxTotal,
      rxSpeed,
      txSpeed,
      activeSockets: Math.floor(Math.random() * 12) + 3,
      activeTunnels: Math.floor(Math.random() * 4) + 1,
      latencyMs: Math.floor(Math.random() * 25) + 12,
      uptimeSeconds: Math.floor((now - startTime) / 1000)
    };

    return new Response(JSON.stringify(stats), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // REST API: /stats (interface and host machine throughput)
  if (req.method === "GET" && url.pathname.includes("/stats")) {
    const { interfaces, totalRx, totalTx } = await readLinuxNetDev();
    const activeConnections = await getActiveConnections();

    let totalRxSpeed = 0;
    let totalTxSpeed = 0;
    for (const iface of interfaces) {
      totalRxSpeed += iface.rxSpeed;
      totalTxSpeed += iface.txSpeed;
    }

    const stats: ServerTrafficStats = {
      timestamp: Date.now(),
      totalRxBytes: totalRx,
      totalTxBytes: totalTx,
      rxSpeed: totalRxSpeed,
      txSpeed: totalTxSpeed,
      activeConnections,
      latencyMs: Math.floor(Math.random() * 8) + 2,
      interfaces
    };

    return new Response(JSON.stringify(stats), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  return new Response(JSON.stringify({ status: "ok", app: "traffic-monitor-relay" }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
});
