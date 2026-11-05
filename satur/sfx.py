"""Effetti sonori sincronizzati su tagli, testi 3D e grafiche. Niente musica (la mette Meme).
uso: python3 satur/sfx.py out/satur_sfx.wav"""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

D = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(f'{D}/timeline.json')); SJ = json.load(open(f'{D}/shots.json'))
SH = {s['name']: s for s in SJ['shots']}; K = SJ['k']
SR = 48000; N = int(SR * TL['duration']); rng = np.random.default_rng(5)
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

# niente campanelli né scintillii (richiesta di Meme)
# tagli
for s_ in SJ['shots'][1:]:
    a = s_['a']
    if s_['tr'] == 'cube': put(whoosh(0.65, True), a - 0.42, 0.45, 0.35); put(boom(55, 0.5), a + 0.05, 0.25)
    else: put(whoosh(0.32, True), a - 0.22, 0.4, 0.6); put(tick(), a, 0.4)
# testi 3D
for at in (0.2, K['apnea'] - 0.35, SH['how']['a'] + 0.15, K['saturimetria3'] - 0.35):
    put(boom(46, 0.8), at + 0.25, 0.42)
# righe e chip
pops = [K['domanda'] - 0.35, K['russi0'] - 0.3, K['stanco0'] - 0.3, K['sonnolenza0'] - 0.3, K['stanchezza'] - 0.3, K['si1'] - 0.3, K['sottovalutare'] - 0.4,
        K['disturbi1'] - 0.3, K['respiratori1'] - 0.3, K['notte1'] - 0.4, K['notturna1'] - 0.3, K['respiro'] - 0.3, K['interrompe'] - 0.3, K['riposi'] - 0.3,
        K['ossigeno2'] - 0.3, K['anidride'] - 0.3, K['rischio'] - 0.35, K['salute'] - 0.3, K['sapere'] - 0.3, K['notturna3'] - 0.3, K['sensore'] - 0.5, K['dormi'] + 0.3,
        K['registra'] - 0.3, K['saturazione'] - 0.3, K['frequenza'] - 0.3, K['variazioni'] - 0.3, K['approfondire'] - 0.35,
        K['russi6'] - 0.25, K['stanco6'] - 0.3, K['sonnolenza6'] - 0.3, K['parlarne'] - 0.3, K['noi6'] - 0.3, K['approfondiremo'] - 0.3, K['saturimetria6'] - 0.5, K['aspettiamo'] - 0.3]
for i, t in enumerate(pops): put(pop(1 + 0.07 * (i % 5)), t - 0.02, 0.28, 0.35 + 0.1 * (i % 4))
# sveglia: ronzio (niente campanelle)
def buzz(d=1.2):
    n = int(d * SR); tt = np.arange(n) / SR
    return lp(np.sign(np.sin(2 * np.pi * 180 * tt)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * tt))), 1800) * env(n, 0.01, d)
put(buzz(1.3), SH['clock']['a'] + 0.05, 0.22)
# spunte dei segnali
for i in range(3): put(tick(), K['si1'] + 0.1 + i * 0.35, 0.6)
# pause del respiro: il suono si ferma con un piccolo colpo
i0 = K['interrompe'] - 0.1
for a_ in (i0, i0 + 1.5, i0 + 2.9): put(boom(70, 0.25), a_ + 0.2, 0.3)
# ossigeno che cala, CO2 che sale
put(whoosh(1.4, False), K['diminuisca'] - 0.6, 0.3); put(riser(1.2, 200, 900), K['aumenti'] - 0.3, 0.2)
put(boom(44, 0.9), K['rischio'] - 0.4, 0.4)
# lente sulla variazione
put(whoosh(0.5, True), K['variazioni'] - 0.3, 0.35); put(boom(60, 0.4), K['variazioni'], 0.3)
# chiusura
e = SH['end']['a']; put(pop(1.2), e + 1.1, 0.3); put(pop(1.35), e + 1.25, 0.3)

x = np.stack([L, R], 1); x = np.tanh(x * 0.9); x /= max(1e-9, np.abs(x).max()); x *= 0.85
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x * 32767).astype(np.int16).tobytes())
print('ok')
