import { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NoteIcon from '@mui/icons-material/Note';

interface BoutNoteProps {
    note: string | undefined;
    onSetNote: (note: string) => void;
}

export default function BoutNote({ note, onSetNote }: BoutNoteProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState('');

    const handleOpenDialog = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingNote(note || '');
        setDialogOpen(true);
    };

    const handleSave = () => {
        onSetNote(editingNote);
        setDialogOpen(false);
    };

    const handleCancel = () => {
        setDialogOpen(false);
    };

    const truncateNote = (text: string, maxLength: number = 20) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <>
            <Box
                onClick={handleOpenDialog}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: 1,
                    minHeight: '20px',
                    '&:hover': {
                        backgroundColor: 'action.hover'
                    }
                }}
            >
                {note ? (
                    <>
                        <NoteIcon sx={{ fontSize: '0.75rem', color: 'primary.main' }} />
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.75rem',
                                color: 'text.primary'
                            }}
                        >
                            {truncateNote(note)}
                        </Typography>
                    </>
                ) : (
                    <EditIcon sx={{ fontSize: '0.75rem', color: 'text.secondary' }} />
                )}
            </Box>

            <Dialog
                open={dialogOpen}
                onClose={handleCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Bout Note</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        placeholder="Enter note for this bout..."
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
