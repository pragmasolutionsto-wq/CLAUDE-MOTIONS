"""Colonna sonora Pragma: 15s, 144 BPM (36 battiti), tagli di scena sui battiti.
uso: python3 pragma/score.py out/score.wav"""
import sys, wave
import numpy as np
from scipy.signal import lfilter, butter

SR = 44100; DUR = 15.0; N = int(SR * DUR); B = 60 / 144
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

def groove(b0, b1, vol=1.0, arpv=0.34, bassv=0.7):
    for b in range(b0, b1):
        t = T(b); root, chord = CH[((b - b0) // 2) % 4]
        put(kick(), t, 0.85 * vol)
        if (b - b0) % 2 == 1: put(clap(), t, 0.6 * vol)
        for h in (0, 0.5): put(hat(0.8, 0.035 if h == 0 else 0.06), t + h * B, 0.3 * vol)
        put(bass(root, 0.4), t, bassv * vol)
        put(bass(root + (12 if (b % 4) == 3 else 0), 0.25), t + B / 2, bassv * 0.7 * vol)
        pat = [0, 1, 2, 1]
        for i in range(2):
            m = chord[pat[(2 * (b - b0) + i) % 4]] + (12 if i else 0)
            put(pluck(m, 1, 0.18), t + i * B / 2, arpv, 0.35 + 0.3 * i)

# ---- S1 intro 0-5B: drone + riser + shimmer
put(boom(0.9), 0, 0.8); put(thump(1), 0, 0.9)
put(pad([45, 52, 57, 60], 5 * B + 0.4, 1.4), 0, 0.7)
put(riser(T(4.6), 1.0), 0.2, 0.55)
for i, m in enumerate([81, 84, 88, 91, 93, 96]): put(pluck(m, 1, 0.3, 1.3), T(1.5) + i * B / 2, 0.22, 0.2 + 0.12 * i)
put(whoosh(0.5, 1, True), T(4.35), 0.7)
# ---- S2 parole 5-12B: un colpo per parola
put(boom(1.0), T(5), 1.0); put(clap(), T(5), 1.0)
for k in range(6):
    b = 5 + k
    put(kick(), T(b), 1.0); put(clap(), T(b) + B / 2 * 0, 0.55 if k % 2 else 0.25)
    put(pluck(PENT[k] + 12, 1, 0.3, 1.4), T(b), 0.6, 0.2 + 0.12 * k)
    put(pluck(PENT[k], 1, 0.3), T(b) + B / 2, 0.4, 0.5)
    put(bass(CH[k % 4][0], 0.35), T(b), 0.7)
    for h in (0, 0.5): put(hat(0.8, 0.04), T(b) + h * B, 0.3)
    put(thump(1), T(b), 0.6)
put(kick(), T(11), 1.0); put(clap(), T(11), 0.9); put(pluck(88, 1, 0.5, 1.4), T(11), 0.6, 0.7)
for i in range(8): put(clap(), T(11) + B / 2 + i * B / 16, 0.12 + 0.04 * i)
put(whoosh(0.5, 1, False), T(11.5), 0.4)
put(riser(B * 1.5, 1.0), T(10.4), 0.5)
# ---- S3 chart 12-19B
put(whoosh(0.6, 1, True), T(11.55), 0.75)
put(boom(1.0), T(12), 1.0); put(kick(), T(12), 1.0); put(clap(), T(12), 0.9)
groove(12, 19)
for i in range(7): put(pluck(PENT[i + 2], 1, 0.28, 1.3), T(12) + 0.15 + i * 0.1 + 0.02, 0.45, 0.25 + 0.08 * i)
for d in (0.5, 0.75, 1.0): put(thump(1), T(12) + d, 0.6); put(click(), T(12) + d, 0.5)
# ---- S4 automation 19-26B
put(whoosh(0.45, 1, True), T(18.55), 0.7)
put(boom(0.9), T(19), 0.9); put(kick(), T(19), 1.0)
groove(19, 26, 1.0, 0.28, 0.65)
starts = [0.75, 1.0, 1.25, 1.5, 1.5]; notes = [76, 79, 81, 84, 88]
for w in (0, 1.15):
    for i, s in enumerate(starts):
        put(pluck(notes[i], 1, 0.25, 1.4), T(19) + s + w + 0.3, 0.42, 0.2 + 0.15 * i)
        put(click(), T(19) + s + w + 0.3, 0.45)
put(pluck(93, 1, 0.6, 1.2), T(19) + 2.0, 0.5, 0.7)
put(whoosh(0.3, 1, True), T(25.7), 0.6)
# ---- S5 web 26-31B
put(thump(1), T(26), 0.9); put(boom(0.8), T(26), 0.8); put(clap(), T(26), 0.8)
groove(26, 31, 0.8, 0.3, 0.5)
ck = T(26) + 1.2
put(click(), ck, 1.0); put(thump(1), ck, 0.7)
for i, m in enumerate([76, 81, 84, 88]): put(pluck(m, 1, 0.3, 1.4), ck + 0.15 + i * 0.08, 0.45, 0.3 + 0.12 * i)
put(riser(B * 2.0, 1.0), T(29), 0.7)
for i in range(16): put(clap(), T(30) + i * B / 8, 0.1 + 0.04 * i)
# ---- S6 chiusura 31-36B
put(boom(1.0), T(31), 1.0); put(kick(), T(31), 1.0); put(clap(), T(31), 1.0)
cr = hp(noise(int(1.6 * SR)), 5000) * env(int(1.6 * SR), 0.001, 0.5); put(cr, T(31), 0.6)
put(pad([45, 57, 60, 64, 69], 5 * B, 1.4), T(31), 0.9)
for i in range(3): put(pluck([69, 76, 81][i], 1, 0.4, 1.3), T(31) + 0.25 + i * 0.1, 0.4, 0.3 + 0.2 * i)
put(whoosh(0.8, 1, True), T(31) + 0.1, 0.5)
put(boom(1.0), T(31) + 0.82, 0.9); put(cr, T(31) + 0.82, 0.5)
for i in range(16):
    put(hat(0.9, 0.03), T(31) + 0.85 + i * 0.03, 0.25)
for i, m in enumerate([81, 84, 88, 93]): put(pluck(m, 1, 0.5, 1.2), T(33) + i * 0.125, 0.4, 0.3 + 0.13 * i)
put(pluck(81, 1, 1.2, 1.0), T(34), 0.45)

x = np.stack([L, R], 1)
fade = np.ones(N); fn = int(0.9 * SR); fade[-fn:] = np.linspace(1, 0, fn)
x *= fade[:, None]
x = np.tanh(x * 0.9); x /= max(1e-9, np.abs(x).max()); x *= 0.92
pcm = (x * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
