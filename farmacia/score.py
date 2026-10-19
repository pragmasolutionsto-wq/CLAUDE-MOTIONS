"""Musica (104 BPM, pop morbido) + effetti sonori sincronizzati sui cue di timeline.json.
uso: python3 farmacia/score.py out/music.wav out/sfx.wav"""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

D = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(f'{D}/timeline.json'))
SEG = [0.0]
for s in TL['segs']: SEG.append(SEG[-1] + s['out'] - s['in'])
END = SEG[-1]; DUR = END + TL['tail']
def cue(n):
    k, at = TL['cues'][n]; return SEG[k] + at - TL['segs'][k]['in']

SR = 44100; N = int(SR * DUR); B = 60 / 104
rng = np.random.default_rng(7)
def bus(): return [np.zeros(N), np.zeros(N)]
MUS, FX = bus(), bus()
def put(b, sig, at, g=1.0, pan=0.5):
    s = int(at * SR)
    if s >= N or s < 0: return
    e = min(N, s + len(sig)); sg = sig[:e - s] * g
    b[0][s:e] += sg * (1 - pan) * 1.4; b[1][s:e] += sg * pan * 1.4
def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def lp(x, f): b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f / (SR / 2), 'high'); return lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# ---------------------------------------------------------------- strumenti
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.14) + 0.2 * noise(n) * np.exp(-t / 0.004)
def clap():
    n = int(0.3 * SR); x = hp(noise(n), 1400) * env(n, 0.001, 0.06)
    for k in (0.011, 0.022): x[int(k * SR):] += x[:n - int(k * SR)] * 0.5
    return lp(x, 8000)
def hat(d=0.035):
    n = int(0.12 * SR); return hp(noise(n), 8000) * env(n, 0.0005, d)
def shaker():
    n = int(0.1 * SR); return hp(noise(n), 5000) * env(n, 0.01, 0.03)
def pluck(m, d=0.22, bright=1.0):
    n = int(d * 5 * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2*np.pi*f*t) + 0.45*np.sin(4*np.pi*f*t)*np.exp(-t/0.08)*bright + 0.2*np.sin(6*np.pi*f*t)*np.exp(-t/0.04)*bright
    return x * env(n, 0.002, d)
def bass(m, d=0.35):
    n = int(d * 3 * SR); t = np.arange(n) / SR; f = hz(m)
    return lp(np.sin(2*np.pi*f*t) + 0.3*np.sin(4*np.pi*f*t) + 0.12*np.sign(np.sin(2*np.pi*f*t)), 700) * env(n, 0.005, d)
def pad(ms, d):
    n = int(d * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.08, 0.08): x += np.sin(2*np.pi*hz(m)*(1+det*0.01)*t) + 0.25*np.sin(4*np.pi*hz(m)*t)
    return lp(x, 2200) * np.minimum(1, t / 0.3) * np.minimum(1, np.maximum(0, d - t) / 0.5) * 0.1
def bell(m, d=1.2):
    n = int(d * SR); t = np.arange(n) / SR; f = hz(m)
    return (np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/0.3) + 0.3*np.sin(2*np.pi*f*5.4*t)*np.exp(-t/0.12)) * env(n, 0.001, d / 3)

# ---------------------------------------------------------------- effetti
def whoosh(d=0.5, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        p = i / n; f = 300 + 7000 * (p if up else 1 - p) ** 1.5
        out[i:i+blk] = lp(x[i:i+blk], min(f, 18000))
    sh = np.sin(np.pi * t / d) ** 2
    return hp(out, 250) * sh
def pop(pitch=1.0):
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = (900 + 1400 * np.exp(-t * 60)) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.035) * 0.8 + hp(noise(n), 3000) * env(n, 0.0005, 0.006) * 0.3
def click():
    n = int(0.04 * SR); return hp(noise(n), 2500) * env(n, 0.0003, 0.007)
def boom():
    n = int(1.6 * SR); t = np.arange(n) / SR
    f = 36 + 80 * np.exp(-t * 7); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t / 0.6) + hp(noise(n), 900) * np.exp(-t / 0.35) * 0.35
def riser(d):
    n = int(d * SR); t = np.arange(n) / SR
    f = 200 * 2 ** (t / d * 3); return (np.sin(2*np.pi*np.cumsum(f)/SR) * 0.2 + hp(noise(n), 1800) * (t / d) ** 2 * 0.6) * (t / d) ** 1.6
def sparkle(seed, k=10, base=84):
    r = np.random.default_rng(seed); out = np.zeros(int(1.6 * SR))
    for i in range(k):
        s = bell(base + int(r.integers(0, 3)) * 5 + int(r.integers(0, 2)) * 12, 0.6) * 0.3
        st = int(i * 0.06 * SR); e = min(len(out), st + len(s)); out[st:e] += s[:e - st]
    return out
def tick_rise(d, n=24):
    out = np.zeros(int((d + 0.3) * SR))
    for i in range(n):
        s = pop(0.6 + 1.2 * i / n) * 0.35; st = int(d * (i / n) ** 0.8 * SR); e = min(len(out), st + len(s)); out[st:e] += s[:e - st]
    return out

# ---------------------------------------------------------------- musica: F – C – Am – G
CH = [(41, [65, 69, 72, 76]), (36, [64, 67, 72, 76]), (45, [64, 69, 72, 76]), (43, [62, 67, 71, 74])]
def bar_of(t): return int(t / (4 * B))
def groove(t0, t1, drums=True, arp=True, v=1.0):
    b = int(np.ceil(t0 / B))
    while b * B < t1:
        t = b * B; root, ch = CH[(b // 4) % 4]
        if drums:
            put(MUS, kick(), t, 0.75 * v)
            if b % 2 == 1: put(MUS, clap(), t, 0.42 * v)
            put(MUS, hat(), t + B / 2, 0.22 * v, 0.6)
            for q in (0.25, 0.75): put(MUS, shaker(), t + q * B, 0.1 * v, 0.4)
        put(MUS, bass(root, 0.3), t, 0.55 * v)
        put(MUS, bass(root + 12 if b % 4 == 3 else root, 0.18), t + B * 0.5, 0.35 * v)
        if arp:
            for i in range(2):
                m = ch[(2 * b + i) % 4] + 12
                put(MUS, pluck(m, 0.18), t + i * B / 2, 0.2 * v, 0.3 + 0.4 * i)
        if b % 4 == 0: put(MUS, pad(ch, 4 * B + 0.4), t, 0.9 * v)
        b += 1

TAKES = [(SEG[1], SEG[2]), (SEG[10], SEG[11]), (SEG[15], SEG[16])]
groove(0, SEG[1])
groove(SEG[1], SEG[2], drums=False, v=0.9)            # collagene: sospeso
groove(SEG[2], SEG[4])
put(MUS, pad(CH[2][1], cue('tu') - SEG[4] + 0.3), SEG[4], 1.0)  # break emotivo
groove(cue('tu'), SEG[10])
groove(SEG[10], SEG[11], drums=False, v=0.9)
groove(SEG[11], SEG[14])
groove(SEG[14], SEG[15], drums=False, arp=True, v=0.85)  # ottobre: tensione verso l'offerta
groove(SEG[15], END)
for i, m in enumerate([65, 72, 77, 81]): put(MUS, bell(m, 3.0) * 0.3, END + 0.05 + i * 0.09, 0.7, 0.3 + 0.13 * i)
put(MUS, pad([53, 65, 69, 72, 77], TL['tail']), END, 1.3)

# ---------------------------------------------------------------- SFX
put(FX, boom(), 0.0, 0.7); put(FX, whoosh(0.35), 0.0, 0.5)
pops = ['braccia', 'addome', 'cosce', 'donne', 'innovativa', 'shock', 'led', 'elettro', 'flusso', 'collagene2', 'consulenza', 'ottobre', 'chiamaci', 'scrivici', 'trovarci']
for i, n in enumerate(pops): put(FX, pop(1 + 0.12 * (i % 3)), cue(n) - 0.05, 0.45, 0.4 + 0.1 * (i % 3))
for t in (0.12, 1.55, SEG[2] + 0.25, cue('seduta') + 0.1, cue('onda') + 0.1, cue('tensore'), SEG[16] + 0.1): put(FX, pop(0.8), t, 0.4)
for a, b in TAKES:
    put(FX, whoosh(0.5, True), a - 0.3, 0.7, 0.35); put(FX, boom(), a, 0.45)
    put(FX, whoosh(0.45, False), b - 0.25, 0.55, 0.65)
put(FX, whoosh(0.5), END - 0.3, 0.7); put(FX, boom(), END, 0.7)
put(FX, click(), cue('collagene'), 0.4); put(FX, click(), cue('elastina'), 0.4)
put(FX, whoosh(0.9, False), cue('riducono') - 0.2, 0.35)
put(FX, click(), cue('altri') + 0.02, 0.4)
put(FX, whoosh(0.3), cue('tu') - 0.05, 0.5); put(FX, bell(81, 1.4), cue('tu'), 0.35); put(FX, boom(), cue('tu'), 0.35)
put(FX, whoosh(0.6), cue('unika') - 0.35, 0.6); put(FX, boom(), cue('unika'), 0.6); put(FX, sparkle(3), cue('unika') + 0.3, 0.55)
put(FX, tick_rise(2.2, 28), SEG[10] + 0.25, 0.6)
put(FX, riser(SEG[15] - cue('ottobre') - 0.2), cue('ottobre') + 0.2, 0.55)
for i in range(5): put(FX, pop(0.7 + 0.1 * i), SEG[15] + 0.25 + i * 0.16, 0.5, 0.3 + 0.1 * i)
put(FX, bell(84, 1.8), cue('omaggio'), 0.5); put(FX, sparkle(5, 14, 88), cue('omaggio') + 0.1, 0.6); put(FX, boom(), cue('omaggio'), 0.4)
put(FX, sparkle(9, 10, 84), cue('gratuita') + 0.1, 0.45); put(FX, pop(1.2), cue('gratuita'), 0.5)

def write(b, path, norm):
    x = np.stack(b, 1); x = np.tanh(x * 0.9); x /= max(1e-9, np.abs(x).max()); x *= norm
    fade = np.ones(N); fn = int(1.2 * SR); fade[-fn:] = np.linspace(1, 0, fn); x *= fade[:, None]
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
write(MUS, sys.argv[1], 0.9); write(FX, sys.argv[2], 0.9)
print('ok', sys.argv[1], sys.argv[2])
