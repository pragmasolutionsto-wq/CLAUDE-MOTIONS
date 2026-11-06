#!/bin/bash
# reel Farmacia Pastore — saturicanze diabete: voce TTS → scaletta → clip 3D → grafiche Remotion (sottotitoli) → voce + musica (ducking) + sfx
set -e
mkdir -p out
python3 satur/voice.py
python3 satur/shots.py
bash satur/render_retry.sh
python3 satur/sfx.py out/satur_sfx.wav
D=$(python3 -c "import json;print(json.load(open('satur/timeline.json'))['duration'])")
ffmpeg -loglevel error -y -i satur/public/music.mp3 -af "apad,atrim=0:$D,afade=t=out:st=$(python3 -c "print($D-1.5)"):d=1.5,aresample=48000" -ac 2 out/satur_music.wav
MIX="[2:a]volume=0.32[m];[1:a]asplit[v][sc];[m][sc]sidechaincompress=threshold=0.035:ratio=6:attack=15:release=380[md];[3:a]volume=0.42[fx]"
ffmpeg -loglevel error -y -i out/satur_raw.mp4 -i out/satur_voice.wav -i out/satur_music.wav -i out/satur_sfx.wav -filter_saturex \
  "$MIX;[v][md][fx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/pastore_saturicanze_diabete_reel.mp4
ffmpeg -loglevel error -y -i out/satur_raw.mp4 -i out/satur_voice.wav -i out/satur_sfx.wav -filter_saturex \
  "[2:a]volume=0.42[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/pastore_saturicanze_diabete_reel_senza_musica.mp4
ffprobe -v error -show_entries format=duration,size -of compact out/pastore_saturicanze_diabete_reel.mp4
