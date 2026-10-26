"""Base del reel PSA (farmacista): taglia la clip secondo timeline.json, upscale 1080x1920 + grade leggero (video muto) e voce pulita.
uso: python3 unifarco/prep.py   ->  unifarco/public/base.mp4, out/unifarco_voice.wav"""
import json, os, subprocess

D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(f'{D}/timeline.json'))
segs, tail = T['segs'], T['tail']
os.makedirs('out', exist_ok=True)

v, a = [], []
for k, s in enumerate(segs):
    d = s['out'] - s['in']
    v.append(f"[0:v]trim={s['in']}:{s['out']},setpts=PTS-STARTPTS,fps=30,hqdn3d=1.2:1.2:3:3,scale=1080:1920:flags=lanczos,setsar=1[v{k}]")
    a.append(f"[0:a]atrim={s['in']}:{s['out']},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={d - 0.035:.3f}:d=0.035[a{k}]")
n = len(segs)
fc = ';'.join(v + a)
# look luminoso e pulito come le foto delle storie: un filo di contrasto, bianchi puliti, pelle naturale
fc += ';' + ''.join(f'[v{k}]' for k in range(n)) + f'concat=n={n}:v=1:a=0,'
fc += f'unsharp=7:7:0.9:5:5:0.3,eq=contrast=1.06:brightness=0.01:saturation=1.08:gamma=0.98,tpad=stop_mode=clone:stop_duration={tail}[vo]'
fc += ';' + ''.join(f'[a{k}]' for k in range(n)) + f'concat=n={n}:v=0:a=1,'
fc += ('highpass=f=80,afftdn=nr=10:nf=-45,equalizer=f=280:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1:g=2.5,'
       'deesser=i=0.3,acompressor=threshold=-22dB:ratio=2.8:attack=6:release=100:makeup=3,'
       f'loudnorm=I=-15:TP=-1.5:LRA=7,apad=pad_dur={tail}[ao]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/' + T['src'], '-filter_complex', fc,
                '-map', '[vo]', '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', f'{D}/public/base.mp4',
                '-map', '[ao]', '-ar', '48000', '-ac', '2', 'out/unifarco_voice.wav'], check=True)
print('ok')
