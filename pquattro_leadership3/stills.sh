#!/bin/bash
# fotogrammi di controllo (con ingombro viso in debug) -> provino unico. Uso: stills.sh t1 t2 ... (secondi)
set -e
cd "$(dirname "$0")/.."
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
O=out/stills3; mkdir -p $O; rm -f $O/*.png
npx remotion bundle pquattro_leadership3/index.ts --public-dir=pquattro_leadership3/public --out-dir=out/bundle3 --log=error >/dev/null
for s in "$@"; do
  f=$(python3 -c "print(round($s*60))")
  timeout 180 npx remotion still out/bundle3 Leadership3 $O/s_$(printf %07.2f $s).png --frame=$f --browser-executable=$B --log=error --props='{"debug":true}' >/dev/null &
  while [ $(jobs -r | wc -l) -ge 3 ]; do sleep 0.3; done
done
wait
ffmpeg -v error -y -pattern_type glob -i "$O/s_*.png" -vf "scale=270:480,tile=6x3:padding=6:color=black" -frames:v 1 $O/sheet.jpg
