import { useState, useEffect } from 'react';
import { Bout, ManifestData, ManifestItem } from '../types';

interface UseBoutSummaryProps {
  url: string;
  manifest: ManifestData;
  currentTime: number;
  setTime: (time: number) => void;
}

export const useBoutSummary = ({ url, manifest, currentTime, setTime }: UseBoutSummaryProps) => {
  const [boutSummaryUrl, setBoutSummaryUrl] = useState<string>('');
  const [boutSummary, setBoutSummary] = useState<Bout[] | null>(null);
  const [selectedBoutId, setSelectedBoutId] = useState<number | null>(null);

  const handleBoutSelect = (boutId: number) => {
    setSelectedBoutId(boutId);
    if (boutSummary) {
      const selectedBout = boutSummary.find(bout => bout.bout_id === boutId);
      if (selectedBout) {
        setTime(selectedBout.bout_start_seconds);
      }
    }
  };

  // Set bout summary URL based on manifest
  useEffect(() => {
    setBoutSummaryUrl("");
    if (!url) return;
    if (!manifest || manifest.length === 0) return;
    const boutSummaryFile = manifest.find((item: ManifestItem) => item.path.split('/').pop() === 'bout_summary.csv');
    setBoutSummaryUrl(boutSummaryFile ? `${url}/${boutSummaryFile.path}` : '');
  }, [manifest, url]);

  // Load and parse bout summary data
  useEffect(() => {
    setBoutSummary(null);
    if (!boutSummaryUrl) return;
    fetch(boutSummaryUrl)
      .then(response => response.text())
      .then(text => {
        const lines = text.split('\n');
        const headerLine = lines[0];
        const columnNames = headerLine.split(',').map(name => name.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(value => value.trim());
          const boutData: {[key: string]: number | string} = {};
          columnNames.forEach((name, index) => {
            if (name === 'bout_start_seconds' || name === 'bout_end_seconds' || name === 'bout_duration_seconds') {
              boutData[name] = parseFloat(values[index]);
            } else if (name === 'exp' || name === 'file_index' || name === 'bout_id' || name === 'n_calls') {
              boutData[name] = parseInt(values[index], 10);
            } else {
              console.warn(`Unknown column name: ${name}`);
            }
          });
          return boutData;
        });
        setBoutSummary(data as Bout[]);
      })
      .catch(error => console.error('Error loading bout summary:', error));
  }, [boutSummaryUrl]);

  // Update selected bout based on current time
  useEffect(() => {
    if (!boutSummary) return;

    const currentBout = boutSummary.find(bout =>
      currentTime >= bout.bout_start_seconds &&
      currentTime <= bout.bout_end_seconds
    );

    setSelectedBoutId(currentBout ? currentBout.bout_id : null);
  }, [currentTime, boutSummary]);

  return {
    boutSummary,
    selectedBoutId,
    handleBoutSelect
  };
};
