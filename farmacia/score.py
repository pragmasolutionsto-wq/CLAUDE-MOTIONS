"""Colonna sonora Farmacia Africa Orientale: 15s, 120 BPM (30 battiti), tagli di scena sui battiti.
pianoforte + archi + base elettronica leggera. uso: python3 farmacia/score.py out/score.wav"""
import sys, json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

tl = json.load(open(os.path.join(os.path.dirname(__file__), 'timeline.json')))
SR = 44100; DUR = float(tl['duration']); N = int(SR * DUR); B = 60 / tl['bpm']; SC = tl['scenes']
rng = np.random.default_rng(3)
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
    n = int(0.38 * SR); t = np.arange(n) / SR
    f = 46 + 130 * np.exp(-t * 28); ph = 2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph) * np.exp(-t / 0.15) + 0.25 * noise(n) * np.exp(-t / 0.006)) * g
def clap(g=1.0):
    n = int(0.3 * SR); x = hp(noise(n), 1200) * env(n, 0.001, 0.07)
    for k in (0.012, 0.024): x[int(k * SR):] += x[:n - int(k * SR)] * 0.6
    return lp(x, 7000) * g
def hat(g=1.0, d=0.04):
    n = int(0.15 * SR); return hp(noise(n), 7000) * env(n, 0.0005, d) * g
def pluck(m, g=1.0, d=0.3):
    n = int(d * 5 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.45*np.sin(4*np.pi*f*t)*np.exp(-t/0.2) + 0.2*np.sin(6*np.pi*f*t)*np.exp(-t/0.08)
    return lp(x, 5200) * env(n, 0.003, d) * g
def bell(m, g=1.0):
    n = int(2.2 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/0.5) + 0.3*np.sin(2*np.pi*f*5.4*t)*np.exp(-t/0.2)
    return x * env(n, 0.002, 0.8) * g
def bass(m, d=0.35, g=1.0):
    n = int(d * 3 * SR); t = np.arange(n) / SR; f = hz(m)
    return lp(np.sin(2*np.pi*f*t) + 0.3*np.sin(4*np.pi*f*t) + 0.15*np.sign(np.sin(2*np.pi*f*t)), 800) * env(n, 0.005, d) * g
def pad(ms, d, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.09, 0, 0.09):
            f = hz(m) * (1 + det * 0.01)
            x += np.sin(2*np.pi*f*t) + 0.5*np.sin(4*np.pi*f*t)
    a = np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.5)
    return lp(x, 2400) * a * g * 0.07
def whoosh(d=0.5, g=1.0, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        p = i / n; f = 300 + 6000 * (p if up else 1 - p) ** 1.6
        out[i:i+blk] = lp(x[i:i+blk], min(f, 16000))
    sh = (t / d) ** 2 if up else (1 - t / d) ** 2
    return hp(out, 200) * sh * g * np.minimum(1, (d - t) / 0.03)
def boom(g=1.0):
    n = int(1.4 * SR); t = np.arange(n) / SR
    f = 40 + 80 * np.exp(-t * 7); ph = 2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph) * np.exp(-t / 0.5) + hp(noise(n), 800) * np.exp(-t / 0.3) * 0.4) * g
def tick(g=1.0):
    n = int(0.05 * SR); return hp(noise(n), 3000) * env(n, 0.0004, 0.01) * g

CH = [([60, 64, 67], 36), ([59, 62, 67], 31), ([57, 60, 64], 33), ([53, 57, 60], 29)]
nb = int(DUR / B)
for k in range(nb):
    at = k * B; bar = k // 4; ch, bs = CH[bar % 4]
    if k % 4 == 0: put(pad(ch + [ch[0] + 12], 4 * B + 0.3, 1.0), at, pan=0.5)
    sec = next(i for i in range(6) if SC[i] <= at < SC[i + 1])
    if sec >= 1:
        put(kick(0.9), at)
        put(bass(bs, 0.3, 0.7), at + B / 2, pan=0.5)
        put(hat(0.22), at + B / 2, pan=0.62)
        if k % 2 == 1: put(clap(0.55), at, pan=0.45)
        for j, note in enumerate([ch[0], ch[1], ch[2], ch[1]]):
            put(pluck(note + 12, 0.38), at + j * B / 4, pan=0.3 + 0.1 * j)
    else:
        if k % 2 == 0: put(bell(ch[2] + 12, 0.3), at, pan=0.6)
        if k == 2: put(kick(0.6), at)
# scene cuts: impatto + whoosh in ingresso
for s in SC[1:6]:
    put(boom(0.75), s); put(whoosh(0.45, 0.6), s - 0.42)
# il logo si costruisce (S1 e S6): ticks sul disegno, accordo-sparkle al completamento
for base in (SC[0], SC[5]):
    for j, d in enumerate([0.25, 0.55, 0.85, 1.05, 1.25, 1.45, 1.65]):
        put(tick(0.8), base + d, pan=0.2 + 0.1 * j); put(bell(72 + j * 2, 0.12), base + d + 0.02, pan=0.2 + 0.1 * j)
    put(boom(0.9), base + 1.95); put(whoosh(0.5, 0.5), base + 1.55)
    for j, m in enumerate([84, 88, 91, 96]): put(bell(m, 0.22), base + 1.97 + j * 0.06, pan=0.3 + 0.13 * j)
put(pad([60, 64, 67, 72], 2.6, 1.1), SC[5] - 0.05)
fi = np.minimum(1, np.arange(N) / SR / 0.3); fo = np.minimum(1, (N - np.arange(N)) / SR / 0.7)
L *= fi * fo; R *= fi * fo
def verb(x):
    out = x.copy()
    for d, g in ((0.043, 0.25), (0.071, 0.18), (0.113, 0.12)):
        k = int(d * SR); out[k:] += x[:-k] * g
    return out
L = verb(L); R = verb(R)
m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * 0.88, R / m * 0.88
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.stack([L, R], 1) * 32767).astype('<i2').tobytes()); w.close()
print('ok', sys.argv[1])
