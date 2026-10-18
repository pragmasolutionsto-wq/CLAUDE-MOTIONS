"""Base del reel: taglia le clip secondo timeline.json, upscale 1080x1920 + grade (video muto) e voce pulita.
uso: python3 farmacia/prep.py   ->  farmacia/public/base.mp4, out/voice.wav"""
import json, os, subprocess

D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(f'{D}/timeline.json'))
segs, tail = T['segs'], T['tail']
os.makedirs('out', exist_ok=True)

clips = sorted({s['clip'] for s in segs})
inputs = sum([['-i', f'{D}/public/raw/clip{c}.mp4'] for c in clips], [])
idx = {c: i for i, c in enumerate(clips)}

v, a = [], []
for k, s in enumerate(segs):
    i, d = idx[s['clip']], s['out'] - s['in']
    v.append(f"[{i}:v]trim={s['in']}:{s['out']},setpts=PTS-STARTPTS,fps=30,scale=1080:1920:flags=lanczos,setsar=1[v{k}]")
    a.append(f"[{i}:a]atrim={s['in']}:{s['out']},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={d - 0.03:.3f}:d=0.03[a{k}]")
n = len(segs)
fc = ';'.join(v + a)
fc += ';' + ''.join(f'[v{k}]' for k in range(n)) + f'concat=n={n}:v=1:a=0,'
fc += f'unsharp=5:5:0.7:3:3:0.3,eq=contrast=1.06:saturation=1.1:gamma=0.98,colorbalance=rs=0.02:bs=-0.02,tpad=stop_mode=clone:stop_duration={tail}[vo]'
fc += ';' + ''.join(f'[a{k}]' for k in range(n)) + f'concat=n={n}:v=0:a=1,'
fc += ('highpass=f=85,afftdn=nr=12:nf=-42,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3400:t=q:w=1:g=3,'
       'equalizer=f=9000:t=h:w=1:g=1.5,deesser=i=0.35,acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=3,'
       f'loudnorm=I=-15:TP=-1.5:LRA=7,apad=pad_dur={tail}[ao]')

subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc,
                '-map', '[vo]', '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', f'{D}/public/base.mp4',
                '-map', '[ao]', '-ar', '48000', '-ac', '2', 'out/voice.wav'], check=True)
print('ok base.mp4 + voice.wav')
