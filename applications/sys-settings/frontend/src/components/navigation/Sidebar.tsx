import React from 'react';
import {
    Box,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from '@mui/material';
import { TabId } from '../../types/settings';

export interface TabItem {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

export interface SidebarProps {
    tabs: TabItem[];
    activeTab: TabId;
    onTabChange: (tabId: TabId) => void;
}

const SidebarHeader: React.FC = () => {
    return (
        <Box className="sidebar-header">
            <Typography variant="h6" className="sidebar-title">
                Settings
            </Typography>
        </Box>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <Paper elevation={0} className="sidebar-paper">
            <SidebarHeader />
            <List className="sidebar-list">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <ListItem disablePadding key={tab.id} className="tab-list-item">
                            <ListItemButton
                                selected={isActive}
                                onClick={() => onTabChange(tab.id)}
                                className="tab-button"
                            >
                                <ListItemIcon
                                    className="tab-icon"
                                    sx={{ color: isActive ? '#38bdf8' : '#64748b' }}
                                >
                                    {tab.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            sx={{
                                                fontWeight: isActive ? 600 : 500,
                                                color: isActive ? '#38bdf8' : '#cbd5e1',
                                                fontSize: '0.92rem',
                                            }}
                                        >
                                            {tab.label}
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
};

export default Sidebar;