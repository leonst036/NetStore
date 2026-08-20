import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    InputAdornment,
    List,
} from '@netlink/ui';
import { Server as ServerIcon, Search, Plus } from 'lucide-react';
import type { DiscoveredDevice } from '../types/device';
import type { NetGraphNode } from '../types/graph';
import { launchTerminal, launchVNC, launchSFTP } from '../bridge/netlinkBridge';

export interface SidebarProps {
    devices: DiscoveredDevice[];
    nodes: NetGraphNode[];
    nicknames: Record<string, string>;
    isScanning: boolean;
    isEditMode: boolean;
    onScanClick: () => void;
    onAddDevice: (device: DiscoveredDevice) => void;
    onUpdateNickname: (ip: string, nickname: string) => void;
    onNodeClick?: (ip: string) => void;
    onVncClick?: (ip: string) => void;
    onSftpClick?: (ip: string) => void;
}

interface SidebarHeaderProps {
    search: string;
    onSearchChange: (search: string) => void;
    onScanClick: () => void;
    isScanning: boolean;
}

const SidebarHeader = ({
    search,
    onSearchChange,
    onScanClick,
    isScanning,
}: SidebarHeaderProps) => {
    return (
        <Box className="sidebar-header">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography className="header-title" variant="subtitle1" sx={{ mb: 0 }}>
                    <ServerIcon size={18} /> Discovered Devices
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={onScanClick}
                    disabled={isScanning}
                >
                    {isScanning ? 'Scanning...' : 'Scan'}
                </Button>
            </Box>
            <TextField
                fullWidth
                size="small"
                placeholder="Search IP or Hostname..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={16} />
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
};

export const Sidebar = ({
    devices,
    nodes,
    nicknames,
    isScanning,
    isEditMode,
    onScanClick,
    onAddDevice,
    onUpdateNickname,
    onNodeClick,
    onVncClick,
    onSftpClick,
}: SidebarProps) => {
    const [search, setSearch] = useState('');

    const filteredDevices = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return devices;

        return devices.filter((device) => {
            const ipMatch = device.ip.toLowerCase().includes(query);
            const hostMatch = (device.hostname || '').toLowerCase().includes(query);
            const nickMatch = (nicknames[device.ip] || '').toLowerCase().includes(query);
            return ipMatch || hostMatch || nickMatch;
        });
    }, [devices, search, nicknames]);

    const handleSSH = (ip: string) => {
        if (onNodeClick) onNodeClick(ip);
        else launchTerminal(ip);
    };

    const handleVNC = (ip: string) => {
        if (onVncClick) onVncClick(ip);
        else launchVNC(ip);
    };

    const handleSFTP = (ip: string) => {
        if (onSftpClick) onSftpClick(ip);
        else launchSFTP(ip);
    };

    return (
        <Paper className="sidebar-container" elevation={0}>
            <SidebarHeader
                search={search}
                onSearchChange={setSearch}
                onScanClick={onScanClick}
                isScanning={isScanning}
            />

            <List className="device-list" onWheelCapture={(e) => e.stopPropagation()}>
                {filteredDevices.map((device) => {
                    const inGraph = nodes.some((n) => n.id === device.ip);
                    const currentNickname = nicknames[device.ip] || '';

                    return (
                        <Paper className="device-paper" key={device.ip} variant="outlined">
                            <Typography variant="subtitle2" color="primary">
                                {device.ip}
                            </Typography>
                            <Typography className="device-hostname" variant="caption" color="text.secondary">
                                {device.hostname || 'Unknown Host'}
                            </Typography>

                            {isEditMode && (
                                <Box className="edit-actions-container">
                                    <TextField
                                        size="small"
                                        placeholder="Nickname..."
                                        value={currentNickname}
                                        onChange={(e) => onUpdateNickname(device.ip, e.target.value)}
                                    />
                                    <Button
                                        variant={inGraph ? 'outlined' : 'contained'}
                                        size="small"
                                        disabled={inGraph}
                                        onClick={() => onAddDevice(device)}
                                        startIcon={!inGraph && <Plus size={16} />}
                                        fullWidth
                                    >
                                        {inGraph ? 'In Graph' : 'Add to Graph'}
                                    </Button>
                                </Box>
                            )}

                            {/* Quick Connect Buttons */}
                            <Box className="quick-connect-container">
                                <Button
                                    className="quick-connect-button"
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleSSH(device.ip)}
                                >
                                    SSH
                                </Button>
                                <Button
                                    className="quick-connect-button"
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    onClick={() => handleVNC(device.ip)}
                                >
                                    VNC
                                </Button>
                                <Button
                                    className="quick-connect-button"
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    onClick={() => handleSFTP(device.ip)}
                                >
                                    SFTP
                                </Button>
                            </Box>
                        </Paper>
                    );
                })}

                {filteredDevices.length === 0 && (
                    <Typography className="no-devices-text" variant="body2" color="text.secondary" align="center">
                        {isScanning ? 'Scanning...' : 'No devices found.'}
                    </Typography>
                )}
            </List>
        </Paper>
    );
};