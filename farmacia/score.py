"""Colonna sonora Farmacia Africa Orientale: 60s, 105 BPM (105 battiti), piano + archi + base elettronica leggera,
crescendo verso le Rooms, chiusura calda. SFX: tac dei blocchi, whoosh tra le scene, clic dell'insegna.
uso: python3 farmacia/score.py out/score.wav   (legge farmacia/timeline.json)"""
import sys, json, wave, os
import numpy as np
from scipy.signal import lfilter, butter

tl = json.load(open(os.path.join(os.path.dirname(__file__), 'timeline.json')))
SR = 44100; DUR = float(tl['duration']); N = int(SR * DUR); B = 60 / tl['bpm']; SC = tl['scenes']
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

def piano(m, d=0.5, g=1.0):
    n = int(d * 4 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.45*np.sin(4*np.pi*f*t)*np.exp(-t/0.25) + 0.2*np.sin(6*np.pi*f*t)*np.exp(-t/0.12) + 0.08*np.sin(8*np.pi*f*t)*np.exp(-t/0.06)
    return lp(x, 5200) * env(n, 0.003, d) * g
def bell(m, g=1.0):
    n = int(2.4 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/0.5) + 0.3*np.sin(2*np.pi*f*5.4*t)*np.exp(-t/0.2)
    return x * env(n, 0.002, 0.9) * g
def bass(m, d=0.55, g=1.0):
    n = int(d * 3 * SR); t = np.arange(n) / SR; f = hz(m)
    return lp(np.sin(2*np.pi*f*t) + 0.3*np.sin(4*np.pi*f*t), 700) * env(n, 0.01, d) * g
def strings(ms, d, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.09, 0.0, 0.09):
            f = hz(m) * (1 + det * 0.01)
            x += np.sin(2*np.pi*f*t) + 0.5*np.sin(4*np.pi*f*t) + 0.25*np.sin(6*np.pi*f*t)
    a = np.minimum(1, t / 1.1) * np.minimum(1, (d - t) / 1.4)
    return lp(x, 2200) * a * g * 0.055
def kick(g=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + 120 * np.exp(-t * 30); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph) * np.exp(-t / 0.13) * g
def hat(g=1.0):
    n = int(0.08 * SR); return hp(noise(n), 8000) * env(n, 0.0005, 0.02) * g
def tac(g=1.0):
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = rng.uniform(150, 230)
    x = np.sin(2*np.pi*f*t) * np.exp(-t/0.035) + 0.5 * lp(hp(noise(n), 900), 4500) * np.exp(-t/0.01)
    return x * g
def whoosh(d=0.7, g=1.0, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        p = i / n; f = 300 + 5500 * (p if up else 1 - p) ** 1.6
        out[i:i+blk] = lp(x[i:i+blk], min(f, 16000))
    sh = np.sin(np.pi * t / d) ** 2
    return hp(out, 250) * sh * g
def click(g=1.0):
    n = int(0.05 * SR); return hp(noise(n), 2500) * env(n, 0.0003, 0.008) * g

CH = [([48, 60, 64, 67], 36), ([43, 59, 62, 67], 31), ([45, 57, 60, 64], 33), ([41, 57, 60, 65], 29)]  # (accordo, nota basso)
bars = int(DUR / (8 * B)) + 1
sect = lambda t: np.interp(t, [0, 6, 16, 34, 46, 54, 60], [0.3, 0.6, 0.75, 1.0, 0.85, 0.7, 0.6])

for c in range(bars):
    t0 = c * 8 * B; ch, bs = CH[c % 4]
    if t0 >= DUR: break
    put(strings(ch, 8 * B + 1.2, 1.0), t0, g=sect(t0) * 0.9, pan=0.5)
    if t0 >= SC[1] - 0.1:
        pat = [0, 2, 1, 3, 2, 1, 3, 2]
        steps = 16 if t0 >= SC[3] else 8
        for k in range(steps):
            at = t0 + k * (B / 2) if steps == 16 else t0 + k * B
            if at >= DUR: break
            note = ch[pat[k % 8]] + (12 if k % 8 in (3, 7) else 0)
            put(piano(note, 0.45, 0.5 * sect(at)), at, pan=0.35 + 0.3 * ((k * 7) % 3) / 2)
    else:
        if c % 2 == 0: put(bell(ch[3] + 12, 0.18), t0 + B, pan=0.6)
    if t0 >= SC[2] - 0.1:
        for k in range(8):
            put(bass(bs, 0.5, 0.55), t0 + k * B, g=1.0 if k % 2 == 0 else 0.5, pan=0.5)
for k in range(int(DUR / B)):
    at = k * B
    if SC[2] <= at < SC[5]:
        put(kick(0.55), at, pan=0.5)
    if SC[3] <= at < SC[5]:
        put(hat(0.2), at + B / 2, pan=0.6)
        if k % 2 == 1: put(hat(0.12), at, pan=0.4)

# effetti: tac nelle finestre di costruzione, griglia a 16esimi
wins = [(0.8, 2.1), (3.6, 4.4), (7.0, 11.2), (13.0, 15.2), (16.9, 19), (21.4, 23.5), (25.9, 28), (30.3, 32.5), (33.8, 35.2), (36.8, 38.5), (40.4, 42), (43.5, 45), (48.4, 52)]
for a, b in wins:
    step = B / 4; at = a
    while at < b:
        if rng.random() < 0.45: put(tac(0.45 * rng.uniform(0.6, 1)), round(at / step) * step, pan=rng.uniform(0.2, 0.8))
        at += step
for at in (5.8, 15.8, 33.4, 53.7): put(whoosh(0.7, 0.5), at, pan=0.5)
put(whoosh(2.8, 0.55), 45.4)
put(whoosh(0.9, 0.35, up=False), 12.2)
put(click(0.9), 10.4); put(click(0.7), 10.5); put(bell(84, 0.35), 10.45, pan=0.7)
put(bell(79, 0.3), 3.3, pan=0.4); put(bell(88, 0.22), 3.45, pan=0.6)
put(bell(72, 0.3), 55.6); put(bell(76, 0.22), 55.9, pan=0.6); put(bell(79, 0.25), 56.2, pan=0.4); put(bell(84, 0.28), 56.7, pan=0.5)
put(strings([48, 55, 60, 64], 8.0, 1.0), 53.0, g=1.0)

# fade-in 1s, fade-out ultimo secondo
fi = np.minimum(1, np.arange(N) / SR / 1.0); fo = np.minimum(1, (N - np.arange(N)) / SR / 1.2)
L *= fi * fo; R *= fi * fo
# riverbero semplice
def verb(x):
    out = x.copy()
    for d, g in ((0.043, 0.28), (0.071, 0.2), (0.113, 0.14), (0.169, 0.09)):
        k = int(d * SR); out[k:] += x[:-k] * g
    return out
L = verb(L); R = verb(R[::1])
m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * 0.85, R / m * 0.85
out = np.stack([L, R], 1)
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype('<i2').tobytes()); w.close()
print('ok', sys.argv[1], f'{DUR}s')
