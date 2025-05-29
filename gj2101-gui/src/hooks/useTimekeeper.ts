import { useState, useEffect } from 'react';

interface UseTimekeeperProps {
  totalDuration: number;
}

export function useTimekeeper({ totalDuration }: UseTimekeeperProps) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let intervalId: number;
    if (isPlaying) {
      intervalId = window.setInterval(() => {
        setCurrentTime(time => {
          if (time >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return time + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isPlaying, totalDuration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const setTime = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(totalDuration, time)));
  };

  return {
    currentTime,
    isPlaying,
    handlePlayPause,
    handleReset,
    setTime
  };
}
