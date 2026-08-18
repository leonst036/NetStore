export type ProtocolType = 'ssh' | 'sftp' | 'vnc' | 'smb';

export interface ServerLogin {
    id: string;
    name: string;
    ip: string;
    port: string;
    loginUsername: string;
    password?: string;
    type: ProtocolType;
    share?: string;
    domain?: string;
}