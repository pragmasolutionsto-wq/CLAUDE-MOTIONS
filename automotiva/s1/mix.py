# mix: voce + musica (agganciata al primo battito, ducking sotto la voce) + effetti dalla timeline; poi mux sul video
import json, os, subprocess, sys
R = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(R, '../work/s1')
tl = json.load(open(os.path.join(R, 'timeline.json'))); dur = tl['dur']
MUSIC_IN = 0.10   # primo battito della traccia a 0.11 s
ins = ['-i', f'{W}/voice.wav', '-stream_loop', '1', '-ss', str(MUSIC_IN), '-i', f'{W}/music.mp3']   # la traccia dura 75 s: la ripeto una volta
fl = ['[0:a]volume=3dB,apad,asplit=2[vo][key]',
      f"[1:a]atrim=0:{dur},volume=-11dB,afade=t=out:st={dur - 1.2}:d=1.2[mu0]",
      '[mu0][key]sidechaincompress=threshold=0.02:ratio=7:attack=25:release=380:makeup=1[mu1]',
      # silenzio comico: la musica si ferma di colpo sulla scenetta e riparte sulla battuta successiva
      "[mu1]volume='if(" + '+'.join(f'between(t,{a},{b})' for a, b in tl['silence']) + ",0,1)':eval=frame[mu]"]
names = []
for i, s in enumerate(tl['sfx']):
    ins += ['-i', f"{W}/{s['n']}.wav"]
    ms = max(0, int(s['t'] * 1000))
    fl.append(f"[{i + 2}:a]volume={s['db']}dB,adelay={ms}[x{i}]"); names.append(f'[x{i}]')
fl.append(f"[vo][mu]{''.join(names)}amix=inputs={2 + len(names)}:normalize=0:duration=first,atrim=0:{dur},volume=4.5dB,alimiter=limit=0.94[out]")
mix = f'{W}/mix.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[out]', '-ar', '48000', '-ac', '2', mix], check=True)
print('mix ok')
if len(sys.argv) > 2:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', sys.argv[1], '-i', mix, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-maxrate', '7M', '-bufsize', '14M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', sys.argv[2]], check=True)
    print('mux ok', sys.argv[2])
