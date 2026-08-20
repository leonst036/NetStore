import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Server } from 'lucide-react';
import type { DeviceNodeData } from '../../../types/graph';

export const DeviceNode = memo(({ data, selected }: NodeProps<Node<DeviceNodeData, 'device'>>) => {
  const displayName = data?.nickname || data?.label || data?.ip || '';
  const showSubtext = data?.hostname || data?.ip;

  return (
    <div className={`net-node-device ${selected ? 'selected' : ''}`}>
      {/* React Flow Handles */}
      <Handle type="target" position={Position.Top} className="net-node-handle" />
      <Handle type="source" position={Position.Bottom} className="net-node-handle" />
      <Handle type="target" position={Position.Left} id="left" className="net-node-handle" />
      <Handle type="source" position={Position.Right} id="right" className="net-node-handle" />

      {/* Node Content */}
      <div className="net-node-content">
        <div className="net-node-icon">
          <Server size={18} />
        </div>
        <div className="net-node-info">
          <div className="net-node-title">{displayName}</div>
          {showSubtext && (
            <div className="net-node-subtitle">
              {data.ip} {data.hostname && data.hostname !== data.ip ? `(${data.hostname})` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DeviceNode.displayName = 'DeviceNode';
