import { useState, useEffect } from 'react';
import {
  User,
  Users,
  Monitor,
  Shield,
  Key,
} from 'lucide-react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@netlink/ui';
import './SettingsApp.css';
import { Sidebar, TabItem } from './components/navigation/Sidebar';
import { GeneralTab } from './components/tabs/GeneralTab';
import { AppearanceTab } from './components/tabs/AppearanceTab';
import { ServerLoginsTab } from './components/tabs/ServerLoginsTab';
import { UserManagementTab } from './components/tabs/UserManagementTab';
import { SecurityTab } from './components/tabs/SecurityTab';
import { TabId } from './types/settings';

interface SettingsAppProps {
  ticket: string;
}

export default function SettingsApp({ ticket }: SettingsAppProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // Load functional settings from localStorage
  const [username, setUsername] = useState(() => localStorage.getItem('netlink_username') || 'Admin');
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('netlink_wallpaper') || 'default');
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem('netlink_theme') || 'Dark');
  const [windowAnimations, setWindowAnimations] = useState(() => localStorage.getItem('netlink_animations') !== 'false');
  const [notificationSounds, setNotificationSounds] = useState(() => localStorage.getItem('netlink_sounds') === 'true');
  const [debugMode, setDebugMode] = useState(() => localStorage.getItem('netlink_debug') === 'true');

  const updateSetting = (key: string, value: string, setter: (val: string) => void) => {
    setter(value);
    localStorage.setItem(key, value);
    window.dispatchEvent(new Event('settingsChange'));
    try {
      window.parent.postMessage({ type: 'netlink_setting_changed', key, value }, '*');
    } catch {
      // Ignore cross-origin error
    }
  };

  const getPermissions = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role === 'admin') return ['manage_users', 'manage_logins', 'access_terminal', 'access_vnc', 'access_sftp', 'scan_network'];
    const perms = urlParams.get('permissions');
    return perms ? perms.split(',') : [];
  };

  const permissions = getPermissions();
  const canManageUsers = permissions.includes('manage_users');

  const tabs: TabItem[] = [
    { id: 'general', label: 'General', icon: <User size={19} /> },
    { id: 'appearance', label: 'Appearance', icon: <Monitor size={19} /> },
    { id: 'logins', label: 'Server Logins', icon: <Key size={19} /> },
    { id: 'security', label: 'Security', icon: <Shield size={19} /> },
  ];

  if (canManageUsers) {
    tabs.splice(3, 0, { id: 'users', label: 'User Management', icon: <Users size={19} /> });
  }

  const [logins, setLogins] = useState<any[]>([]);
  const [editingLogin, setEditingLogin] = useState<any | null>(null);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [deleteUserDialog, setDeleteUserDialog] = useState<{ open: boolean, username: string }>({ open: false, username: '' });
  const [deleteLoginDialog, setDeleteLoginDialog] = useState<{ open: boolean, id: string }>({ open: false, id: '' });

  useEffect(() => {
    if (activeTab === 'logins') {
      fetchLogins();
    } else if (activeTab === 'users' && canManageUsers) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Ticket ${ticket}` }
      });
      const data = await res.json();
      if (data.users) setUsersList(data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const saveUser = async () => {
    if (!editingUser) return;
    try {
      const isNew = !usersList.find(u => u.username === editingUser.username);
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/users', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Ticket ${ticket}`
        },
        body: JSON.stringify(editingUser)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to save user', err);
    }
  };

  const handleDeleteUserClick = (username: string) => {
    setDeleteUserDialog({ open: true, username });
  };

  const confirmDeleteUser = async () => {
    const username = deleteUserDialog.username;
    try {
      const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Ticket ${ticket}` }
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user', err);
    }
    setDeleteUserDialog({ open: false, username: '' });
  };

  const togglePermission = (perm: string) => {
    if (!editingUser) return;
    const current = editingUser.permissions || [];
    if (current.includes(perm)) {
      setEditingUser({ ...editingUser, permissions: current.filter((p: string) => p !== perm) });
    } else {
      setEditingUser({ ...editingUser, permissions: [...current, perm] });
    }
  };

  const ALL_PERMISSIONS = [
    { id: 'manage_users', label: 'Manage Users', desc: 'Create, edit, and delete system user accounts' },
    { id: 'manage_logins', label: 'Manage Server Logins', desc: 'Add and configure remote server credentials' },
    { id: 'access_terminal', label: 'Access SSH Terminal', desc: 'Launch interactive SSH terminal sessions' },
    { id: 'access_vnc', label: 'Access VNC Desktop', desc: 'Connect to remote VNC graphical desktops' },
    { id: 'access_sftp', label: 'Access SFTP File Explorer', desc: 'Browse and transfer remote files' },
    { id: 'scan_network', label: 'Scan Network', desc: 'Perform automatic subnet and topology scans' }
  ];

  const fetchLogins = async () => {
    try {
      const res = await fetch('/api/server-logins', {
        headers: { 'Authorization': `Ticket ${ticket}` }
      });
      const data = await res.json();
      if (data.logins) {
        setLogins(data.logins);
      }
    } catch (err) {
      console.error('Failed to fetch logins', err);
    }
  };

  const handleProtocolChange = (type: string) => {
    if (!editingLogin) return;
    let defaultPort = '22';
    if (type === 'vnc') defaultPort = '5900';
    if (type === 'smb') defaultPort = '445';
    setEditingLogin({
      ...editingLogin,
      type,
      port: defaultPort
    });
  };

  const saveLogin = async () => {
    if (!editingLogin) return;
    try {
      const res = await fetch('/api/server-logins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Ticket ${ticket}`
        },
        body: JSON.stringify(editingLogin)
      });
      if (res.ok) {
        setEditingLogin(null);
        await fetchLogins();
      }
    } catch (err) {
      console.error('Failed to save login', err);
    }
  };

  const handleDeleteLoginClick = (id: string) => {
    setDeleteLoginDialog({ open: true, id });
  };

  const confirmDeleteLogin = async () => {
    const id = deleteLoginDialog.id;
    try {
      const res = await fetch(`/api/server-logins?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Ticket ${ticket}` }
      });
      if (res.ok) {
        await fetchLogins();
      }
    } catch (err) {
      console.error('Failed to delete login', err);
    }
    setDeleteLoginDialog({ open: false, id: '' });
  };

  const getProtocolChip = (type: string) => {
    const upper = (type || 'ssh').toUpperCase();
    let color: 'primary' | 'secondary' | 'success' | 'warning' = 'primary';
    if (upper === 'VNC') color = 'secondary';
    if (upper === 'SFTP') color = 'success';
    if (upper === 'SMB') color = 'warning';

    return <Chip label={upper} color={color} size="small" className="styled-chip" variant="outlined" />;
  };

  return (
    <RootContainer>
      {/* Sidebar */}
      <Sidebar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <MainContentContainer>
        <ContentMaxWidth>
          {/* General Tab */}
          {activeTab === 'general' && (
            <GeneralTab
              username={username}
              setUsername={setUsername}
              windowAnimations={windowAnimations}
              setWindowAnimations={setWindowAnimations}
              notificationSounds={notificationSounds}
              setNotificationSounds={setNotificationSounds}
              debugMode={debugMode}
              setDebugMode={setDebugMode}
              updateSetting={updateSetting}
            />
          )}


          {/* Appearance Tab */}
          <AppearanceTab
            activeTab={activeTab}
            appTheme={appTheme}
            setAppTheme={setAppTheme}
            wallpaper={wallpaper}
            setWallpaper={setWallpaper}
            updateSetting={updateSetting}
          />

          {/* Server Logins Tab */}
          {activeTab === 'logins' && (
            <ServerLoginsTab
              logins={logins}
              editingLogin={editingLogin}
              setEditingLogin={setEditingLogin}
              handleProtocolChange={handleProtocolChange}
              saveLogin={saveLogin}
              handleDeleteLoginClick={handleDeleteLoginClick}
              getProtocolChip={getProtocolChip}
            />
          )}

          {/* User Management Tab */}
          <UserManagementTab
            activeTab={activeTab}
            canManageUsers={canManageUsers}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            usersList={usersList}
            togglePermission={togglePermission}
            ALL_PERMISSIONS={ALL_PERMISSIONS}
            saveUser={saveUser}
            handleDeleteUserClick={handleDeleteUserClick}
          />

          {/* Security Tab */}
          <SecurityTab
            activeTab={activeTab}
          />
        </ContentMaxWidth>
      </MainContentContainer>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteUserDialog.open}
        onClose={() => setDeleteUserDialog({ open: false, username: '' })}
        PaperProps={{ sx: { backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: '#f8fafc', fontWeight: 700 }}>Delete User Account</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94a3b8' }}>
            Are you sure you want to permanently delete user <strong style={{ color: '#f8fafc' }}>"{deleteUserDialog.username}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteUserDialog({ open: false, username: '' })} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDeleteUser} variant="contained" color="error">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Login Dialog */}
      <Dialog
        open={deleteLoginDialog.open}
        onClose={() => setDeleteLoginDialog({ open: false, id: '' })}
        PaperProps={{ sx: { backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: '#f8fafc', fontWeight: 700 }}>Delete Server Login</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94a3b8' }}>
            Are you sure you want to remove this saved server credential?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteLoginDialog({ open: false, id: '' })} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDeleteLogin} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </RootContainer>
  );
}

// Styled Components Wrappers
const RootContainer = (props: any) => <Box className="root-container" {...props} />;
const MainContentContainer = (props: any) => <Box className="main-content-container" {...props} />;
const ContentMaxWidth = (props: any) => <Box className="content-max-width" {...props} />;