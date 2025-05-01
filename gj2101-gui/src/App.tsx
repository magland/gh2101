import { useEffect, useState } from 'react';
import { Box, Container, CssBaseline, ThemeProvider, createTheme, IconButton, Typography, Checkbox } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import queryString from 'query-string';
import { ManifestData } from './types';
import VideoPlayer from './components/VideoPlayer';
import AudioPlayer from './components/AudioPlayer';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [manifest, setManifest] = useState<ManifestData>([]);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mutedAudios, setMutedAudios] = useState<Record<string, boolean>>({});
  const [activeLocations, setActiveLocations] = useState<Record<string, boolean>>({});
  const totalDuration = 360; // 6 minutes in seconds

  const handleToggleMute = (audioPath: string) => {
    setMutedAudios(prev => ({
      ...prev,
      [audioPath]: !prev[audioPath]
    }));
  };

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

  // Load activeLocations from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('activeLocations');
    const storedBaseUrlForActiveLocations = localStorage.getItem('baseUrlForActiveLocations');

    if (storedData && storedBaseUrlForActiveLocations === baseUrl) {
      setActiveLocations(JSON.parse(storedData));
    }
  }, [baseUrl]);

  // Save activeLocations to localStorage when changed
  useEffect(() => {
    if (baseUrl) {
      localStorage.setItem('activeLocations', JSON.stringify(activeLocations));
      localStorage.setItem('baseUrlForActiveLocations', baseUrl);
    }
  }, [activeLocations, baseUrl]);

  useEffect(() => {
    const query = queryString.parse(window.location.search);
    const url = query.baseUrl as string;

    if (url) {
      setBaseUrl(url);
      fetch(`${url}/manifest.json`)
        .then(response => response.json())
        .then((data: ManifestData) => setManifest(data))
        .catch(error => console.error('Error loading manifest:', error));
    }
  }, []);

  // Group media files by location
  const mediaByLocation = manifest.reduce((acc, item) => {
    const location = item.path.split('_')[1];
    if (!acc[location]) {
      acc[location] = { videos: [], audios: [] };
    }
    if (item.path.endsWith('.mp4')) {
      acc[location].videos.push(item);
    } else if (item.path.endsWith('.wav')) {
      acc[location].audios.push(item);
    }
    return acc;
  }, {} as Record<string, { videos: typeof manifest, audios: typeof manifest }>);

  const locations = Object.keys(mediaByLocation).sort((a, b) => {
    const aHasTop = mediaByLocation[a].videos.some(v => v.path.split('_')[2] === 'top');
    const bHasTop = mediaByLocation[b].videos.some(v => v.path.split('_')[2] === 'top');
    if (aHasTop && !bHasTop) return -1;
    if (!aHasTop && bHasTop) return 1;
    return a.localeCompare(b);
  }).slice(0, 4);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth={false}>
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
            <IconButton onClick={handlePlayPause} size="large" color="primary">
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={handleReset} size="large">
              <RestartAltIcon />
            </IconButton>
            <Typography variant="h6">
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration % 60)).padStart(2, '0')}
            </Typography>
          </Box>
          <Box
            sx={{
              height: 20,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
              position: 'relative',
              cursor: 'pointer',
              mb: 2
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              const newTime = Math.max(0, Math.min(totalDuration, Math.floor(percentage * totalDuration)));
              setCurrentTime(newTime);
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${(currentTime / totalDuration) * 100}%`,
                bgcolor: 'primary.main',
                borderRadius: 1
              }}
            />
          </Box>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            '& > div': {
              flex: 1,
              minWidth: '450px'
            }
          }}>
            {locations.map(location => (
              <div key={location}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">
                      {location.charAt(0).toUpperCase() + location.slice(1)}
                    </Typography>
                    <Checkbox
                      checked={activeLocations[location]}
                      onChange={(e) => setActiveLocations(prev => ({
                        ...prev,
                        [location]: e.target.checked
                      }))}
                      // for some reason we get problems if we change the active locations while playing
                      disabled={isPlaying}
                      size="small"
                    />
                  </Box>
                  {activeLocations[location] && mediaByLocation[location].videos
                    .sort((a, b) => {
                      const aIsTop = a.path.split('_')[2] === 'top';
                      const bIsTop = b.path.split('_')[2] === 'top';
                      if (aIsTop && !bIsTop) return -1;
                      if (!aIsTop && bIsTop) return 1;
                      return 0;
                    })
                    .map(video => (
                    <Box sx={{ mb: 1 }} key={video.path}>
                      <VideoPlayer
                        url={`${baseUrl}/${video.path}`}
                        title={video.path.split('/').pop() || ''}
                        currentTime={currentTime}
                        totalDuration={totalDuration}
                        isPlaying={isPlaying}
                        shouldFlip={video.path === 'video_burrow_side_50.mp4'}
                      />
                    </Box>
                  ))}
                  {activeLocations[location] && mediaByLocation[location].audios.map(audio => (
                    <Box sx={{ mb: 1 }} key={audio.path}>
                      <AudioPlayer
                        url={`${baseUrl}/${audio.path}`}
                        title={audio.path.split('/').pop() || ''}
                        currentTime={currentTime}
                        totalDuration={totalDuration}
                        isPlaying={isPlaying}
                        isMuted={mutedAudios[audio.path] || false}
                        onToggleMute={() => handleToggleMute(audio.path)}
                      />
                    </Box>
                  ))}
                </Box>
              </div>
            ))}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
