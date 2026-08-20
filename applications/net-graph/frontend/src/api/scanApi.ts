import { apiRequest } from './client';
import type { DiscoveredDevice } from '../types/device';

export async function fetchDiscoveredDevices(ticket: string, refresh: boolean = false): Promise<DiscoveredDevice[]> {
    const endpoint = refresh ? '/api/net-graph/scan?refresh=true' : '/api/net-graph/scan';
    return await apiRequest<DiscoveredDevice[]>(ticket, endpoint);
}