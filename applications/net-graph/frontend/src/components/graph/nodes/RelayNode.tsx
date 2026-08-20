import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Network } from 'lucide-react';
import type { RelayNodeData } from '../../../types/graph';

export const RelayNode = memo(({ data, selected }: NodeProps<Node<RelayNodeData, 'relay'>>) => {
    const displayName = data?.label || 'Relay Server';

    return (
        <div className={`net-node-relay ${selected ? 'selected' : ''}`}>
            {/* React Flow Handles */}
            <Handle type="target" position={Position.Top} className="net-node-handle" />
            <Handle type="source" position={Position.Bottom} className="net-node-handle" />
            <Handle type="target" position={Position.Left} id="left" className="net-node-handle" />
            <Handle type="source" position={Position.Right} id="right" className="net-node-handle" />

            {/* Node Content */}
            <div className="net-node-content">
                <div className="net-node-icon">
                    <Network size={18} />
                </div>
                <div className="net-node-info">
                    <div className="net-node-title">{displayName}</div>
                </div>
            </div>
        </div>
    );
});

RelayNode.displayName = 'RelayNode';