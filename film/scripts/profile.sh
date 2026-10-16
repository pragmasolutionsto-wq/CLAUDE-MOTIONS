#!/bin/bash
# profilo del costo di render: 30 frame in diversi punti del film
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
for t in 2 4.8 7 9 11 14 16 20 22 24 27 28.9 31 33 36 38 41 43 45 47 50 52 56 58.5; do
  f=$(python3 -c "print(round($t*120))")
  s=$(date +%s.%N)
  npx remotion render film/index.ts Pquattro out/prof.mp4 --frames=$f-$((f+29)) --browser-executable=$B --log=error >/dev/null 2>&1
  e=$(date +%s.%N)
  python3 -c "print('t=$t', round(($e-$s-14)/30,2), 's/frame')"
done
