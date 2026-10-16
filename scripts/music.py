"""Colonna sonora sintetizzata (royalty-free) sincronizzata sulla timeline del video.

120 BPM: ogni cambio scena cade su un battito. Impatti + riser sui tagli.
Uso: python3 scripts/music.py public/music.wav
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM

tl = json.loads((Path(__file__).parent.parent / 'src' / 'timeline.json').read_text())
FPS, OV = tl['fps'], tl['overlap']
starts, acc = [], 0
for i, s in enumerate(tl['scenes']):
    acc = 0 if i == 0 else starts[-1] + tl['scenes'][i - 1]['dur'] - OV
    starts.append(acc)
total_f = starts[-1] + tl['scenes'][-1]['dur']
DUR = total_f / FPS
cuts = [s / FPS for s in starts[1:]]  # secondi dei tagli
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    b = 1 - a
    for i in range(len(x)):
        acc = b * x[i] + a * acc
        y[i] = acc
    return y


def add(buf, sig, at, gain=1.0):
    s = int(at * SR)
    if s >= N or s < 0:
        return
    e = min(N, s + len(sig))
    buf[s:e] += sig[: e - s] * gain


L = np.zeros(N)
R = np.zeros(N)

# ---------- struttura energia ----------
def section(sec):
    """0 = intro, 1 = build, 2 = groove, 3 = montage (max), 4 = CTA (calmo), 5 = outro"""
    if sec < cuts[0]:
        return 0
    if sec < cuts[1] + 4.0:
        return 1
    if sec < starts[9] / FPS:
        return 2
    if sec < starts[10] / FPS:
        return 3
    if sec < starts[11] / FPS:
        return 4
    return 5


# ---------- PAD (accordi 2 battute = 4s) ----------
CHORDS = [
    [48, 55, 59, 64, 67],  # Cmaj7(9)
    [45, 52, 57, 60, 64],  # Am9
    [41, 48, 55, 60, 64],  # Fmaj7
    [43, 50, 55, 59, 62],  # G6
]
CH = 4 * BEAT * 2 / 2  # 4 s
pad_l = np.zeros(N)
pad_r = np.zeros(N)
k = 0
while k * CH < DUR + CH:
    s0 = max(0, int((k * CH - 0.6) * SR))
    s1 = min(N, int(((k + 1) * CH + 1.2) * SR))
    if s1 > s0:
        tt = np.arange(s1 - s0) / SR
        e = np.ones(s1 - s0)
        a = r = 0
        a, r = min(int(0.9 * SR), (s1 - s0) // 2), min(int(1.2 * SR), (s1 - s0) // 2)
        e[:a] = np.linspace(0, 1, a) ** 2
        e[-r:] *= np.linspace(1, 0, r) ** 2
        for m in CHORDS[k % 4]:
            for det, pan in ((-0.09, 0.8), (0.0, 0.5), (0.11, 0.2)):
                f = hz(m) * 2 ** (det / 12)
                ph = rng.uniform(0, 6.28)
                w = np.sin(2 * np.pi * f * tt + ph) + 0.3 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)
                pad_l[s0:s1] += w * 0.045 * pan * e
                pad_r[s0:s1] += w * 0.045 * (1 - pan) * e
    k += 1
pad_l = lowpass(pad_l, 2400)
pad_r = lowpass(pad_r, 2400)

# sidechain (pompa sul kick)
beats = np.arange(0, DUR, BEAT)
sc = np.ones(N)
for b in beats:
    if section(b) == 0:
        continue
    s = int(b * SR)
    n = int(0.42 * SR)
    if s + n < N:
        sc[s:s + n] *= 1 - 0.55 * np.exp(-np.arange(n) / SR * 9)

L += pad_l * sc
R += pad_r * sc

# ---------- KICK ----------
kn = int(0.5 * SR)
tk = np.arange(kn) / SR
kick = np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-tk * 28)) / SR) * np.exp(-tk * 6.5)
kick += 0.25 * np.sin(2 * np.pi * 60 * tk) * np.exp(-tk * 14)
for b in beats:
    sec = section(b)
    if sec in (0, 5):
        continue
    if sec == 1 and b < cuts[0]:
        continue
    g = 0.62 if sec != 4 else 0.45
    add(L, kick, b, g)
    add(R, kick, b, g)

# ---------- CLAP (2 e 4) ----------
cn = int(0.22 * SR)
tc = np.arange(cn) / SR
noise = rng.normal(0, 1, cn)
clap = (noise - lowpass(noise, 900)) * np.exp(-tc * 24) * 0.35
for bi, b in enumerate(beats):
    if bi % 2 == 1 and section(b) in (2, 3):
        add(L, clap, b + 0.004, 1)
        add(R, clap, b - 0.004, 1)

# ---------- HI-HAT (8vi, 16esimi nel montage) ----------
hn = int(0.06 * SR)
th = np.arange(hn) / SR
hn_noise = rng.normal(0, 1, hn)
hat = (hn_noise - lowpass(hn_noise, 5000)) * np.exp(-th * 90) * 0.18
step = BEAT / 2
x = 0.0
while x < DUR:
    sec = section(x)
    if sec in (1, 2, 3):
        off = int(round(x / step)) % 2 == 1
        g = (1.0 if off else 0.5) * (0.6 if sec == 1 else 1)
        add(L, hat, x, g)
        add(R, hat, x + 0.003, g)
        if sec == 3:
            add(L, hat, x + step / 2, 0.45)
            add(R, hat, x + step / 2, 0.45)
    x += step

# ---------- BASS (8vi) ----------
bass = np.zeros(N)
x = 0.0
while x < DUR:
    sec = section(x)
    if sec in (2, 3, 4):
        ch = int(x // CH) % 4
        root = CHORDS[ch][0] - 12
        n = int(step * 0.95 * SR)
        tt = np.arange(n) / SR
        w = np.sin(2 * np.pi * hz(root) * tt) + 0.35 * np.sin(4 * np.pi * hz(root) * tt)
        w *= np.exp(-tt * 3.5) * 0.28
        add(bass, w, x, 1)
    x += step
bass *= sc
L += bass
R += bass

# ---------- ARPEGGIO pluck (16esimi) ----------
arp_l = np.zeros(N)
arp_r = np.zeros(N)
pn = int(0.5 * SR)
pt = np.arange(pn) / SR
step16 = BEAT / 4
x = 0.0
i = 0
pattern = [0, 2, 4, 2, 3, 2, 4, 2]
while x < DUR:
    sec = section(x)
    if sec in (2, 3, 4) or (sec == 1 and x > cuts[1]):
        ch = int(x // CH) % 4
        notes = CHORDS[ch]
        m = notes[pattern[i % 8]] + 24
        f = hz(m)
        p = (np.sin(2 * np.pi * f * pt) + 0.35 * np.sin(4 * np.pi * f * pt)) * np.exp(-pt * 9)
        pan = 0.5 + 0.3 * np.sin(i * 0.6)
        g = 0.05 if sec != 4 else 0.035
        add(arp_l, p, x, g * pan)
        add(arp_r, p, x, g * (1 - pan))
    x += step16
    i += 1
d = int(BEAT * 0.75 * SR)
for _ in range(3):
    arp_l[d:] += arp_r[:-d] * 0.4
    arp_r[d:] += arp_l[:-d] * 0.4
L += arp_l
R += arp_r

# ---------- RISER + IMPATTO sui tagli ----------
imp_n = int(1.2 * SR)
ti = np.arange(imp_n) / SR
impact = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-ti * 3) + 35) / SR) * np.exp(-ti * 4)
sh = rng.normal(0, 1, imp_n)
impact += (sh - lowpass(sh, 2500)) * np.exp(-ti * 9) * 0.35
for c in cuts:
    rn = int(0.9 * SR)
    tr = np.arange(rn) / SR
    nz = rng.normal(0, 1, rn)
    nz = (nz - lowpass(nz, 1500)) * (tr / 0.9) ** 3 * 0.22
    add(L, nz, c - 0.9, 1)
    add(R, nz, c - 0.9, 1)
    add(L, impact, c + 0.04, 0.5)
    add(R, impact, c + 0.04, 0.5)

# ---------- RIVERBERO ----------
ir_n = int(2.4 * SR)
ir_t = np.arange(ir_n) / SR
irL = rng.normal(0, 1, ir_n) * np.exp(-ir_t * 2.6)
irR = rng.normal(0, 1, ir_n) * np.exp(-ir_t * 2.6)
irL /= np.sqrt(np.sum(irL ** 2))
irR /= np.sqrt(np.sum(irR ** 2))


def conv(x, h):
    n = len(x) + len(h) - 1
    nf = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(h, nf), nf)[: len(x)]


L = L * 0.78 + conv(L, irL) * 0.32
R = R * 0.78 + conv(R, irR) * 0.32

# fade in/out
fade = np.clip(t / 0.4, 0, 1) * np.clip((DUR - t) / 1.8, 0, 1)
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.25) * 0.9
R = np.tanh(R / peak * 1.25) * 0.9

pcm = (np.stack([L, R], axis=1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], round(DUR, 2), 's')
