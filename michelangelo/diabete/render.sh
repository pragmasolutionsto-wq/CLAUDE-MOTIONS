#!/bin/bash
# reel Michelangelo — diabete: base girata → inserti Runway → grafiche Remotion → voce + sfx (+ musica opzionale). Niente sottotitoli.
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
mkdir -p out
[ -f michelangelo/diabete/public/base.mp4 ] || RAW=${RAW:-michelangelo/diabete/public/raw} python3 michelangelo/diabete/prep.py
npx remotion render michelangelo/diabete/index.ts Diabete out/diabete_raw.mp4 --public-dir=michelangelo/diabete/public --gl=swangle --browser-executable=$B --concurrency=4 --crf=14 --muted --log=error
python3 michelangelo/diabete/sfx.py out/diabete_sfx.wav
