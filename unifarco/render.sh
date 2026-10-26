#!/bin/bash
# reel attivi Unifarco Farmacia Plebiscito (farmacista in video): taglio pause → base + voce → viso → clip 3D → grafiche Remotion → voce + sfx
# niente sottotitoli né musica (li mette Meme)
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
python3 unifarco/cut.py
python3 unifarco/prep.py
python3 unifarco/facetrack.py
python3 unifarco/shots.py
python3 unifarco/prep_ai.py
npx remotion render unifarco/index.ts Unifarco out/uni_raw.mp4 --public-dir=unifarco/public --gl=swangle --browser-executable=$B --concurrency=4 --crf=14 --muted --log=error
python3 unifarco/sfx.py out/uni_sfx.wav
ffmpeg -loglevel error -y -i out/uni_raw.mp4 -i out/unifarco_voice.wav -i out/uni_sfx.wav -filter_complex \
  "[2:a]volume=0.4[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_unifarco_reel.mp4
ffmpeg -loglevel error -y -i out/uni_raw.mp4 -i out/unifarco_voice.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_unifarco_solo_voce.mp4
ffprobe -v error -show_entries format=duration,size -of compact out/plebiscito_unifarco_reel.mp4
