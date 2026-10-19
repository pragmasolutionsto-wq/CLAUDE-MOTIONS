"""Colonna sonora Automotiva: 15.2s, 150 BPM (38 battiti), trap/phonk aggressiva, drop al battito 16.
uso: python3 automotiva/score.py out/score.wav"""
import sys, wave
import numpy as np
from scipy.signal import lfilter, butter

SR = 44100; B = 60 / 150; DUR = 38 * B; N = int(SR * DUR)
rng = np.random.default_rng(7)
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
T = lambda beat: beat * B

def kick(g=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 50 + 160 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(2.2 * (np.sin(ph) * np.exp(-t / 0.13) + 0.4 * noise(n) * np.exp(-t / 0.004))) * g
def snare(g=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    x = hp(noise(n), 1500) * env(n, 0.001, 0.11) + 0.6 * body
    for k in (0.011, 0.021): x[int(k * SR):] += x[:n - int(k * SR)] * 0.5
    return np.tanh(1.6 * lp(x, 9000)) * g
def hat(g=1.0, d=0.03):
    n = int(0.12 * SR); return hp(noise(n), 8000) * env(n, 0.0004, d) * g
def bell(m, g=1.0, d=0.18):
    # cowbell phonk: due quadre stonate, passa-banda
    n = int(d * 4 * SR); t = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * hz(m) * t)) + np.sign(np.sin(2 * np.pi * hz(m) * 1.48 * t))
    return lp(hp(x, 500), 4500) * env(n, 0.001, d) * g * 0.35
def b808(m, d, g=1.0, glide_from=None):
    n = int(d * SR); t = np.arange(n) / SR
    f0 = hz(m)
    f = f0 if glide_from is None else hz(glide_from) + (f0 - hz(glide_from)) * np.minimum(1, t / 0.07)
    ph = 2 * np.pi * np.cumsum(np.ones(n) * f) / SR
    x = np.sin(ph) + 0.15 * np.sin(2 * ph)
    a = np.minimum(1, t / 0.004) * np.minimum(1, (d - t) / 0.03) * (0.55 + 0.45 * np.exp(-t / 0.35))
    return np.tanh(3.2 * x * a) * 0.8 * g
def boom(g=1.0):
    n = int(2.2 * SR); t = np.arange(n) / SR
    f = 34 + 110 * np.exp(-t * 7); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.9) + hp(noise(n), 700) * np.exp(-t / 0.35) * 0.6
    return np.tanh(1.8 * x) * g
def whoosh(d=0.6, g=1.0, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        p = i / n; f = 300 + 7000 * (p if up else 1 - p) ** 1.6
        out[i:i + blk] = lp(x[i:i + blk], min(f, 18000))
    sh = (t / d) ** 2 if up else (1 - t / d) ** 2
    return hp(out, 200) * sh * g * np.minimum(1, (d - t) / 0.02)
def riser(d, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    f = 120 * 2 ** (t / d * 3.6)
    r = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.18 + hp(noise(n), 1200) * (t / d) ** 2 * 0.6
    return lp(r, 9000) * (t / d) ** 1.6 * g
def pad(ms, d, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.12, 0.0, 0.12):
            x += np.sign(np.sin(2 * np.pi * hz(m) * (1 + det * 0.01) * t)) * 0.4
    a = np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.5)
    return lp(x, 1800) * a * g * 0.1

# progressione in Mi minore: E, C, D, B (radici 808)
ROOTS = [28, 24, 26, 23]
BELL = [64, 67, 71, 74, 71, 67, 66, 67]

def groove(b0, b1, vol=1.0, bells=True, hats=True):
    for b in range(b0, b1):
        t = T(b); k = b - b0; root = ROOTS[(b // 4) % 4]
        if k % 4 == 0: put(kick(), t, 1.0 * vol)
        if k % 4 == 2: put(snare(), t, 0.85 * vol)
        if k % 4 == 3: put(kick(), t + B / 2, 0.8 * vol)
        if hats:
            roll = 4 if b % 4 == 3 else 2
            for h in range(roll): put(hat(0.9, 0.025), t + h * B / roll, 0.32 * vol, 0.35 + 0.3 * (h % 2))
        if k % 4 == 0: put(b808(root, B * 1.9, 1.0, None if b % 8 else root + 12), t, 0.95 * vol)
        if k % 4 == 3: put(b808(root + 7, B * 0.45), t + B / 2, 0.7 * vol)
        if bells:
            for i in range(2):
                put(bell(BELL[(2 * b + i) % 8] + 12, 1, 0.12), t + i * B / 2, 0.55 * vol, 0.3 + 0.4 * i)

# ---- hook 0-14: colpo secco, poi groove
put(boom(1.0), 0, 1.0); put(snare(), 0, 0.8)
groove(0, 5, 0.9, bells=False)
groove(5, 14, 0.9)
for b in (0, 3, 5, 8, 10, 12): put(whoosh(0.25, 1, True), T(b) - 0.25, 0.45)
for b in (1.5, 6, 9): put(snare(), T(b), 0.5)
# ---- break 14-16: tutto si svuota, rullante che accelera + riser
put(pad([52, 55, 59], 2 * B, 1.0), T(14), 0.9)
put(riser(2 * B, 1.0), T(14), 0.85)
for i in range(16):
    put(snare(), T(14) + i * B / 8, 0.12 + 0.04 * i)
put(b808(28, B * 0.4), T(14), 0.6)
# ---- DROP 16-25
put(boom(1.0), T(16), 1.0); put(snare(), T(16), 1.0)
groove(16, 21, 1.15)
put(pad([52, 55, 59, 64], 5 * B, 1.0), T(16), 0.5)
# stutter 21-25: un impatto per battito
for k in range(4):
    t = T(21 + k)
    put(kick(), t, 1.1); put(snare(), t, 0.7); put(b808(ROOTS[k], B * 0.9, 1.0, ROOTS[k] + 5), t, 0.9)
    put(bell(76 - k * 2, 1, 0.2), t, 0.6, 0.3 + 0.13 * k)
    put(whoosh(0.18, 1, True), t - 0.18, 0.5)
# ---- hero 25-31
put(boom(1.0), T(25), 0.95)
groove(25, 31, 1.1)
put(pad([52, 55, 59], 6 * B, 1.0), T(25), 0.55)
put(riser(1.4 * B, 1.0), T(29.6), 0.5)
# ---- finale 31-38: colpo, coda 808 e campanaccio che sfuma
put(boom(1.0), T(31), 1.05); put(snare(), T(31), 0.9)
put(b808(28, 3.2, 1.0, 40), T(31), 1.0)
put(pad([40, 52, 55, 59, 64], 7 * B, 1.0), T(31), 0.8)
for i, m in enumerate([76, 79, 83, 88]): put(bell(m, 1, 0.3), T(31.5) + i * B / 2, 0.4, 0.25 + 0.17 * i)
put(kick(), T(35), 0.6); put(bell(76, 1, 0.6), T(35), 0.35)

x = np.stack([L, R], 1)
fade = np.ones(N); fn = int(1.2 * SR); fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
x *= fade[:, None]
x = np.tanh(x * 1.1); x /= max(1e-9, np.abs(x).max()); x *= 0.93
pcm = (x * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
