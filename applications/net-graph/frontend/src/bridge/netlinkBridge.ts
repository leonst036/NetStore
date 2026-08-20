import type { OpenAppPayload, NotificationSeverity } from '../types/bridge';

export const openApp = (payload: OpenAppPayload): void => {
    try {
        window.parent.postMessage({
            type: 'open_app',
            appId: payload.appId,
            title: payload.title,
            extraParams: payload.extraParams || {},
        }, '*');
    } catch (error) {
        console.error('Failed to post open_app message to parent:', error);
    }
};

export const sendNotification = (message: string, severity: NotificationSeverity = 'info'): void => {
    try {
        window.parent.postMessage({
            type: 'notify',
            message,
            severity,
        }, '*');
    } catch (error) {
        console.error('Failed to post notify message to parent:', error);
    }
};

export const launchTerminal = (ip: string): void => {
    openApp({
        appId: 'net-terminal',
        title: `Terminal: ${ip}`,
        extraParams: { ip },
    });
};

export const launchVNC = (ip: string): void => {
    openApp({
        appId: 'vnc-viewer',
        title: `VNC: ${ip}`,
        extraParams: { ip },
    });
};

export const launchSFTP = (ip: string): void => {
    openApp({
        appId: 'sftp-client',
        title: `SFTP: ${ip}`,
        extraParams: { ip },
    });
};