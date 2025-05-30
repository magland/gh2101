import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Box,
  IconButton,
  Typography
} from "@mui/material";
import queryString from "query-string";
import { useEffect, useState } from "react";
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
import { useWindowDimensions } from "./hooks/useWindowDimensions";
import { ManifestData, ManifestItem } from "./types";

function App() {
  const [manifest, setManifest] = useState<ManifestData>([]);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [mutedAudios, setMutedAudios] = useState<Record<string, boolean>>({});
  const [showSpectrograms, setShowSpectrograms] = useState<
    Record<string, boolean>
  >({});
  const totalDuration = 360; // 6 minutes in seconds

  const { currentTime, isPlaying, handlePlayPause, handleReset, setTime } =
    useTimekeeper({ totalDuration });

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

  const query = queryString.parse(window.location.search);
  const url = query.baseUrl as string;
  const fileIndex = parseInt((query.fileIndex as string) || "");

  useEffect(() => {
    if (url) {
      setBaseUrl(url);
      fetch(`${url}/manifest.json`)
        .then((response) => response.json())
        .then((data: ManifestData) => setManifest(data))
        .catch((error) => console.error("Error loading manifest:", error));
    }
  }, [url]);

  const { boutSummary, selectedBoutId, handleBoutSelect } = useBoutSummary({
    url,
    fileIndex,
    manifest,
    currentTime,
    setTime,
  });

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

  const topHeight = 120;
  const leftPanelWidth = Math.max(250, Math.min(800, width * 0.25));
  const barWidth = width - 50;

  return (
    <div style={{ position: "absolute", width, height, left: 20, top: 20 }}>
      <VBoxLayout heights={[topHeight, height - topHeight]} width={width}>
        <div>
          <Box>
            <IconButton onClick={handlePlayPause} size="small" color="primary">
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={handleReset} size="small">
              <RestartAltIcon />
            </IconButton>
            <Typography variant="h6">
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </Typography>
          </Box>
          <Box
            sx={{
              width: barWidth,
              height: 20,
              bgcolor: "rgba(19, 17, 17, 0.1)",
              borderRadius: 1,
              position: "relative",
              cursor: "pointer",
              mb: 2,
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
                width: (currentTime / totalDuration) * barWidth,
                bgcolor: "primary.main",
                borderRadius: 1,
              }}
            />
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
                <div>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      overflowX: "auto",
                      mb: 2,
                      pb: 1 /* Space for scrollbar */,
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
                            // title={video.path.split('/').pop() || ''}
                            currentTime={currentTime}
                            totalDuration={totalDuration}
                            isPlaying={isPlaying}
                            shouldFlip={
                              video.path === "video_burrow_side_50.mp4"
                            }
                          />
                        </Box>
                      )
                    )}
                  </Box>
                  <div>
                    {mediaByLocation[location].audios.map(
                      (audio: ManifestItem) => (
                        <>
                          <div>
                            <AudioPlayer
                              url={`${baseUrl}/${audio.path}`}
                              title={audio.path.split("/").pop() || ""}
                              currentTime={currentTime}
                              totalDuration={totalDuration}
                              isPlaying={isPlaying}
                              isMuted={mutedAudios[audio.path] || false}
                              onToggleMute={() => handleToggleMute(audio.path)}
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
                        </>
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
