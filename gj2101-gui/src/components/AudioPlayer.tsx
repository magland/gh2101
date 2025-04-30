import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
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
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            {title}
          </Typography>
          <IconButton onClick={onToggleMute} size="small">
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Box>
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
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
