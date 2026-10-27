#!/bin/bash
# render Remotion a blocchi (ripartibile): salta i blocchi già fatti, poi concatena in out/buoni_raw.mp4
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
N=$(python3 -c "import json;print(round(json.load(open('buoni/timeline.json'))['duration']*30))")
STEP=400; mkdir -p out/buoni_parts; : > out/buoni_parts/list.txt
for ((a=0; a<N; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $N ] && b=$((N-1))
  f=out/buoni_parts/p$(printf %05d $a).mp4
  [ -s $f ] || npx remotion render buoni/index.ts Buoni $f --frames=$a-$b --public-dir=buoni/public --gl=swangle --browser-executable=$B --concurrency=3 --timeout=240000 --crf=14 --muted --log=error
  echo "file '$(basename $f)'" >> out/buoni_parts/list.txt
done
ffmpeg -loglevel error -y -f concat -safe 0 -i out/buoni_parts/list.txt -c copy out/buoni_raw.mp4
