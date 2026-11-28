# effetti sintetizzati: whoosh (rumore filtrato in sweep), hit (colpo basso + click), tick, riser
import numpy as np, soundfile as sf, os
W = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../work/s1'); SR = 48000
rng = np.random.default_rng(7)
def bp(n, f0, f1, q=0.25):
    """rumore passa-banda con centro che scorre da f0 a f1 (filtro a stato variabile)"""
    x = rng.standard_normal(n).astype('float32'); y = np.zeros(n, 'float32'); lo = bd = 0.0
    fs = np.geomspace(f0, f1, n)
    for i in range(n):
        f = 2 * np.sin(np.pi * fs[i] / SR)
        lo += f * bd; hi = x[i] - lo - q * bd; bd += f * hi; y[i] = bd
    return y
def norm(x, pk=0.9): return (x / (np.abs(x).max() + 1e-9) * pk).astype('float32')
n = int(0.42 * SR); t = np.arange(n) / SR
env = np.sin(np.pi * np.clip(t / 0.42, 0, 1)) ** 2.2
sf.write(f'{W}/whoosh.wav', norm(bp(n, 350, 5200) * env), SR)
n = int(0.7 * SR); t = np.arange(n) / SR
hit = np.sin(2 * np.pi * (48 * t + 60 * (1 - np.exp(-t * 28)) / 28)) * np.exp(-t * 7) + 0.35 * rng.standard_normal(n) * np.exp(-t * 60)
sf.write(f'{W}/hit.wav', norm(np.tanh(hit * 2)), SR)
n = int(0.07 * SR); t = np.arange(n) / SR
sf.write(f'{W}/tick.wav', norm(np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 90) + 0.3 * rng.standard_normal(n) * np.exp(-t * 200), 0.7), SR)
n = int(0.95 * SR); t = np.arange(n) / SR
sf.write(f'{W}/riser.wav', norm(bp(n, 500, 7000, 0.35) * (t / 0.95) ** 2.5), SR)
# ping: campanella metallica per l'entrata dei marchi
n = int(0.9 * SR); t = np.arange(n) / SR
ping = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * dk) for f, a, dk in [(1318.5, 1.0, 5.5), (1975.5, 0.55, 7.5), (2637, 0.4, 9), (3951, 0.22, 13)]) + 0.25 * rng.standard_normal(n) * np.exp(-t * 260)
sf.write(f'{W}/ping.wav', norm(ping, 0.8), SR)
# stop: la musica 'frena' (tono che scende in fretta) prima di una gag
n = int(0.38 * SR); t = np.arange(n) / SR
f = 420 * np.exp(-t * 6.5) + 40
stop = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - t / 0.38) ** 1.4 + 0.12 * rng.standard_normal(n) * np.exp(-t * 30)
sf.write(f'{W}/stop.wav', norm(np.tanh(stop * 1.6), 0.8), SR)
print('sfx ok')
