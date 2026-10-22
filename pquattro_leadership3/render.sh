#!/bin/bash
# montaggio -> audio -> render 60fps -> motion blur (2 campioni) -> 30fps, grana leggera + vignetta morbida, mux colonna sonora
set -e
cd "$(dirname "$0")/.."
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out

python3 pquattro_leadership3/scripts/edl.py >/dev/null
START_BAR=0 LOOPS=1 python3 pquattro_leadership3/scripts/audio.py
npx remotion render pquattro_leadership3/index.ts Leadership3 out/leadership3_raw60.mp4 --public-dir=pquattro_leadership3/public --crf=12 --browser-executable=$B --log=error --concurrency=4
ffmpeg -loglevel error -y -i out/leadership3_raw60.mp4 -i out/l3/mix.wav -filter_complex "[0:v]tmix=frames=2:weights='1 1',select='not(mod(n\,2))',setpts=N/(30*TB),noise=alls=4:allf=t+u,vignette=angle=PI/9,format=yuv420p[v]" -map "[v]" -map 1:a -r 30 -c:v libx264 -crf 19 -preset slow -profile:v high -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/pquattro_reel_leadership_3.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact out/pquattro_reel_leadership_3.mp4
