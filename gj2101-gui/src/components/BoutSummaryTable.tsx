import { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import { Bout, BoutTag, ManifestData } from '../types';
import { useBoutAnnotations } from '../hooks/useBoutAnnotations';
import BoutTags from './BoutTags';

interface BoutSummaryTableProps {
  boutSummary: Bout[] | null;
  selectedBoutId: number | null;
  onSelectBout: (boutId: number) => void;
  baseUrl: string;
  fileIndex: number;
  manifest: ManifestData;
}

export default function BoutSummaryTable({ boutSummary, selectedBoutId, onSelectBout, baseUrl, fileIndex }: BoutSummaryTableProps) {
  const { addTag, removeTag, getTagsForBout, tags, setTags, clearAllTags } = useBoutAnnotations(baseUrl);
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false);

  const handleClearConfirm = () => {
    clearAllTags();
    setClearDialogOpen(false);
  };

  const handleDownload = () => {
    if (!boutSummary) return;

    // Create CSV header
    const headers = [
      'exp',
      'file_index',
      'bout_id',
      'bout_start_seconds',
      'bout_end_seconds',
      'n_calls',
      'bout_duration_seconds',
      'tags'
    ].join(',');

    // Create CSV rows from all bouts
    const rows = boutSummary.map((bout: Bout) => {
      return [
        bout.exp,
        bout.file_index,
        bout.bout_id,
        bout.bout_start_seconds,
        bout.bout_end_seconds,
        bout.n_calls,
        bout.bout_duration_seconds.toFixed(1),
        tags.filter((tag: BoutTag) => tag.bout === bout.bout_id).map((tag: BoutTag) => tag.name).join(';')
      ].join(',');
    });

    // Combine header and rows
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bout_annotations_${baseUrl.split('/').pop()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!boutSummary) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1, alignItems: 'center' }}>
        <Tooltip title="Download Annotations">
          <IconButton onClick={handleDownload} size="small">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Upload Annotations">
          <IconButton
            component="label"
            size="small"
          >
            <input
              hidden
              accept=".csv"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                  const csvContent = event.target?.result as string;
                  const lines = csvContent.split('\n');
                  const headers = lines[0].split(',');
                  const tagsIndex = headers.findIndex(h => h.trim() === 'tags');
                  const boutIdIndex = headers.findIndex(h => h.trim() === 'bout_id');

                  if (tagsIndex === -1 || boutIdIndex === -1) {
                    alert('Invalid CSV format. Must contain bout_id and tags columns.');
                    return;
                  }

                  const newTags: BoutTag[] = [];
                  for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const values = line.split(',');
                    const boutId = parseInt(values[boutIdIndex]);
                    const tagString = values[tagsIndex];

                    if (tagString) {
                      const tags = tagString.split(';');
                      tags.forEach(tag => {
                        if (tag.trim()) {
                          newTags.push({
                            bout: boutId,
                            name: tag.trim()
                          });
                        }
                      });
                    }
                  }

                  const storageKey = `bout_annotations_${baseUrl}`;
                  localStorage.setItem(storageKey, JSON.stringify({ tags: newTags }));
                  setTags(newTags);
                };

                reader.readAsText(file);
                e.target.value = ''; // Reset input
              }}
            />
            <UploadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear All Annotations">
          <IconButton
            size="small"
            onClick={() => setClearDialogOpen(true)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear All Annotations?</DialogTitle>
        <DialogContent>
          This will clear ALL annotations associated with this URL, not just for the current file index.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearConfirm} color="error">Clear All</Button>
        </DialogActions>
      </Dialog>
      <TableContainer component={Paper} sx={{ width: '100%', maxHeight: '80vh' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>Bout ID</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>Start (s)</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>End (s)</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}># Calls</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>Tags</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boutSummary.filter(b => b.file_index === fileIndex).map((bout, index) => (
              <TableRow
                key={index}
                onClick={() => onSelectBout(bout.bout_id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedBoutId === bout.bout_id ? 'primary.dark' : 'inherit',
                  '&:hover': {
                    bgcolor: selectedBoutId === bout.bout_id ? 'primary.dark' : 'action.hover',
                  }
                }}
              >
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>{bout.bout_id}</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>{bout.bout_start_seconds.toFixed(1)}</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>{bout.bout_end_seconds.toFixed(1)}</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>{bout.n_calls}</TableCell>
                <TableCell sx={{ padding: '2px 4px' }}>
                  <BoutTags
                    tags={getTagsForBout(bout.bout_id)}
                    onAddTag={(tag) => addTag(bout.bout_id, tag)}
                    onRemoveTag={(tag) => removeTag(bout.bout_id, tag)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
