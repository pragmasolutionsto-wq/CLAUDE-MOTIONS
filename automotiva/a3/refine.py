# allarga ogni taglio fino al bordo della pausa (dalla parte della parola tenuta) e allinea al frame
import soundfile as sf, numpy as np, sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from segs import SEGS
FPS = 30
LOCK = {('9322', 'in'), ('9363', 'in'), ('9329', 'in')}  # inizi già verificati a orecchio/ASR
def env(c):
    x, sr = sf.read(f'/home/user/CLAUDE-MOTIONS/automotiva/work/v2/wav/IMG_{c}.wav', dtype='float32')
    h = sr // 100
    e = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)])
    return 20 * np.log10(np.convolve(e, np.ones(3) / 3, 'same') + 1e-9)
out = []
for c, a, b in SEGS:
    db = env(c)
    def quiet(t):
        i = int(round(t * 100)); lo, hi = max(0, i - 30), min(len(db) - 1, i + 30)
        m = lo + int(np.argmin(db[lo:hi])); thr = db[m] + 7
        s = m
        while s > 0 and db[s - 1] < thr: s -= 1
        e = m
        while e < len(db) - 1 and db[e + 1] < thr: e += 1
        return s / 100, e / 100
    na, nb = a, b
    if (c, 'in') not in LOCK:
        qs, qe = quiet(a)
        na = math.ceil((qs + 0.02) * FPS) / FPS          # subito dopo la parola precedente
        if na > qe: na = math.floor(qe * FPS) / FPS
    qs, qe = quiet(b)
    nb = math.floor((qe - 0.02) * FPS) / FPS             # appena prima della parola successiva
    if nb < qs: nb = math.ceil(qs * FPS) / FPS
    if (c, 'in') in LOCK: na = round(a * FPS) / FPS
    out.append((c, round(na, 4), round(nb, 4)))
    print(f'{c} in {a:.2f}->{na:.3f}  out {b:.2f}->{nb:.3f}')
lines = ['# Audi A3 Identity Black: tagli del parlato (clip, in, out), allineati al frame e ai bordi delle pause (refine.py)', 'SEGS = [']
lines += [f"    ('{c}', {a}, {b})," for c, a, b in out] + [']']
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'segs.py'), 'w').write('\n'.join(lines) + '\n')
