"""Colonna sonora Pragma Servizi: 45s, 120 BPM (90 battiti), tagli di scena sui battiti.
uso: python3 servizi/score.py out/score.wav"""
import sys, wave
import numpy as np
from scipy.signal import lfilter, butter

SR = 44100; DUR = 45.0; N = int(SR * DUR); B = 60 / 120
rng = np.random.default_rng(11)
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
    f = 46 + 130 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t / 0.15) + 0.3 * noise(n) * np.exp(-t / 0.006)) * g
def clap(g=1.0):
    n = int(0.3 * SR); x = hp(noise(n), 1200) * env(n, 0.001, 0.07)
    for k in (0.012, 0.024): x[int(k * SR):] += x[:n - int(k * SR)] * 0.6
    return lp(x, 7000) * g
def hat(g=1.0, d=0.04):
    n = int(0.15 * SR); return hp(noise(n), 7000) * env(n, 0.0005, d) * g
def pluck(m, g=1.0, d=0.25, bright=1.0):
    n = int(d * 5 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.5*np.sin(4*np.pi*f*t)*np.exp(-t/0.08)*bright + 0.25*np.sin(6*np.pi*f*t)*np.exp(-t/0.04)*bright
    return x * env(n, 0.002, d) * g
def bass(m, d=0.4, g=1.0):
    n = int(d * 3 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.35*np.sin(4*np.pi*f*t) + 0.2*np.sign(np.sin(2*np.pi*f*t))
    return lp(x, 900) * env(n, 0.004, d) * g
def pad(ms, d, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.07, 0.07):
            x += np.sin(2*np.pi*hz(m)*(1+det*0.01)*t) + 0.3*np.sin(4*np.pi*hz(m)*t)
    a = np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.4)
    return lp(x, 2500) * a * g * 0.12
def whoosh(d=0.6, g=1.0, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        p = i / n; f = 300 + (6000 if up else 6300) * (p if up else 1 - p) ** 1.6
        out[i:i+blk] = lp(x[i:i+blk], min(f, 18000))
    sh = (t / d) ** 2 if up else (1 - t / d) ** 2
    return hp(out, 200) * sh * g * np.minimum(1, (d - t) / 0.03)
def boom(g=1.0):
    n = int(1.8 * SR); t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 6); ph = 2*np.pi*np.cumsum(f)/SR
    x = np.sin(ph) * np.exp(-t / 0.7) + hp(noise(n), 800) * np.exp(-t / 0.5) * 0.5
    return x * g
def thump(g=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    f = 70 + 60*np.exp(-t*40); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t/0.07) * g
def click(g=1.0):
    n = int(0.05 * SR); return hp(noise(n), 2500) * env(n, 0.0003, 0.008) * g
def riser(d, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    f = 180 * 2 ** (t / d * 3.2); r = np.sin(2*np.pi*np.cumsum(f)/SR) * 0.25 + hp(noise(n), 1500) * (t / d) ** 2 * 0.5
    return r * (t / d) ** 1.5 * g

T = lambda beat: beat * B
SCB = [0, 5, 12, 19, 26, 31, 36]
PENT = [57, 60, 64, 67, 69, 72, 76, 79, 81, 84]   # La minore pentatonica
CH = [(45, [69, 72, 76]), (41, [65, 69, 72]), (48, [67, 72, 76]), (43, [67, 71, 74])]
AREA_B, N_AREA = 7, 10
A0 = 6                                   # battuta di inizio prima area
FINA = A0 + N_AREA * AREA_B               # 76
FINB = FINA + 6                           # 82

def groove(b0, b1, vol=1.0, arpv=0.3, bassv=0.65, shift=0):
    for b in range(b0, b1):
        t = T(b); root, chord = CH[(((b - b0) // 2) + shift) % 4]
        put(kick(), t, 0.85 * vol)
        if (b - b0) % 2 == 1: put(clap(), t, 0.55 * vol)
        for h in (0, 0.5): put(hat(0.8, 0.035 if h == 0 else 0.06), t + h * B, 0.28 * vol)
        put(bass(root, 0.4), t, bassv * vol)
        put(bass(root + (12 if (b % 4) == 3 else 0), 0.25), t + B / 2, bassv * 0.7 * vol)
        pat = [0, 1, 2, 1]
        for i in range(2):
            m = chord[pat[(2 * (b - b0) + i) % 4]] + (12 if i else 0)
            put(pluck(m, 1, 0.18), t + i * B / 2, arpv, 0.35 + 0.3 * i)

# ---- intro 0-6B: drone + riser + colpi sui numeri
put(boom(0.9), 0, 0.8); put(thump(1), 0, 0.9)
put(pad([45, 52, 57, 60], 6 * B + 0.4, 1.4), 0, 0.7)
put(riser(T(1.9), 1.0), 0.05, 0.55)
for i, m in enumerate([81, 84, 88, 91, 93]): put(pluck(m, 1, 0.3, 1.3), T(0.6) + i * B / 4, 0.22, 0.2 + 0.12 * i)
for b, n in ((2, 76), (3, 79), (4, 84)):                # 100 / 10 / UN SOLO PARTNER
    put(boom(0.9), T(b), 0.85); put(kick(), T(b), 1.0); put(clap(), T(b), 0.7)
    put(pluck(n, 1, 0.4, 1.4), T(b), 0.55, 0.3 + 0.1 * (b - 2)); put(bass(45, 0.4), T(b), 0.7)
put(riser(T(1.5), 1.0), T(4.4), 0.5)
put(whoosh(0.5, 1, True), T(A0) - 0.5, 0.75)

# ---- 10 aree
for k in range(N_AREA):
    b0 = A0 + k * AREA_B; t0 = T(b0)
    put(whoosh(0.5, 1, True), t0 - 0.5, 0.65)
    put(boom(1.0), t0, 0.9); put(kick(), t0, 1.0); put(clap(), t0, 0.8)
    groove(b0, b0 + AREA_B, 1.0, 0.3, 0.65, shift=k)
    put(pluck(PENT[k] + 12, 1, 0.45, 1.4), t0, 0.5, 0.25 + 0.05 * k)     # nota-firma dell'area
    for i in range(3):                                                    # chip servizi
        tc = t0 + 1.0 + i * 0.2 + 0.25
        put(click(), tc, 0.55); put(thump(1), tc, 0.45)
        put(pluck(PENT[(k + i * 2) % 10] + 12, 1, 0.25, 1.4), tc, 0.4, 0.3 + 0.15 * i)
    tp = t0 + 2.05                                                        # pillola vantaggio
    put(whoosh(0.3, 1, True), tp - 0.1, 0.4); put(thump(1), tp + 0.2, 0.7)
    for i, m in enumerate([76, 81, 84]): put(pluck(m, 1, 0.3, 1.3), tp + 0.3 + i * 0.08, 0.35, 0.3 + 0.15 * i)

# ---- finale A (76-82B): tessere a scatti + 100 servizi
tA = T(FINA)
put(boom(1.0), tA, 0.9); put(kick(), tA, 1.0); put(clap(), tA, 0.8)
groove(FINA, FINB, 0.9, 0.3, 0.6)
for i in range(10):
    put(pluck(PENT[i] + 12, 1, 0.22, 1.4), tA + 0.45 + i * 0.16, 0.42, 0.15 + 0.07 * i); put(click(), tA + 0.45 + i * 0.16, 0.4)
put(riser(1.0, 1.0), tA + 1.9, 0.6)
put(boom(1.0), tA + 2.2, 0.9); put(clap(), tA + 2.2, 0.9)
put(whoosh(0.5, 1, True), T(FINB) - 0.5, 0.75)

# ---- finale B (82-90B): logo + CTA
tB = T(FINB)
put(boom(1.0), tB, 1.0); put(kick(), tB, 1.0); put(clap(), tB, 1.0)
cr = hp(noise(int(1.6 * SR)), 5000) * env(int(1.6 * SR), 0.001, 0.5); put(cr, tB, 0.6)
put(pad([45, 57, 60, 64, 69], 8 * B, 1.4), tB, 0.9)
for i in range(3): put(pluck([69, 76, 81][i], 1, 0.4, 1.3), tB + 0.25 + i * 0.1, 0.4, 0.3 + 0.2 * i)
put(whoosh(0.8, 1, True), tB + 0.1, 0.5)
put(boom(1.0), tB + 0.82, 0.9); put(cr, tB + 0.82, 0.5)
for i in range(16): put(hat(0.9, 0.03), tB + 0.85 + i * 0.03, 0.25)
for i, m in enumerate([81, 84, 88, 93]): put(pluck(m, 1, 0.5, 1.2), tB + 1.7 + i * 0.125, 0.45, 0.3 + 0.13 * i)   # CTA
put(click(), tB + 1.7, 0.9); put(thump(1), tB + 1.7, 0.7)
put(pluck(81, 1, 1.5, 1.0), tB + 2.6, 0.4)
put(pluck(76, 1, 1.5, 1.0), tB + 3.4, 0.3)

x = np.stack([L, R], 1)
fade = np.ones(N); fn = int(1.4 * SR); fade[-fn:] = np.linspace(1, 0, fn)
x *= fade[:, None]
x = np.tanh(x * 0.9); x /= max(1e-9, np.abs(x).max()); x *= 0.92
pcm = (x * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
