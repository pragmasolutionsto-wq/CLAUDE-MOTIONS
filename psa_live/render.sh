#!/bin/bash
# reel PSA Farmacia Plebiscito (farmacista in video): taglio pause → base + voce → viso → clip 3D → grafiche Remotion → voce + sfx
# niente sottotitoli né musica (li mette Meme)
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
python3 psa_live/cut.py
python3 psa_live/prep.py
python3 psa_live/facetrack.py
python3 psa_live/shots.py
npx remotion render psa_live/index.ts PsaLive out/live_raw.mp4 --public-dir=psa_live/public --gl=swangle --browser-executable=$B --concurrency=4 --crf=14 --muted --log=error
python3 psa_live/sfx.py out/live_sfx.wav
ffmpeg -loglevel error -y -i out/live_raw.mp4 -i out/psa_live_voice.wav -i out/live_sfx.wav -filter_complex \
  "[2:a]volume=0.4[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_psa_farmacista_reel.mp4
ffmpeg -loglevel error -y -i out/live_raw.mp4 -i out/psa_live_voice.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_psa_farmacista_solo_voce.mp4
ffprobe -v error -show_entries format=duration,size -of compact out/plebiscito_psa_farmacista_reel.mp4
