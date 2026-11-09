"""Base del reel Immuno (Farmacia Michelangelo): frasi chiave di ogni brand, taglio stretto sulle pause, upscale 1080x1920,
voce pulita (con notch sui fischi), timeline.json e words.json. uso: RAW=/cartella/con/bf1..bf7.mp4 python3 michelangelo/blackfriday/prep.py"""
import json, os, re, subprocess
D = os.path.dirname(os.path.abspath(__file__))
RAW = os.environ.get('RAW', os.path.join(D, 'public', 'raw'))
WH = json.load(open(f'{D}/whisper.json'))
os.makedirs(f'{D}/public', exist_ok=True); os.makedirs(f'{D}/tmp', exist_ok=True)
# (clip, inizio, fine) in secondi della clip sorgente — taglio da ~70 s: frasi chiave
RANGES = [(1, 0.0, 5.95), (2, 0.0, 6.2), (3, 0.0, 12.2), (3, 13.4, 22.6), (4, 0.0, 4.9), (6, 0.0, 12.5), (7, 0.0, 7.45), (8, 0.5, 11.2)]


def run(*a):
    subprocess.run(a, check=True)


def dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).decode())


def silences(i):
    o = subprocess.run(['ffmpeg', '-i', f'{RAW}/im{i}.mp4', '-af', 'silencedetect=noise=-34dB:d=0.3', '-vn', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', o)]
    e = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', o)]
    return list(zip(s, e + [None] * (len(s) - len(e))))


SIL = {i: silences(i) for i in range(1, 9)}
CUTS = []
lens = []
for n, (i, a0, b0) in enumerate(RANGES):
    d = dur(f'{RAW}/im{i}.mp4')
    sp = []
    cur = 0.0
    for s, e in SIL[i]:
        if s > cur + 0.01:
            sp.append([cur, s])
        cur = e if e is not None else d
    if cur < d - 0.05:
        sp.append([cur, d])
    segs = []
    for a, b in sp:
        a = max(a - 0.11, a0)
        b = min(b + 0.15, b0)
        if b - a < 0.2 or b <= a0 or a >= b0:
            continue
        if segs and a - segs[-1][1] < 0.04:
            segs[-1][1] = b
        else:
            segs.append([a, b])
    segs[0][0] = a0
    segs[-1][1] = b0
    CUTS.append(segs)
    fc = []
    for k, (a, b) in enumerate(segs):
        z = 1.0 if (n + k) % 2 == 0 else 1.06
        W_ = int(round(1080 * z / 2) * 2); H_ = int(round(1920 * z / 2) * 2)
        fc.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS,fps=30,scale={W_}:{H_}:flags=lanczos,crop=1080:1920,unsharp=5:5:0.5:3:3:0.0,format=yuv420p[v{k}]")
        fc.append(f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:st=0:d=0.012,afade=t=out:st={b - a - 0.012:.3f}:d=0.012[a{k}]")
    fc.append(''.join(f'[v{k}][a{k}]' for k in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=1[vv][aa]')
    run('ffmpeg', '-v', 'error', '-y', '-i', f'{RAW}/im{i}.mp4', '-filter_complex', ';'.join(fc), '-map', '[vv]', '-map', '[aa]', '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-r', '30', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', '-ar', '48000', f'{D}/tmp/c{n}.mkv')
    lens.append(dur(f'{D}/tmp/c{n}.mkv'))
N = len(RANGES)
open(f'{D}/tmp/list.txt', 'w').write(''.join(f"file '{D}/tmp/c{n}.mkv'\n" for n in range(N)))
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{D}/tmp/list.txt', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-an', f'{D}/public/base.mp4')
NOTCH = 'bandreject=f=10389:width_type=q:w=25,bandreject=f=12400:width_type=q:w=25,bandreject=f=8690:width_type=q:w=25,bandreject=f=13898:width_type=q:w=25'
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{D}/tmp/list.txt', '-vn', '-af',
    f'highpass=f=85,afftdn=nr=9:nf=-32,{NOTCH},equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1:g=2.5,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=7',
    '-ar', '48000', '-ac', '1', f'{D}/public/voice.wav')
json.dump({'fps': 30, 'tail': 4.6, 'segs': [{'in': 0.0, 'out': round(l, 4)} for l in lens]}, open(f'{D}/timeline.json', 'w'))
json.dump({'ranges': RANGES, 'cuts': CUTS}, open(f'{D}/cuts.json', 'w'))


def norm(t):
    return re.sub(r"[^\wàèéìòóù']", '', t.lower().replace('’', "'"))


def mp(n, t):
    cum = 0.0
    segs = CUTS[n]
    if t <= segs[0][0]:
        return 0.0
    for a, b in segs:
        if t < a:
            return cum
        if t <= b:
            return cum + t - a
        cum += b - a
    return cum


FIX = {'mi': None}
out = []
start = 0.0
for n, (i, a0, b0) in enumerate(RANGES):
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
    for k, (t, a, b) in enumerate(j):
        if a < a0 - 0.12 or a > b0 - 0.05:
            continue
        w = norm(t)
        if not w:
            continue
        out.append([round(start + mp(n, max(a, a0)), 2), w, n])
    start += lens[n]
# correzioni di trascrizione: "mi amo" -> miamo
fix = []
skip = False
for q, (t, w, k) in enumerate(out):
    if skip:
        skip = False
        continue
    if w == 'mi' and q + 1 < len(out) and out[q + 1][1] == 'amo':
        fix.append([t, 'miamo', k]); skip = True; continue
    fix.append([t, w, k])
json.dump(fix, open(f'{D}/words.json', 'w'), ensure_ascii=False)
print('base', round(sum(lens), 2), 's;', len(fix), 'parole;', [round(l, 1) for l in lens])
