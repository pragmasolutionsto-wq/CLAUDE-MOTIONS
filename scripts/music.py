"""Genera la colonna sonora ambient/cinematica del video (royalty-free, sintetizzata).

Uso: python3 scripts/music.py public/music.wav
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 100.0
BPM = 80
BEAT = 60 / BPM
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# Progressione (2 battute = 6s per accordo): Dm9 · Bbmaj7 · Fadd9 · C6/E
CHORDS = [
    [50, 57, 60, 64, 65, 69],
    [46, 53, 57, 62, 65, 69],
    [41, 53, 57, 60, 67, 69],
    [40, 52, 55, 60, 64, 67],
]
CH_LEN = 8 * BEAT


def env_adsr(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai) ** 2
    e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e


def lowpass(x, cutoff):
    # one-pole semplice
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    b = 1 - a
    for i in range(len(x)):
        acc = b * x[i] + a * acc
        y[i] = acc
    return y


L = np.zeros(N)
R = np.zeros(N)

# ---- PAD ----
n_ch = int(np.ceil(DUR / CH_LEN)) + 1
for k in range(n_ch):
    start = k * CH_LEN - 1.0
    length = CH_LEN + 2.5
    s0 = max(0, int(start * SR))
    s1 = min(N, int((start + length) * SR))
    if s1 <= s0:
        continue
    tt = np.arange(s1 - s0) / SR
    seg_l = np.zeros(s1 - s0)
    seg_r = np.zeros(s1 - s0)
    for m in CHORDS[k % 4]:
        f = hz(m)
        for det, pan in ((-0.11, 0.8), (0.0, 0.5), (0.13, 0.2)):
            ff = f * 2 ** (det / 12)
            ph = rng.uniform(0, 2 * np.pi)
            w = np.sin(2 * np.pi * ff * tt + ph) + 0.28 * np.sin(4 * np.pi * ff * tt + ph) + 0.1 * np.sin(6 * np.pi * ff * tt)
            amp = 0.05 if m > 48 else 0.07
            seg_l += w * amp * pan
            seg_r += w * amp * (1 - pan)
    e = env_adsr(s1 - s0, 1.8, 2.2)
    L[s0:s1] += seg_l * e
    R[s0:s1] += seg_r * e

# filtro che si apre lentamente lungo il brano
L = lowpass(L, 2600)
R = lowpass(R, 2600)
swell = 0.55 + 0.45 * np.clip(t / 30, 0, 1)
L *= swell
R *= swell

# ---- SUB BASS ----
sub = np.zeros(N)
for k in range(n_ch):
    s0 = int(k * CH_LEN * SR)
    s1 = min(N, int((k + 1) * CH_LEN * SR))
    if s0 >= N:
        break
    tt = np.arange(s1 - s0) / SR
    sub[s0:s1] = np.sin(2 * np.pi * hz(CHORDS[k % 4][0] - 12) * tt) * env_adsr(s1 - s0, 0.4, 0.6)
sub *= 0.16 * np.clip((t - 5) / 6, 0, 1)
L += sub
R += sub

# ---- PULSE (battito cardiaco) ----
def kick(n):
    tt = np.arange(n) / SR
    f = 50 + 70 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)

kn = int(0.5 * SR)
kk = kick(kn)
beat_t = 5.0
while beat_t < DUR - 6:
    for off, g in ((0, 0.42), (0.32, 0.24)):
        s = int((beat_t + off) * SR)
        if s + kn < N:
            fade = np.clip((beat_t - 5) / 8, 0, 1)
            L[s:s + kn] += kk * g * fade
            R[s:s + kn] += kk * g * fade
    beat_t += 2 * BEAT

# ---- ARPEGGIO pluck (dal 15s) ----
arp_l = np.zeros(N)
arp_r = np.zeros(N)
step = BEAT / 2
i = 0
tt0 = 15.0
pn = int(0.9 * SR)
ptt = np.arange(pn) / SR
while tt0 < DUR - 8:
    k = int(tt0 // CH_LEN) % 4
    notes = sorted(CHORDS[k][2:]) + [CHORDS[k][3] + 12]
    m = notes[[0, 2, 1, 3, 2, 4, 3, 1][i % 8]] + 12
    f = hz(m)
    p = (np.sin(2 * np.pi * f * ptt) + 0.3 * np.sin(4 * np.pi * f * ptt)) * np.exp(-ptt * 6)
    s = int(tt0 * SR)
    pan = 0.5 + 0.35 * np.sin(i * 0.7)
    g = 0.06 * np.clip((tt0 - 15) / 10, 0, 1)
    if s + pn < N:
        arp_l[s:s + pn] += p * g * pan
        arp_r[s:s + pn] += p * g * (1 - pan)
    tt0 += step
    i += 1
# delay ping-pong
d = int(BEAT * 0.75 * SR)
for _ in range(4):
    arp_l[d:] += arp_r[:-d] * 0.45
    arp_r[d:] += arp_l[:-d] * 0.45
L += arp_l
R += arp_r

# ---- SHIMMER / riser verso l'outro ----
riser_s, riser_e = 86.0, 90.0
mask = (t >= riser_s) & (t < riser_e)
noise = rng.normal(0, 1, N) * mask
noise = lowpass(noise, 3000) * np.clip((t - riser_s) / (riser_e - riser_s), 0, 1) ** 2 * 0.12
L += noise
R += noise

# ---- RIVERBERO (convoluzione con IR sintetica) ----
ir_n = int(3.2 * SR)
ir_t = np.arange(ir_n) / SR
irL = rng.normal(0, 1, ir_n) * np.exp(-ir_t * 2.1)
irR = rng.normal(0, 1, ir_n) * np.exp(-ir_t * 2.1)
irL /= np.sqrt(np.sum(irL ** 2))
irR /= np.sqrt(np.sum(irR ** 2))


def conv(x, h):
    n = len(x) + len(h) - 1
    nf = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(h, nf), nf)[: len(x)]


wetL = conv(L, irL)
wetR = conv(R, irR)
L = L * 0.7 + wetL * 0.45
R = R * 0.7 + wetR * 0.45

# fade in/out + normalizzazione
fade = np.clip(t / 2.0, 0, 1) * np.clip((DUR - t) / 6.0, 0, 1)
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.1) * 0.89
R = np.tanh(R / peak * 1.1) * 0.89

out = np.stack([L, R], axis=1)
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], DUR, 's')
