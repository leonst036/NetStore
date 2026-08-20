import type { NodeTypes } from '@xyflow/react';
import { DeviceNode } from './DeviceNode';
import { SwitchNode } from './SwitchNode';
import { GatewayNode } from './GatewayNode';
import { RelayNode } from './RelayNode';

export const nodeTypes: NodeTypes = {
    device: DeviceNode,
    switch: SwitchNode,
    gateway: GatewayNode,
    relay: RelayNode,
};

export { DeviceNode, SwitchNode, GatewayNode, RelayNode };
