#!/bin/bash
# 1080x1920 @60fps -> motion blur (tmix 2 campioni) -> 30fps, grana + vignetta, mux colonna sonora
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
npx remotion render servizi/index.ts Servizi out/raw60_servizi.mp4 --public-dir=servizi/public --crf=12 --browser-executable=$B --log=error --concurrency=4
python3 servizi/score.py out/score_servizi.wav
ffmpeg -loglevel error -y -i out/raw60_servizi.mp4 -i out/score_servizi.wav -filter_complex "[0:v]tmix=frames=2:weights='1 1',select='not(mod(n\,2))',setpts=N/(30*TB),noise=alls=4:allf=t+u,vignette=angle=PI/7,format=yuv420p[v]" -map "[v]" -map 1:a -r 30 -c:v libx264 -crf 16 -preset slow -c:a aac -b:a 224k -movflags +faststart -shortest out/pragma_servizi_45s.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact out/pragma_servizi_45s.mp4
