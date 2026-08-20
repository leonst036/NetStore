import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Router } from 'lucide-react';
import type { SwitchNodeData } from '../../../types/graph';

export const SwitchNode = memo(({ data, selected }: NodeProps<Node<SwitchNodeData, 'switch'>>) => {
    const displayName = data?.label || 'Switch / Router';
    const portCount = data?.portCount || 0;

    return (
        <div className={`net-node-switch ${selected ? 'selected' : ''}`}>
            {/* React Flow Handles */}
            <Handle type="target" position={Position.Top} className="net-node-handle" />
            <Handle type="source" position={Position.Bottom} className="net-node-handle" />
            <Handle type="target" position={Position.Left} id="left" className="net-node-handle" />
            <Handle type="source" position={Position.Right} id="right" className="net-node-handle" />

            {/* Node Content */}
            <div className="net-node-content">
                <div className="net-node-icon">
                    <Router size={18} />
                </div>
                <div className="net-node-info">
                    <div className="net-node-title">{displayName}</div>
                    {portCount > 0 && (
                        <div className="net-node-subtitle">{portCount} ports</div>
                    )}
                </div>
            </div>
        </div>
    );
});

SwitchNode.displayName = 'SwitchNode';