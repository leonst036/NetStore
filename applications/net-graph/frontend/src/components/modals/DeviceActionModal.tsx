import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Button,
} from '@netlink/ui';

export interface DeviceActionModalProps {
    open: boolean;
    deviceId: string | null;
    nicknames: Record<string, string>;
    onClose: () => void;
    onConnectSSH: (ip: string) => void;
    onConnectVNC: (ip: string) => void;
    onConnectSFTP: (ip: string) => void;
}

export const DeviceActionModal = ({
    open,
    deviceId,
    nicknames,
    onClose,
    onConnectSSH,
    onConnectVNC,
    onConnectSFTP,
}: DeviceActionModalProps) => {
    if (!deviceId) return null;

    const isRelay = deviceId === 'relay';
    const isGateway = deviceId === 'nat';
    const isSwitch = deviceId.startsWith('switch-');

    const getTitle = () => {
        if (isRelay) return 'Relay Server';
        if (isGateway) return 'NAT / Gateway';
        if (isSwitch) return 'Network Switch';
        return nicknames[deviceId] || deviceId;
    };

    const targetIp = isRelay ? '' : deviceId;

    return (
        <Dialog
            className="styled-dialog"
            open={open}
            onClose={onClose}
        >
            <DialogTitle className="styled-dialog-title">
                {getTitle()}
            </DialogTitle>
            <DialogContent className="styled-dialog-content">
                {!isRelay && !isGateway && !isSwitch && (
                    <Typography className="dialog-text" variant="body2" color="text.secondary">
                        IP: {deviceId}
                    </Typography>
                )}

                {isSwitch ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                        No remote protocols available for this switch.
                    </Typography>
                ) : isGateway ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                        Gateway device. Connect via SSH if supported.
                    </Typography>
                ) : (
                    <Box className="dialog-actions-container">
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                onConnectSSH(targetIp);
                                onClose();
                            }}
                        >
                            Connect via SSH
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="success"
                            onClick={() => {
                                onConnectVNC(targetIp);
                                onClose();
                            }}
                        >
                            Connect via VNC
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="warning"
                            onClick={() => {
                                onConnectSFTP(targetIp);
                                onClose();
                            }}
                        >
                            Browse via SFTP
                        </Button>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
