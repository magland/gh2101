import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Bout } from '../types';

interface BoutSummaryTableProps {
  boutSummary: Bout[] | null;
  selectedBoutId: number | null;
  onSelectBout: (boutId: number) => void;
}

export default function BoutSummaryTable({ boutSummary, selectedBoutId, onSelectBout }: BoutSummaryTableProps) {
  if (!boutSummary) return null;

  return (
    <TableContainer component={Paper} sx={{ width: 350, maxHeight: '80vh' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Bout ID</TableCell>
            <TableCell>Start (s)</TableCell>
            <TableCell>End (s)</TableCell>
            <TableCell># Calls</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {boutSummary.map((bout, index) => (
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
              <TableCell>{bout.bout_id}</TableCell>
              <TableCell>{bout.bout_start_seconds.toFixed(1)}</TableCell>
              <TableCell>{bout.bout_end_seconds.toFixed(1)}</TableCell>
              <TableCell>{bout.n_calls}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
