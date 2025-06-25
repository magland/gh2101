import { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import { Bout, BoutTag, BoutNote as BoutNoteType, ManifestData } from '../types';
import { useBoutAnnotations } from '../hooks/useBoutAnnotations';
import BoutTags from './BoutTags';
import BoutNote from './BoutNote';

interface BoutSummaryTableProps {
  boutSummary: Bout[] | null;
  selectedBoutId: number | null;
  onSelectBout: (boutId: number) => void;
  baseUrl: string;
  csvUrl: string;
  fileIndex: number;
  manifest: ManifestData;
}

export default function BoutSummaryTable({ boutSummary, selectedBoutId, onSelectBout, baseUrl, csvUrl, fileIndex }: BoutSummaryTableProps) {
  const { addTag, removeTag, getTagsForBout, tags, setTags, clearAllTags, setNote, getNoteForBout, setNotes, getAllUniqueTagNames } = useBoutAnnotations(baseUrl, csvUrl);
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
      'file_num',
      'channel',
      'start_time_file_sec',
      'stop_time_file_sec',
      'duration_sec',
      'assigned_location',
      'bout_id',
      'num_calls',
      'tags',
      'note'
    ].join(',');

    // Create CSV rows from all bouts
    const rows = boutSummary.map((bout: Bout) => {
      const boutNote = getNoteForBout(bout.bout_id) || '';
      return [
        bout.exp,
        bout.file_num,
        bout.channel,
        bout.start_time_file_sec.toFixed(1),
        bout.stop_time_file_sec.toFixed(1),
        bout.duration_sec.toFixed(1),
        bout.assigned_location,
        bout.bout_id,
        bout.calls.length,
        tags.filter((tag: BoutTag) => tag.bout === bout.bout_id).map((tag: BoutTag) => tag.name).join(';'),
        `"${boutNote.replace(/"/g, '""')}"`
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
      <>
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
                  const noteIndex = headers.findIndex(h => h.trim() === 'note');

                  if (tagsIndex === -1 || boutIdIndex === -1) {
                    alert('Invalid CSV format. Must contain bout_id and tags columns.');
                    return;
                  }

                  const newTags: BoutTag[] = [];
                  const newNotes: BoutNoteType[] = [];

                  for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Simple CSV parsing - split by comma but handle quoted fields
                    const values: string[] = [];
                    let current = '';
                    let inQuotes = false;

                    for (let j = 0; j < line.length; j++) {
                      const char = line[j];
                      if (char === '"') {
                        if (inQuotes && line[j + 1] === '"') {
                          current += '"';
                          j++; // Skip next quote
                        } else {
                          inQuotes = !inQuotes;
                        }
                      } else if (char === ',' && !inQuotes) {
                        values.push(current);
                        current = '';
                      } else {
                        current += char;
                      }
                    }
                    values.push(current); // Add the last value

                    const boutId = parseInt(values[boutIdIndex]);
                    const tagString = values[tagsIndex];

                    // Handle tags
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

                    // Handle notes (if note column exists)
                    if (noteIndex !== -1 && values[noteIndex]) {
                      const noteText = values[noteIndex].trim();
                      if (noteText) {
                        newNotes.push({
                          bout: boutId,
                          note: noteText
                        });
                      }
                    }
                  }

                  const storageKey = `bout_annotations_${baseUrl}_${csvUrl}`;
                  const data: { tags: BoutTag[]; notes?: BoutNoteType[] } = { tags: newTags };
                  if (newNotes.length > 0) {
                    data.notes = newNotes;
                  }
                  localStorage.setItem(storageKey, JSON.stringify(data));
                  setTags(newTags);
                  setNotes(newNotes);
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
      </>
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
      <TableContainer component={Paper} sx={{ width: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>Bout ID</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>File</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>Start (s)</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>End (s)</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}># calls</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>Tags</TableCell>
              <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>N</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boutSummary.filter(b => b.file_num === fileIndex).map((bout, index) => (
              <TableRow
                key={index}
                onClick={() => onSelectBout(bout.bout_id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedBoutId === bout.bout_id ? '#cef' : 'inherit',
                  '&:hover': {
                    bgcolor: selectedBoutId === bout.bout_id ? '#def' : 'action.hover',
                  }
                }}
              >
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>{bout.bout_id}</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>
                  {bout.file_num}
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>{bout.start_time_file_sec.toFixed(1)}</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>{bout.stop_time_file_sec.toFixed(1)}</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', padding: '2px 4px' }}>
                  {bout.calls.length}
                </TableCell>
                <TableCell sx={{ padding: '2px 4px' }}>
                  <BoutTags
                    tags={getTagsForBout(bout.bout_id)}
                    availableTags={getAllUniqueTagNames()}
                    onAddTag={(tag) => addTag(bout.bout_id, tag)}
                    onRemoveTag={(tag) => removeTag(bout.bout_id, tag)}
                  />
                </TableCell>
                <TableCell sx={{ padding: '2px 4px' }}>
                  <BoutNote
                    note={getNoteForBout(bout.bout_id)}
                    onSetNote={(note) => setNote(bout.bout_id, note)}
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
