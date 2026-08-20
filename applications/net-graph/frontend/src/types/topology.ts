import type { NetGraphNode, NetGraphEdge } from './graph';

export interface TopologyData {
    nodes: NetGraphNode[];
    edges: NetGraphEdge[];
    nicknames: Record<string, string>;
}