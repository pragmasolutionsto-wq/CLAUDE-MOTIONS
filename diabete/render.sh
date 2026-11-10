#!/bin/bash
# reel prevenzione diabete Farmacia Plebiscito (farmacista in video): taglio pause → base + voce → viso → clip 3D → grafiche Remotion → voce + sfx
# sottotitoli in una versione a parte (ASS impresso con ffmpeg), musica a Meme
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
python3 diabete/cut.py
python3 diabete/prep.py
python3 diabete/facetrack.py
python3 diabete/shots.py
python3 diabete/prep_ai.py
npx remotion render diabete/index.ts Diabete out/diab_raw.mp4 --public-dir=diabete/public --gl=swangle --browser-executable=$B --concurrency=4 --crf=14 --muted --log=error
python3 diabete/sfx.py out/diab_sfx.wav
python3 diabete/subs.py out/diabete_subs.ass
ffmpeg -loglevel error -y -i out/diab_raw.mp4 -i out/diabete_voice.wav -i out/diab_sfx.wav -filter_complex \
  "[2:a]volume=0.4[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_diabete_reel.mp4
ffmpeg -loglevel error -y -i out/diab_raw.mp4 -i out/diabete_voice.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_diabete_solo_voce.mp4
ffprobe -v error -show_entries format=duration,size -of compact out/plebiscito_diabete_reel.mp4
ffmpeg -loglevel error -y -i out/diab_raw.mp4 -i out/diabete_voice.wav -i out/diab_sfx.wav -filter_complex \
  "[0:v]ass=out/diabete_subs.ass:fontsdir=diabete/fonts[v];[2:a]volume=0.4[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_diabete_reel_sottotitoli.mp4
