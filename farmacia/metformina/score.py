"""Colonna sonora reel metformina: base calma 92 BPM, chime sui tagli (sale di nota a ogni consiglio).
uso: python3 farmacia/metformina/score.py out/score.wav"""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

TL = json.load(open(os.path.join(os.path.dirname(__file__), 'timeline.json')))
SC = {s['id']: s['from'] for s in TL['scenes']}
SR = 44100; DUR = TL['scenes'][-1]['to']; N = int(SR * DUR); B = 60 / 92
rng = np.random.default_rng(5)
L = np.zeros(N); R = np.zeros(N)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def put(sig, at, g=1.0, pan=0.5):
    s = int(at * SR)
    if s >= N or s < 0: return
    e = min(N, s + len(sig)); sg = sig[:e - s] * g
    L[s:e] += sg * (1 - pan) * 1.4; R[s:e] += sg * pan * 1.4
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)
def lp(x, f): b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), 'high'); return lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)

def kick(g=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.13) * g
def shaker(g=1.0):
    n = int(0.09 * SR); return hp(noise(n), 6000) * env(n, 0.006, 0.03) * g
def rim(g=1.0):
    n = int(0.08 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1700 * t) * 0.5 + hp(noise(n), 3000) * 0.5) * np.exp(-t / 0.012) * g
def pluck(m, d=0.35, bright=1.0):
    n = int(d * 5 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.4*np.sin(4*np.pi*f*t)*np.exp(-t/0.1)*bright + 0.15*np.sin(6*np.pi*f*t)*np.exp(-t/0.05)*bright
    return x * env(n, 0.003, d)
def bell(m, d=1.2):
    n = int(d * 2 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/0.25) + 0.2*np.sin(2*np.pi*f*5.4*t)*np.exp(-t/0.08)
    return x * env(n, 0.002, d * 0.6)
def bass(m, d):
    n = int(d * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.25*np.sin(4*np.pi*f*t)
    return lp(x, 500) * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.08)
def pad(ms, d):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.12, 0.12):
            x += np.sin(2*np.pi*hz(m)*(1 + det * 0.01)*t + det) + 0.25*np.sin(4*np.pi*hz(m)*t)
    a = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
    return lp(x, 1800) * a * 0.09
def pop(g=1.0):
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = 300 + 900 * (t / 0.12); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t / 0.035) * g
def swish(d=0.45, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    return lp(hp(noise(n), 1500), 7000) * np.sin(np.pi * t / d) ** 2 * g

# Re maggiore: Dmaj7 - Bm7 - Gmaj7 - A6, un accordo per battuta
CH = [(38, [62, 66, 69, 73]), (35, [62, 66, 69, 71]), (31, [62, 66, 67, 71]), (33, [61, 64, 66, 69])]
bar = 4 * B
nbars = int(DUR / bar) + 1
t_groove = SC['cosa']
for k in range(nbars):
    t0 = k * bar; root, ch = CH[k % 4]
    put(pad(ch, bar + 0.6), t0, 1.0)
    if t0 < t_groove - 0.1: continue
    put(bass(root, bar * 0.48), t0, 0.55); put(bass(root, bar * 0.4), t0 + bar / 2 + B / 2, 0.4)
    for b in range(4):
        tb = t0 + b * B
        if b in (0, 2): put(kick(), tb, 0.55)
        if b in (1, 3): put(rim(), tb, 0.22, 0.6)
        for h in (0, 0.5): put(shaker(), tb + h * B, 0.18 if h else 0.1, 0.65)
        arp = [ch[0] + 12, ch[2] + 12, ch[1] + 12, ch[3] + 12]
        for h in (0, 0.5):
            m = arp[(2 * b + int(h * 2)) % 4]
            put(pluck(m, 0.22, 0.8), tb + h * B, 0.16, 0.3 + 0.4 * ((b + h) % 2))

# gancio: capsula che rimbalza
for at, g in ((0.396, 0.9), (0.741, 0.5), (0.914, 0.3), (0.978, 0.15)): put(kick(), at, g); put(pop(), at, g * 0.25)
put(bell(86, 1.4), 0.4, 0.22, 0.6)
# tagli: swish + pop + chime che sale di grado a ogni consiglio
scale = [74, 76, 78, 81, 83, 85, 86]
for s in TL['scenes'][1:]:
    at = s['from']; put(swish(0.4), at - 0.3, 0.12); put(pop(), at + 0.05, 0.25)
for i in range(7):
    at = SC[f't{i+1}']; put(bell(scale[i], 1.1), at + 0.15, 0.28, 0.35 + 0.05 * i); put(bell(scale[i] - 12, 1.1), at + 0.15, 0.12)
# chiusura
e = SC['end']
put(pad([50, 57, 62, 66, 69, 73], DUR - e), e, 1.6)
put(kick(), e, 0.7); put(bass(38, DUR - e - 0.5), e, 0.5)
for i, m in enumerate([74, 78, 81, 85, 86]): put(bell(m, 1.4), e + 1.7 + i * 0.12, 0.22, 0.25 + 0.12 * i)

x = np.stack([L, R], 1)
fade = np.ones(N); fn = int(1.4 * SR); fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
x *= fade[:, None]
x = np.tanh(x * 0.8); x /= max(1e-9, np.abs(x).max()); x *= 0.85
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
print('ok', sys.argv[1])
