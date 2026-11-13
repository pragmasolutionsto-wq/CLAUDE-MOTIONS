#!/bin/bash
# reel farmacista "Doppia detersione (base)": girato pulito -> base tagliata a fotogramma, grafiche Remotion, clip+musica+effetti Runway, -14 LUFS
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
if [ ! -f farmacia/public/detersione2/girato.mp4 ]; then
  ffmpeg -loglevel error -y -i farmacia/detersione2_src/raw/girato.mp4 -an -vf "hqdn3d=2:2:4:4,scale=1080:1920:flags=lanczos,unsharp=5:5:0.8:3:3:0.3,eq=contrast=1.04:saturation=1.06" \
    -c:v libx264 -crf 15 -pix_fmt yuv420p -r 30 farmacia/public/detersione2/girato.mp4
fi
python3 farmacia/detersione2/build_edit.py
TOTAL=$(python3 -c "import json;print(json.load(open('farmacia/detersione2/edit.json'))['total'])")
npx remotion render farmacia/detersione2/index.ts Detersione2 out/d2_raw.mp4 --public-dir=farmacia/public --crf=14 --browser-executable=$B --log=error --concurrency=4 --muted
ffmpeg -loglevel error -y -i out/d2_raw.mp4 -i out/d2_mix.wav -map 0:v -map 1:a -t $TOTAL -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:v libx264 -crf 18 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k -ar 48000 farmacia/detersione2/doppia_detersione_base_reel.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,duration -of compact farmacia/detersione2/doppia_detersione_base_reel.mp4
