# per ogni taglio: c'è parlato tra il punto di taglio e il silenzio vero più vicino? (silenzio = >=80ms sotto -40dB)
import soundfile as sf, numpy as np, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from segs import SEGS
def env(c):
    x, sr = sf.read(f'/home/user/CLAUDE-MOTIONS/automotiva/work/v2/wav/IMG_{c}.wav', dtype='float32')
    h = sr // 100
    return 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)]) + 1e-9)
def runs(db, thr=-40, mn=8):
    r, s = [], None
    for i, v in enumerate(db):
        if v < thr and s is None: s = i
        if v >= thr and s is not None:
            if i - s >= mn: r.append((s / 100, i / 100))
            s = None
    if s is not None and len(db) - s >= mn: r.append((s / 100, len(db) / 100))
    return r
for c, a, b in SEGS:
    db = env(c); R = runs(db)
    # uscita: il silenzio deve iniziare prima (o subito) del taglio
    after = [r for r in R if r[1] > b]
    s_out = after[0] if after else None
    ok_out = s_out is not None and s_out[0] <= b + 0.01
    befo = [r for r in R if r[0] < a]
    s_in = befo[-1] if befo else None
    ok_in = a <= 0.05 or (s_in is not None and s_in[1] >= a - 0.01)
    print(f"{c} in {a:6.3f} {'ok ' if ok_in else 'XX '}{s_in}   out {b:6.3f} {'ok ' if ok_out else 'XX '}{s_out}")
