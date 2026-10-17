#!/bin/bash
# Render completo: voce + timeline -> video 1080x1920 30fps -> mux AAC.
# uso: monaco/scripts/render.sh <dir_modelli_kokoro> [out/farmacia_monaco_telecardiologia.mp4]
set -e
MODELS=$1
OUT=${2:-out/farmacia_monaco_telecardiologia.mp4}
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
RAW=out/monaco_raw.mp4
mkdir -p out

echo "== 1/3 voce narrante + timeline"
python3 monaco/scripts/voice.py "$MODELS"

echo "== 2/3 render video"
npx remotion render monaco/index.ts Monaco $RAW --public-dir=monaco/public --crf=14 --browser-executable=$B --log=error

echo "== 3/3 mux audio"
ffmpeg -loglevel error -y -i $RAW -i monaco/public/voice.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $OUT
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact $OUT
