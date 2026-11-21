# per ogni segmento: primo/ultimo istante sopra soglia dentro la finestra -> bordi consigliati (pre 0.10 s, post 0.14 s)
import soundfile as sf, numpy as np, os, sys
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
for c, a, b in SEGS:
    x, sr = sf.read(f'{R}/../work/n1/{c}.wav', dtype='float32'); h = sr // 100
    db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)]) + 1e-9)
    lo, hi = max(0, int(a * 100) - 30), min(len(db), int(b * 100) + 30)
    pk = db[int(a * 100):int(b * 100)].max(); thr = max(pk - 32, -52)
    on = [i for i in range(lo, hi) if db[i] > thr]
    s, e = on[0] / 100, (on[-1] + 1) / 100
    q = lambda v: round(round(v * 30) / 30, 4)
    print(f"('{c}', {q(max(0, s - 0.10)):.4f}, {q(min(len(db) / 100, e + 0.14)):.4f}),  # voce {s:.2f}-{e:.2f} pk{pk:.0f} thr{thr:.0f}  (era {a}-{b})")
