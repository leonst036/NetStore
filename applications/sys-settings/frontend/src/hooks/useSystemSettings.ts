import { useState, useEffect } from "react";

function getStorageItem(key: string, defaultValue: string) {
    const value = localStorage.getItem(key);
    if (value === null) {
        localStorage.setItem(key, defaultValue);
        return defaultValue;
    }
    return value;
}

function setStorageItem(key: string, value: string) {
    localStorage.setItem(key, value);
}

export const useSystemSettings = () => {
    const [username, setUsername] = useState(getStorageItem('netlink_username', 'Unknown'));
    const [wallpaper, setWallpaper] = useState(getStorageItem('netlink_wallpaper', 'default'));
    const [appTheme, setAppTheme] = useState(getStorageItem('netlink_theme', 'Dark'));
    const [windowAnimations, setWindowAnimations] = useState(getStorageItem('netlink_animations', 'true') === 'true');
    const [notificationSounds, setNotificationSounds] = useState(getStorageItem('netlink_sounds', 'true') === 'true');
    const [debugMode, setDebugMode] = useState(getStorageItem('netlink_debug', 'true') === 'true');


    const updateSetting = (key: string, value: string) => {
        setStorageItem(key, value);
        window.dispatchEvent(new Event('settingsChange'));
        try {
            window.parent.postMessage({ type: 'netlink_setting_changed', key, value }, '*');
        } catch (err) {
            console.error('Failed to post message', err);
        }
    }

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'netlink_username') setUsername(e.newValue || 'Unknown');
            if (e.key === 'netlink_wallpaper') setWallpaper(e.newValue || 'default');
            if (e.key === 'netlink_theme') setAppTheme(e.newValue || 'Dark');
            if (e.key === 'netlink_animations') setWindowAnimations(e.newValue === 'true');
            if (e.key === 'netlink_sounds') setNotificationSounds(e.newValue === 'true');
            if (e.key === 'netlink_debug') setDebugMode(e.newValue === 'true');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return {
        username,
        setUsername,
        wallpaper,
        setWallpaper,
        appTheme,
        setAppTheme,
        windowAnimations,
        setWindowAnimations,
        notificationSounds,
        setNotificationSounds,
        debugMode,
        setDebugMode,
        updateSetting
    };
}