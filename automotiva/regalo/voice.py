import os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from segs import SEGS
W = '/home/user/CLAUDE-MOTIONS/automotiva/work/v3'
ins, fl = [], []
for i, (c, a, b) in enumerate(SEGS):
    ins += ['-i', f'{W}/wav/IMG_{c}.wav']
    fl.append(f"[{i}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={b-a-0.03:.3f}:d=0.03[a{i}]")
n = len(SEGS)
fl.append(''.join(f'[a{i}]' for i in range(n)) + f'concat=n={n}:v=0:a=1,highpass=f=85,afftdn=nf=-28,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7[v]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[v]', '-ar', '48000', sys.argv[1]], check=True)
