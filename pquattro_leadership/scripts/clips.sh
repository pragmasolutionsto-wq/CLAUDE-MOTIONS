#!/bin/bash
# clip sorgente -> 1080x1920 30fps, GOP corto per il seek di Remotion. Le 480p: denoise, lanczos, sharpen leggero.
set -e
cd "$(dirname "$0")/.."
mkdir -p public/v
for n in $(seq 1 10); do
  h=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 src/c$n.mp4 | head -1 | tr -d ,)
  if [ "$h" -lt 1000 ]; then
    vf="hqdn3d=1.2:1.2:4:4,scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0"
  else
    vf="scale=1080:1920:flags=lanczos"
  fi
  ffmpeg -v error -y -i src/c$n.mp4 -an -vf "$vf,fps=30,format=yuv420p" -c:v libx264 -crf 14 -preset medium -g 15 -bf 0 public/v/c$n.mp4 &
  if (( n % 4 == 0 )); then wait; fi
done
wait
