#!/bin/bash
# reel Michelangelo — Black Friday: base girata (frasi chiave) -> clip Runway -> grafiche Remotion (pannello alto farmacista, basso 3D) -> voce + sfx + musica
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
[ -f michelangelo/blackfriday/public/base.mp4 ] || RAW=${RAW:-michelangelo/blackfriday/public/raw} python3 michelangelo/blackfriday/prep.py
npx remotion render michelangelo/blackfriday/index.ts BlackFriday out/bf_raw.mp4 --public-dir=michelangelo/blackfriday/public --gl=swangle --browser-executable=$B --concurrency=3 --crf=14 --muted --log=error
python3 michelangelo/blackfriday/sfx.py out/bf_sfx.wav
bash michelangelo/blackfriday/mix.sh
