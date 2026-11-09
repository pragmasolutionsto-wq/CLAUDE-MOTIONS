"""Colonna sonora: lo-fi 96 BPM (24 battiti = 15s) + pioggia + switch meccanici sincronizzati con timeline.json.
uso: python3 keyboard/score.py out/score.wav"""
import sys, json, wave
import numpy as np
from scipy.signal import lfilter, butter

TL = json.load(open('keyboard/timeline.json'))
SR = 44100; DUR = TL['dur']; N = int(SR * DUR); B = 60 / TL['bpm']
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
SFX_L = np.zeros(N); SFX_R = np.zeros(N)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def put(sig, at, g=1.0, pan=0.5, bus='mus'):
    s = int(at * SR)
    if s >= N: return
    if s < 0: sig = sig[-s:]; s = 0
    e = min(N, s + len(sig)); sg = sig[:e - s] * g
    l, r = (L, R) if bus == 'mus' else (SFX_L, SFX_R)
    l[s:e] += sg * np.sqrt(1 - pan) * 1.4; r[s:e] += sg * np.sqrt(pan) * 1.4
def lp(x, f, o=2): b, a = butter(o, min(f, SR / 2 - 100) / (SR / 2)); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, f1, f2): b, a = butter(2, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def tt(n): return np.arange(n) / SR

# ── strumenti ──
def rhodes(m, d, g=1.0):
    n = int((d + 1.2) * SR); t = tt(n); f = hz(m)
    x = np.sin(2*np.pi*f*t + 0.9*np.sin(2*np.pi*f*t)*np.exp(-t/0.25)) + 0.15*np.sin(2*np.pi*2*f*t)*np.exp(-t/0.4)
    x *= (1 + 0.18*np.sin(2*np.pi*4.5*t))
    a = np.minimum(1, t/0.01) * np.exp(-t/1.6) * np.clip((d + 1.2 - t)/1.2, 0, 1)
    return x * a * g
def kick(g=1.0):
    n = int(0.45*SR); t = tt(n); f = 48 + 110*np.exp(-t*30)
    return (np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/0.18) + 0.15*lp(noise(n),2000)*np.exp(-t/0.01)) * g
def snare(g=1.0):
    n = int(0.35*SR); t = tt(n)
    x = bp(noise(n), 900, 6000)*np.exp(-t/0.09) + 0.5*np.sin(2*np.pi*190*t)*np.exp(-t/0.05)
    return lp(x, 5000) * g
def hat(g=1.0, d=0.035):
    n = int(0.12*SR); return hp(noise(n), 7500)*np.exp(-tt(n)/d) * g
def bass(m, d, g=1.0):
    n = int(d*SR); t = tt(n); f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.25*np.sin(4*np.pi*f*t)
    return lp(x, 400) * np.minimum(1, t/0.01) * np.minimum(1, (d - t)/0.05) * g
def riser(d, g=1.0):
    n = int(d*SR); t = tt(n); x = noise(n); out = np.zeros(n)
    for i in range(0, n, 1024):
        p = i/n; out[i:i+1024] = bp(x[i:i+1024], 300 + 2000*p, 800 + 9000*p)
    return out * (t/d)**2 * g
def impact(g=1.0):
    n = int(2.0*SR); t = tt(n); f = 40 + 70*np.exp(-t*8)
    return (np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/0.6) + 0.4*lp(noise(n), 3000)*np.exp(-t/0.25)) * g
def switch(g=1.0, pitch=1.0, heavy=False):
    """switch tattile: click alto + 'thock' del fondo corsa + clack di ritorno"""
    n = int(0.12*SR); t = tt(n)
    clk = bp(noise(n), 2500*pitch, 9000) * np.exp(-t/0.0025)
    body_f = (230 if not heavy else 150) * pitch
    thock = np.sin(2*np.pi*body_f*t + 2*np.sin(2*np.pi*body_f*1.6*t)) * np.exp(-t/(0.022 if not heavy else 0.04))
    rattle = bp(noise(n), 800, 3000) * np.exp(-t/0.012) * (0.5 if heavy else 0.25)
    return (clk*0.9 + thock*0.8 + rattle) * g
def release(g=1.0, pitch=1.0):
    n = int(0.05*SR); t = tt(n)
    return bp(noise(n), 1800*pitch, 7000) * np.exp(-t/0.003) * g

T = lambda b: b * B
E1, E2 = TL['enter1'], TL['enter2']

# ── accordi lo-fi (4 battiti ciascuno) ──
CH = [[53, 57, 60, 64, 67], [52, 55, 59, 62, 66], [50, 53, 57, 60, 64], [48, 52, 55, 59, 62], [53, 57, 60, 64, 67], [52, 55, 59, 62, 69]]
ROOT = [41, 40, 38, 36, 41, 40]
for c, notes in enumerate(CH):
    for j, m in enumerate(notes):
        put(rhodes(m, 4*B - 0.1, 0.13), T(4*c) + j*0.012, pan=0.35 + 0.075*j)
# melodia sparsa dopo il drop
MEL = [(8, 72), (9, 74), (9.5, 76), (11, 72), (12, 71), (13.5, 74), (15, 69), (16, 72), (17, 76), (18, 79), (19, 76), (20.5, 74), (21, 72)]
for b, m in MEL:
    put(rhodes(m, 0.6, 0.11), T(b) + 0.02, pan=0.62)

# ── batteria swing ──
SW = 0.09 * B
for b in range(8, 21):
    if b == 18: continue
    if b % 2 == 0: put(kick(), T(b), 0.9)
    else: put(snare(), T(b), 0.45)
    if b % 4 == 2: put(kick(0.6), T(b) + 0.5*B + SW, 0.9)
    for h in range(2):
        put(hat(0.9 if h == 0 else 0.6), T(b) + h*0.5*B + (SW if h else 0), 0.18, pan=0.62)
for b in range(4, 8):
    for h in range(2): put(hat(0.6), T(b) + h*0.5*B + (SW if h else 0), 0.12, pan=0.62)
for c in range(2, 6):
    for k in range(4):
        if 4*c + k >= 22: break
        put(bass(ROOT[c] if k != 3 else ROOT[c] + 7, B*0.9, 0.42), T(4*c + k) + (SW if k % 2 else 0))

# FX transizioni
put(riser(1.2), E1 - 1.2, 0.18)
put(impact(), E1, 0.55)
put(riser(0.9), E2 - 0.9, 0.12)
put(impact(0.6), E2, 0.4)
put(kick(1.0), E2, 0.9)
put(rhodes(77, 2.5, 0.13), E2 + 0.4, pan=0.6); put(rhodes(84, 2.5, 0.07), E2 + 0.4, pan=0.4)
put(rhodes(65, 2.6, 0.11), T(21)); put(rhodes(72, 2.6, 0.09), T(21) + 0.02)

# intro filtrata, che si apre sul drop
pre = int(E1 * SR)
for X in (L, R):
    a = X[:pre].copy(); X[:pre] = lp(a, 900, 2) * 0.85 + a * 0.15
# tape stop finale
st = int(14.2 * SR)
for X in (L, R):
    seg = X[st:].copy(); m = len(seg); tm = np.arange(m) / m
    idx = np.cumsum(1 - 0.85 * tm ** 1.5); idx = np.clip(idx, 0, m - 1)
    X[st:] = np.interp(idx, np.arange(m), seg) * (1 - tm) ** 1.5

# ── tastiera ──
for e in TL['keys']:
    heavy = e['k'] in ('space', 'enter', 'lshift')
    p = rng.uniform(0.92, 1.1) * (0.85 if heavy else 1.0)
    pan = 0.62 if e['k'] in 'yuiophjklnm' or heavy else 0.42
    put(switch(1.0, p, heavy), e['t'], 0.55 if not heavy else 0.75, pan, bus='sfx')
    put(release(1.0, p), e['t'] + e['d'], 0.18, pan, bus='sfx')

# ── pioggia + vinile ──
rain = lp(hp(noise(N), 400), 6000) * 0.05
for _ in range(1400):
    put(bp(noise(300), 2000, 8000) * np.exp(-tt(300)/0.002), rng.uniform(0, DUR), rng.uniform(0.01, 0.05), rng.uniform(0.2, 0.8), bus='sfx')
crack = np.zeros(N); crack[rng.integers(0, N, 260)] = rng.uniform(-1, 1, 260); crack = hp(crack, 1500) * 0.3
rain2 = lp(hp(noise(N), 400), 6000) * 0.05

out = np.stack([L * 0.9 + SFX_L + rain + crack, R * 0.9 + SFX_R + rain2 + crack], 1)
fade = np.ones(N); fi = int(0.4 * SR); fade[:fi] = np.linspace(0, 1, fi); fo = int(0.5 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2
out *= fade[:, None]
out = np.tanh(out * 1.3) / np.tanh(1.3)
out /= np.max(np.abs(out)) / 0.92
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok', sys.argv[1])
