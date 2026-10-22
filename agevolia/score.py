"""Colonna sonora Agevolia: 47s, 120 BPM (94 battiti), tagli di scena sui battiti, accenti sugli eventi a schermo.
uso: python3 agevolia/score.py out/agevolia_score.wav"""
import sys, wave
import numpy as np
from scipy.signal import lfilter, butter

SR = 44100; DUR = 47.0; N = int(SR * DUR); B = 0.5
rng = np.random.default_rng(23)
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
    n = int(0.4 * SR); t = np.arange(n) / SR
    f = 44 + 120 * np.exp(-t * 26); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t / 0.17) + 0.25 * noise(n) * np.exp(-t / 0.005)) * g
def clap(g=1.0):
    n = int(0.3 * SR); x = hp(noise(n), 1200) * env(n, 0.001, 0.08)
    for k in (0.011, 0.023): x[int(k * SR):] += x[:n - int(k * SR)] * 0.6
    return lp(x, 7000) * g
def hat(g=1.0, d=0.04):
    n = int(0.15 * SR); return hp(noise(n), 7500) * env(n, 0.0005, d) * g
def pluck(m, g=1.0, d=0.25, bright=1.0):
    n = int(d * 5 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.5*np.sin(4*np.pi*f*t)*np.exp(-t/0.08)*bright + 0.25*np.sin(6*np.pi*f*t)*np.exp(-t/0.04)*bright
    return x * env(n, 0.002, d) * g
def bell(m, g=1.0, d=0.9):
    n = int(d * 3 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/0.3) + 0.2*np.sin(2*np.pi*f*5.4*t)*np.exp(-t/0.1)
    return x * env(n, 0.001, d) * g
def bass(m, d=0.4, g=1.0):
    n = int(d * 3 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.35*np.sin(4*np.pi*f*t) + 0.15*np.sign(np.sin(2*np.pi*f*t))
    return lp(x, 800) * env(n, 0.004, d) * g
def pad(ms, d, g=1.0, cut=2400):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.08, 0.08):
            x += np.sin(2*np.pi*hz(m)*(1+det*0.01)*t) + 0.3*np.sin(4*np.pi*hz(m)*(1-det*0.01)*t)
    a = np.minimum(1, t / 0.3) * np.minimum(1, np.maximum(0, d - t) / 0.5)
    return lp(x, cut) * a * g * 0.1
def whoosh(d=0.6, g=1.0, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        p = i / n; f = 300 + 6000 * (p if up else 1 - p) ** 1.6
        out[i:i+blk] = lp(x[i:i+blk], min(f, 18000))
    sh = (t / d) ** 2 if up else (1 - t / d) ** 2
    return hp(out, 200) * sh * g * np.minimum(1, (d - t) / 0.03)
def boom(g=1.0):
    n = int(2.0 * SR); t = np.arange(n) / SR
    f = 36 + 90 * np.exp(-t * 6); ph = 2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph) * np.exp(-t / 0.8) + hp(noise(n), 800) * np.exp(-t / 0.5) * 0.45) * g
def thump(g=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    f = 70 + 60*np.exp(-t*40); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t/0.07) * g
def click(g=1.0):
    n = int(0.05 * SR); return hp(noise(n), 2500) * env(n, 0.0003, 0.008) * g
def tick(g=1.0):
    n = int(0.03 * SR); t = np.arange(n) / SR
    return np.sin(2*np.pi*2400*t) * np.exp(-t/0.004) * g
def riser(d, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    f = 160 * 2 ** (t / d * 3.2); r = np.sin(2*np.pi*np.cumsum(f)/SR) * 0.25 + hp(noise(n), 1500) * (t / d) ** 2 * 0.5
    return r * (t / d) ** 1.5 * g

T = lambda beat: beat * B
# Fa maggiore: F - C - Dm - Bb (fiducioso, corporate-tech)
CH = [(41, [65, 69, 72]), (36, [64, 67, 72]), (38, [62, 65, 69]), (34, [62, 65, 70])]
SCALE = [65, 67, 69, 72, 74, 77, 79, 81, 84, 86]

def groove(b0, b1, vol=1.0, arpv=0.3, bassv=0.65, claps=True):
    for b in range(b0, b1):
        t = T(b); root, chord = CH[((b - b0) // 4) % 4]
        put(kick(), t, 0.85 * vol)
        if claps and (b - b0) % 2 == 1: put(clap(), t, 0.5 * vol)
        for h in (0, 0.5): put(hat(0.8, 0.03 if h == 0 else 0.06), t + h * B, 0.26 * vol, 0.6)
        put(bass(root, 0.35), t + B / 2, bassv * vol)
        pat = [0, 1, 2, 1]
        for i in range(2):
            m = chord[pat[(2 * (b - b0) + i) % 4]] + 12
            put(pluck(m, 1, 0.16), t + i * B / 2, arpv * vol, 0.3 + 0.4 * i)
    for b in range(b0, b1, 4):
        root, chord = CH[((b - b0) // 4) % 4]
        put(pad(chord, 4 * B + 0.3, 1.0), T(b), 0.45 * vol)

# ---- S1 0-10B: logo
put(pad([53, 60, 65, 69], 10 * B, 1.3, 1800), 0, 0.8)
put(riser(1.4, 1.0), 0.05, 0.5); put(whoosh(1.3, 1, True), 0.15, 0.6)
put(boom(1.0), 1.45, 1.0); put(thump(1), 1.45, 0.9)
cr = hp(noise(int(1.8 * SR)), 5000) * env(int(1.8 * SR), 0.001, 0.6); put(cr, 1.45, 0.45)
for i, m in enumerate([77, 81, 84, 89]): put(bell(m, 1, 0.8), 1.5 + i * 0.12, 0.22, 0.25 + 0.15 * i)
for i in range(8): put(pluck([72, 77, 81, 84][i % 4] + 12, 1, 0.25, 1.3), 2.75 + i * 0.06, 0.25, 0.2 + 0.08 * i)
put(thump(1), 2.75, 0.6)
for b in range(6, 10): put(kick(), T(b), 0.5); put(hat(0.8, 0.04), T(b) + B / 2, 0.2)
put(riser(1.0, 1.0), 4.0, 0.55); put(whoosh(0.5, 1, True), 4.55, 0.7)
# ---- S2 10-20B: caos, tensione
put(boom(1.0), T(10), 0.9); put(clap(), T(10), 0.8)
put(pad([50, 57, 62, 65], 10 * B, 1.0, 1500), T(10), 0.7)
for b in range(10, 20):
    put(kick(), T(b), 0.8 if b % 2 == 0 else 0.45)
    put(bass(38, 0.3), T(b), 0.55)
    for k in range(4): put(tick(1), T(b) + k * B / 4, 0.18 if k else 0.3, 0.3 + 0.4 * (k % 2))
for i in range(5):
    t0 = 5.8 + i * 0.55; put(whoosh(0.35, 1, True), t0 - 0.25, 0.35); put(pluck(SCALE[i + 2] + 12, 1, 0.2), t0, 0.25, 0.2 + 0.15 * i)
put(clap(), 7.55, 0.8); put(thump(1), 7.55, 0.7)
for i in range(8): put(clap(), 9.5 + i * B / 8, 0.08 + 0.04 * i)
put(riser(1.2, 1.0), 8.8, 0.5); put(whoosh(0.45, 1, True), 9.6, 0.7)
# ---- S3 20-32B: monitoraggio, il groove parte
put(boom(1.0), T(20), 1.0); put(clap(), T(20), 0.9)
groove(20, 32, 0.9)
for i in range(4): put(bell(SCALE[i * 2] + 12, 1, 0.6), 10.5 + i * 0.15, 0.25, 0.2 + 0.2 * i)
put(whoosh(0.45, 1, True), 15.6, 0.7)
# ---- S4 32-48B: estrazione, un accento per campo
put(boom(0.9), T(32), 0.9); put(kick(), T(32), 1.0)
groove(32, 48, 1.0)
for k, ts in enumerate([1.29, 1.83, 2.37, 2.91, 3.44, 3.98]):
    put(click(), 16 + ts, 0.5); put(whoosh(0.3, 1, True), 16 + ts, 0.25)
    put(pluck(SCALE[k + 2] + 12, 1, 0.3, 1.4), 16 + ts + 0.6, 0.45, 0.6); put(thump(1), 16 + ts + 0.6, 0.4)
put(bell(89, 1, 1.0), 21.5, 0.35, 0.7); put(bell(84, 1, 1.0), 21.58, 0.3, 0.6)
put(riser(1.0, 1.0), 23.0, 0.5); put(whoosh(0.45, 1, True), 23.6, 0.7)
# ---- S5 48-64B: matching
put(boom(1.0), T(48), 1.0); put(kick(), T(48), 1.0); put(clap(), T(48), 0.8)
put(whoosh(2.2, 1, False), 24.2, 0.45)
groove(50, 64, 1.0)
for k in range(6): put(pluck(SCALE[k + 3] + 12, 1, 0.25, 1.4), 27.15 + k * 0.3, 0.42, 0.3 + 0.08 * k); put(tick(1), 27.15 + k * 0.3, 0.3)
put(boom(0.8), 29.0, 0.6); put(clap(), 29.0, 0.7)
for i, m in enumerate([77, 81, 84, 89]): put(bell(m, 1, 0.7), 29.0 + i * 0.07, 0.24, 0.3 + 0.13 * i)
put(click(), 30.35, 1.0); put(thump(1), 30.35, 0.8)
for i, m in enumerate([84, 89]): put(bell(m, 1, 0.8), 30.6 + i * 0.1, 0.3, 0.6)
put(whoosh(0.45, 1, True), 31.6, 0.7)
# ---- S6 64-74B: calendario e notifiche
put(thump(1), T(64), 0.9); put(boom(0.7), T(64), 0.7)
groove(64, 74, 0.8, 0.22, 0.55)
put(whoosh(0.6, 1, False), 32.35, 0.4)
put(pluck(86, 1, 0.3, 1.4), 33.5, 0.4, 0.3)
for i in range(4):
    t0 = 33.3 + i * 0.6
    put(bell(84 if i % 2 else 89, 1, 0.5), t0 + 0.1, 0.3, 0.7); put(bell(77 if i % 2 else 81, 1, 0.5), t0 + 0.18, 0.25, 0.7)
put(whoosh(0.45, 1, True), 36.6, 0.6)
# ---- S7 74-82B: due accessi, build
put(boom(0.8), T(74), 0.8); put(clap(), T(74), 0.7)
groove(74, 80, 0.9, 0.3, 0.6)
put(whoosh(0.5, 1, True), 37.2, 0.4); put(whoosh(0.5, 1, True), 37.4, 0.4)
put(riser(T(82) - 38.4, 1.0), 38.4, 0.7)
for i in range(16): put(clap(), T(80) + i * B / 4, 0.08 + 0.035 * i)
for i in range(8): put(kick(), T(80) + i * B / 4, 0.3 + 0.07 * i)
# ---- S8 82-94B: logo finale
put(boom(1.0), T(82), 1.0); put(kick(), T(82), 1.0); put(clap(), T(82), 0.9); put(cr, T(82), 0.5)
put(whoosh(1.0, 1, True), 41.0, 0.45)
put(boom(1.0), 42.0, 1.0); put(cr, 42.0, 0.55)
put(pad([41, 53, 60, 65, 69, 72], 5.6, 1.4, 2600), 41.2, 1.0)
for i, m in enumerate([77, 81, 84, 89, 93]): put(bell(m, 1, 1.2), 42.1 + i * 0.09, 0.22, 0.2 + 0.15 * i)
for i in range(8): put(pluck([72, 77, 81, 84][i % 4] + 12, 1, 0.25, 1.2), 42.1 + i * 0.05, 0.2, 0.2 + 0.08 * i)
for i in (0, 1): put(thump(1), 43.6 + i * 0.15, 0.6); put(bell(89 - i * 5, 1, 0.6), 43.6 + i * 0.15, 0.25, 0.4 + 0.2 * i)
put(bell(77, 1, 2.0), 44.3, 0.3); put(bell(65, 1, 2.0), 44.3, 0.25)

x = np.stack([L, R], 1)
fade = np.ones(N); fn = int(1.2 * SR); fade[-fn:] = np.linspace(1, 0, fn)
x *= fade[:, None]
x = np.tanh(x * 0.9); x /= max(1e-9, np.abs(x).max()); x *= 0.92
pcm = (x * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
