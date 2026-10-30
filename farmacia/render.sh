#!/bin/bash
# Farmacia Africa Orientale: musica -> render orizzontale 1920x1080 + verticale 1080x1920 -> versioni WhatsApp (<16MB)
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
python3 farmacia/score.py out/music_raw.wav
ffmpeg -loglevel error -y -i out/music_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=7,volume=-1.2dB" -ar 44100 farmacia/public/music.wav
for C in ${@:-FarmaciaH FarmaciaV}; do
  npx remotion render farmacia/index.ts $C out/$C.mp4 --public-dir=farmacia/public --browser-executable=$B --chrome-mode=headless-shell --gl=swangle --crf=17 --concurrency=${CONC:-4} --log=error
done
for C in ${@:-FarmaciaH FarmaciaV}; do
  ffmpeg -loglevel error -y -i out/$C.mp4 -c:v libx264 -preset slow -b:v 1700k -maxrate 2200k -bufsize 4400k -c:a aac -b:a 96k -movflags +faststart out/${C}_whatsapp.mp4
  ls -la out/$C.mp4 out/${C}_whatsapp.mp4
done
