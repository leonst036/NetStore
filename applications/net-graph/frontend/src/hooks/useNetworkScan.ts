import { useState, useEffect, useCallback } from 'react';
import type { DiscoveredDevice } from '../types/device';
import { fetchDiscoveredDevices } from '../api/scanApi';
import { sendNotification } from '../bridge/netlinkBridge';

export function useNetworkScan(ticket: string) {
    const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scan = useCallback(async (refresh: boolean = false) => {
        setIsScanning(true);
        setError(null);
        try {
            const result = await fetchDiscoveredDevices(ticket, refresh);
            setDevices(result || []);
        } catch (err: any) {
            const message = err?.message || 'Failed to scan network';
            setError(message);
            console.error('Network scan failed:', err);
            sendNotification(message, 'error');
        } finally {
            setIsScanning(false);
        }
    }, [ticket]);

    useEffect(() => {
        scan(false);
    }, [scan]);

    return {
        devices,
        isScanning,
        error,
        scan,
    };
}
