#!/bin/bash
# reel farmacista "cambio stagione": girato pulito 1080x1920, tagli + sottotitoli + grafiche + clip Runway, mix voce/musica -14 LUFS
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
if [ ! -f farmacia/public/cambio/girato.mp4 ]; then
  ffmpeg -loglevel error -y -i farmacia/cambio_stagione/raw/reel.mp4 -an -vf "hqdn3d=2:2:4:4,scale=1080:1920:flags=lanczos,unsharp=5:5:0.8:3:3:0.3,eq=contrast=1.04:saturation=1.06" \
    -c:v libx264 -crf 15 -pix_fmt yuv420p -r 30 farmacia/public/cambio/girato.mp4
fi
python3 farmacia/cambio/build_edit.py
npx remotion render farmacia/cambio/index.ts CambioStagione out/cs_raw.mp4 --public-dir=farmacia/public --crf=14 --browser-executable=$B --log=error --concurrency=4 --muted
ffmpeg -loglevel error -y -i out/cs_raw.mp4 -i out/cs_mix.wav -map 0:v -map 1:a -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:v libx264 -crf 18 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k -ar 48000 -shortest farmacia/cambio/cambio_stagione_reel.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact farmacia/cambio/cambio_stagione_reel.mp4
