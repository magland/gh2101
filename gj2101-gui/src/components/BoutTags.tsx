import { Box, Chip } from '@mui/material';

const AVAILABLE_TAGS = ['mom', 'dad', 'pup1', 'pup2'] as const;

interface BoutTagsProps {
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
}

export default function BoutTags({ tags, onAddTag, onRemoveTag }: BoutTagsProps) {
    const isTagSelected = (tag: string) => tags.includes(tag);

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {AVAILABLE_TAGS.map((tag) => (
                <Chip
                    key={tag}
                    label={tag}
                    onClick={() => isTagSelected(tag) ? onRemoveTag(tag) : onAddTag(tag)}
                    sx={{
                        backgroundColor: isTagSelected(tag) ? 'success.main' : 'transparent',
                        borderColor: isTagSelected(tag) ? 'success.main' : 'grey.500',
                        color: isTagSelected(tag) ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                        '&:hover': {
                            backgroundColor: isTagSelected(tag) ? 'success.dark' : 'rgba(255, 255, 255, 0.1)'
                        }
                    }}
                    size="small"
                />
            ))}
        </Box>
    );
}
