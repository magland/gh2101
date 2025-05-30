import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { IconButton } from '@mui/material';
import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  url: string;
  title: string;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  url,
  title,
  currentTime,
  totalDuration,
  isPlaying,
  isMuted,
  onToggleMute
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (!isNaN(currentTime) && currentTime >= 0 && currentTime <= totalDuration) {
        audio.currentTime = currentTime;
      }
      if (isPlaying) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [currentTime, totalDuration, isPlaying]);

  return (
    <>
      {title}
      <IconButton onClick={onToggleMute} size="small">
        {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        muted={isMuted}
        controls
        controlsList="nodownload"
      >
        <source src={url} type="audio/wav" />
        Your browser does not support the audio tag.
      </audio>
    </>
  );
};

export default AudioPlayer;
