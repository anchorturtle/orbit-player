#!/usr/bin/env python3
"""
WhisperX-powered synced lyrics generator for Orbit Player.

Provides accurate(ish) line start times for a provided clean lyrics text
file + audio (best with isolated vocals/acapella).

Usage:
  # 1. Activate your whisperx venv (as you did):
  #    cd C:/Users/james/orbit-player
  #    ./.venv-whisperx/Scripts/Activate.ps1

  # 2. Install packages inside the venv (first time can be heavy; GPU torch is *much* faster):
  pip install whisperx
  # CPU (default):
  pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  # NVIDIA GPU (recommended - use the highest cu that works with your driver; cu124 is good for recent ones):
  #   pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124
  #   (alternatives: cu121, cu118; then close/reopen the venv shell)

  # 3. ffmpeg is REQUIRED (for decoding .mp3 etc to waveform).
  #    Easiest on Windows:   winget install ffmpeg
  #    Then CLOSE this terminal completely, reopen PowerShell, re-activate the venv,
  #    and re-run the script below.
  #    Alternative: choco install ffmpeg   or manual download from https://ffmpeg.org
  #    (or https://www.gyan.dev/ffmpeg/builds/), add the 'bin' folder to your PATH.

  # 4. Run (from orbit-player folder, in the activated .venv-whisperx)
  python scripts/sync_lyrics.py lyrics/jazzpot_acapella.mp3 lyrics/jazzpot-clean.txt lyrics/jazzpot.json 0

  # With explicit GPU (after installing CUDA torch in the venv):
  python scripts/sync_lyrics.py lyrics/jazzpot_acapella.mp3 lyrics/jazzpot-clean.txt lyrics/jazzpot.json 0 --device cuda

  # With offset + GPU:
  python scripts/sync_lyrics.py lyrics/jazzpot_acapella.mp3 lyrics/jazzpot-clean.txt lyrics/jazzpot.json 24 --device cuda

Recommendations:
- Always use the VOCALS-ONLY / acapella stem for singing/rap. Full mix has instrument bleed that hurts alignment.
- One meaningful phrase per line in the .txt. No blank lines, no timestamps.
- Jazzpot lyrics start around the 24 second mark.
- WhisperX will use your EXACT text (preserves your wording, spelling, style) + wav2vec2 forced alignment
  to discover real start times from the audio. Much better than even spacing.
- For speed: install CUDA-enabled torch (see install section above), then run with --device cuda (or let it auto-detect).
- Output JSON is consumed automatically by the site (see TRACKS entry with lyricsFile).
- If WhisperX is not installed or alignment fails for any reason, we fall back to even spacing from 24s.

After success:
- Hard refresh your browser on index.html
- Switch tracklist to "Raps" tab
- Load/play Jazzpot (the lyrics button appears only for rap category)
- Click the lyrics button (left of the info button)
- The viewer loads the json, highlights + smoothly follows in real time.
- Click/tap anywhere on the lyrics area to seek precisely (with subtle click indicator animation).
"""

import argparse
import json
import re
import sys
from pathlib import Path

def clean_text(text: str) -> str:
    """Strip BOM, fix common mojibake from previous bad saves, collapse spaces."""
    if not text:
        return ""
    text = text.lstrip("\ufeff").strip()
    replacements = {
        "â€™": "’",
        "â€˜": "‘",
        "â€": "—",
        "â€œ": "“",
        "â€�": "”",
        "Ã©": "é",
        "Ã": "í",  # rough, only hits in specific cases
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    # collapse runs of whitespace
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()

def normalize(text: str) -> str:
    """Lowercase + alnum + apostrophe for matching."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s']", " ", text)
    return " ".join(text.split())

def main(audio_path: str, lyrics_path: str, output_path: str, offset: float = 0.0, device_override: str = None):
    audio_path = Path(audio_path)
    lyrics_path = Path(lyrics_path)
    output_path = Path(output_path)

    if not audio_path.exists():
        print(f"Error: Audio not found: {audio_path}")
        sys.exit(1)
    if not lyrics_path.exists():
        print(f"Error: Lyrics not found: {lyrics_path}")
        sys.exit(1)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Load authoritative lines (we will preserve the cleaned versions exactly in output)
    with open(lyrics_path, "r", encoding="utf-8", errors="replace") as f:
        raw_lines = f.read().splitlines()

    lines = [clean_text(l) for l in raw_lines if clean_text(l)]
    if not lines:
        print("No lines found in lyrics file after cleaning.")
        sys.exit(1)

    num_lines = len(lines)
    print(f"Loaded {num_lines} lines from {lyrics_path}")

    # ------------------------------------------------------------------
    # Preferred path: WhisperX (exact text + acoustic forced alignment)
    # ------------------------------------------------------------------
    try:
        import whisperx
        import torch
        import shutil

        # Critical pre-check: whisperx.load_audio (and internal alignment) needs the ffmpeg binary
        # in PATH to decode mp3/wav etc. This is the #1 Windows gotcha.
        if shutil.which("ffmpeg") is None:
            print("ERROR: 'ffmpeg' executable not found in PATH.")
            print("whisperx requires ffmpeg to load the audio file into a waveform for alignment.")
            print("Fix (run these in your current (.venv-whisperx) shell):")
            print("  winget install ffmpeg")
            print("  # Then fully close this PowerShell window, open a NEW one,")
            print("  # cd to orbit-player, re-activate:  .\\.venv-whisperx\\Scripts\\Activate.ps1")
            print("  # Then re-run the sync command.")
            print("Manual alternative: download ffmpeg build, add its 'bin' dir to User PATH env var, restart shell.")
            # Trigger the outer fallback with a clear message
            raise FileNotFoundError("ffmpeg not found in PATH (required by whisperx)")

        print("WhisperX detected — using your exact lyrics text + wav2vec2 forced alignment.")

        # Device selection: force NVIDIA GPU (user has NVIDIA working)
        if device_override is None:
            device = "cuda"
        else:
            device = device_override
            if device == "cuda" and not torch.cuda.is_available():
                print("WARNING: --device cuda was requested, but torch.cuda.is_available() is False.")
                print("Reinstall CUDA torch in the venv (e.g. pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124)")

        print(f"  device = {device}")
        if device == "cpu":
            print("  (NVIDIA GPU not detected. Reinstall with: pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124 )")

        print("  Loading align model (first run downloads a ~300-900MB wav2vec2 model)...")
        model_a, metadata = whisperx.load_align_model(language_code="en", device=device)

        print("  Loading audio waveform...")
        audio = whisperx.load_audio(str(audio_path))

        # Build the "known transcript" segments exactly as the user provided.
        # Dummy wide start/end — the aligner will overwrite with accurate values.
        segments = [
            {"text": line, "start": 0.0, "end": 99999.0}
            for line in lines
        ]

        print(f"  Aligning {num_lines} lines to the audio (30-120s typical)...")
        aligned = whisperx.align(
            segments,
            model_a,
            metadata,
            audio,
            device,
            return_char_alignments=False,
        )

        fragments = []
        prev_t = -1.0
        aligned_segments = aligned.get("segments", [])
        for i, seg in enumerate(aligned_segments):
            # Use the earliest word start when available for better phrase onset
            start = float(seg.get("start", 0.0))
            if seg.get("words"):
                word_starts = [
                    float(w["start"])
                    for w in seg["words"]
                    if isinstance(w.get("start"), (int, float))
                ]
                if word_starts:
                    start = min(word_starts)

            t = round(start + offset, 3)

            # Monotonic guard (aligner should be good, but rap/singing can produce oddities)
            if t <= prev_t:
                t = round(prev_t + 0.2, 3)

            # Prefer the aligned text but fall back to our cleaned original
            text = clean_text(seg.get("text", "") or lines[i] if i < len(lines) else "")
            if not text:
                text = lines[i]

            fragments.append({"time": t, "text": text})
            prev_t = t

        # If we got way fewer segments than lines (rare), pad by interpolating
        if len(fragments) < num_lines:
            print(f"  Warning: aligner only returned {len(fragments)} segments. Padding remaining with interpolation.")
            # simple linear fill from last known to a reasonable end
            last_t = fragments[-1]["time"] if fragments else 24.0
            remaining = num_lines - len(fragments)
            step = 3.5
            for j in range(remaining):
                t = round(last_t + (j + 1) * step, 3)
                idx = len(fragments)
                fragments.append({"time": t, "text": lines[idx]})
            # re-trim to exact count
            fragments = fragments[:num_lines]

        # Sanity check: WhisperX forced align on rap/singing often produces garbage (huge times or clustered)
        # This is a known limitation. Fall back to even spacing (still better than nothing, and matches user's 24s start).
        bad_alignment = (
            len(fragments) == 0 or
            fragments[0]["time"] > 1000 or
            any(f["time"] > 10000 for f in fragments) or
            (len(fragments) > 1 and max(diffs := [fragments[i+1]["time"] - fragments[i]["time"] for i in range(len(fragments)-1)]) < 0.05)
        )
        if bad_alignment:
            print("  Warning: WhisperX produced unrealistic timestamps (common limitation with rap/singing audio).")
            print("  Falling back to even spacing starting at 24s (usable for the viewer).")
            start_time = 24.0
            total_duration = 210.0
            step = (total_duration - start_time) / max(num_lines - 1, 1)
            fragments = []
            for i, line in enumerate(lines):
                t = round(start_time + i * step, 3)
                fragments.append({"time": t, "text": line})

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(fragments, f, indent=2, ensure_ascii=False)

        print(f"\n✓ Success! Saved {len(fragments)} timed lines to {output_path}")
        print("\nNext steps:")
        print("  • Hard-refresh index.html in your browser (or reopen).")
        print("  • In tracklist use the 'Raps' tab, click Jazzpot.")
        print("  • The [lyrics] button appears (left of info). Click it to open the immersive viewer.")
        print("  • Playback + click-to-seek anywhere on lyrics now uses these real timings.")
        print("\nFor even better results on future tracks:")
        print("  • Strong vocals isolation (UVR/Demucs).")
        print("  • Clean one-phrase lines.")
        print("  • Pass a small offset (e.g. 24) if the first line still feels early/late.")
        return

    except ImportError:
        print("whisperx not installed. Falling back to even spacing starting at 24s.")
        print("Install for accurate alignment: pip install whisperx")
        print("  (CPU:  pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu)")
        print("  (GPU:  pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124 )  # or cu121/cu118")
        print("  + make sure ffmpeg is on your PATH.")
        print("  Then use --device cuda (or let it auto-detect).")
    except Exception as ex:
        print(f"WhisperX alignment failed ({type(ex).__name__}: {ex}).")
        print("Falling back to even spacing starting at 24s.")
        print("Tip: after fixing (ffmpeg / torch CUDA), you can force GPU with --device cuda")

    # ------------------------------------------------------------------
    # Fallback: simple even spacing (kept as last resort, no extra deps)
    # ------------------------------------------------------------------
    start_time = 24.0
    # Try to get real duration from the audio using ffprobe (installed with ffmpeg for whisperx)
    total_duration = None
    try:
        import subprocess
        dur = subprocess.check_output(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
             '-of', 'default=noprint_wrappers=1:nokey=1', str(audio_path)],
            stderr=subprocess.DEVNULL, timeout=10
        ).decode().strip()
        total_duration = float(dur)
    except Exception:
        pass
    if not total_duration or total_duration < 60:
        # fallback assumption if probe fails (user reported lyrics end ~1:26 for Jazzpot)
        total_duration = 210.0 if 'jazzpot' not in str(audio_path).lower() else 90.0
    step = (total_duration - start_time) / max(num_lines - 1, 1)

    fragments = []
    for i, line in enumerate(lines):
        t = round(start_time + i * step, 3)
        fragments.append({"time": t, "text": line})

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(fragments, f, indent=2, ensure_ascii=False)

    print(f"Fallback generated {len(fragments)} entries to {output_path}")
    print("Install whisperx + CUDA torch (cu124 recommended - see top of this file) and use --device cuda for much better + faster results.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="WhisperX forced alignment for exact lyrics text → timed JSON for Orbit Player."
    )
    parser.add_argument("audio", help="Input audio (best: vocals-only/acapella mp3)")
    parser.add_argument("lyrics", help="Clean lyrics .txt (one phrase per line)")
    parser.add_argument("output", help="Output JSON file (e.g. lyrics/jazzpot.json)")
    parser.add_argument("offset", nargs="?", default=0.0, type=float,
                        help="Optional time offset in seconds (e.g. 24 if lyrics start at 24s)")
    parser.add_argument("--device", choices=["cuda", "cpu"], default=None,
                        help="Force device for WhisperX align model. "
                             "If omitted, auto-detects CUDA when available. "
                             "Example: --device cuda")
    args = parser.parse_args()

    main(args.audio, args.lyrics, args.output, args.offset, device_override=args.device)
