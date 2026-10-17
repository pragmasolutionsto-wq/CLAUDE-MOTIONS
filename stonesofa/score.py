"""Colonna sonora Stone Sofa: 30s, 120 BPM, tutto sintetizzato. Tagli di scena sui battiti.
uso: python3 stonesofa/score.py out/score.wav"""
import sys, wave
import numpy as np
from scipy.signal import lfilter, butter

SR = 44100; DUR = 30.0; N = int(SR * DUR); B = 0.5
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def put(sig, at, g=1.0, pan=0.5):
    s = int(at * SR)
    if s >= N or s < 0: return
    e = min(N, s + len(sig)); sg = sig[:e - s] * g
    L[s:e] += sg * (1 - pan) * 1.4; R[s:e] += sg * pan * 1.4
def env(n, a, d):  # attacco rapido, decadimento esp.
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)
def lp(x, f): b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), 'high'); return lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)

def kick(g=1.0):
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 48 + 130 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t / 0.16) + 0.3 * noise(n) * np.exp(-t / 0.006)) * g
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
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n)
    out = np.zeros(n); 
    # filtro sweep a blocchi
    blk = 1024
    for i in range(0, n, blk):
        p = i / n; f = 300 + (6000 if up else 6300) * (p if up else 1 - p) ** 1.6
        f = min(f, 18000)
        out[i:i+blk] = lp(x[i:i+blk], f) if f < 20000 else x[i:i+blk]
    sh = (t / d) ** 2 if up else (1 - t / d) ** 2
    return hp(out, 200) * sh * g * (np.minimum(1, (d - t) / 0.03))
def boom(g=1.0):
    n = int(1.8 * SR); t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 6); ph = 2*np.pi*np.cumsum(f)/SR
    x = np.sin(ph) * np.exp(-t / 0.7) + hp(noise(n), 800) * np.exp(-t / 0.5) * 0.5
    return x * g
def thump(g=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    f = 70 + 60*np.exp(-t*40); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t/0.07) * g

# progressione La minore pentatonica: Am F C G (2 battute ciascuno = 4s)
CH = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [67, 72, 76]), (55, [67, 71, 74])]
SC = {0: [0, 3, 7, 12, 15], 1: [0, 4, 7, 12, 16]}
def arp(chord, t0, steps=8, g=0.5):
    pat = [0, 1, 2, 1, 2, 1, 0, 2]
    for i in range(steps):
        m = chord[pat[i % len(pat)]] + (12 if i % 4 == 3 else 0)
        put(pluck(m, 1.0, 0.18), t0 + i * B / 2, g, 0.35 + 0.3 * (i % 2))

# ---- HOOK 0-3.5: pizzicato giocoso
for t in (0.0, 0.22): put(thump(1.0), t, 0.9)
for i, d in enumerate((0.66, 0.81, 0.96, 1.11, 1.26)):
    put(thump(1), d, 0.7); put(pluck(69 + [0, 3, 7, 12, 15][i], 1, 0.3), d, 0.6, 0.2 + 0.15 * i)
put(boom(0.5), 1.5, 0.8); put(clap(), 1.5, 0.8); put(clap(), 1.72, 0.6)
for i in range(6): put(pluck([69, 72, 76, 72, 79, 76][i], 1, 0.2), 1.75 + i * 0.25, 0.4, 0.5)
put(whoosh(0.9, 1.0, True), 2.55, 0.8)
for i in range(8): put(hat(0.7), 2.5 + i * 0.125, 0.5)
# ---- ASSEMBLAGGIO 3.5-7.0
put(whoosh(0.5, 1, False), 3.4, 0.6)
for i in range(7):  # kick sul battito, cresce
    put(kick(), 3.5 + i * B, 0.5 + i * 0.07)
for i in range(28): put(hat(0.8, 0.03), 3.5 + i * B / 2, 0.25 + i * 0.012)
put(pad([57, 60, 64], 3.6, 1.0), 3.5, 0.8)
for i in range(4): put(clap(), 5.5 + i * 0.25, 0.4 + 0.12 * i)
for i in range(16): put(clap(), 6.0 + i * 0.0625, 0.15 + 0.04 * i)   # rullante
# riser
n = int(2.0 * SR); t = np.arange(n) / SR
f = 200 * 2 ** (t * 2.5); riser = np.sin(2*np.pi*np.cumsum(f)/SR) * 0.25 + hp(noise(n), 1500) * (t / 2) ** 2 * 0.5
put(riser * (t / 2) ** 1.5, 5.0, 0.9)
# IMPATTO 7.0
put(boom(1.0), 7.0, 1.0); put(kick(), 7.0, 1.0); put(clap(), 7.0, 1.0)
cr = hp(noise(int(1.6 * SR)), 5000) * env(int(1.6 * SR), 0.001, 0.5); put(cr, 7.0, 0.6)
put(pad([57, 60, 64, 69], 2.0, 1.4), 7.0, 0.9)
# ---- da 7.0 a 27.0: groove pieno
def groove(t0, t1, intensity=1.0):
    k = 0
    t = t0
    while t < t1 - 1e-6:
        bar = int((t - 7.0) // 2.0) % 4
        root, chord = CH[bar]
        beat = int(round((t - t0) / B))
        put(kick(), t, 0.85 * intensity)
        if beat % 2 == 1: put(clap(), t, 0.7 * intensity)
        for h in (0, 0.5): put(hat(0.8, 0.035 if h == 0 else 0.06), t + h * B, 0.32 * intensity)
        put(bass(root - 12 + (12 if beat % 4 == 3 else 0), 0.3), t + B / 2, 0.55 * intensity)
        put(bass(root - 12, 0.4), t, 0.7 * intensity)
        t += B
    t = t0
    while t < t1 - 1e-6:
        bar = int((t - 7.0) // 2.0) % 4
        arp(CH[bar][1], t, 4, 0.34 * intensity); t += 2 * B
groove(7.5, 27.0)
# melodia (pentatonica) su F1-F4 e colori
mel = [(9.5, 76), (10.0, 79), (10.5, 76), (11.0, 72), (11.5, 74), (12.0, 76), (12.5, 79), (13.0, 81), (13.5, 79), (14.0, 76), (14.5, 74), (15.0, 72), (15.5, 76), (16.0, 79), (16.5, 81), (17.0, 84)]
for t, m in mel: put(pluck(m, 1, 0.3, 1.3), t, 0.45, 0.65)
# colori: nota ascendente a ogni cambio
for i in range(6): put(pluck(72 + [0, 2, 4, 7, 9, 12][i], 1, 0.35, 1.5), 17.5 + i, 0.6, 0.5); put(clap(), 17.5 + i, 0.5)
# whoosh ai cambi scena
for t in (9.5, 11.5, 13.5, 15.5, 17.5, 23.5, 27.0):
    put(whoosh(0.5, 1, True), t - 0.1, 0.55)
    put(thump(1), t, 0.7)
for i in range(1, 6): put(whoosh(0.3, 1, True), 17.5 + i - 0.1, 0.3)
# lifestyle: stop sul groove? pad aperto + colpi finestre
for t in (23.5, 24.0, 24.5): put(pluck(81, 1, 0.5), t, 0.5)
for t in (23.5, 24.5, 25.5): put(thump(1), t, 0.8); put(clap(), t, 0.5)
put(boom(0.8), 25.5, 0.7)
# 27.0 chiusura
put(boom(1.0), 27.0, 1.0); put(cr, 27.0, 0.6); put(pad([57, 64, 69, 72, 76], 3.0, 1.4), 27.0, 0.9)
put(clap(), 27.0, 1)
for i, m in enumerate([81, 84, 88, 93]): put(pluck(m, 1, 0.5, 1.2), 28.0 + i * 0.125, 0.4, 0.3 + 0.13 * i)
put(pluck(81, 1, 0.9), 28.8, 0.5)

# master
x = np.stack([L, R], 1)
fade = np.ones(N); fn = int(0.7 * SR); fade[-fn:] = np.linspace(1, 0, fn)
x *= fade[:, None]
x = np.tanh(x * 0.9) ; x /= max(1e-9, np.abs(x).max()); x *= 0.92
pcm = (x * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
