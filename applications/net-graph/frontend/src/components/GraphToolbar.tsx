import { Save, Settings2, Pencil } from 'lucide-react';
import {
    Box,
    Paper,
    Typography,
    Button,
} from '@netlink/ui';

export interface GraphToolbarProps {
    isEditMode: boolean;
    isSaving: boolean;
    addSwitch: () => void;
    saveTopology: () => void;
    setIsEditMode: React.Dispatch<React.SetStateAction<boolean>> | ((isEditMode: boolean) => void);
}

export const GraphToolbar = ({
    isEditMode,
    isSaving,
    addSwitch,
    saveTopology,
    setIsEditMode,
}: GraphToolbarProps) => {
    return (
        <Box className="toolbar-container">
            <Button
                variant="contained"
                size="small"
                color={isEditMode ? "primary" : "inherit"}
                onClick={() => setIsEditMode(!isEditMode)}
                startIcon={<Pencil size={15} />}
            >
                {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
            </Button>

            {isEditMode && (
                <>
                    <Button variant="contained" size="small" color="secondary" onClick={addSwitch} startIcon={<Settings2 size={15} />}>
                        Add Switch
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={saveTopology}
                        disabled={isSaving}
                        startIcon={<Save size={15} />}
                    >
                        {isSaving ? 'Saving...' : 'Save Topology'}
                    </Button>
                    <Paper className="info-paper">
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                            Double-click node to rename. Select & press Backspace to delete.
                        </Typography>
                    </Paper>
                </>
            )}
        </Box>
    );
};