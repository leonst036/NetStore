import { useMemo } from 'react';
import { PermissionId, UserRole } from '../types/auth';

const ALL_PERMISSIONS: PermissionId[] = [
  'manage_users',
  'manage_logins',
  'access_terminal',
  'access_vnc',
  'access_sftp',
  'scan_network',
];

export interface UsePermissionsResult {
  role: UserRole;
  isAdmin: boolean;
  permissions: PermissionId[];
  hasPermission: (permission: PermissionId) => boolean;
  canManageUsers: boolean;
  canManageLogins: boolean;
  canAccessTerminal: boolean;
  canAccessVnc: boolean;
  canAccessSftp: boolean;
  canScanNetwork: boolean;
}

export function usePermissions(_ticket?: string): UsePermissionsResult {
  return useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const role: UserRole = roleParam === 'admin' ? 'admin' : 'user';
    const isAdmin = role === 'admin';

    let permissions: PermissionId[];
    if (isAdmin) {
      permissions = [...ALL_PERMISSIONS];
    } else {
      const permsParam = urlParams.get('permissions');
      if (permsParam) {
        permissions = permsParam
          .split(',')
          .map((p) => p.trim())
          .filter((p): p is PermissionId => ALL_PERMISSIONS.includes(p as PermissionId));
      } else {
        permissions = [];
      }
    }

    const hasPermission = (permission: PermissionId) =>
      isAdmin || permissions.includes(permission);

    return {
      role,
      isAdmin,
      permissions,
      hasPermission,
      canManageUsers: hasPermission('manage_users'),
      canManageLogins: hasPermission('manage_logins'),
      canAccessTerminal: hasPermission('access_terminal'),
      canAccessVnc: hasPermission('access_vnc'),
      canAccessSftp: hasPermission('access_sftp'),
      canScanNetwork: hasPermission('scan_network'),
    };
  }, []);
}

export default usePermissions;
