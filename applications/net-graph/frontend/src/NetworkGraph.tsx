import { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Typography } from '@netlink/ui';

import './NetworkGraph.css';
import './styles/graph.css';

import { nodeTypes } from './components/graph/nodes';
import { Sidebar } from './components/Sidebar';
import { GraphToolbar } from './components/GraphToolbar';
import { DeviceActionModal, RenameNodeModal } from './components/modals';
import { useTopology, useGraphInteractions } from './hooks';
import { launchTerminal, launchVNC, launchSFTP } from './bridge/netlinkBridge';
import type { DiscoveredDevice } from './types/device';
import type { NetGraphNode } from './types/graph';

export interface NetworkGraphProps {
  devices?: DiscoveredDevice[];
  servers?: DiscoveredDevice[];
  onNodeClick?: (ip: string) => void;
  onVncClick?: (ip: string) => void;
  onSftpClick?: (ip: string) => void;
  ticket: string;
  isScanning?: boolean;
  onScanClick?: () => void;
  cidr?: string;
  onCidrChange?: (cidr: string) => void;
}

export default function NetworkGraph({
  devices,
  servers,
  onNodeClick = launchTerminal,
  onVncClick = launchVNC,
  onSftpClick = launchSFTP,
  ticket,
  isScanning = false,
  onScanClick = () => {},
  cidr,
  onCidrChange,
}: NetworkGraphProps) {
  const deviceList = devices || servers || [];
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [promptDialog, setPromptDialog] = useState<{
    title: string;
    defaultValue: string;
    onConfirm: (val: string) => void;
  } | null>(null);

  const {
    nodes,
    edges,
    nicknames,
    isLoading,
    isSaving,
    setNodes,
    setEdges,
    saveCurrentTopology,
    addDeviceNode,
    addSwitchNode,
    updateNodeNickname,
    updateSwitchLabel,
  } = useTopology(ticket);

  const { onNodesChange, onEdgesChange, onConnect } = useGraphInteractions({
    isEditMode,
    setNodes,
    setEdges,
  });

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: NetGraphNode) => {
      if (isEditMode) return;
      setSelectedDevice(node.id);
    },
    [isEditMode]
  );

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: NetGraphNode) => {
      if (!isEditMode) return;
      if (node.id === 'relay' || node.id === 'nat') return;

      if (node.type === 'switch' || node.id.startsWith('switch-')) {
        setPromptDialog({
          title: 'Enter new name for switch/router:',
          defaultValue: (node.data?.label as string) || '',
          onConfirm: (newName) => {
            updateSwitchLabel(node.id, newName);
          },
        });
      } else {
        const currentNick = nicknames[node.id] || (node.data as any)?.nickname || '';
        setPromptDialog({
          title: 'Enter nickname for device:',
          defaultValue: currentNick as string,
          onConfirm: (newName) => {
            updateNodeNickname(node.id, newName);
          },
        });
      }
    },
    [isEditMode, nicknames, updateSwitchLabel, updateNodeNickname]
  );

  return (
    <Box className="root-container">
      {/* Sidebar: Device List */}
      <Sidebar
        devices={deviceList}
        nodes={nodes}
        nicknames={nicknames}
        isScanning={isScanning}
        isEditMode={isEditMode}
        onScanClick={onScanClick}
        onAddDevice={addDeviceNode}
        onUpdateNickname={updateNodeNickname}
        onNodeClick={onNodeClick}
        onVncClick={onVncClick}
        onSftpClick={onSftpClick}
        cidr={cidr}
        onCidrChange={onCidrChange}
      />

      {/* Main Graph Area */}
      <Box className="graph-area">
        {/* Toolbar */}
        <GraphToolbar
          isEditMode={isEditMode}
          isSaving={isSaving}
          addSwitch={addSwitchNode}
          saveTopology={saveCurrentTopology}
          setIsEditMode={setIsEditMode}
        />

        {isLoading ? (
          <Box className="loading-container">
            <div
              className="animate-spin"
              style={{
                marginRight: '10px',
                width: '20px',
                height: '20px',
                border: '2px solid transparent',
                borderTopColor: 'currentColor',
                borderRadius: '50%',
              }}
            />
            <Typography>Loading Topology...</Typography>
          </Box>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            nodesDraggable={isEditMode}
            nodesConnectable={isEditMode}
            elementsSelectable={true}
            edgesFocusable={isEditMode}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap
              nodeColor="#38bdf8"
              maskColor="rgba(2, 6, 23, 0.7)"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
              }}
            />
            <Background color="#1e293b" gap={20} />
          </ReactFlow>
        )}

        {/* Protocol Selection Modal */}
        <DeviceActionModal
          open={!!selectedDevice}
          deviceId={selectedDevice}
          nicknames={nicknames}
          onClose={() => setSelectedDevice(null)}
          onConnectSSH={(ip) => onNodeClick(ip)}
          onConnectVNC={(ip) => onVncClick(ip)}
          onConnectSFTP={(ip) => onSftpClick(ip)}
        />

        {/* Prompt Dialog */}
        <RenameNodeModal
          open={!!promptDialog}
          title={promptDialog?.title || ''}
          defaultValue={promptDialog?.defaultValue || ''}
          onClose={() => setPromptDialog(null)}
          onSave={(newName) => {
            if (promptDialog) {
              promptDialog.onConfirm(newName);
            }
          }}
        />
      </Box>
    </Box>
  );
}