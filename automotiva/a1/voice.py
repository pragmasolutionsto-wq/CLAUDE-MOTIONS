# traccia voce: segmenti EDL concatenati con micro-fade, pulizia leggera, loudness -16 LUFS
import json, os, subprocess
R = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(R, 'timeline.json')))
W = os.path.join(R, '../work/a1')
ins, fl = [], []
for i, s in enumerate(tl['segs']):
    ins += ['-i', f"{W}/wav/IMG_{s['clip']}.wav"]
    d = s['out'] - s['in']
    fl.append(f"[{i}:a]atrim={s['in']}:{s['out']},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={d-0.02:.3f}:d=0.02[a{i}]")
n = len(tl['segs'])
fl.append(''.join(f'[a{i}]' for i in range(n)) + f"concat=n={n}:v=0:a=1,highpass=f=85,afftdn=nf=-28,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7[v]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[v]', '-ar', '48000', f'{W}/audio/voice.wav'], check=True)
print('voice ok')
