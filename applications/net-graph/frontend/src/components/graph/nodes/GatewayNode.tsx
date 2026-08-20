import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Shield } from 'lucide-react';
import type { GatewayNodeData } from '../../../types/graph';

export const GatewayNode = memo(({ data, selected }: NodeProps<Node<GatewayNodeData, 'gateway'>>) => {
    const displayName = data?.label || 'NAT / Gateway';
    const ip = data?.ip;

    return (
        <div className={`net-node-gateway ${selected ? 'selected' : ''}`}>
            {/* React Flow Handles */}
            <Handle type="target" position={Position.Top} className="net-node-handle" />
            <Handle type="source" position={Position.Bottom} className="net-node-handle" />
            <Handle type="target" position={Position.Left} id="left" className="net-node-handle" />
            <Handle type="source" position={Position.Right} id="right" className="net-node-handle" />

            {/* Node Content */}
            <div className="net-node-content">
                <div className="net-node-icon">
                    <Shield size={18} />
                </div>
                <div className="net-node-info">
                    <div className="net-node-title">{displayName}</div>
                    {ip && <div className="net-node-subtitle">{ip}</div>}
                </div>
            </div>
        </div>
    );
});

GatewayNode.displayName = 'GatewayNode';
