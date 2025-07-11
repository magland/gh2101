"""
/api/specgram?url=...&start=20&duration=10
Binary `image/png` response, <250 MB bundle.
"""
import io, os, struct, math
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler

import fsspec, soundfile as sf, numpy as np
from scipy.signal import spectrogram        # remove this import if you use the NumPy STFT
from PIL import Image

# ---- constants ---------------------------------------------------------------
FPS_AUDIO      = 125_000
N_FFT          = 512
N_PER_SEG      = 512
N_OVERLAP      = 256
LOG_OFFSET     = 1e-12
# 256-entry Viridis palette (RGB triples flattened)
_VIRIDIS = (
    b'\x44\x00\x70\x46\x01\x72\x47\x02\x74\x48\x03\x75\x49\x04\x77\x4a\x05\x78\x4b\x06'
    b'\x79\x4c\x07\x7a\x4d\x07\x7b\x4e\x08\x7c\x4f\x09\x7d\x50\x0a\x7e\x51\x0b\x7e\x52\x0c'
    b'\x7f\x53\x0d\x80\x54\x0e\x81\x55\x0f\x82\x56\x10\x82\x57\x11\x83\x57\x13\x84\x58\x14'
    b'\x85\x59\x15\x85\x5a\x16\x86\x5b\x17\x87\x5c\x18\x87\x5d\x19\x88\x5e\x1a\x89\x5f\x1c'
    b'\x89\x60\x1d\x8a\x61\x1e\x8b\x61\x1f\x8b\x62\x20\x8c\x63\x21\x8c\x64\x23\x8d\x65\x24'
    b'\x8e\x66\x25\x8e\x67\x26\x8f\x67\x27\x8f\x68\x29\x90\x69\x2a\x90\x6a\x2b\x91\x6b\x2c'
    b'\x91\x6b\x2d\x92\x6c\x2e\x92\x6d\x2f\x92\x6e\x31\x93\x6e\x32\x93\x6f\x33\x94\x70\x34'
    b'\x94\x71\x35\x94\x71\x36\x95\x72\x37\x95\x73\x38\x95\x73\x3a\x96\x74\x3b\x96\x75\x3c'
    b'\x96\x76\x3d\x97\x76\x3e\x97\x77\x3f\x97\x78\x40\x97\x78\x41\x98\x79\x42\x98\x7a\x43'
    b'\x98\x7a\x44\x98\x7b\x46\x99\x7c\x47\x99\x7c\x48\x99\x7d\x49\x99\x7d\x4a\x99\x7e\x4b'
    b'\x9a\x7f\x4c\x9a\x7f\x4d\x9a\x80\x4e\x9a\x81\x4f\x9a\x81\x50\x9a\x82\x51\x9a\x82\x52'
    b'\x9a\x83\x53\x9b\x84\x54\x9b\x84\x55\x9b\x85\x56\x9b\x85\x57\x9b\x86\x58\x9b\x87\x59'
    b'\x9b\x87\x5a\x9b\x88\x5b\x9b\x88\x5c\x9b\x89\x5d\x9b\x89\x5e\x9b\x8a\x5f\x9b\x8a\x60'
    b'\x9b\x8b\x61\x9b\x8c\x62\x9b\x8c\x63\x9b\x8d\x64\x9b\x8d\x65\x9b\x8e\x66\x9b\x8e\x66'
    b'\x9b\x8f\x67\x9b\x8f\x68\x9b\x90\x69\x9b\x90\x6a\x9b\x91\x6b\x9b\x91\x6c\x9b\x92\x6d'
    b'\x9b\x92\x6e\x9b\x93\x6f\x9b\x93\x70\x9b\x94\x71\x9b\x94\x72\x9b\x95\x73\x9b\x95\x73'
    b'\x9a\x96\x74\x9a\x96\x75\x9a\x97\x76\x9a\x97\x77\x9a\x98\x78\x9a\x98\x79\x9a\x99\x7a'
    b'\x9a\x99\x7b\x9a\x9a\x7c\x9a\x9a\x7d\x99\x9b\x7d\x99\x9b\x7e\x99\x9c\x7f\x99\x9c\x80'
    b'\x99\x9d\x81\x99\x9d\x82\x98\x9d\x83\x98\x9e\x84\x98\x9e\x85\x98\x9f\x86\x97\x9f\x87'
    b'\x97\xa0\x88\x97\xa0\x89\x96\xa1\x8a\x96\xa1\x8b\x96\xa2\x8c\x96\xa2\x8d\x95\xa3\x8d'
    b'\x95\xa3\x8e\x95\xa4\x8f\x94\xa4\x90\x94\xa5\x91\x94\xa5\x92\x93\xa6\x93\x93\xa6\x94'
    b'\x92\xa7\x95\x92\xa7\x96\x92\xa8\x97\x91\xa8\x98\x91\xa9\x99\x90\xa9\x9a\x90\xaa\x9b'
    b'\x8f\xab\x9c\x8f\xab\x9d\x8e\xac\x9e\x8e\xac\x9f\x8d\xad\xa0\x8d\xad\xa1\x8c\xae\xa2'
    b'\x8c\xae\xa3\x8b\xaf\xa4\x8b\xaf\xa5\x8a\xb0\xa6\x8a\xb0\xa7\x89\xb1\xa8\x89\xb1\xa9'
    b'\x88\xb2\xaa\x88\xb2\xab\x87\xb3\xac\x87\xb3\xad\x86\xb4\xae\x86\xb4\xaf\x85\xb5\xb0'
    b'\x85\xb5\xb1\x84\xb6\xb2\x84\xb6\xb3\x83\xb7\xb4\x82\xb7\xb5\x82\xb8\xb6\x81\xb8\xb7'
    b'\x81\xb9\xb8\x80\xb9\xb9\x80\xba\xba\x7f\xba\xbb\x7f\xbb\xbc\x7e\xbb\xbd\x7d\xbc\xbe'
    b'\x7d\xbc\xbf\x7c\xbd\xc0\x7c\xbd\xc1\x7b\xbe\xc2\x7b\xbe\xc3\x7a\xbf\xc4\x7a\xbf\xc5'
    b'\x79\xc0\xc6\x79\xc0\xc7\x78\xc1\xc8\x78\xc1\xc9\x77\xc2\xca\x77\xc2\xcb\x76\xc3\xcc'
    b'\x76\xc3\xcd\x75\xc4\xce\x75\xc4\xcf\x74\xc5\xd0\x74\xc5\xd1\x73\xc6\xd2\x73\xc6\xd3'
    b'\x72\xc7\xd4\x72\xc7\xd5\x71\xc8\xd6\x71\xc8\xd7\x70\xc9\xd8\x70\xc9\xd9\x6f\xca\xda'
    b'\x6f\xca\xdb\x6e\xcb\xdc\x6e\xcb\xdd\x6d\xcc\xde\x6d\xcc\xdf\x6c\xcd\xe0\x6c\xcd\xe1'
    b'\x6b\xce\xe2\x6b\xce\xe3\x6a\xcf\xe4\x6a\xcf\xe5\x69\xd0\xe6\x69\xd0\xe7\x68\xd1\xe8'
    b'\x68\xd1\xe9\x67\xd2\xea\x67\xd2\xeb\x66\xd3\xec\x66\xd3\xed\x65\xd4\xee\x65\xd4\xef'
    b'\x64\xd5\xf0\x64\xd5\xf1\x63\xd6\xf2\x63\xd6\xf3\x62\xd7\xf4\x62\xd7\xf5\x61\xd8\xf6'
    b'\x61\xd8\xf7\x60\xd9\xf8\x60\xd9\xf9\x5f\xda\xfa\x5f\xda\xfb\x5f\xdb\xfc\x5e\xdb\xfd'
)

# ---- helpers -----------------------------------------------------------------
def make_spec_numpy(audio):
    """SciPy-free alternative <60 kB code, use if you DROP SciPy."""
    win  = np.hamming(N_PER_SEG).astype(np.float32)
    hop  = N_PER_SEG - N_OVERLAP
    nfrm = 1 + (len(audio) - N_PER_SEG) // hop
    if nfrm <= 0:
        raise ValueError("window shorter than FFT size")
    # Frame with stride tricks
    frames = np.lib.stride_tricks.as_strided(
        audio,
        shape=(nfrm, N_PER_SEG),
        strides=(audio.strides[0]*hop, audio.strides[0]),
        writeable=False,
    )
    frames = frames * win
    spec   = np.fft.rfft(frames, n=N_FFT, axis=1)
    spec   = np.abs(spec).T.astype(np.float32)       # shape (freq, time)
    spec   = spec[1:]                                # drop DC
    spec   = np.flip(spec, axis=0)                   # high-f at top
    return np.log(spec + LOG_OFFSET)

def make_spec_scipy(audio):
    f, t, s = spectrogram(audio, fs=FPS_AUDIO,
                          nfft=N_FFT, nperseg=N_PER_SEG,
                          noverlap=N_OVERLAP, return_onesided=True)
    s = np.flip(s[1:], axis=0)
    return np.log(np.abs(s) + LOG_OFFSET)

def read_window(url, start_sec, dur_sec):
    with fsspec.open(url, "rb", block_size=262_144,
                     cache_type="readahead") as fh, sf.SoundFile(fh) as wav:
        sr = wav.samplerate
        if sr != FPS_AUDIO:
            raise ValueError(f"{sr=} Hz in file ≠ {FPS_AUDIO}")
        wav.seek(int(start_sec * sr))
        audio = wav.read(int(dur_sec * sr)).T
    if audio.ndim == 2:
        audio = audio.mean(axis=0)
    return audio.astype(np.float32)

def spec_to_png_bytes(spec):
    """Map spec (float32) → viridis-colored PNG (bytes) via Pillow."""
    # normalize 0-255
    smin, smax = spec.min(), spec.max()
    scal = 255.0 / (smax - smin) if smax > smin else 1.0
    arr8 = ((spec - smin) * scal).clip(0, 255).astype(np.uint8)

    # img = Image.fromarray(arr8, mode="L").transpose(Image.FLIP_TOP_BOTTOM)
    img = Image.fromarray(arr8, mode="L")
    img.putpalette(_VIRIDIS)
    out = io.BytesIO()
    img.save(out, format="PNG", optimize=True)
    return out.getvalue()

# ---- HTTP handler ------------------------------------------------------------
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        if "url" not in q:
            self.send_error(400, "Missing ?url=")
            return
        url       = q["url"][0]
        start     = float(q.get("start", ["0"])[0])
        duration  = float(q.get("duration", ["10"])[0])

        # check that start and duration are integers
        if not (start.is_integer() and duration.is_integer()):
            self.send_error(400, "start and duration must be integers")
            return

        # check that start is a multiple of 10 and that duration equals 10
        if start % 10 != 0 or duration != 10:
            self.send_error(400, "Invalid start or duration")
            return

        try:
            audio  = read_window(url, start, duration)
            # pick ONE of the two:
            spec   = make_spec_scipy(audio)      # keep SciPy ✔
            # spec = make_spec_numpy(audio)      # if you dropped SciPy
            png    = spec_to_png_bytes(spec)
        except Exception as exc:
            self.send_error(500, f"Failed: {exc}")
            return

        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        self.end_headers()
        self.wfile.write(png)
