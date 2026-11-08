#!/bin/bash
# render Remotion a blocchi (ripartibile, con retry): salta i blocchi già fatti, poi concatena in out/pastore2_raw.mp4
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
N=$(python3 -c "import json;print(round(json.load(open('pastore2/timeline.json'))['duration']*30))")
STEP=240; mkdir -p out/pastore2_parts; : > out/pastore2_parts/list.txt
for ((a=0; a<N; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $N ] && b=$((N-1))
  f=out/pastore2_parts/p$(printf %05d $a).mp4
  for try in 1 2 3 4; do
    [ -s $f ] && break
    npx remotion render pastore2/index.ts Pastore $f --frames=$a-$b --public-dir=pastore2/public --gl=swangle --browser-executable=$B --concurrency=4 --timeout=120000 --crf=14 --muted --log=error || rm -f $f
  done
  [ -s $f ] || { echo "blocco $a fallito"; exit 1; }
  echo "file '$(basename $f)'" >> out/pastore2_parts/list.txt
done
ffmpeg -loglevel error -y -f concat -safe 0 -i out/pastore2_parts/list.txt -c copy out/pastore2_raw.mp4
