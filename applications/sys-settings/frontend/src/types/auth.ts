export type UserRole = 'admin' | 'user';

export type PermissionId =
  | 'manage_users'
  | 'manage_logins'
  | 'access_terminal'
  | 'access_vnc'
  | 'access_sftp'
  | 'scan_network';

export interface PermissionDefinition {
  id: PermissionId;
  label: string;
  desc: string;
}

export interface UserAccount {
  username: string;
  password?: string;
  role: UserRole;
  permissions: PermissionId[];
}