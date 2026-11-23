# mix: voce + pianoforte in sottofondo (si abbassa sotto il parlato, risale nella chiusura); poi mux sul video
import json, os, subprocess, sys
R = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(R, '../work/dono')
tl = json.load(open(os.path.join(R, 'timeline.json'))); dur = tl['dur']
fl = ['[0:a]volume=3dB,apad,asplit=2[vo][key]',
      f"[1:a]atrim=0:{dur},volume=-9dB,afade=t=in:d=1.0,afade=t=out:st={dur - 2.2}:d=2.2[mu0]",
      '[mu0][key]sidechaincompress=threshold=0.015:ratio=5:attack=60:release=700:makeup=1[mu]',
      f'[vo][mu]amix=inputs=2:normalize=0:duration=first,atrim=0:{dur},volume=4dB,alimiter=limit=0.94[out]']
mix = f'{W}/mix.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{W}/voice.wav', '-i', f'{W}/music.mp3', '-filter_complex', ';'.join(fl), '-map', '[out]', '-ar', '48000', '-ac', '2', mix], check=True)
print('mix ok')
if len(sys.argv) > 2:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', sys.argv[1], '-i', mix, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-maxrate', '10M', '-bufsize', '20M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', sys.argv[2]], check=True)
    print('mux ok', sys.argv[2])
