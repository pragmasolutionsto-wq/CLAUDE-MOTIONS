#!/bin/bash
# reel diabete complicanze e piccole attenzioni Farmacia Plebiscito (farmacista in video): taglio pause → base + voce → viso → clip 3D → grafiche Remotion → voce + sfx
# sottotitoli in una versione a parte (ASS impresso con ffmpeg), musica a Meme
set -e
B=${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p out
python3 diab2/cut.py
python3 diab2/prep.py
python3 diab2/facetrack.py
python3 diab2/shots.py
python3 diab2/prep_ai.py
npx remotion render diab2/index.ts Diab2 out/diab2_raw.mp4 --public-dir=diab2/public --gl=swangle --browser-executable=$B --concurrency=4 --crf=14 --muted --log=error
python3 diab2/sfx.py out/diab2_sfx.wav
python3 diab2/subs.py out/diab2_subs.ass
ffmpeg -loglevel error -y -i out/diab2_raw.mp4 -i out/diab2_voice.wav -i out/diab2_sfx.wav -filter_complex \
  "[2:a]volume=0.4[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_diabete2_reel.mp4
ffmpeg -loglevel error -y -i out/diab2_raw.mp4 -i out/diab2_voice.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_diabete2_solo_voce.mp4
ffprobe -v error -show_entries format=duration,size -of compact out/plebiscito_diabete2_reel.mp4
ffmpeg -loglevel error -y -i out/diab2_raw.mp4 -i out/diab2_voice.wav -i out/diab2_sfx.wav -filter_complex \
  "[0:v]ass=out/diab2_subs.ass:fontsdir=diab2/fonts[v];[2:a]volume=0.4[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_diabete2_reel_sottotitoli.mp4
# versioni con musica di sottofondo (lieve, si abbassa sotto la voce)
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/diab2_raw.mp4)
MIX="[1:a]asplit=2[v1][vkey];[3:a]aresample=48000,volume=0.16,afade=t=in:d=1.5,afade=t=out:st=$(echo "$D-3"|bc):d=3[m];[m][vkey]sidechaincompress=threshold=0.03:ratio=4:attack=30:release=400[md];[2:a]volume=0.4[fx];[v1][fx][md]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]"
for v in reel reel_sottotitoli; do
  ffmpeg -loglevel error -y -i out/plebiscito_diabete2_$v.mp4 -i out/diab2_voice.wav -i out/diab2_sfx.wav -i diab2/public/music/sottofondo.mp3 -filter_complex "$MIX" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/plebiscito_diabete2_${v}_musica.mp4
done
