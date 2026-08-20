import { useCallback } from 'react';
import {
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    type NodeChange,
    type EdgeChange,
    type Connection,
    type Edge,
} from '@xyflow/react';
import type { NetGraphNode, NetGraphEdge } from '../types/graph';

interface UseGraphInteractionsProps {
    isEditMode: boolean;
    setNodes: React.Dispatch<React.SetStateAction<NetGraphNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<NetGraphEdge[]>>;
}

export function useGraphInteractions({
    isEditMode,
    setNodes,
    setEdges,
}: UseGraphInteractionsProps) {
    const onNodesChange = useCallback(
        (changes: NodeChange<NetGraphNode>[]) => {
            if (!isEditMode) {
                const allowed = changes.filter((c) => c.type === 'select');
                if (allowed.length > 0) {
                    setNodes((nds) => applyNodeChanges(allowed, nds));
                }
                return;
            }
            setNodes((nds) => applyNodeChanges(changes, nds));
        },
        [isEditMode, setNodes]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange<NetGraphEdge>[]) => {
            if (!isEditMode) {
                const allowed = changes.filter((c) => c.type === 'select');
                if (allowed.length > 0) {
                    setEdges((eds) => applyEdgeChanges(allowed, eds));
                }
                return;
            }
            setEdges((eds) => applyEdgeChanges(changes, eds));
        },
        [isEditMode, setEdges]
    );

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            if (!isEditMode) return;
            const newEdge: NetGraphEdge = {
                ...params,
                animated: true,
                style: { stroke: '#94a3b8', strokeWidth: 2 },
            } as NetGraphEdge;
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [isEditMode, setEdges]
    );

    return {
        onNodesChange,
        onEdgesChange,
        onConnect,
    };
}
