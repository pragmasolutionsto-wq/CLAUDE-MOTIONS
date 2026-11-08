#!/bin/bash
# reel Farmacia Pastore — caduta capelli d'autunno, versione CARTOON: stessa voce del reel 01, tutte le scene sono clip Runway,
# scritte/sottotitoli Remotion, logo vero in chiusura. Mix voce + musica (ducking) + sfx senza campanelle.
set -e
mkdir -p out
python3 pastore2/shots.py
python3 pastore2/prep_ai.py
bash pastore2/render_chunks.sh
python3 pastore2/sfx.py out/pastore2_sfx.wav
D=$(python3 -c "import json;print(json.load(open('pastore2/timeline.json'))['duration'])")
[ -s out/pastore_voice.wav ] || python3 pastore/voice.py
ffmpeg -loglevel error -y -i pastore2/public/music.mp3 -af "atrim=0:$D,afade=t=out:st=$(python3 -c "print($D-1.5)"):d=1.5,aresample=48000" -ac 2 out/pastore2_music.wav
MIX="[2:a]volume=0.32[m];[1:a]asplit[v][sc];[m][sc]sidechaincompress=threshold=0.035:ratio=6:attack=15:release=380[md];[3:a]volume=0.42[fx]"
ffmpeg -loglevel error -y -i out/pastore2_raw.mp4 -i out/pastore_voice.wav -i out/pastore2_music.wav -i out/pastore2_sfx.wav -filter_complex \
  "$MIX;[v][md][fx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/pastore_caduta_capelli_cartoon_reel.mp4
ffmpeg -loglevel error -y -i out/pastore2_raw.mp4 -i out/pastore_voice.wav -i out/pastore2_sfx.wav -filter_complex \
  "[2:a]volume=0.42[fx];[1:a][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/pastore_caduta_capelli_cartoon_reel_senza_musica.mp4
ffprobe -v error -show_entries format=duration,size -of compact out/pastore_caduta_capelli_cartoon_reel.mp4
