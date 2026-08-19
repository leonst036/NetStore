import React from 'react';
import { Box, MenuItem, Switch, Divider, Typography } from '@netlink/ui';
import {
    VerticalStack,
    FlexRowSpaceBetween,
    StyledCard,
    StyledCardContent,
    StyledFormGroup,
    StyledSelect,
    StyledTextField
} from '../layout/Layout';

export interface GeneralTabProps {
    username: string;
    setUsername: (val: string) => void;
    windowAnimations: boolean;
    setWindowAnimations: (val: boolean) => void;
    notificationSounds: boolean;
    setNotificationSounds: (val: boolean) => void;
    debugMode: boolean;
    setDebugMode: (val: boolean) => void;
    updateSetting: (key: string, value: string, setter: (val: any) => void) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
    username,
    setUsername,
    updateSetting,
    windowAnimations,
    setWindowAnimations,
    notificationSounds,
    setNotificationSounds,
    debugMode,
    setDebugMode
}) => {
    return (
        <Box>
            <Typography variant="h5" className="section-title">General Settings</Typography>

            <StyledCard variant="outlined" $mb>
                <StyledCardContent>
                    <Typography variant="subtitle2" className="card-subtitle">User Profile</Typography>
                    <VerticalStack>
                        <FlexRowSpaceBetween>
                            <Box>
                                <Typography sx={{ fontWeight: 500 }}>Display Name</Typography>
                                <Typography variant="body2" color="text.secondary">Name shown across the desktop workspace</Typography>
                            </Box>
                            <StyledTextField
                                size="small"
                                value={username}
                                onChange={(e) => updateSetting('netlink_username', e.target.value, setUsername)}
                            />
                        </FlexRowSpaceBetween>
                        <FlexRowSpaceBetween>
                            <Box>
                                <Typography sx={{ fontWeight: 500 }}>Language</Typography>
                                <Typography variant="body2" color="text.secondary">Default system and app language</Typography>
                            </Box>
                            <StyledSelect size="small" defaultValue="en">
                                <MenuItem value="en">English (US)</MenuItem>
                            </StyledSelect>
                        </FlexRowSpaceBetween>
                    </VerticalStack>
                </StyledCardContent>
            </StyledCard>

            <StyledCard variant="outlined">
                <StyledCardContent>
                    <Typography variant="subtitle2" className="card-subtitle">Desktop Experience</Typography>
                    <StyledFormGroup>
                        <FlexRowSpaceBetween>
                            <Box>
                                <Typography sx={{ fontWeight: 500 }}>Window Animations</Typography>
                                <Typography variant="body2" color="text.secondary">Smooth open, minimize, and restore transitions</Typography>
                            </Box>
                            <Switch
                                checked={windowAnimations}
                                onChange={(_e, checked) => updateSetting('netlink_animations', checked.toString(), () => setWindowAnimations(checked))}
                            />
                        </FlexRowSpaceBetween>
                        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
                        <FlexRowSpaceBetween>
                            <Box>
                                <Typography sx={{ fontWeight: 500 }}>Notification Sounds</Typography>
                                <Typography variant="body2" color="text.secondary">Audio feedback for system events</Typography>
                            </Box>
                            <Switch
                                checked={notificationSounds}
                                onChange={(_e, checked) => {
                                    if (checked) {
                                        fetch('/api/sounds/notification').then(res => res.blob()).then(blob => {
                                            const url = URL.createObjectURL(blob);
                                            new Audio(url).play().catch(() => { });
                                        });
                                    }
                                    updateSetting('netlink_sounds', checked.toString(), () => setNotificationSounds(checked));
                                }}
                            />

                        </FlexRowSpaceBetween>
                        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
                        <FlexRowSpaceBetween>
                            <Box>
                                <Typography sx={{ fontWeight: 500 }}>Debug Overlay & Diagnostic Logs</Typography>
                                <Typography variant="body2" color="text.secondary">Display live VNC FPS, latency metrics, and relay logs</Typography>
                            </Box>
                            <Switch
                                checked={debugMode}
                                onChange={(_e, checked) => updateSetting('netlink_debug', checked.toString(), () => setDebugMode(checked))}
                            />
                        </FlexRowSpaceBetween>
                    </StyledFormGroup>
                </StyledCardContent>
            </StyledCard>
        </Box>
    );
};

export default GeneralTab;
