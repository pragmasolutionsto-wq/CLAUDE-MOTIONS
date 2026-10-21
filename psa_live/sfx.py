"""Effetti sonori sincronizzati su tagli, testi 3D e grafiche. Niente musica (la mette Meme).
uso: python3 psa_live/sfx.py out/live_sfx.wav"""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

D = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(f'{D}/timeline.json')); SE = json.load(open(f'{D}/sents.json')); SJ = json.load(open(f'{D}/shots.json'))
SH = {s['name']: s for s in SJ['shots']}; K = SJ['k']
SR = 48000; N = int(SR * (SE[-1]['end'] + TL['tail'])); rng = np.random.default_rng(5)
L = np.zeros(N); R = np.zeros(N)
def put(sig, at, g=1.0, pan=0.5):
    s = int(at * SR)
    if s < 0: sig = sig[-s:]; s = 0
    if s >= N: return
    e = min(N, s + len(sig)); x = sig[:e - s] * g
    L[s:e] += x * (1 - pan) * 1.4; R[s:e] += x * pan * 1.4
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def lp(x, f): b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), 'high'); return lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def whoosh(d=0.6, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        p = i / n; out[i:i + blk] = lp(x[i:i + blk], min(300 + 7000 * (p if up else 1 - p) ** 1.5, 18000))
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
        s = bell(f0 * 2 ** (r.integers(0, 7) / 12), 0.7) * 0.25; st = int(i * 0.06 * SR); e = min(len(out), st + len(s)); out[st:e] += s[:e - st]
    return out
def boom(f=48, d=0.9):  # impatto profondo (sub drop)
    n = int(d * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(f + 90 * np.exp(-t * 14)) / SR) * np.exp(-t / (d / 3))
    return s + hp(noise(n), 3000) * env(n, 0.0005, 0.015) * 0.5
def riser(d=1.4, f0=200, f1=1600):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (f1 / f0) ** (t / d)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + hp(noise(n), 2000) * 0.25 * (t / d)) * (t / d) ** 2
def tick(): n = int(0.03 * SR); return hp(noise(n), 4000) * env(n, 0.0003, 0.006)
def glitch(d=0.35):
    n = int(d * SR); out = np.zeros(n)
    for i in range(10):
        m = int(rng.uniform(0.01, 0.03) * SR); st = int(rng.uniform(0, d - 0.03) * SR)
        out[st:st + m] += np.sign(np.sin(2 * np.pi * rng.uniform(200, 1800) * np.arange(m) / SR)) * 0.3
    return hp(out, 300)
def heartbeat():
    out = np.zeros(int(0.9 * SR))
    for at, g in ((0, 1), (0.22, 0.7)):
        s = boom(42, 0.35) * g; st = int(at * SR); out[st:st + len(s)] += s
    return out

# apertura
put(boom(40, 1.2), 0.0, 0.6); put(pop(1.1), 0.02, 0.35); put(pop(1.25), 0.2, 0.35)
# tagli
for k in (1, 3, 7, 8, 10):
    a = SE[k]['t']; put(whoosh(0.4, True), a - 0.3, 0.5, 0.6); put(tick(), a, 0.5)
put(whoosh(0.65, True), SH['end']['a'] - 0.42, 0.55, 0.35); put(boom(55, 0.5), SH['end']['a'] + 0.05, 0.3)
# testi 3D
for at in (K['prostata0'] - 0.15, K['psa1'] - 0.35, K['due'] - 0.45, K['non6'] - 0.15, K['cinquanta'] - 0.3, K['quaranta'] - 0.3):
    put(boom(46, 0.8), at + 0.25, 0.45); put(shimmer(int(at * 10), 7, 1568), at + 0.3, 0.28)
pops = [0.02, 0.2, K['prostata0'] + 0.35, K['importante0'] - 0.15, K['importante0'] + 0.6, K['psa1'] - 0.75, K['proteina'] - 0.1, K['prodotta'] - 0.1, K['marcatore'] - 0.25,
        SH['f_prel']['a'] + 0.08, K['prelievo2'] - 0.15, K['cause'] - 0.2, K['alto3'] - 0.2, K['due'] - 0.2,
        K['ingrossata'] - 0.2, K['infiammazione'] - 0.15, K['infezione'] - 0.15, K['prostatiti'] - 0.15, SH['f_neq']['a'] + 0.05, K['psa6'] - 0.25, K['necess'] - 0.3, K['necess'] - 0.05,
        K['eta'] - 0.25, K['test7'] - 0.3, K['familiarita'] - 0.2, K['fattori7'] - 0.2, SH['f_beyond']['a'] + 0.05, K['possibile'] - 0.2, K['esame8'] - 0.3,
        SH['f_why']['a'] + 0.1, K['sempre9'] - 0.25, K['sintomi'] - 0.5, K['fattori9'] - 0.7, SH['f_help']['a'] + 0.05, K['aiutarti'] - 0.2, K['area'] - 0.2,
        SH['f_verify']['a'] + 0.05, K['salute8'] - 0.3, K['capillare'] - 0.35, K['rapido'] - 0.1, K['info'] - 0.3, K['lettura'] - 0.3, K['consigli'] - 0.4, SH['f_step']['a'] + 0.05, K['passo'] - 0.35]
for i, t in enumerate(pops): put(pop(1 + 0.07 * (i % 5)), t - 0.02, 0.32, 0.35 + 0.1 * (i % 4))
put(boom(60, 0.5), K['tumore5'] - 0.3, 0.35); put(glitch(0.25), K['tumore5'] - 0.3, 0.2)
put(boom(38, 1.2), K['non6'] - 0.1, 0.45)
put(heartbeat(), K['sempre9'] - 0.2, 0.35)
for at in (SH['f_test']['a'] + 0.4, SH['end']['a'] + 1.2): put(bell(1319, 1.2), at + 0.1, 0.32); put(bell(1760, 1.0), at + 0.18, 0.22)
for k in ('info', 'lettura', 'consigli'): put(whoosh(0.4, True), K[k] - 0.6, 0.4); put(boom(70, 0.3), K[k] - 0.25, 0.28)
e = SH['end']['a']; put(shimmer(9, 12, 1320), e + 0.1, 0.42); put(boom(44, 1.2), e + 0.6, 0.45); put(pop(1.2), e + 1.0, 0.3); put(pop(1.35), e + 1.2, 0.3)

x = np.stack([L, R], 1); x = np.tanh(x * 0.9); x /= max(1e-9, np.abs(x).max()); x *= 0.85
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x * 32767).astype(np.int16).tobytes())
print('ok')
