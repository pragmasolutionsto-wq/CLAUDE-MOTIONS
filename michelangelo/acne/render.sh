#!/bin/bash
# reel Michelangelo — Acne: base girata (frasi chiave) -> clip Runway -> grafiche Remotion (pannello alto farmacista, basso 3D) -> voce + sfx + musica
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
[ -f michelangelo/acne/public/base.mp4 ] || RAW=${RAW:-michelangelo/acne/public/raw} python3 michelangelo/acne/prep.py
npx remotion render michelangelo/acne/index.ts Acne out/ac_raw.mp4 --public-dir=michelangelo/acne/public --gl=swangle --browser-executable=$B --concurrency=3 --crf=14 --muted --log=error
python3 michelangelo/acne/sfx.py out/ac_sfx.wav
bash michelangelo/acne/mix.sh
