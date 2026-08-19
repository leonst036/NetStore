import { Box, Typography, Grid, TextField, Button, MenuItem, Divider, Select, Checkbox, Table, TableHead, TableRow, TableCell, Chip, IconButton, TableBody, CardContent, Card, Paper, FormControlLabel, TableContainer } from '@netlink/ui';
import { Edit2, Users, User, Save, Trash2, Plus } from 'lucide-react'
import { StyledCard, StyledCardContent, FormFieldsContainer, ButtonActionsContainer, StyledTableContainer, SectionHeader } from '../layout/Layout';

export interface UserManagementTabProps {
    activeTab: string;
    canManageUsers: boolean;
    editingUser: any;
    setEditingUser: (user: any) => void;
    usersList: any[];
    togglePermission: (perm: string) => void;
    ALL_PERMISSIONS: any[];
    saveUser: () => void;
    handleDeleteUserClick: (username: string) => void;
}




export const UserManagementTab = ({ activeTab, canManageUsers, editingUser, setEditingUser, usersList, togglePermission, ALL_PERMISSIONS, saveUser, handleDeleteUserClick }: UserManagementTabProps) => {
    return (
        <>{activeTab === 'users' && canManageUsers && (
            <Box>
                <SectionHeader>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f8fafc' }}>User Management</Typography>
                        <Typography variant="body2" color="text.secondary">Create and manage accounts, roles, and service permissions</Typography>
                    </Box>
                    {!editingUser && (
                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            onClick={() => setEditingUser({ username: '', password: '', role: 'user', permissions: ['access_terminal', 'scan_network'] })}
                        >
                            Add User
                        </Button>
                    )}
                </SectionHeader>

                {editingUser ? (
                    <StyledCard variant="outlined">
                        <StyledCardContent>
                            <Typography variant="subtitle2" className="card-subtitle">
                                {usersList.find(u => u.username === editingUser.username) ? 'Edit User Account' : 'Create New User Account'}
                            </Typography>
                            <FormFieldsContainer>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Username"
                                            size="small"
                                            value={editingUser.username}
                                            onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                            disabled={Boolean(usersList.find(u => u.username === editingUser.username))}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Password"
                                            type="password"
                                            size="small"
                                            value={editingUser.password || ''}
                                            onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                                            placeholder={usersList.find(u => u.username === editingUser.username) ? '(Leave empty to keep current)' : ''}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Select
                                            size="small"
                                            value={editingUser.role || 'user'}
                                            onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                            fullWidth
                                        >
                                            <MenuItem value="user">Standard User</MenuItem>
                                            <MenuItem value="admin">System Administrator</MenuItem>
                                        </Select>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

                                <Box>
                                    <Typography variant="subtitle2" className="permissions-title">
                                        Service Permissions
                                    </Typography>
                                    <Grid container spacing={1.5}>
                                        {ALL_PERMISSIONS.map(perm => (
                                            <Grid item xs={12} sm={6} key={perm.id}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.5,
                                                        backgroundColor: 'rgba(255,255,255,0.015)',
                                                        borderColor: (editingUser.permissions || []).includes(perm.id) ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.06)',
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                size="small"
                                                                checked={(editingUser.permissions || []).includes(perm.id)}
                                                                onChange={() => togglePermission(perm.id)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                                                                    {perm.label}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {perm.desc}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                                                    />
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                <ButtonActionsContainer>
                                    <Button variant="contained" color="primary" startIcon={<Save size={16} />} onClick={saveUser}>
                                        Save Account
                                    </Button>
                                    <Button variant="outlined" color="inherit" onClick={() => setEditingUser(null)}>
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
                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Username</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Role</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Granted Permissions</TableCell>
                                    <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usersList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="empty-table-cell">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 2 }}>
                                                <Users size={36} color="#64748b" />
                                                <Typography sx={{ color: '#94a3b8', fontWeight: 500 }}>No users found</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usersList.map((u) => (
                                        <TableRow key={u.username} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}>
                                            <TableCell className="name-table-cell">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <User size={16} color={u.role === 'admin' ? '#f43f5e' : '#38bdf8'} />
                                                    {u.username}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={u.role === 'admin' ? 'ADMINISTRATOR' : 'USER'}
                                                    color={u.role === 'admin' ? 'error' : 'default'}
                                                    size="small"
                                                    className="styled-chip"
                                                    variant={u.role === 'admin' ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {(u.permissions || []).slice(0, 3).map((p: string) => (
                                                        <Chip key={p} label={p.replace('_', ' ')} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                                                    ))}
                                                    {(u.permissions || []).length > 3 && (
                                                        <Chip label={`+${u.permissions.length - 3} more`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    sx={{ color: '#38bdf8', mr: 1 }}
                                                    onClick={() => setEditingUser({ ...u, password: '' })}
                                                >
                                                    <Edit2 size={16} />
                                                </IconButton>
                                                {u.username !== 'admin' && (
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteUserClick(u.username)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>
                )}
            </Box>
        )}</>
    )
}