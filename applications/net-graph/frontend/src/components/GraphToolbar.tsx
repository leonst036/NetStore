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
                color={isEditMode ? "primary" : "inherit"}
                onClick={() => setIsEditMode(!isEditMode)}
                startIcon={<Pencil size={16} />}
            >
                {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
            </Button>

            {isEditMode && (
                <>
                    <Button variant="contained" color="secondary" onClick={addSwitch} startIcon={<Settings2 size={16} />}>
                        Add Switch
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={saveTopology}
                        disabled={isSaving}
                        startIcon={<Save size={16} />}
                    >
                        {isSaving ? 'Saving...' : 'Save Topology'}
                    </Button>
                    <Paper className="info-paper">
                        <Typography variant="caption" color="text.secondary">
                            Double-click to rename. Select and press Backspace to delete.
                        </Typography>
                    </Paper>
                </>
            )}
        </Box>
    );
};