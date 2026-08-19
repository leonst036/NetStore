export type TabId = 'general' | 'appearance' | 'logins' | 'security' | 'users';

export type ThemeName = 'Dark' | 'Midnight' | 'Cyber';
export type WallpaperPreset = 'default' | 'wp1' | 'wp2' | 'wp3' | 'solid';
export type LanguageCode = 'en';
export type DisplayScale = '100' | '125' | '150';

export interface SystemSettingsState {
    username: string;
    language: LanguageCode;
    wallpaper: WallpaperPreset;
    theme: ThemeName;
    windowAnimations: boolean;
    notificationSounds: boolean;
    debugMode: boolean;
    displayScale: DisplayScale;
}