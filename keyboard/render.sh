#!/bin/bash
# 60fps -> motion blur (tmix) -> 30fps, grana + vignetta, mux colonna sonora. Esce 9:16.
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
python3 keyboard/timeline.py
python3 keyboard/score.py out/score_kb.wav
npx remotion render keyboard/index.ts Keyboard out/raw_kb.mp4 --public-dir=keyboard/public --crf=12 --browser-executable=$B --chrome-mode=headless-shell --log=error --concurrency=4
O=out/claude_keyboard_15s_9x16.mp4
ffmpeg -loglevel error -y -i out/raw_kb.mp4 -i out/score_kb.wav -filter_complex "[0:v]tmix=frames=2:weights='1 1',select='not(mod(n\,2))',setpts=N/(30*TB),noise=alls=6:allf=t+u,vignette=angle=PI/5,format=yuv420p[v]" -map "[v]" -map 1:a -r 30 -c:v libx264 -crf 17 -preset slow -c:a aac -b:a 224k -shortest -movflags +faststart $O
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact $O
