"""Effetti sonori morbidi (brand calmo) sincronizzati su cubi, inserti e chip. Niente campanelli, niente musica.
uso: python3 michelangelo/diabete/sfx.py out/diabete_sfx.wav"""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

D = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(f'{D}/timeline.json')); WORDS = json.load(open(f'{D}/words.json'))
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


def thud():
    n = int(0.5 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-t * 18)) / SR) * np.exp(-t / 0.18)


def bell(f0, d=1.6):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t) + 0.4 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / 0.25) + 0.2 * np.sin(2 * np.pi * f0 * 5.4 * t) * np.exp(-t / 0.1)) * env(n, 0.002, d / 3)


def logo_reveal():
    out = np.zeros(int(2.2 * SR)); notes = [523.25, 659.25, 783.99, 1046.5]
    for i, f in enumerate(notes):
        s = bell(f, 1.4) * 0.22; st = int(i * 0.09 * SR); out[st:st + len(s)] += s[:len(out) - st]
    return out + whoosh(0.9, True)[:len(out)] * 0.0 if False else out


# inserti (stessi tempi di Movie.tsx)
INS = {
    'gli': (w('glicemia') - 0.2, SEG[2]), 'cons': (w('conseguenze') - 0.15, SEG[3]), 'don': (w('benessere') - 0.1, SEG[5]),
    'pel': (w('secchezza', 2) - 0.15, SEG[6]), 'pie': (w('controllali') - 0.1, SEG[7]), 'fer': (w('ferita') - 0.15, w('dolore') + 0.7),
    'occ': (w('occhi', 2) - 0.15, w('idratati') + 0.9), 'cur': (w('prendersi') - 0.15, SEG[10]),
}
for k, (a, b) in INS.items():
    put(whoosh(0.6, True), a - 0.35, 0.5, 0.35); put(thud(), a, 0.22)
    put(whoosh(0.6, False), b - 0.35, 0.4, 0.65)
# fine: logo 3D
put(whoosh(0.8, True), END - 0.45, 0.5); put(thud(), END, 0.25); put(logo_reveal(), END + 0.25, 0.5)
# chip e titoli: pop leggeri sui momenti chiave
for word, n, g, pitch in [
    ('hai', 1, 0.2, 1.0), ('alimentazione', 1, 0.2, 1.0), ('movimento', 1, 0.2, 1.1), ('stress', 1, 0.2, 1.2), ('malattia', 1, 0.2, 1.3),
    ('pelle', 1, 0.2, 1.0), ('piedi', 1, 0.2, 1.1), ('occhi', 1, 0.2, 1.2), ('secchezza', 1, 0.2, 1.0), ('infezioni', 1, 0.2, 1.1), ('sessuale', 1, 0.2, 1.2),
    ('cosmetici', 1, 0.2, 1.0), ('viso', 1, 0.2, 1.1), ('ridurne', 1, 0.2, 1.0), ('controllali', 1, 0.2, 1.0), ('asciugali', 1, 0.2, 1.1), ('crema', 1, 0.2, 1.2),
    ('evitando', 1, 0.2, 1.3), ('segnale', 1, 0.2, 1.0), ('gonfio', 1, 0.2, 1.0), ('rosso', 1, 0.2, 1.1), ('caldo', 1, 0.2, 1.2), ('contattare', 1, 0.25, 1.1),
    ('idratati', 1, 0.2, 1.0), ('periodicamente', 1, 0.2, 1.0), ('prendersi', 1, 0.2, 1.0), ('soluzioni', 1, 0.2, 1.1), ('vieni', 1, 0.25, 1.0), ('vivere', 1, 0.2, 1.2),
]:
    put(pop(pitch), w(word, n) - 0.08, g, 0.5)

# limiter morbido e scrittura
pk = max(np.abs(L).max(), np.abs(R).max(), 1e-9); sc = 0.9 / pk if pk > 0.9 else 1.0
out = (np.stack([L, R], 1) * sc * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(out.tobytes())
print('sfx', round(DUR, 2), 's')
