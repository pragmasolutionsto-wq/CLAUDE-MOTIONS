"""Colonna sonora + sound design sincronizzati sul film Pquattro (tutto sintetizzato, royalty-free).

120 BPM: i tagli di scena cadono sui battiti. Ogni whip / impatto / pop ha il suo suono.
Uso: python3 film/scripts/score.py film/public/score.wav
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 60.5
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(5)
t_all = np.arange(N) / SR

L = np.zeros(N)
R = np.zeros(N)
FX_L = np.zeros(N)  # bus sound design (riverbero più lungo)
FX_R = np.zeros(N)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, cutoff):
    """filtro passa-basso a un polo; cutoff può essere scalare o array"""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def hp(x, cutoff):
    return x - lp(x, cutoff)


def put(bus_l, bus_r, sig, at, gain=1.0, pan=0.5):
    s = int(at * SR)
    if s >= N or s + len(sig) <= 0:
        return
    s0 = max(0, s)
    e = min(N, s + len(sig))
    seg = sig[s0 - s : e - s]
    bus_l[s0:e] += seg * gain * (1 - pan) * 1.4
    bus_r[s0:e] += seg * gain * pan * 1.4


def env_exp(n, k):
    return np.exp(-np.arange(n) / SR * k)


# ============ sound design ============
def thud(at, f=70, dur=0.5, gain=0.6, pan=0.5):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(f * (1 + 1.6 * np.exp(-tt * 40))) / SR) * np.exp(-tt * 9)
    put(L, R, s, at, gain, pan)


def tick(at, f=1800, gain=0.2, pan=0.5, dur=0.07):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    nz = rng.normal(0, 1, n)
    s = hp(nz, 2500) * np.exp(-tt * 70) * 0.5 + np.sin(2 * np.pi * f * tt) * np.exp(-tt * 55) * 0.5
    put(FX_L, FX_R, s, at, gain, pan)


def ping(at, f=880, gain=0.18, dur=0.9, pan=0.5):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 4) + 0.25 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 9)) * np.exp(-tt * 3.2)
    put(FX_L, FX_R, s, at, gain, pan)


def pop(at, f=500, gain=0.25, pan=0.5):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(f * (1 + 2.2 * np.exp(-tt * 34))) / SR) * np.exp(-tt * 26)
    put(FX_L, FX_R, s, at, gain, pan)


def swoosh(t0, t1, f0=300, f1=5000, gain=0.35, pan0=0.5, pan1=0.5, shape=2.0):
    """fruscio filtrato con cutoff che sale/scende e panning animato"""
    n = int((t1 - t0) * SR)
    u = np.linspace(0, 1, n)
    nz = rng.normal(0, 1, n)
    cut = f0 * (f1 / f0) ** u
    y = hp(lp(nz, cut), cut * 0.25)
    amp = np.sin(np.pi * u ** (1 / shape)) ** 1.5
    y = y * amp
    y /= np.abs(y).max() + 1e-9
    pan = pan0 + (pan1 - pan0) * u
    s = int(t0 * SR)
    e = min(N, s + n)
    FX_L[s:e] += y[: e - s] * gain * (1 - pan[: e - s]) * 1.4
    FX_R[s:e] += y[: e - s] * gain * pan[: e - s] * 1.4


def riser(t0, t1, gain=0.3):
    n = int((t1 - t0) * SR)
    u = np.linspace(0, 1, n)
    nz = rng.normal(0, 1, n)
    y = hp(nz, 400 + 4500 * u ** 2) * (u ** 2.2)
    tone = np.sin(2 * np.pi * np.cumsum(200 * 2 ** (u * 3.2)) / SR) * (u ** 2.5) * 0.4
    y = (y / (np.abs(y).max() + 1e-9)) * 0.8 + tone
    s = int(t0 * SR)
    e = min(N, s + n)
    FX_L[s:e] += y[: e - s] * gain
    FX_R[s:e] += y[: e - s] * gain


def impact(at, gain=0.9, size=1.0):
    n = int(1.8 * SR)
    tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(46 * (1 + 2.5 * np.exp(-tt * 9))) / SR) * np.exp(-tt * (2.6 / size))
    nz = rng.normal(0, 1, n)
    crack = hp(nz, 1500) * np.exp(-tt * 14) * 0.5
    body = lp(nz, 700) * np.exp(-tt * 6) * 0.5
    s = sub + crack + body
    put(L, R, s, at, gain)
    put(FX_L, FX_R, crack + body, at, gain * 0.7)


def shimmer(at, f=1568, n_notes=7, gain=0.1, spread=0.05):
    for i in range(n_notes):
        ping(at + i * spread, f * (1.25 ** (i % 4)) / (2 if i > 3 else 1), gain * (1 - i / (n_notes + 2)), 1.4, 0.25 + 0.5 * (i % 3) / 2)


def whoosh_whip(t0, t1, left_to_right=True):
    swoosh(t0, t1, 250, 6500, 0.55, 0.1 if left_to_right else 0.9, 0.9 if left_to_right else 0.1, 1.6)
    swoosh(t0 + 0.05, t1, 90, 900, 0.3, 0.5, 0.5, 1.4)


def flood(t0, t1):
    riser(t0, t1, 0.34)
    swoosh(t0, t1, 200, 3500, 0.2)


def letters(start, n, step, f0=420, gain=0.16, delay=0.5):
    for i in range(n):
        at = start + delay + i * step
        pop(at, f0 * (1 + 0.04 * i), gain, 0.3 + 0.4 * (i % 2))


def stair_note(at, k, gain=0.28):
    scale = [0, 2, 4, 7, 9, 12, 14, 16]
    m = 60 + scale[k]
    ping(at, hz(m), gain, 1.0, 0.5)
    thud(at, 90, 0.25, 0.35)


# ============ MUSICA ============
CH = [[48, 55, 59, 62, 64], [43, 50, 55, 59, 62], [45, 52, 57, 60, 64], [41, 48, 55, 60, 64]]  # Cmaj9, G6, Am9, Fmaj7
CH_LEN = 4 * BEAT * 2  # 4s


def energy(s):
    """0 intro, 1 groove, 2 calmo, 3 outro"""
    if s < 5.5:
        return 0
    if s < 54.5:
        return 1
    if s < 58.0:
        return 2
    return 3


pad_l = np.zeros(N)
pad_r = np.zeros(N)
k = 0
while k * CH_LEN < DUR + 4:
    s0 = max(0, int((k * CH_LEN - 0.8) * SR))
    s1 = min(N, int(((k + 1) * CH_LEN + 1.4) * SR))
    if s1 > s0:
        tt = np.arange(s1 - s0) / SR
        a = min(int(1.0 * SR), (s1 - s0) // 2)
        r = min(int(1.4 * SR), (s1 - s0) // 2)
        e = np.ones(s1 - s0)
        e[:a] = np.linspace(0, 1, a) ** 2
        e[-r:] *= np.linspace(1, 0, r) ** 2
        for m in CH[k % 4]:
            for det, pan in ((-0.1, 0.8), (0.0, 0.5), (0.12, 0.2)):
                f = hz(m) * 2 ** (det / 12)
                ph = rng.uniform(0, 6.28)
                w = np.sin(2 * np.pi * f * tt + ph) + 0.3 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)
                pad_l[s0:s1] += w * 0.04 * pan * e
                pad_r[s0:s1] += w * 0.04 * (1 - pan) * e
    k += 1
pad_l = lp(pad_l, 2200)
pad_r = lp(pad_r, 2200)

# sidechain dal kick (battiti su griglia 0.5s)
beats = np.arange(0, DUR, BEAT)
sc = np.ones(N)
for b in beats:
    if energy(b) != 1:
        continue
    s = int(b * SR)
    n = int(0.38 * SR)
    if s + n < N:
        sc[s : s + n] *= 1 - 0.55 * np.exp(-np.arange(n) / SR * 10)

pad_gain = np.where(t_all < 5.5, 1.0, 0.85)
L += pad_l * sc * pad_gain
R += pad_r * sc * pad_gain

# kick + clap + hat + bass + pluck
kn = int(0.45 * SR)
tk = np.arange(kn) / SR
kick = np.sin(2 * np.pi * np.cumsum(50 + 120 * np.exp(-tk * 30)) / SR) * np.exp(-tk * 7) * 0.6
cn = int(0.2 * SR)
tc = np.arange(cn) / SR
nzc = rng.normal(0, 1, cn)
clap = hp(nzc, 1100) * np.exp(-tc * 24) * 0.3
hn = int(0.05 * SR)
th = np.arange(hn) / SR
nzh = rng.normal(0, 1, hn)
hat = hp(nzh, 6000) * np.exp(-th * 100) * 0.16

for bi, b in enumerate(beats):
    if energy(b) == 1:
        put(L, R, kick, b, 0.8 if bi % 4 == 0 else 0.62)
        if bi % 2 == 1 and b > 13.0:
            put(L, R, clap, b + 0.004, 0.9, 0.55)
        put(L, R, hat, b + BEAT / 2, 0.9 if b > 13.0 else 0.5, 0.65)
    elif energy(b) == 2 and (bi % 2 == 0):
        put(L, R, kick, b, 0.28)

bass = np.zeros(N)
bn = int(0.46 * SR)
tb = np.arange(bn) / SR
step = BEAT / 2
x = 5.5
while x < 54.5:
    root = CH[int(x // CH_LEN) % 4][0] - 12
    w = (np.sin(2 * np.pi * hz(root) * tb) + 0.35 * np.sin(4 * np.pi * hz(root) * tb)) * np.exp(-tb * 3.8) * 0.3
    put(bass, bass, w, x, 0.5)
    x += step
bass *= sc
L += bass * 0.9
R += bass * 0.9

arp_l = np.zeros(N)
arp_r = np.zeros(N)
pn = int(0.45 * SR)
pt = np.arange(pn) / SR
step16 = BEAT / 4
x = 13.0
i = 0
pat = [0, 2, 4, 2, 3, 2, 4, 2]
while x < 54.5:
    notes = CH[int(x // CH_LEN) % 4]
    m = notes[pat[i % 8]] + 24
    p = (np.sin(2 * np.pi * hz(m) * pt) + 0.3 * np.sin(4 * np.pi * hz(m) * pt)) * np.exp(-pt * 10)
    pan = 0.5 + 0.3 * np.sin(i * 0.5)
    put(arp_l, arp_r, p, x, 0.05, pan)
    x += step16
    i += 1
d = int(BEAT * 0.75 * SR)
for _ in range(3):
    arp_l[d:] += arp_r[:-d] * 0.4
    arp_r[d:] += arp_l[:-d] * 0.4
L += arp_l
R += arp_r

# ============ CUE: sound design sul montaggio ============
# --- 1. apertura
swoosh(0.25, 2.5, 300, 6000, 0.35, 0.1, 0.6, 1.2)
for i in range(8):
    tick(0.4 + i * 0.28, 2400 + i * 140, 0.1, 0.2 + 0.6 * (i % 2))
letters(2.45, 8, 0.07, 160, 0.3, 0.5)
impact(3.0, 0.7, 0.9)
shimmer(3.05, 1568, 7, 0.12)
riser(3.6, 5.5, 0.34)
thud(5.5, 55, 1.0, 0.8)
swoosh(4.85, 5.5, 400, 7000, 0.4, 0.5, 0.5, 1.0)
impact(5.5, 1.0, 1.2)

# --- 2. hook
letters(5.5, 9, 0.05, 220, 0.3, 0.55)
pop(6.6, 330, 0.3)
swoosh(6.45, 7.0, 800, 3000, 0.2, 0.3, 0.7)
swoosh(7.15, 8.35, 900, 5000, 0.18, 0.1, 0.9)
letters(8.95, 20, 0.035, 520, 0.08, 0.45)
swoosh(10.2, 11.6, 200, 5000, 0.4, 0.7, 0.2, 1.4)
whoosh_whip(12.0, 13.0, True)
impact(13.0, 0.9, 1.0)

# --- 3. chi siamo
for i in range(3):
    pop(13.25 + i * 0.12, 380 + i * 90, 0.28, 0.2 + 0.3 * i)
letters(13.15, 12, 0.04, 300, 0.1, 0.5)
swoosh(14.85, 15.4, 3000, 400, 0.45, 0.1, 0.9, 1.2)  # taglio
tick(14.9, 3400, 0.4)
swoosh(15.4, 16.1, 1500, 200, 0.4, 0.5, 0.5, 1.0)  # lettere che cadono
letters(15.5, 9, 0.05, 140, 0.35, 0.5)
impact(15.7, 0.8, 0.9)
shimmer(15.75, 1760, 8, 0.12)
flood(17.8, 18.5)
impact(18.5, 1.0, 1.1)

# --- 4. metodo
for tm, f in ((18.9, 660), (20.6, 784), (22.35, 988)):
    ping(tm, f, 0.28)
    swoosh(tm - 0.15, tm + 0.5, 600, 4000, 0.18, 0.2, 0.8)
for b in range(5):
    pop(23.25 + b * 0.12, 300 + b * 70, 0.3)
impact(23.75, 0.7, 0.8)
shimmer(23.8, 2093, 8, 0.1)
whoosh_whip(24.65, 25.5, True)
impact(25.5, 0.7, 0.9)

# --- 5. target
letters(25.9, 7, 0.07, 150, 0.4, 0.5)
swoosh(27.45, 28.15, 300, 6000, 0.5, 0.5, 0.5, 1.2)
for i in range(5):
    pop(27.55 + i * 0.1, 260 + i * 80, 0.25, 0.3 + 0.1 * i)
swoosh(28.5, 28.95, 700, 5000, 0.5, 0.95, 0.35, 0.9)  # freccia
impact(28.95, 1.0, 1.2)
ping(28.95, 1318, 0.3, 1.8)
shimmer(29.0, 1568, 7, 0.12)
letters(29.0, 14, 0.03, 280, 0.12, 0.5)
flood(29.7, 30.5)
impact(30.5, 0.9, 1.0)

# --- 6. scaffali
letters(30.8, 11, 0.045, 260, 0.15, 0.5)
for r in range(2):
    for i in range(9):
        thud(31.2 + r * 0.3 + i * 0.09 + 0.45, 120 + (i % 3) * 20, 0.2, 0.22, 0.2 + 0.6 * ((i + r) % 2))
swoosh(32.6, 33.7, 400, 3500, 0.35, 0.05, 0.95, 1.4)
for r in range(2):
    for i in range(9):
        tick(32.7 + i * 0.07 + r * 0.15 + 0.35, 1500 + i * 120, 0.12, 0.15 + 0.7 * ((i + r) % 2))
ping(33.8, 1046, 0.2)
whoosh_whip(34.6, 35.5, True)
impact(35.5, 0.8, 0.9)

# --- 7. digital
letters(35.55, 7, 0.07, 260, 0.2, 0.5)
pop(35.8, 420, 0.3)
pop(36.2, 380, 0.25)
for i in range(3):
    pop(36.6 + i * 0.15, 480 + i * 60, 0.2)
swoosh(36.7, 37.9, 800, 3000, 0.12, 0.2, 0.7)
for tm in (37.3, 37.5, 37.7):
    ping(tm, 1175, 0.14)
tick(37.9, 1400, 0.5, 0.5, 0.05)
pop(37.92, 700, 0.3)
for i in range(10):
    ping(37.95 + i * 0.1, hz(72 + [0, 4, 7, 12][i % 4]), 0.1, 0.8, 0.2 + 0.6 * (i % 2))
flood(39.2, 40.0)
impact(40.0, 0.95, 1.1)

# --- 8. eventi
letters(40.05, 6, 0.06, 150, 0.4, 0.5)
swoosh(41.05, 41.9, 300, 3500, 0.4, 0.3, 0.7, 1.3)  # pagina
pop(41.85, 600, 0.35)
impact(41.9, 0.8, 0.9)
for i in range(30):
    tick(41.9 + i * 0.045, 3000 + 40 * (i % 9) * 10, 0.1, rng.random())
for i in range(12):
    pop(41.55 + i * 0.07, 380 + i * 25, 0.18, 0.15 + 0.7 * rng.random())
whoosh_whip(43.4, 44.0, True)
impact(44.0, 0.85, 0.9)

# --- 9. formazione
letters(44.35, 10, 0.05, 220, 0.25, 0.5)
for i in range(5):
    thud(44.75 + i * 0.12 + 0.35, 80 + i * 12, 0.3, 0.35)
for kk in range(4):
    stair_note(46.27 + kk * 0.52, kk + 1)
stair_note(45.75 + 0.0, 0, 0.2)
ping(48.03, 2093, 0.35, 2.0)
shimmer(48.03, 2093, 9, 0.12)
impact(48.03, 0.8, 1.0)
flood(48.7, 49.5)
impact(49.5, 0.95, 1.0)

# --- 10. gauge
letters(49.55, 7, 0.06, 240, 0.2, 0.5)
letters(49.95, 11, 0.045, 300, 0.12, 0.5)
for i in range(5):
    thud(50.25 + i * 0.14 + 0.4, 100 + i * 18, 0.3, 0.3)
pop(50.45, 700, 0.3)
tt_n = 0.0
for i in range(26):  # needle ratchet decelera
    tt_n += 0.02 + (i / 26) ** 2 * 0.12
    tick(50.85 + tt_n * 0.75, 1900 + 18 * i, 0.12, 0.6)
impact(51.8, 0.85, 1.0)
shimmer(51.85, 1760, 8, 0.12)
pop(52.2, 540, 0.3)
whoosh_whip(54.2, 55.0, True)
impact(55.0, 0.8, 0.9)

# --- 11. CTA
letters(55.15, 11, 0.06, 150, 0.35, 0.5)
swoosh(56.0, 57.1, 600, 4500, 0.2, 0.1, 0.9)
for i, tm in enumerate((56.5, 56.7, 56.9, 57.1)):
    swoosh(tm, tm + 0.35, 500, 3500, 0.22, 0.2 if i % 2 == 0 else 0.8, 0.5)
pop(57.5, 600, 0.3)
riser(57.0, 58.0, 0.5)
impact(58.0, 1.0, 1.6)
swoosh(58.0, 58.8, 200, 4000, 0.4, 0.5, 0.5, 1.0)
letters(58.45, 8, 0.05, 200, 0.28, 0.5)
shimmer(58.8, 1568, 9, 0.11)
ping(59.2, 784, 0.3, 3.0)
ping(59.2, 1046, 0.2, 3.0)

# ============ riverbero ============
def conv(x, h):
    n = len(x) + len(h) - 1
    nf = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(h, nf), nf)[: len(x)]


def make_ir(sec, decay):
    n = int(sec * SR)
    tt = np.arange(n) / SR
    return rng.normal(0, 1, n) * np.exp(-tt * decay) / np.sqrt(n * 0.05)


irA = make_ir(2.2, 2.8)
irB = make_ir(3.4, 2.1)
irC = make_ir(3.4, 2.1)
musL = L * 0.8 + conv(L, irA) * 0.3
musR = R * 0.8 + conv(R, irA[::-1]) * 0.3
fxL = FX_L * 0.75 + conv(FX_L, irB) * 0.55
fxR = FX_R * 0.75 + conv(FX_R, irC) * 0.55
OL = musL + fxL
OR = musR + fxR

fade = np.clip(t_all / 0.3, 0, 1) * np.clip((DUR - t_all) / 1.2, 0, 1)
OL *= fade
OR *= fade
peak = max(np.abs(OL).max(), np.abs(OR).max())
OL = np.tanh(OL / peak * 1.35) * 0.9
OR = np.tanh(OR / peak * 1.35) * 0.9
pcm = (np.stack([OL, OR], axis=1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], DUR, 's')
