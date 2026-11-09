#!/bin/bash
# reel Michelangelo — Immuno: base girata (frasi chiave) -> clip Runway -> grafiche Remotion (pannello alto farmacista, basso 3D) -> voce + sfx + musica
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
[ -f michelangelo/immuno/public/base.mp4 ] || RAW=${RAW:-michelangelo/immuno/public/raw} python3 michelangelo/immuno/prep.py
npx remotion render michelangelo/immuno/index.ts Immuno out/im_raw.mp4 --public-dir=michelangelo/immuno/public --gl=swangle --browser-executable=$B --concurrency=3 --crf=14 --muted --log=error
python3 michelangelo/immuno/sfx.py out/im_sfx.wav
bash michelangelo/immuno/mix.sh
