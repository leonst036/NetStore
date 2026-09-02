import { useState, useEffect, useCallback } from 'react';
import type { DiscoveredDevice } from '../types/device';
import { fetchDiscoveredDevices } from '../api/scanApi';
import { sendNotification } from '../bridge/netlinkBridge';

export function useNetworkScan(ticket: string) {
    const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-detect default subnet from window location if IP
    const defaultCidr = (() => {
        try {
            const host = window.location.hostname;
            const match = host.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/);
            if (match) {
                return `${match[1]}.${match[2]}.${match[3]}.0/24`;
            }
        } catch {}
        return '192.168.55.0/24';
    })();

    const [cidr, setCidr] = useState<string>(() => {
        return localStorage.getItem('netgraph_scan_cidr') || defaultCidr;
    });

    const scan = useCallback(async (refresh: boolean = false, targetCidr?: string) => {
        setIsScanning(true);
        setError(null);
        const effectiveCidr = targetCidr !== undefined ? targetCidr : cidr;
        if (effectiveCidr) {
            try {
                localStorage.setItem('netgraph_scan_cidr', effectiveCidr);
            } catch {}
        }
        try {
            const result = await fetchDiscoveredDevices(ticket, refresh, effectiveCidr);
            setDevices(result || []);
        } catch (err: any) {
            const message = err?.message || 'Failed to scan network';
            setError(message);
            console.error('Network scan failed:', err);
            sendNotification(message, 'error');
        } finally {
            setIsScanning(false);
        }
    }, [ticket, cidr]);

    useEffect(() => {
        scan(false);
    }, [scan]);

    return {
        devices,
        isScanning,
        error,
        scan,
        cidr,
        setCidr,
    };
}
