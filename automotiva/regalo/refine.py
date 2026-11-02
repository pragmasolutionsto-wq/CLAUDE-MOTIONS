# porta ogni taglio dentro la pausa vera (>=80ms sotto -40dB) più vicina, lasciando un po' d'aria; allinea al frame
import soundfile as sf, numpy as np, sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from segs_draft import SEGS
FPS, WAV = 30, '/home/user/CLAUDE-MOTIONS/automotiva/work/v3/wav'
def env(c):
    x, sr = sf.read(f'{WAV}/IMG_{c}.wav', dtype='float32'); h = sr // 100
    return 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)]) + 1e-9)
def quiet_runs(db, thr=-40, mn=8):
    r, s = [], None
    for i, v in enumerate(list(db) + [0]):
        if v < thr and s is None: s = i
        if v >= thr and s is not None:
            if i - s >= mn: r.append((s / 100, i / 100))
            s = None
    return r
out = []
for c, a, b in SEGS:
    db = env(c); R = quiet_runs(db); L = len(db) / 100
    # ingresso: pausa che contiene/precede a (entro 0.5s)
    if a <= 0.05:
        na = 0.0
    else:
        cand = [r for r in R if r[0] - 0.5 <= a <= r[1] + 0.5]
        r = min(cand, key=lambda r: abs((r[0] + r[1]) / 2 - a)) if cand else None
        na = max(r[0], r[1] - 0.15) if r else a
    cand = [r for r in R if r[0] - 0.5 <= b <= r[1] + 0.5]
    r = min(cand, key=lambda r: abs((r[0] + r[1]) / 2 - b)) if cand else None
    nb = min(r[1], r[0] + 0.25) if r else min(b, L - 0.05)
    na = math.ceil(na * FPS) / FPS; nb = math.floor(nb * FPS) / FPS
    flag = '' if (r or b >= L - 0.1) else '  <-- nessuna pausa vera in uscita'
    out.append((c, round(na, 4), round(nb, 4)))
    print(f'{c} {a:6.2f}->{na:6.3f}  {b:6.2f}->{nb:6.3f}{flag}')
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'segs.py'), 'w').write(
    '# Regalo Yaris: tagli del parlato (clip, in, out) dentro le pause vere, allineati al frame (refine.py)\nSEGS = [\n' + ''.join(f"    ('{c}', {a}, {b}),\n" for c, a, b in out) + ']\n')
