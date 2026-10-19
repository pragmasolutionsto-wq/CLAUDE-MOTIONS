#!/bin/bash
# reel Africa Orientale — caduta capelli: base → clip AI → grafiche Remotion → voce + sfx (niente musica, niente sottotitoli)
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
python3 africa/prep.py
python3 africa/prep_ai.py
npx remotion render africa/index.ts Africa out/africa_raw.mp4 --public-dir=africa/public --gl=swangle --browser-executable=$B --concurrency=4 --crf=14 --muted --log=error
python3 africa/sfx.py out/africa_sfx.wav
ffmpeg -loglevel error -y -i out/africa_raw.mp4 -i out/africa_voice.wav -i out/africa_sfx.wav -filter_complex \
  "[2:a]volume=0.45[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/africa_capelli_reel.mp4
ffmpeg -loglevel error -y -i out/africa_raw.mp4 -i out/africa_voice.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/africa_capelli_reel_solo_voce.mp4
ffprobe -v error -show_entries format=duration,size -of compact out/africa_capelli_reel.mp4
