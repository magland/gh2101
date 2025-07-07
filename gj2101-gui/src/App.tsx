import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import queryString from "query-string";
import { useEffect, useState, useCallback } from "react";
import ActiveLocationsSelector from "./components/ActiveLocationsSelector";
import AudioPlayer from "./components/AudioPlayer";
import BoutSummaryTable from "./components/BoutSummaryTable";
import { HBoxLayout } from "./components/HBoxLayout";
import SpectrogramToggle from "./components/SpectrogramToggle";
import { VBoxLayout } from "./components/VBoxLayout";
import VideoPlayer from "./components/VideoPlayer";
import WavSpectrogram from "./components/WavSpectrogram";
import { useActiveLocations } from "./hooks/useActiveLocations";
import { useBoutSummary } from "./hooks/useBoutSummary";
import { useMediaOrganization } from "./hooks/useMediaOrganization";
import { useTimekeeper } from "./hooks/useTimekeeper";
import { useMediaDuration } from "./hooks/useMediaDuration";
import { useWindowDimensions } from "./hooks/useWindowDimensions";
import { ManifestData, ManifestItem } from "./types";

function App() {
  const [manifest, setManifest] = useState<ManifestData>([]);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [csvUrl, setCsvUrl] = useState<string>("");
  const [csvText, setCsvText] = useState<string>("");
  const [mutedAudios, setMutedAudios] = useState<Record<string, boolean>>({});
  const [showSpectrograms, setShowSpectrograms] = useState<
    Record<string, boolean>
  >({});
  const query = queryString.parse(window.location.search);
  const { totalDuration, registerDuration } = useMediaDuration();

  const { currentTime, isPlaying, handlePlayPause, handleReset, setTime } =
    useTimekeeper({ totalDuration });

  const handleMediaDuration = useCallback((duration: number) => {
    registerDuration(duration);
  }, [registerDuration]);

  const handleToggleMute = (audioPath: string) => {
    setMutedAudios((prev) => ({
      ...prev,
      [audioPath]: !prev[audioPath],
    }));
  };

  const handleToggleSpectrogram = (audioPath: string) => {
    setShowSpectrograms((prev) => ({
      ...prev,
      [audioPath]: !prev[audioPath],
    }));
  };

  useEffect(() => {
    const url = query.baseUrl as string;
    if (url) {
      setBaseUrl(url);
      fetch(`${url}/manifest.json`)
        .then((response) => response.json())
        .then((data: ManifestData) => setManifest(data))
        .catch((error) => console.error("Error loading manifest:", error));
    }
  }, [query.baseUrl]);

  useEffect(() => {
    const url = query.csvUrl as string;
    if (url) {
      setCsvUrl(url);
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          setCsvText(data);
        })
        .catch((error) => console.error("Error loading CSV:", error));
    }
  }
  , [query.csvUrl]);

  const [fileIndex, setFileIndex] = useState<number>(
    () => {
      const stored = localStorage.getItem('timekeeper-file-index');
      return stored ? parseInt(stored, 10) : 58;
    }
  );

  const { boutSummary, selectedBoutId, handleBoutSelect } = useBoutSummary({
    csvText,
    fileIndex,
    currentTime,
    setTime,
  });

  // Get unique file numbers from bout summary
  const uniqueFileNums = boutSummary
    ? Array.from(new Set(boutSummary.map(bout => bout.file_num))).sort((a, b) => a - b)
    : [];

  const { mediaByLocation, locations, sortVideos } = useMediaOrganization({
    manifest,
    fileIndex,
  });

  const { activeLocations, toggleLocation, isToggleDisabled } =
    useActiveLocations({
      baseUrl,
      isPlaying,
    });

  const { width: W, height: H } = useWindowDimensions();

  const width = W - 40;
  const height = H - 40;

  const topHeight = 80;
  const leftPanelWidth = Math.max(250, Math.min(800, width * 0.25));

  return (
    <div style={{ position: "absolute", width, height, left: 20, top: 20 }}>
      <VBoxLayout heights={[topHeight, height - topHeight]} width={width}>
        <div>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1, pt: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="file-select-label">File Number</InputLabel>
              <Select
                labelId="file-select-label"
                value={fileIndex}
                label="File Number"
                onChange={(e) => {
                const newIndex = Number(e.target.value);
                setFileIndex(newIndex);
                localStorage.setItem('timekeeper-file-index', String(newIndex));
              }}
              >
                {uniqueFileNums.map((num) => (
                  <MenuItem key={num} value={num}>
                    File {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <IconButton onClick={handlePlayPause} size="small" color="primary">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton onClick={handleReset} size="small">
                <RestartAltIcon />
              </IconButton>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                height: 20,
                bgcolor: "rgba(19, 17, 17, 0.1)",
                borderRadius: 1,
                position: "relative",
                cursor: "pointer",
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                const newTime = Math.max(
                  0,
                  Math.min(totalDuration, Math.floor(percentage * totalDuration))
                );
                setTime(newTime);
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: (currentTime / totalDuration) * 100 + "%",
                  bgcolor: "primary.main",
                  borderRadius: 1,
                }}
              />
            </Box>
            <Typography variant="h6" component="span" sx={{ minWidth: '120px' }}>
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </Typography>

          </Box>
        </div>
        <HBoxLayout
          widths={[leftPanelWidth, width - leftPanelWidth]}
          height={height - topHeight}
        >
          <BoutSummaryTable
            boutSummary={boutSummary}
            selectedBoutId={selectedBoutId}
            onSelectBout={handleBoutSelect}
            manifest={manifest}
            baseUrl={baseUrl}
            csvUrl={csvUrl}
            fileIndex={fileIndex}
          />
          <div
            style={{
              position: "relative",
              width: width - leftPanelWidth,
              height: height - topHeight,
              overflowY: "auto",
            }}
          >
            <ActiveLocationsSelector
              activeLocations={activeLocations}
              toggleLocation={toggleLocation}
              isToggleDisabled={isToggleDisabled}
              locations={locations}
            />
            {locations
              .filter((location) => activeLocations[location])
              .map((location) => (
                <div key={location}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      overflowX: "auto",
                      mb: 2,
                      pb: 1,
                    }}
                  >
                    {sortVideos(mediaByLocation[location].videos).map(
                      (video: ManifestItem) => (
                        <Box
                          sx={{
                            flex: "0 0 auto",
                            width: "clamp(200px, 45%, 1800px)",
                          }}
                          key={video.path}
                        >
                          <VideoPlayer
                            url={`${baseUrl}/${video.path}`}
                            title=""
                            currentTime={currentTime}
                            isPlaying={isPlaying}
                            shouldFlipX={
                              video.path.includes("video_burrow_side") // issue with Gily's data
                            }
                            shouldFlipY={
                              video.path.includes("video_burrow_side") // issue with Gily's data
                            }
                            onLoadedMetadata={(duration) =>
                              handleMediaDuration(duration)
                            }
                          />
                        </Box>
                      )
                    )}
                  </Box>
                  <div>
                    {mediaByLocation[location].audios.map(
                      (audio: ManifestItem) => (
                        <div key={audio.path}>
                          <div>
                            <AudioPlayer
                              url={`${baseUrl}/${audio.path}`}
                              title={audio.path.split("/").pop() || ""}
                              currentTime={currentTime}
                              totalDuration={totalDuration}
                              isPlaying={isPlaying}
                              isMuted={mutedAudios[audio.path] || false}
                              onToggleMute={() => handleToggleMute(audio.path)}
                              onLoadedMetadata={(duration) =>
                                handleMediaDuration(duration)
                              }
                            />
                            <SpectrogramToggle
                              isVisible={showSpectrograms[audio.path] || false}
                              onToggle={() =>
                                handleToggleSpectrogram(audio.path)
                              }
                            />
                          </div>
                          {showSpectrograms[audio.path] && (
                            <div>
                              <WavSpectrogram
                                width={width - leftPanelWidth - 30}
                                url={`${baseUrl}/${audio.path}`}
                                currentTime={currentTime}
                                onTimeChange={setTime}
                              />
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
          </div>
        </HBoxLayout>
      </VBoxLayout>
    </div>
  );
}

export default App;
