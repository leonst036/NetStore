export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

export interface OpenAppPayload {
    appId: 'net-terminal' | 'vnc-viewer' | 'sftp-client' | string;
    title: string;
    extraParams?: Record<string, unknown>;
}