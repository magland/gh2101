import { Card, CardContent, Typography, Paper, Box } from '@mui/material';
import { useEffect, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  shouldFlip?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, currentTime, totalDuration, isPlaying, shouldFlip }) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (videoElement) {
      if (!isNaN(currentTime) && currentTime >= 0 && currentTime <= totalDuration) {
        videoElement.currentTime = currentTime;
      }
      if (isPlaying) {
        videoElement.play().catch(() => {});
      } else {
        videoElement.pause();
      }
    }
  }, [currentTime, totalDuration, isPlaying, videoElement]);

  const [displaySeeking, setDisplaySeeking] = useState(false);
  useEffect(() => {
    if (!isSeeking) {
      setDisplaySeeking(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      setDisplaySeeking(true);
    }
    , 1000);
    return () => {
      clearTimeout(timeoutId);
    }
  }
  , [isSeeking]);

  return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Paper elevation={3}>
            <Box sx={{ position: "relative" }}>
              <video
                ref={elmt => setVideoElement(elmt)}
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: 600,
                  height: "auto",
                  transform: shouldFlip ? "scaleX(-1) scaleY(-1)" : "none"
                }}
                onSeeking={() => {
                  setIsSeeking(true);
                }}
                onSeeked={() => {
                  setIsSeeking(false);
                }}
                disablePictureInPicture
                controlsList="noplaybackrate nofullscreen nodownload"
                preload="metadata"
              >
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {displaySeeking && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.875rem"
                  }}
                >
                  Seeking...
                </Box>
              )}
            </Box>
          </Paper>
        </CardContent>
      </Card>
  );
};

export default VideoPlayer;
