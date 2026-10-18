"""Effetti sonori morbidi (brand calmo) sincronizzati su tagli, inserti e grafiche. Niente musica.
uso: python3 africa/sfx.py out/africa_sfx.wav"""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

D = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(f'{D}/timeline.json')); WORDS = json.load(open(f'{D}/words.json')); INS = json.load(open(f'{D}/inserts.json'))
SEG = [0.0]
for s in TL['segs']: SEG.append(SEG[-1] + s['out'] - s['in'])
END = SEG[-1]; DUR = END + TL['tail']
def w(x, n=1):
    c = 0
    for t, ww, k in WORDS:
        if ww == x:
            c += 1
            if c == n: return t
    raise KeyError(x)

SR = 48000; N = int(SR * DUR); rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
def put(sig, at, g=1.0, pan=0.5):
    s = int(at * SR)
    if s < 0 or s >= N: return
    e = min(N, s + len(sig)); x = sig[:e - s] * g
    L[s:e] += x * (1 - pan) * 1.4; R[s:e] += x * pan * 1.4
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def lp(x, f): b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), 'high'); return lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def whoosh(d=0.6, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        p = i / n; out[i:i + blk] = lp(x[i:i + blk], min(300 + 5000 * (p if up else 1 - p) ** 1.5, 16000))
    return hp(out, 200) * np.sin(np.pi * t / d) ** 2
def pop(pitch=1.0):
    n = int(0.1 * SR); t = np.arange(n) / SR
    f = (700 + 900 * np.exp(-t * 50)) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.03)
def bell(f0, d=1.6):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2*np.pi*f0*t) + 0.4*np.sin(2*np.pi*f0*2.76*t)*np.exp(-t/0.25) + 0.2*np.sin(2*np.pi*f0*5.4*t)*np.exp(-t/0.1)) * env(n, 0.002, d / 3)
def shimmer(seed, k=8, f0=1760):
    r = np.random.default_rng(seed); out = np.zeros(int(1.4 * SR))
    for i in range(k):
        s = bell(f0 * 2 ** (r.integers(0, 7) / 12), 0.7) * 0.25; st = int(i * 0.07 * SR); e = min(len(out), st + len(s)); out[st:e] += s[:e - st]
    return out
def thud():
    n = int(0.5 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-t * 18)) / SR) * np.exp(-t / 0.18)
def crack():
    out = np.zeros(int(0.6 * SR))
    for i in range(14):
        n = int(0.02 * SR); s = hp(noise(n), 2500) * env(n, 0.0003, 0.004) * (0.4 + rng.random()); st = int((i * 0.025 + rng.random() * 0.01) * SR); out[st:st + n] += s
    return out

# inserti: transizione a cubo in entrata e in uscita
ins = {'cycle': (SEG[2], SEG[4]), 'autumn': (SEG[5], SEG[6]), 'strand': (w('che') - 0.05, SEG[8]), 'tips': (w('sicuramente', 2) - 0.12, SEG[12])}
for k, (a, b) in ins.items():
    put(whoosh(0.6, True), a - 0.35, 0.55, 0.35); put(thud(), a, 0.25); put(shimmer(len(k)), a + 0.15, 0.3)
    put(whoosh(0.55, False), b - 0.3, 0.45, 0.65)
for a in (SEG[1], SEG[7], SEG[9]):
    put(whoosh(0.55), a - 0.3, 0.4)
put(whoosh(0.7), END - 0.35, 0.55); put(thud(), END, 0.35); put(shimmer(9, 10, 1320), END + 0.3, 0.4)
# grafiche: un pop morbido per ogni entrata
pops = [w('perdendo'), w('solito'), w('tranquilla'), w('normale'), w('riposo'), w('luglio'), w('agosto'), w('settembre'), w('ottobre'), w('novembre'), w('aumenta'),
        w("un'estate"), w('uv'), w('calore'), w('stress'), w('tinte'), w('schiariture'), w('phon'), w('spazzole'), w('piastra'), w('fragilità'),
        w('tranquilla', 2), w('temporanea'), w('se'), w('dura'), w('malattie'), w('diete'), w('stress', 2), w('approfondire'), w('consiglio'),
        w('detergenti'), w('meno'), w('termoprotettore'), w('sostegno'), w('vieni'), w('aspettiamo')]
for i, t in enumerate(pops): put(pop(1 + 0.08 * (i % 4)), t - 0.08, 0.32, 0.4 + 0.07 * (i % 3))
for x in ('cresce', 'ferma', 'cade'): put(pop(1.25), w(x) - 0.1, 0.35)
put(crack(), w('rottura') - 0.05, 0.6)
put(bell(1047, 1.8), w('temporanea') + 0.05, 0.25)
put(shimmer(4, 8, 1568), w('vieni'), 0.3)

x = np.stack([L, R], 1); x = np.tanh(x * 0.9); x /= max(1e-9, np.abs(x).max()); x *= 0.85
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x * 32767).astype(np.int16).tobytes())
print('ok')
