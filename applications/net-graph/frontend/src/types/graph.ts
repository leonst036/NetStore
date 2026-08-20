import type { Node, Edge } from '@xyflow/react';

export type NetNodeType = 'device' | 'switch' | 'gateway' | 'relay';

export type DeviceNodeData = {
    ip: string;
    hostname?: string;
    nickname?: string;
    label: string;
    onOpenActions?: (ip: string) => void;
};

export type SwitchNodeData = {
    label: string;
    portCount?: number;
};

export type GatewayNodeData = {
    label: string;
    ip?: string;
};

export type RelayNodeData = {
    label: string;
};

export type NetGraphNode =
    | Node<DeviceNodeData, 'device'>
    | Node<SwitchNodeData, 'switch'>
    | Node<GatewayNodeData, 'gateway'>
    | Node<RelayNodeData, 'relay'>;

export type NetGraphEdge = Edge;