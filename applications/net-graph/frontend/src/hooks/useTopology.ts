import { useState, useEffect, useCallback } from 'react';
import type { NetGraphNode, NetGraphEdge } from '../types/graph';
import type { DiscoveredDevice } from '../types/device';
import { fetchTopology, saveTopology } from '../api/topologyApi';
import { sendNotification } from '../bridge/netlinkBridge';

export function useTopology(ticket: string) {
    const [nodes, setNodes] = useState<NetGraphNode[]>([]);
    const [edges, setEdges] = useState<NetGraphEdge[]>([]);
    const [nicknames, setNicknames] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadTopology = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchTopology(ticket);
            if (data && data.nodes && data.nodes.length > 0) {
                const loadedNicknames: Record<string, string> = { ...(data.nicknames || {}) };

                const updatedNodes: NetGraphNode[] = data.nodes.map((n) => {
                    const nodeData = (n.data || {}) as Record<string, any>;

                    if (n.id === 'nat') {
                        return {
                            ...n,
                            type: 'gateway',
                            deletable: false,
                            data: { label: nodeData.label || 'NAT / Gateway', ip: nodeData.ip },
                        } as NetGraphNode;
                    }
                    if (n.id === 'relay') {
                        return {
                            ...n,
                            type: 'relay',
                            data: { label: nodeData.label || 'Relay Server' },
                        } as NetGraphNode;
                    }
                    if (n.id.startsWith('switch-')) {
                        return {
                            ...n,
                            type: 'switch',
                            data: { label: nodeData.label || 'Switch / Router', portCount: nodeData.portCount },
                        } as NetGraphNode;
                    }

                    const nick = loadedNicknames[n.id] || nodeData.nickname || '';
                    if (nick) {
                        loadedNicknames[n.id] = nick;
                    }
                    return {
                        ...n,
                        type: 'device',
                        data: {
                            ip: n.id,
                            hostname: nodeData.hostname,
                            nickname: nick,
                            label: nick || n.id,
                        },
                    } as NetGraphNode;
                });

                const hasNat = updatedNodes.some((n) => n.id === 'nat');
                if (!hasNat) {
                    updatedNodes.push({
                        id: 'nat',
                        type: 'gateway',
                        position: { x: 300, y: 150 },
                        data: { label: 'NAT / Gateway' },
                        deletable: false,
                    });
                }

                setNodes(updatedNodes);
                setEdges(data.edges || []);
                setNicknames(loadedNicknames);
            } else {
                setNodes([
                    {
                        id: 'nat',
                        type: 'gateway',
                        position: { x: 200, y: 150 },
                        data: { label: 'NAT / Gateway' },
                        deletable: false,
                    },
                    {
                        id: 'relay',
                        type: 'relay',
                        position: { x: 400, y: 300 },
                        data: { label: 'Relay Server' },
                    },
                ]);
                setEdges([]);
                setNicknames({});
            }
        } catch (err) {
            console.error('Failed to load topology:', err);
            sendNotification('Failed to load network topology', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [ticket]);

    useEffect(() => {
        loadTopology();
    }, [loadTopology]);

    const saveCurrentTopology = useCallback(async () => {
        setIsSaving(true);
        try {
            await saveTopology(ticket, { nodes, edges, nicknames });
            sendNotification('Topology saved successfully!', 'success');
        } catch (err) {
            console.error('Failed to save topology:', err);
            sendNotification('Failed to save topology', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [ticket, nodes, edges, nicknames]);

    const addDeviceNode = useCallback((device: DiscoveredDevice) => {
        setNodes((nds) => {
            if (nds.some((n) => n.id === device.ip)) {
                sendNotification('Device is already in the graph.', 'info');
                return nds;
            }
            const nickname = nicknames[device.ip] || device.hostname || '';
            const newNode: NetGraphNode = {
                id: device.ip,
                type: 'device',
                position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
                data: {
                    ip: device.ip,
                    hostname: device.hostname,
                    nickname,
                    label: nickname || device.ip,
                },
            };
            return [...nds, newNode];
        });
    }, [nicknames]);

    const addSwitchNode = useCallback(() => {
        const id = `switch-${Date.now()}`;
        const newNode: NetGraphNode = {
            id,
            type: 'switch',
            position: { x: 200, y: 200 },
            data: { label: 'Switch / Router' },
        };
        setNodes((nds) => [...nds, newNode]);
    }, []);

    const updateNodeNickname = useCallback((nodeId: string, nickname: string) => {
        const trimmed = nickname.trim();
        setNicknames((prev) => ({ ...prev, [nodeId]: trimmed }));
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === nodeId && n.type === 'device') {
                    const finalLabel = trimmed || n.id;
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            nickname: trimmed,
                            label: finalLabel,
                        },
                    };
                }
                return n;
            })
        );
    }, []);

    const updateSwitchLabel = useCallback((nodeId: string, label: string) => {
        const trimmed = label.trim();
        if (!trimmed) return;
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === nodeId && n.type === 'switch') {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            label: trimmed,
                        },
                    };
                }
                return n;
            })
        );
    }, []);

    return {
        nodes,
        edges,
        nicknames,
        isLoading,
        isSaving,
        setNodes,
        setEdges,
        setNicknames,
        loadTopology,
        saveCurrentTopology,
        addDeviceNode,
        addSwitchNode,
        updateNodeNickname,
        updateSwitchLabel,
    };
}
