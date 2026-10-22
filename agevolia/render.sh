#!/bin/bash
# 60fps -> motion blur (tmix 2 campioni) -> 30fps, grana + vignetta, mux colonna sonora
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
npx remotion render agevolia/index.ts Agevolia out/agevolia_raw60.mp4 --public-dir=agevolia/public --crf=12 --browser-executable=$B --log=error --concurrency=4
python3 agevolia/score.py out/agevolia_score.wav
ffmpeg -loglevel error -y -i out/agevolia_raw60.mp4 -i out/agevolia_score.wav -filter_complex "[0:v]tmix=frames=2:weights='1 1',select='not(mod(n\,2))',setpts=N/(30*TB),noise=alls=4:allf=t+u,format=yuv420p[v]" -map "[v]" -map 1:a -r 30 -c:v libx264 -crf 16 -preset slow -movflags +faststart -c:a aac -b:a 224k -shortest out/agevolia_explainer_47s.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact out/agevolia_explainer_47s.mp4
