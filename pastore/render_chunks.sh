#!/bin/bash
# render Remotion a blocchi (ripartibile): salta i blocchi già fatti, poi concatena in out/pastore_raw.mp4
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
N=$(python3 -c "import json;print(round(json.load(open('pastore/timeline.json'))['duration']*30))")
STEP=400; mkdir -p out/pastore_parts; : > out/pastore_parts/list.txt
for ((a=0; a<N; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $N ] && b=$((N-1))
  f=out/pastore_parts/p$(printf %05d $a).mp4
  [ -s $f ] || npx remotion render pastore/index.ts Pastore $f --frames=$a-$b --public-dir=pastore/public --gl=swangle --browser-executable=$B --concurrency=3 --timeout=240000 --crf=14 --muted --log=error
  echo "file '$(basename $f)'" >> out/pastore_parts/list.txt
done
ffmpeg -loglevel error -y -f concat -safe 0 -i out/pastore_parts/list.txt -c copy out/pastore_raw.mp4
