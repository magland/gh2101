import { useState, useCallback } from 'react';

export const useMediaDuration = () => {
  const [mediaDurations, setMediaDurations] = useState<number[]>([]);

  const registerDuration = useCallback((duration: number) => {
    setMediaDurations((prev) => {
      // Ensure the duration is a valid number and not already in the list
      if (typeof duration === 'number' && !isNaN(duration) && !prev.includes(duration)) {
        return [...prev, duration];
      }
      return prev;
    });
  }, []);

  const totalDuration = Math.max(...mediaDurations, 0);

  return {
    totalDuration,
    registerDuration
  };
};
