#!/bin/bash
# clip HDR iPhone -> SDR verticali (una volta), render Remotion, grana + mux colonna sonora (traccia + motore)
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
npx remotion render automotiva/index.ts Automotiva out/raw.mp4 --public-dir=automotiva/public --crf=12 --browser-executable=$B --log=error --concurrency=4
python3 automotiva/mix.py out/score.wav
ffmpeg -loglevel error -y -i out/raw.mp4 -i out/score.wav -filter_complex "[0:v]noise=alls=6:allf=t+u,format=yuv420p[v]" -map "[v]" -map 1:a -c:v libx264 -crf 17 -preset slow -profile:v high -c:a aac -b:a 256k -shortest -movflags +faststart out/automotiva_a220d_reel.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact out/automotiva_a220d_reel.mp4
