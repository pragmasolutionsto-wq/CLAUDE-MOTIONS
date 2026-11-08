#!/bin/bash
# reel animato Goovi Splash Me Baby: clip Runway + grafiche Remotion + voce/musica/effetti Runway, -14 LUFS
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
python3 farmacia/goovi/build_audio.py
TOTAL=$(python3 -c "import json;print(json.load(open('farmacia/goovi/timeline.json'))['total'])")
npx remotion render farmacia/goovi/index.ts GooviSplash out/gv_raw.mp4 --public-dir=farmacia/public --crf=14 --browser-executable=$B --log=error --concurrency=4 --muted
ffmpeg -loglevel error -y -i out/gv_raw.mp4 -i out/gv_mix.wav -map 0:v -map 1:a -t $TOTAL -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:v libx264 -crf 18 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k -ar 48000 farmacia/goovi/goovi_splash_reel.mp4
ffprobe -v error -show_entries format=duration:stream=codec_type,duration -of compact farmacia/goovi/goovi_splash_reel.mp4
