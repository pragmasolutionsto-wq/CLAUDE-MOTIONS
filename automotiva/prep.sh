#!/bin/bash
# uso: automotiva/prep.sh cartella_con_IMG_xxxx.MOV  -> automotiva/public/cxxxx.mp4 (HLG/Dolby Vision -> SDR 1080x1920)
for v in "$1"/*.MOV; do
  n=$(basename "$v" .MOV); n=${n#IMG_}
  ffmpeg -v error -y -i "$v" -an -vf "zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=200,format=gbrpf32le,zscale=p=bt709,tonemap=mobius:desat=0:param=0.4,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,scale=1080:1920:flags=lanczos,fps=30" -c:v libx264 -crf 14 -preset medium -g 1 automotiva/public/c$n.mp4 &
done
wait
