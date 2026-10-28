#!/bin/bash
# reel con voce: allinea voce+musica (Runway), render 30fps 1080x1920, mux con loudness social (-14 LUFS)
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
python3 farmacia/metformina/build_audio.py
npx remotion render farmacia/metformina/index.ts MetforminaVO out/met_vo_raw.mp4 --public-dir=farmacia/public --crf=14 --browser-executable=$B --log=error --concurrency=4 --muted
ffmpeg -loglevel error -y -i out/met_vo_raw.mp4 -i out/met_mix.wav -map 0:v -map 1:a \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:v libx264 -crf 18 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 192k -ar 48000 -shortest out/metformina_reel_voce.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact out/metformina_reel_voce.mp4
