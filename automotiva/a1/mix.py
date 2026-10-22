# mix finale: voce + musica in ducking + SFX dalla timeline, poi mux sul video
import json, os, subprocess, sys
R = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(R, '../work/a1/audio')
tl = json.load(open(os.path.join(R, 'timeline.json')))
dur = tl['dur']
ins = ['-i', f'{A}/voice.wav', '-i', f'{A}/music.mp3']
fl = [
    '[0:a]apad,asplit=2[vo][key]',
    f"[1:a]atrim=0:{dur},volume=-15dB,afade=t=in:d=0.4,afade=t=out:st={dur - 1.6}:d=1.6[mu0]",
    '[mu0][key]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450:makeup=1[mu]',
]
names = []
for i, s in enumerate(tl['sfx']):
    ins += ['-i', f"{A}/{s['n']}.mp3"]
    k = i + 2
    ms = max(0, int(s['t'] * 1000))
    fl.append(f"[{k}:a]volume={s['db']}dB,adelay={ms}|{ms}[x{i}]")
    names.append(f'[x{i}]')
fl.append(f"[vo][mu]{''.join(names)}amix=inputs={2 + len(names)}:normalize=0:duration=first,atrim=0:{dur},alimiter=limit=0.95[out]")
mix = f'{A}/mix.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[out]', '-ar', '48000', mix], check=True)
print('mix ok')
if len(sys.argv) > 2:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', sys.argv[1], '-i', mix, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', sys.argv[2]], check=True)
    print('mux ok', sys.argv[2])
