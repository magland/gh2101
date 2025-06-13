import { useEffect, useState } from 'react';
import { Bout, Call } from '../types';

interface UseBoutSummaryProps {
  csvText: string;
  fileIndex: number;
  currentTime: number;
  setTime: (time: number) => void;
}

export const useBoutSummary = ({ csvText, fileIndex, currentTime, setTime }: UseBoutSummaryProps) => {
  const [boutSummary, setBoutSummary] = useState<Bout[] | null>(null);
  const [selectedBoutId, setSelectedBoutId] = useState<number | null>(null);

  const handleBoutSelect = (boutId: number) => {
    if (boutSummary) {
      const selectedBout = boutSummary.find(bout => bout.bout_id === boutId);
      if (selectedBout) {
        setTime(selectedBout.start_time_file_sec);
      }
    }
  };

  // Load and parse bout summary data
  useEffect(() => {
    setBoutSummary(null);
    if (!csvText) return;
    const lines = csvText.split('\n');
    const headerLine = lines[0];
    const columnNames = headerLine.split(',').map(name => name.trim());
    const allCalls = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const valuesByColumn: Record<string, string> = {};
      columnNames.forEach((name, index) => {
        valuesByColumn[name] = values[index] || '';
      });
      const callData: Call = {
        exp: parseInt(valuesByColumn['exp'], 10),
        file_num: parseInt(valuesByColumn['file_num'], 10),
        event_type: valuesByColumn['event_type'] as "alarm" | "string",
        channel: parseInt(valuesByColumn['channel'], 10),
        start_time_file_sec: parseFloat(valuesByColumn['start_time_file_sec']),
        stop_time_file_sec: parseFloat(valuesByColumn['stop_time_file_sec']),
        duration_sec: parseFloat(valuesByColumn['duration_sec']),
        start_time_real: valuesByColumn['start_time_real'],
        stop_time_real: valuesByColumn['stop_time_real'],
        start_time_experiment: valuesByColumn['start_time_experiment'],
        stop_time_experiment: valuesByColumn['stop_time_experiment'],
        start_time_experiment_sec: parseFloat(valuesByColumn['start_time_experiment_sec']),
        stop_time_experiment_sec: parseFloat(valuesByColumn['stop_time_experiment_sec']),
        assigned_location: valuesByColumn['assigned_location'] as "underground" | "arena_1" | "arena_2" | string,
        RMS_areaa_1: valuesByColumn['RMS_areaa_1'],
        RMS_arena_2: valuesByColumn['RMS_arena_2'],
        RMS_underground: valuesByColumn['RMS_underground'],
        source: valuesByColumn['source'] as "vox" | string,
        bout_id: parseInt(valuesByColumn['bout_id'], 10),
        position_in_bout: parseInt(valuesByColumn['position_in_bout'], 10),
        caller_id: valuesByColumn['caller_id'] || ''
      }
      return callData;
    });
    const allBoutIds = Array.from(new Set(allCalls.map(call => call.bout_id))).filter(b => !isNaN(b));
    const allBouts: Bout[] = allBoutIds.map(boutId => {
      const callsForBout = allCalls.filter(call => call.bout_id === boutId);
      const firstCall = callsForBout[0];
      return {
        exp: firstCall.exp,
        file_num: firstCall.file_num,
        channel: firstCall.channel,
        start_time_file_sec: Math.min(...callsForBout.map(call => call.start_time_file_sec)),
        stop_time_file_sec: Math.max(...callsForBout.map(call => call.stop_time_file_sec)),
        duration_sec: Math.max(...callsForBout.map(call => call.stop_time_file_sec)) - Math.min(...callsForBout.map(call => call.start_time_file_sec)),
        assigned_location: firstCall.assigned_location,
        bout_id: boutId,
        caller_id: "",
        calls: callsForBout
      };
    });
    setBoutSummary(allBouts);
  }, [csvText]);

  // Update selected bout based on current time
  useEffect(() => {
    if (!boutSummary) return;

    const currentBout = boutSummary.filter(b => b.file_num === fileIndex).find(bout =>
      currentTime >= bout.start_time_file_sec &&
      currentTime <= bout.stop_time_file_sec
    );

    setSelectedBoutId(currentBout ? currentBout.bout_id : null);
  }, [currentTime, boutSummary, fileIndex]);

  return {
    boutSummary,
    selectedBoutId,
    handleBoutSelect
  };
};
