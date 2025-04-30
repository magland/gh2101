import { Card, CardContent, Typography, Paper } from '@mui/material';
import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  shouldFlip?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, currentTime, totalDuration, isPlaying, shouldFlip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (!isNaN(currentTime) && currentTime >= 0 && currentTime <= totalDuration) {
        video.currentTime = currentTime;
      }
      if (isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [currentTime, totalDuration, isPlaying]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Paper elevation={3}>
          <video
            ref={videoRef}
            width="100%"
            style={{
              display: 'block',
              maxHeight: '400px',
              transform: shouldFlip ? 'scaleX(-1) scaleY(-1)' : 'none'
            }}
            disablePictureInPicture
            controlsList="noplaybackrate nofullscreen nodownload"
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
