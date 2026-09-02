import { apiRequest } from './client';
import type { DiscoveredDevice } from '../types/device';

export async function fetchDiscoveredDevices(
    ticket: string,
    refresh: boolean = false,
    cidr?: string
): Promise<DiscoveredDevice[]> {
    const params = new URLSearchParams();
    if (refresh) params.set('refresh', 'true');
    if (cidr) params.set('cidr', cidr);
    const qs = params.toString();
    const endpoint = `/api/net-graph/scan${qs ? '?' + qs : ''}`;
    return await apiRequest<DiscoveredDevice[]>(ticket, endpoint);
}