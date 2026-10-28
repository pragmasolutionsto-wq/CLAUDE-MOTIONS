#!/bin/bash
# reel 1080x1920: render 60fps -> motion blur (2 campioni) -> 30fps, grana leggera, mux colonna sonora
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
npx remotion render farmacia/metformina/index.ts Metformina out/met_raw60.mp4 --public-dir=farmacia/public --crf=12 --browser-executable=$B --log=error --concurrency=4
python3 farmacia/metformina/score.py out/met_score.wav
ffmpeg -loglevel error -y -i out/met_raw60.mp4 -i out/met_score.wav -filter_complex "[0:v]tmix=frames=2:weights='1 1',select='not(mod(n\,2))',setpts=N/(30*TB),noise=alls=3:allf=t+u,format=yuv420p[v]" -map "[v]" -map 1:a -r 30 -c:v libx264 -crf 17 -preset slow -profile:v high -movflags +faststart -c:a aac -b:a 192k -shortest out/metformina_reel.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact out/metformina_reel.mp4
