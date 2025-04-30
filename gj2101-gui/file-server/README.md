# Video/Audio File Server

This is a specialized file server designed to serve video and audio files for the GJ2101 synchronized playback interface. It supports range requests for efficient media streaming and includes CORS support for specific origins.

## Purpose

This server is designed to work with the GJ2101 web interface, which provides synchronized playback of multiple video and audio streams from different camera angles and microphone locations. The interface expects to find:
- Video files (*.mp4) showing different views (top/side) of various locations
- Audio files (*.wav) from different locations
- A manifest.json file listing all available media files (see sample below)

## Prerequisites

### macOS

1. Install Node.js:
   ```bash
   # Using Homebrew (recommended)
   brew install node

   # Or download from https://nodejs.org/ (LTS version)
   ```

### Linux

1. Install Node.js:
   ```bash
   # Using apt (Ubuntu/Debian)
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Using dnf (Fedora)
   sudo dnf install nodejs
   ```

## Installation

1. Clone or download this repository
2. Navigate to the file-server directory:
   ```bash
   cd file-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server, pointing it to your data directory:
   ```bash
   SERVE_PATH=/path/to/your/data npm start
   ```

2. The server will start on port 8091 and display configuration details

3. Access the web interface by visiting:
   ```
   https://gj2101-gui.vercel.app/?baseUrl=http://localhost:8091
   ```

This will load the synchronized playback interface, which will:
- Fetch manifest.json from your local server
- Load and display all videos and audio tracks
- Enable synchronized playback across all media files
- Support seeking through the timeline

## Features

- Range request support for efficient video streaming
- CORS enabled for the web interface
- Automatic content-type detection
- Request cancellation handling
- Detailed logging of all operations

## Server Configuration

The server can be configured using environment variables:

- `SERVE_PATH`: (Required) Path to the directory containing your media files
- `PORT`: (Optional) Server port number (default: 8091)

## Directory Structure

Your data directory should contain:
- Video files (*.mp4)
- Audio files (*.wav)
- manifest.json listing all media files (see below)

## Sample manifest.json file

```json
[
    {
        "path": "audio_burrow_50.wav",
        "size": 179974030
    },
    {
        "path": "audio_arena1_50.wav",
        "size": 179974030
    },
    {
        "path": "video_arena2_50.mp4",
        "size": 285007833
    },
    {
        "path": "video_burrow_side_50.mp4",
        "size": 373387047
    },
    {
        "path": "video_nest_top_50.mp4",
        "size": 516208499
    },
    {
        "path": "video_arena1_50.mp4",
        "size": 336715303
    },
    {
        "path": "video_nest_side_50.mp4",
        "size": 420396281
    },
    {
        "path": "audio_arena2_50.wav",
        "size": 179974030
    },
    {
        "path": "video_burrow_top_50.mp4",
        "size": 505649855
    },
    {
        "path": "audio_nest_50.wav",
        "size": 179974030
    }
]
```