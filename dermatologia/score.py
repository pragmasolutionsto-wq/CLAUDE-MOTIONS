"""Colonna sonora Longevitas Dermatologia: 20s, 120 BPM, tagli di scena sui battiti.
pad + pluck + base elettronica leggera, ticks sui passaggi ABCDE. uso: python3 dermatologia/score.py out/score_derma.wav"""
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

CH = [([62, 65, 69], 38), ([58, 62, 65], 34), ([60, 64, 67], 36), ([57, 60, 64], 33)]
NS = len(SC) - 1
nb = int(DUR / B)
for k in range(nb):
    at = k * B; bar = k // 4; ch, bs = CH[bar % 4]
    if k % 4 == 0: put(pad(ch + [ch[0] + 12], 4 * B + 0.3, 1.0), at, pan=0.5)
    sec = next(i for i in range(NS) if SC[i] <= at < SC[i + 1])
    if sec >= 2 and at < DUR - 1.0:
        put(kick(0.85), at)
        put(bass(bs, 0.3, 0.65), at + B / 2, pan=0.5)
        put(hat(0.2), at + B / 2, pan=0.62); put(hat(0.1, 0.02), at + B / 4, pan=0.4)
        if k % 2 == 1: put(clap(0.5), at, pan=0.45)
        for j, note in enumerate([ch[0], ch[2], ch[1], ch[2]]):
            put(pluck(note + 12, 0.32), at + j * B / 4, pan=0.3 + 0.1 * j)
    elif sec < 2:
        put(bell(ch[(k % 3)] + 12, 0.22), at, pan=0.35 + 0.1 * (k % 3))
        put(hat(0.12), at + B / 2, pan=0.6)
# hook: riser verso il punto che esplode, impatto su "nemmeno"
put(whoosh(1.2, 0.8), SC[1] - 1.2); put(boom(0.9), SC[1]); put(boom(0.6), SC[1] + 0.4)
for j, m in enumerate([86, 90, 93]): put(bell(m, 0.18), SC[0] + 1.0 + j * 0.05, pan=0.4 + 0.1 * j)
# tagli di scena
for s in SC[2:NS]:
    put(boom(0.7), s); put(whoosh(0.45, 0.6), s - 0.42)
# numeri: ticks del contatore
for j in range(16): put(tick(0.5), SC[3] + 0.08 + j * 0.06, pan=0.2 + 0.04 * j)
# servizi: tick su ogni cambio voce
for i in range(4): put(tick(0.9), SC[4] + 0.3 + i * 0.45, pan=0.5); put(bell(81 + i * 2, 0.12), SC[4] + 0.3 + i * 0.45)
# ABCDE: campanella + tick su ogni lettera
for i, d in enumerate([0.35, 1.05, 1.75, 2.45, 3.15]):
    put(tick(1.0), SC[5] + d, pan=0.3 + 0.1 * i); put(bell(74 + [0, 2, 4, 7, 9][i], 0.25), SC[5] + d, pan=0.3 + 0.1 * i)
# CTA: click sul bottone + accordo finale
put(tick(1.2), SC[7] + 2.05); put(boom(0.5), SC[7] + 2.08)
for j, m in enumerate([74, 77, 81, 86]): put(bell(m, 0.2), SC[7] + 2.1 + j * 0.07, pan=0.3 + 0.13 * j)
put(pad([62, 65, 69, 74], 2.0, 1.2), SC[7] + 1.0)
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
