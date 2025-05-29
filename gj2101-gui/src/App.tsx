import { useEffect, useState } from 'react';
import { useTimekeeper } from './hooks/useTimekeeper';
import { Box, Container, CssBaseline, ThemeProvider, IconButton, Typography, Checkbox } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import queryString from 'query-string';
import { ManifestData, ManifestItem } from './types';
import VideoPlayer from './components/VideoPlayer';
import AudioPlayer from './components/AudioPlayer';
import WavSpectrogram from './components/WavSpectrogram';
import SpectrogramToggle from './components/SpectrogramToggle';
import BoutSummaryTable from './components/BoutSummaryTable';
import { darkTheme } from './theme/darkTheme';
import { useBoutSummary } from './hooks/useBoutSummary';
import { useMediaOrganization } from './hooks/useMediaOrganization';
import { useActiveLocations } from './hooks/useActiveLocations';

function App() {
  const [manifest, setManifest] = useState<ManifestData>([]);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [mutedAudios, setMutedAudios] = useState<Record<string, boolean>>({});
  const [showSpectrograms, setShowSpectrograms] = useState<Record<string, boolean>>({});
  const totalDuration = 360; // 6 minutes in seconds

  const { currentTime, isPlaying, handlePlayPause, handleReset, setTime } = useTimekeeper({ totalDuration });

  const handleToggleMute = (audioPath: string) => {
    setMutedAudios(prev => ({
      ...prev,
      [audioPath]: !prev[audioPath]
    }));
  };

  const handleToggleSpectrogram = (audioPath: string) => {
    setShowSpectrograms(prev => ({
      ...prev,
      [audioPath]: !prev[audioPath]
    }));
  };

  const query = queryString.parse(window.location.search);
  const url = query.baseUrl as string;
  const fileIndex = query.fileIndex as string || '';

  useEffect(() => {
    if (url) {
      setBaseUrl(url);
      fetch(`${url}/manifest.json`)
        .then(response => response.json())
        .then((data: ManifestData) => setManifest(data))
        .catch(error => console.error('Error loading manifest:', error));
    }
  }, [url]);

  const { boutSummary, selectedBoutId, handleBoutSelect } = useBoutSummary({
    url,
    manifest,
    fileIndex,
    currentTime,
    setTime
  });

  const { mediaByLocation, locations, sortVideos } = useMediaOrganization({ manifest, fileIndex });

  const { activeLocations, toggleLocation, isToggleDisabled } = useActiveLocations({
    baseUrl,
    isPlaying
  });

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
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
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
              setTime(newTime);
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flexShrink: 0 }}>
              <BoutSummaryTable
                boutSummary={boutSummary}
                selectedBoutId={selectedBoutId}
                onSelectBout={handleBoutSelect}
              />
            </Box>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              flex: 1,
              '& > div': {
                flex: 1,
                minWidth: '450px'
              }
            }}>
              {locations.map((location: string) => (
                <div key={location}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">
                        {location}
                      </Typography>
                      <Checkbox
                        checked={activeLocations[location]}
                        onChange={() => toggleLocation(location)}
                        disabled={isToggleDisabled}
                        size="small"
                      />
                    </Box>
                    {activeLocations[location] && sortVideos(mediaByLocation[location].videos)
                      .map((video: ManifestItem) => (
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
                    {activeLocations[location] && mediaByLocation[location].audios.map((audio: ManifestItem) => (
                      <Box sx={{ mb: 1 }} key={audio.path}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <AudioPlayer
                            url={`${baseUrl}/${audio.path}`}
                            title={audio.path.split('/').pop() || ''}
                            currentTime={currentTime}
                            totalDuration={totalDuration}
                            isPlaying={isPlaying}
                            isMuted={mutedAudios[audio.path] || false}
                            onToggleMute={() => handleToggleMute(audio.path)}
                          />
                          <SpectrogramToggle
                            isVisible={showSpectrograms[audio.path] || false}
                            onToggle={() => handleToggleSpectrogram(audio.path)}
                          />
                        </Box>
                        {showSpectrograms[audio.path] && (
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <WavSpectrogram
                              url={`${baseUrl}/${audio.path}`}
                              currentTime={currentTime}
                              onTimeChange={setTime}
                            />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </div>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
