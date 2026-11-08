#!/bin/bash
# voce + sfx (master, senza musica e senza sottotitoli) e versione con musica Runway (Lyria) con ducking sotto la voce. -14 LUFS.
set -e
V=michelangelo/diabete/public/voice.wav; M=michelangelo/diabete/public/music.wav
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/diabete_raw.mp4)
ffmpeg -loglevel error -y -i out/diabete_raw.mp4 -i $V -i out/diabete_sfx.wav -filter_complex \
  "[1:a]apad=whole_dur=$DUR,aformat=channel_layouts=stereo[v];[2:a]volume=0.45[fx];[v][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -t $DUR out/Michelangelo_Reel_Diabete_v2_senza_musica.mp4
ffmpeg -loglevel error -y -i out/diabete_raw.mp4 -i $V -i out/diabete_sfx.wav -i $M -filter_complex \
  "[1:a]apad=whole_dur=$DUR,aformat=channel_layouts=stereo,asplit=2[v][key];[2:a]volume=0.45[fx];[3:a]loudnorm=I=-24:TP=-3:LRA=7,atrim=0:$DUR,afade=t=in:st=0:d=0.8,afade=t=out:st=$(python3 -c "print(round($DUR-2.0,2))"):d=2.0,apad=whole_dur=$DUR[m];[m][key]sidechaincompress=threshold=0.025:ratio=5:attack=15:release=450:makeup=1[md];[v][fx][md]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart -t $DUR out/Michelangelo_Reel_Diabete_v2_con_musica.mp4
ls -la out/Michelangelo_Reel_Diabete_v2_*.mp4
