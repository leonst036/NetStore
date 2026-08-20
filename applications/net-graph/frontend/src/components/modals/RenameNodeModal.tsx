import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@netlink/ui';

export interface RenameNodeModalProps {
    open: boolean;
    title: string;
    defaultValue?: string;
    onClose: () => void;
    onSave: (value: string) => void;
}

export const RenameNodeModal = ({
    open,
    title,
    defaultValue = '',
    onClose,
    onSave,
}: RenameNodeModalProps) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue, open]);

    const handleSave = () => {
        onSave(value);
        onClose();
    };

    return (
        <Dialog
            className="styled-dialog"
            open={open}
            onClose={onClose}
        >
            <DialogTitle className="styled-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent className="styled-dialog-content">
                <TextField
                    autoFocus
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSave();
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
