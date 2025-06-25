import { useState } from 'react';
import { Box, Chip, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface BoutTagsProps {
    tags: string[];
    availableTags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
}

export default function BoutTags({ tags, availableTags, onAddTag, onRemoveTag }: BoutTagsProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');

    const isTagSelected = (tag: string) => tags.includes(tag);

    const handleOpenDialog = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNewTagName('');
        setDialogOpen(true);
    };

    const handleAddNewTag = () => {
        const trimmedTag = newTagName.trim();
        if (trimmedTag) {
            onAddTag(trimmedTag);
            setDialogOpen(false);
            setNewTagName('');
        }
    };

    const handleCancel = () => {
        setDialogOpen(false);
        setNewTagName('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddNewTag();
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {availableTags.map((tag) => (
                    <Chip
                        key={tag}
                        label={tag}
                        onClick={(e) => (e.stopPropagation(), isTagSelected(tag) ? onRemoveTag(tag) : onAddTag(tag))}
                        sx={{
                            backgroundColor: isTagSelected(tag) ? 'success.main' : '#eee',
                            borderColor: isTagSelected(tag) ? 'success.main' : 'black',
                            color: isTagSelected(tag) ? '#fff' : '#888',
                            '&:hover': {
                                backgroundColor: isTagSelected(tag) ? 'success.dark' : 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                        size="small"
                    />
                ))}
                <IconButton
                    size="small"
                    onClick={handleOpenDialog}
                    sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: '#f0f0f0',
                        '&:hover': {
                            backgroundColor: '#e0e0e0'
                        }
                    }}
                >
                    <AddIcon sx={{ fontSize: '0.75rem' }} />
                </IconButton>
            </Box>

            <Dialog
                open={dialogOpen}
                onClose={handleCancel}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Add New Tag</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        variant="outlined"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter tag name..."
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleAddNewTag} variant="contained" disabled={!newTagName.trim()}>
                        Add Tag
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
