#!/bin/bash
# render Remotion a blocchi (ripartibile): salta i blocchi già fatti, poi concatena in out/compl_raw.mp4
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
N=$(python3 -c "import json;print(round(json.load(open('compl/timeline.json'))['duration']*30))")
STEP=400; mkdir -p out/compl_parts; : > out/compl_parts/list.txt
for ((a=0; a<N; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $N ] && b=$((N-1))
  f=out/compl_parts/p$(printf %05d $a).mp4
  [ -s $f ] || npx remotion render compl/index.ts Compl $f --frames=$a-$b --public-dir=compl/public --gl=swangle --browser-executable=$B --concurrency=3 --timeout=240000 --crf=14 --muted --log=error
  echo "file '$(basename $f)'" >> out/compl_parts/list.txt
done
ffmpeg -loglevel error -y -f concat -safe 0 -i out/compl_parts/list.txt -c copy out/compl_raw.mp4
