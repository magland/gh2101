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
  onLoadedMetadata?: (duration: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  url,
  title,
  currentTime,
  totalDuration,
  isPlaying,
  isMuted,
  onToggleMute,
  onLoadedMetadata
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

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleLoadedMetadata = () => {
        if (onLoadedMetadata && !isNaN(audio.duration)) {
          onLoadedMetadata(audio.duration);
        }
      };
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      // If already loaded, call immediately
      if (audio.duration) handleLoadedMetadata();
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [onLoadedMetadata]);

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
