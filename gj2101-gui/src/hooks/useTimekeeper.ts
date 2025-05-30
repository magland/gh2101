import { useState, useEffect, useMemo } from 'react';

interface UseTimekeeperProps {
  totalDuration: number;
}

export function useTimekeeper({ totalDuration }: UseTimekeeperProps) {
  const [currentTime, setCurrentTime] = useState<number>(parseInt(localStorage.getItem('timekeeper-current-time') || "0"))
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const setTime = useMemo(() => ((time: number) => {
    const newTime = Math.max(0, Math.min(totalDuration, time));
    setCurrentTime(newTime);
    localStorage.setItem('timekeeper-current-time', String(newTime));
  }), [totalDuration]);

  useEffect(() => {
    let intervalId: number;
    if (isPlaying) {
      intervalId = window.setInterval(() => {
        setTime(currentTime + 1);
        if (currentTime >= totalDuration) {
          setIsPlaying(false);
        }
      }, 1000);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isPlaying, totalDuration, currentTime, setTime]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    localStorage.removeItem('timekeeper-current-time');
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return {
    currentTime,
    isPlaying,
    handlePlayPause,
    handleReset,
    setTime
  };
}
