#!/bin/bash
# reel Farmacia Monaco — Unika: base tagliata -> grafiche Remotion (3D via swangle) -> mix voce/musica/sfx
# esce in due versioni: con musica, e senza musica (voce + sfx) per usare un audio di tendenza dall'app
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
python3 farmacia/prep.py
npx remotion render farmacia/index.ts Farmacia out/video_raw.mp4 --public-dir=farmacia/public --gl=swangle --browser-executable=$B --concurrency=4 --crf=14 --muted --log=error
python3 farmacia/score.py out/music.wav out/sfx.wav
MIX="[2:a]volume=0.30[m];[1:a]asplit[v][sc];[m][sc]sidechaincompress=threshold=0.035:ratio=7:attack=15:release=380[md];[3:a]volume=0.5[fx]"
ffmpeg -loglevel error -y -i out/video_raw.mp4 -i out/voice.wav -i out/music.wav -i out/sfx.wav -filter_complex \
  "$MIX;[v][md][fx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/farmacia_unika_reel.mp4
ffmpeg -loglevel error -y -i out/video_raw.mp4 -i out/voice.wav -i out/sfx.wav -filter_complex \
  "[2:a]volume=0.5[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/farmacia_unika_reel_senza_musica.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact out/farmacia_unika_reel.mp4
