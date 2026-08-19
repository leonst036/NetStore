import { Box, MenuItem, Switch, Divider, Typography } from '@netlink/ui';
import {
    FlexRowSpaceBetween,
    StyledCard,
    StyledCardContent,
    StyledSelect,
} from '../layout/Layout';

export interface AppearanceTabProps {
    activeTab: string;
    appTheme: string;
    setAppTheme: (val: string) => void;
    wallpaper: string;
    setWallpaper: (val: string) => void;
    updateSetting: (key: string, value: string, setter: (val: any) => void) => void;
}

const ThemeCardRoot = (props: any) => <Box className="theme-card-root" {...props} />;
const ThemeCardPreview = ({ $color, $active, ...props }: any) => {
    return (
        <Box
            className={`theme-card-preview ${$active ? 'active' : ''}`}
            sx={{ backgroundColor: $color, borderColor: $active ? '#38bdf8' : '#334155' }}
            {...props}
        />
    );
};
const ThemeCardHeader = (props: any) => <Box className="theme-card-header" {...props} />;
const ThemeCardBody = ({ $accent, ...props }: any) => <Box className="theme-card-body" $accent={$accent} {...props} />;

const ThemeCard = ({ name, active, color, accent, onClick }: { name: string, active: boolean, color: string, accent?: string, onClick: () => void }) => {
    return (
        <ThemeCardRoot onClick={onClick}>
            <ThemeCardPreview $color={color} $active={active}>
                <ThemeCardHeader />
                <ThemeCardBody $accent={accent} />
            </ThemeCardPreview>
            <Typography
                variant="caption"
                className="theme-card-label"
                sx={{ color: active ? '#38bdf8' : '#94a3b8' }}
            >
                {name}
            </Typography>
        </ThemeCardRoot>
    );
};

const FlexRowGap2 = (props: any) => <Box className="flex-row-gap-2" {...props} />;
const WallpaperContainer = (props: any) => <Box className="wallpaper-container" {...props} />;
const WallpaperThumb = ({ $bg, $active, ...props }: any) => {
    return <Box className="wallpaper-thumb" sx={{ background: $bg, border: $active ? '2px solid #38bdf8' : '2px solid transparent' }} {...props} />;
};
const SolidWallpaperButton = ({ $active, ...props }: any) => {
    return <Box className="solid-wallpaper-button" sx={{ border: $active ? '2px solid #38bdf8' : '1px dashed rgba(255,255,255,0.15)', color: $active ? '#38bdf8' : '#94a3b8' }} {...props} />;
};

export const AppearanceTab = ({
    activeTab,
    appTheme,
    setAppTheme,
    wallpaper,
    setWallpaper,
    updateSetting
}: AppearanceTabProps) => {
    return (
        <>{activeTab === 'appearance' && (
            <Box>
                <Typography variant="h5" className="section-title">Appearance & Themes</Typography>

                <StyledCard variant="outlined" $mb>
                    <StyledCardContent>
                        <Typography variant="subtitle2" className="card-subtitle">Theme Mode</Typography>
                        <FlexRowGap2>
                            <ThemeCard
                                name="Dark Nebula"
                                active={appTheme === 'Dark'}
                                color="#0b0f19"
                                accent="#38bdf8"
                                onClick={() => updateSetting('netlink_theme', 'Dark', setAppTheme)}
                            />

                        </FlexRowGap2>
                    </StyledCardContent>
                </StyledCard>

                <StyledCard variant="outlined" $mb>
                    <StyledCardContent>
                        <Typography variant="subtitle2" className="card-subtitle">Desktop Wallpaper</Typography>
                        <WallpaperContainer>
                            <WallpaperThumb
                                $active={wallpaper === 'default'}
                                $bg='url("/login-bg.png") center/cover'
                                onClick={() => updateSetting('netlink_wallpaper', 'default', setWallpaper)}
                            />
                            <WallpaperThumb
                                $active={wallpaper === 'wp1'}
                                $bg='linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'
                                onClick={() => updateSetting('netlink_wallpaper', 'wp1', setWallpaper)}
                            />
                            <WallpaperThumb
                                $active={wallpaper === 'wp2'}
                                $bg='linear-gradient(135deg, #4c1d95 0%, #0f172a 100%)'
                                onClick={() => updateSetting('netlink_wallpaper', 'wp2', setWallpaper)}
                            />
                            <WallpaperThumb
                                $active={wallpaper === 'wp3'}
                                $bg='linear-gradient(135deg, #064e3b 0%, #0f172a 100%)'
                                onClick={() => updateSetting('netlink_wallpaper', 'wp3', setWallpaper)}
                            />
                            <SolidWallpaperButton
                                onClick={() => updateSetting('netlink_wallpaper', 'solid', setWallpaper)}
                                $active={wallpaper === 'solid'}
                            >
                                Solid Charcoal
                            </SolidWallpaperButton>
                        </WallpaperContainer>
                    </StyledCardContent>
                </StyledCard>

                <StyledCard variant="outlined">
                    <StyledCardContent>
                        <Typography variant="subtitle2" className="card-subtitle">Display Scale</Typography>
                        <FlexRowSpaceBetween>
                            <Box>
                                <Typography sx={{ fontWeight: 500 }}>Interface Scaling</Typography>
                                <Typography variant="body2" color="text.secondary">Adjust element sizing for high-DPI displays (Coming Soon)</Typography>
                            </Box>
                            <StyledSelect size="small" defaultValue="100">
                                <MenuItem value="100">100% (Standard)</MenuItem>
                            </StyledSelect>
                        </FlexRowSpaceBetween>
                    </StyledCardContent>
                </StyledCard>
            </Box>
        )}</>
    )
}