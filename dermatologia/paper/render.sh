#!/bin/bash
# 60fps -> motion blur (tmix) -> 30fps, grana + vignetta, mux colonna sonora. Esce 16:9 e 9:16.
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
python3 dermatologia/paper/score.py out/score_paper.wav
for C in ${@:-DermaPaperH DermaPaperV}; do
  [ -n "$SKIP_RENDER" ] || npx remotion render dermatologia/paper/index.ts $C out/raw_$C.mp4 --public-dir=dermatologia/paper/public --crf=12 --browser-executable=$B --chrome-mode=headless-shell --log=error --concurrency=4
  O=out/longevitas_dermatologia_papercut_$([ $C = DermaPaperH ] && echo 16x9 || echo 9x16).mp4
  ffmpeg -loglevel error -y -i out/raw_$C.mp4 -i out/score_paper.wav -filter_complex "[0:v]tmix=frames=2:weights='1 1',select='not(mod(n\,2))',setpts=N/(30*TB),noise=alls=5:allf=t+u,vignette=angle=PI/6,format=yuv420p[v]" -map "[v]" -map 1:a -r 30 -c:v libx264 -crf 15 -preset slow -c:a aac -b:a 224k -shortest $O
  # versione leggera per la landing (faststart, grana ridotta)
  ffmpeg -loglevel error -y -i out/raw_$C.mp4 -i out/score_paper.wav -filter_complex "[0:v]tmix=frames=2:weights='1 1',select='not(mod(n\,2))',setpts=N/(30*TB),noise=alls=2:allf=t,vignette=angle=PI/6,format=yuv420p[v]" -map "[v]" -map 1:a -r 30 -c:v libx264 -crf 25 -preset slow -c:a aac -b:a 160k -movflags +faststart -shortest ${O%.mp4}_web.mp4
  ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact $O
done
