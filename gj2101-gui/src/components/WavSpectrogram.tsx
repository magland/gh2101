import { useMemo, useState, useEffect } from 'react';
import { Box } from '@mui/material';

interface WavSpectrogramProps {
  url: string;
  currentTime: number;
  onTimeChange: (time: number) => void;
  width: number;
}

const WavSpectrogram: React.FC<WavSpectrogramProps> = ({
  url,
  currentTime,
  onTimeChange,
  width
}) => {
  // Calculate the 10-second window that contains the current time
  const spectrogramWindow = useMemo(() => {
    const windowStart = Math.floor(currentTime / 10) * 10;
    return {
      start: windowStart,
      duration: 10
    };
  }, [currentTime]);

  // Construct the spectrogram URL
  const spectrogramUrl = useMemo(() => {
    return `https://specgram-svc.vercel.app/api/specgram?url=${encodeURIComponent(url)}&start=${spectrogramWindow.start}&duration=${spectrogramWindow.duration}`;
  }, [url, spectrogramWindow]);

  // Calculate the position of the vertical line as a percentage
  const linePosition = useMemo(() => {
    const windowStart = Math.floor(currentTime / 10) * 10;
    return ((currentTime - windowStart) / 10) * 100;
  }, [currentTime]);

  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when URL changes
  useEffect(() => {
    setIsLoading(true);
  }, [spectrogramUrl]);

  return (
    <Box
      sx={{ width, position: 'relative', height: 90, bgcolor: '#aaa' }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const windowStart = Math.floor(currentTime / 10) * 10;
        const clickedTime = windowStart + (percentage * 10);
        onTimeChange(clickedTime);
      }}
    >
      <img
        src={spectrogramUrl}
        alt="Audio spectrogram"
        style={{
          width: '100%',
          height: 90,
          display: isLoading ? 'none' : 'block'
        }}
        onLoad={() => setIsLoading(false)}
      />
      <Box
        sx={{
          position: 'absolute',
          left: `${linePosition}%`,
          top: 0,
          bottom: 0,
          width: '2px',
          bgcolor: 'yellow',
          zIndex: 1
        }}
      />
    </Box>
  );
};

export default WavSpectrogram;
