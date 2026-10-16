#!/bin/bash
# Pipeline completa: render 120fps -> motion blur / bloom / aberrazione / grana / vignetta -> mux audio.
# uso: film/scripts/render.sh [out/pquattro.mp4]
set -e
OUT=${1:-out/pquattro.mp4}
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
RAW=out/raw90.mp4

echo "== 1/3 render 90fps"
npx remotion render film/index.ts Pquattro $RAW --crf=10 --browser-executable=$B --log=error

echo "== 2/3 colonna sonora"
python3 film/scripts/score.py film/public/score.wav

echo "== 3/3 post-produzione + mux"
ffmpeg -loglevel error -y -i $RAW -i film/public/score.wav -filter_complex "\
[0:v]tmix=frames=3:weights='1 1 0.6',select='not(mod(n\,3))',setpts=N/(30*TB),format=gbrp,split=2[a][b];\
[b]lutrgb=r='if(gt(val\,175)\,val\,0)':g='if(gt(val\,175)\,val\,0)':b='if(gt(val\,175)\,val\,0)',gblur=sigma=26[bl];\
[a][bl]blend=all_mode=screen:all_opacity=0.38,rgbashift=rh=-2:bh=2,noise=alls=6:allf=t+u,vignette=angle=PI/5,format=yuv420p[v]" \
  -map "[v]" -map 1:a -r 30 -c:v libx264 -crf 15 -preset slow -pix_fmt yuv420p -c:a aac -b:a 224k -shortest $OUT
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact $OUT
