import { apiRequest } from './client';
import type { TopologyData } from '../types/topology';

export async function fetchTopology(ticket: string): Promise<TopologyData> {
    return await apiRequest<TopologyData>(ticket, '/api/net-graph/topology');
}

export async function saveTopology(ticket: string, topology: TopologyData): Promise<{ success: boolean }> {
    return await apiRequest<{ success: boolean }>(ticket, '/api/net-graph/topology', {
        method: 'POST',
        body: topology,
    });
}