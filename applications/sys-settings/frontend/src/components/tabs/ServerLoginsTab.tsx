import React from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    Grid,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Chip
} from '@netlink/ui';
import { Plus, Save, Server, Edit2, Trash2 } from 'lucide-react';
import {
    SectionHeader,
    StyledCard,
    StyledCardContent,
    FormFieldsContainer,
    ButtonActionsContainer,
    StyledTableContainer
} from '../layout/Layout';
import { ServerLogin, ProtocolType } from '../../types/login';

export interface ServerLoginsTabProps {
    activeTab?: string;
    logins: ServerLogin[];
    editingLogin: ServerLogin | null;
    setEditingLogin: (login: ServerLogin | null) => void;
    handleProtocolChange: (type: string) => void;
    saveLogin: () => void;
    handleDeleteLoginClick: (id: string) => void;
    getProtocolChip?: (type: string) => React.ReactNode;
}

const defaultProtocolChip = (type: string) => {
    const upper = (type || 'ssh').toUpperCase();
    let color: 'primary' | 'secondary' | 'success' | 'warning' = 'primary';
    if (upper === 'VNC') color = 'secondary';
    if (upper === 'SFTP') color = 'success';
    if (upper === 'SMB') color = 'warning';

    return <Chip label={upper} color={color} size="small" className="styled-chip" variant="outlined" />;
};

export const ServerLoginsTab: React.FC<ServerLoginsTabProps> = ({
    activeTab,
    logins,
    editingLogin,
    setEditingLogin,
    handleProtocolChange,
    saveLogin,
    handleDeleteLoginClick,
    getProtocolChip = defaultProtocolChip
}) => {
    if (activeTab && activeTab !== 'logins') {
        return null;
    }

    return (
        <Box>
            <SectionHeader>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#f8fafc' }}>Server Logins</Typography>
                    <Typography variant="body2" color="text.secondary">Manage saved credentials for SSH, SFTP, VNC, and SMB access</Typography>
                </Box>
                {!editingLogin && (
                    <Button
                        variant="contained"
                        startIcon={<Plus size={16} />}
                        onClick={() => setEditingLogin({ id: '', name: 'Home Server', ip: '', port: '22', loginUsername: 'root', password: '', type: 'ssh' })}
                    >
                        Add Server
                    </Button>
                )}
            </SectionHeader>

            {editingLogin ? (
                <StyledCard variant="outlined">
                    <StyledCardContent>
                        <Typography variant="subtitle2" className="card-subtitle">
                            {editingLogin.id ? 'Edit Server Login' : 'Add New Server Login'}
                        </Typography>
                        <FormFieldsContainer>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        label="Server Name"
                                        size="small"
                                        value={editingLogin.name}
                                        onChange={e => setEditingLogin({ ...editingLogin, name: e.target.value })}
                                        fullWidth
                                        placeholder="e.g. Debian Test Server"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Select
                                        size="small"
                                        value={editingLogin.type || 'ssh'}
                                        onChange={e => handleProtocolChange(e.target.value)}
                                        fullWidth
                                    >
                                        <MenuItem value="ssh">SSH (Terminal)</MenuItem>
                                        <MenuItem value="sftp">SFTP (File Transfer)</MenuItem>
                                        <MenuItem value="vnc">VNC (Remote Desktop)</MenuItem>
                                        <MenuItem value="smb">SMB (Network Share)</MenuItem>
                                    </Select>
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        label="Host / IP Address"
                                        size="small"
                                        value={editingLogin.ip}
                                        onChange={e => setEditingLogin({ ...editingLogin, ip: e.target.value })}
                                        fullWidth
                                        placeholder="192.168.1.100"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Port"
                                        size="small"
                                        value={editingLogin.port}
                                        onChange={e => setEditingLogin({ ...editingLogin, port: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Username"
                                        size="small"
                                        value={editingLogin.loginUsername}
                                        onChange={e => setEditingLogin({ ...editingLogin, loginUsername: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Password"
                                        type="password"
                                        size="small"
                                        value={editingLogin.password || ''}
                                        onChange={e => setEditingLogin({ ...editingLogin, password: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                {editingLogin.type === 'smb' && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Share Name"
                                                size="small"
                                                value={editingLogin.share || ''}
                                                onChange={e => setEditingLogin({ ...editingLogin, share: e.target.value })}
                                                fullWidth
                                                placeholder="e.g. data"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Domain / Workgroup"
                                                size="small"
                                                value={editingLogin.domain || ''}
                                                onChange={e => setEditingLogin({ ...editingLogin, domain: e.target.value })}
                                                fullWidth
                                                placeholder="WORKGROUP"
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>

                            <ButtonActionsContainer>
                                <Button variant="contained" color="primary" startIcon={<Save size={16} />} onClick={saveLogin}>
                                    Save Server
                                </Button>
                                <Button variant="outlined" color="inherit" onClick={() => setEditingLogin(null)}>
                                    Cancel
                                </Button>
                            </ButtonActionsContainer>
                        </FormFieldsContainer>
                    </StyledCardContent>
                </StyledCard>
            ) : (
                <StyledTableContainer component={Paper} elevation={0}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Protocol</TableCell>
                                <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Connection Endpoint</TableCell>
                                <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logins.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="empty-table-cell">
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 2 }}>
                                            <Server size={36} color="#64748b" />
                                            <Typography sx={{ color: '#94a3b8', fontWeight: 500 }}>No saved server logins yet</Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Plus size={14} />}
                                                onClick={() => setEditingLogin({ id: '', name: 'Home Server', ip: '', port: '22', loginUsername: 'root', password: '', type: 'ssh' })}
                                                sx={{ mt: 1 }}
                                            >
                                                Add Your First Server
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logins.map((login) => (
                                    <TableRow key={login.id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}>
                                        <TableCell className="name-table-cell">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Server size={16} color="#38bdf8" />
                                                {login.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{getProtocolChip(login.type)}</TableCell>
                                        <TableCell className="details-table-cell">
                                            {login.loginUsername ? `${login.loginUsername}@` : ''}{login.ip}{login.port ? `:${login.port}` : ''}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                sx={{ color: '#38bdf8', mr: 1 }}
                                                onClick={() => setEditingLogin(login)}
                                            >
                                                <Edit2 size={16} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteLoginClick(login.id)}
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            )}
        </Box>
    );
};

export default ServerLoginsTab;