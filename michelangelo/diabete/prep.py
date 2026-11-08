"""Base del reel diabete (Farmacia Michelangelo): taglio stretto sulle pause + upscale 1080x1920 + punch-in alternato,
voce pulita, timeline.json e words.json (parola -> secondo in uscita).
Clip girate in RAW (default public/raw/d1..d12.mp4, non versionate). uso: RAW=/percorso python3 michelangelo/diabete/prep.py"""
import json, os, re, subprocess
D = os.path.dirname(os.path.abspath(__file__))
RAW = os.environ.get('RAW', os.path.join(D, 'public', 'raw'))
C = json.load(open(f'{D}/cuts.json'))
WH = json.load(open(f'{D}/whisper_med.json'))
os.makedirs(f'{D}/public', exist_ok=True); os.makedirs(f'{D}/tmp', exist_ok=True)


def run(*a):
    subprocess.run(a, check=True)


def dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).decode().split()[0])


lens = []
for i in range(1, 13):
    segs = C[str(i)]['segs']
    fc = []
    for k, (a, b) in enumerate(segs):
        z = 1.0 if (i + k) % 2 == 0 else 1.075
        W_ = int(round(1080 * z / 2) * 2)
        H_ = int(round(1920 * z / 2) * 2)
        fc.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS,fps=30,scale={W_}:{H_}:flags=lanczos,crop=1080:1920,unsharp=5:5:0.5:3:3:0.0,format=yuv420p[v{k}]")
        fc.append(f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:st=0:d=0.012,afade=t=out:st={b - a - 0.012:.3f}:d=0.012[a{k}]")
    fc.append(''.join(f'[v{k}][a{k}]' for k in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=1[vv][aa]')
    run('ffmpeg', '-v', 'error', '-y', '-i', f'{RAW}/d{i}.mp4', '-filter_complex', ';'.join(fc), '-map', '[vv]', '-map', '[aa]',
        '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-r', '30', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', '-ar', '48000', f'{D}/tmp/c{i}.mkv')
    lens.append(dur(f'{D}/tmp/c{i}.mkv'))
open(f'{D}/tmp/list.txt', 'w').write(''.join(f"file '{D}/tmp/c{i}.mkv'\n" for i in range(1, 13)))
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{D}/tmp/list.txt', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-an', f'{D}/public/base.mp4')
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{D}/tmp/list.txt', '-vn', '-af',
    'highpass=f=85,afftdn=nr=9:nf=-32,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1:g=2.5,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=7',
    '-ar', '48000', '-ac', '1', f'{D}/public/voice.wav')
tl = {'fps': 30, 'tail': 4.4, 'segs': [{'in': 0.0, 'out': round(l, 4)} for l in lens]}
json.dump(tl, open(f'{D}/timeline.json', 'w'))

FIX = {'diabeta.': 'diabete.'}


def norm(t):
    return re.sub(r"[^\wàèéìòóù']", '', t.lower().replace('’', "'"))


def mp(i, t):
    cum = 0.0
    segs = C[str(i)]['segs']
    if t <= segs[0][0]:
        return 0.0
    for a, b in segs:
        if t < a:
            return cum
        if t <= b:
            return cum + t - a
        cum += b - a
    return cum


start = 0.0
out = []
for i in range(1, 13):
    ws = [list(w) for s in WH[str(i)] for w in s['w']]
    j = []
    for t, a, b in ws:
        t = t.strip()
        if j and (t.startswith("'") or j[-1][0].endswith("'")):
            j[-1] = [j[-1][0] + t, j[-1][1], b]
        elif j and j[-1][0] == 'c' and t == "'è":
            j[-1] = ["c'è", j[-1][1], b]
        else:
            j.append([t, a, b])
    onset = C[str(i)]['segs'][0][0] + 0.15
    for n, (t, a, b) in enumerate(j):
        if n == 0 and a < onset:
            a = onset
        w = norm(FIX.get(t, t)).replace('occulista', 'oculista')
        if w:
            out.append([round(start + mp(i, a), 2), w, i - 1])
    start += lens[i - 1]
fix = []
skip = False
for n, (t, w, k) in enumerate(out):
    if skip:
        skip = False
        continue
    if w == 'controlla' and n + 1 < len(out) and out[n + 1][1] == 'gli':
        fix.append([t, 'controllali', k])
        skip = True
        continue
    fix.append([t, w, k])
json.dump(fix, open(f'{D}/words.json', 'w'), ensure_ascii=False)
print('base', round(sum(lens), 2), 's;', len(fix), 'parole')
