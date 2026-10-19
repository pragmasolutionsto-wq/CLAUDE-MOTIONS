"""Colonna sonora Automotiva: traccia dark trap (152 BPM, portata a 150) tagliata sui battiti + avviamento motore.
Intro 0-1.2s solo motore, al primo taglio parte la traccia, battiti 14-16 silenzio + sgasata, drop al 16.
uso: python3 automotiva/mix.py out/score.wav"""
import subprocess, sys, wave
import numpy as np

SR = 44100
B = 0.4                      # battito video (150 BPM)
SRC_B = 0.39474              # battito della traccia (152 BPM)
PRE = 3 * B                  # intro avviamento
TOTAL = 41 * B
HERE = 'automotiva/audio/'

def load(path, ss=0.0, dur=None, tempo=1.0):
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{ss:.4f}', '-i', path]
    if dur: cmd += ['-t', f'{dur:.4f}']
    if tempo != 1.0: cmd += ['-af', f'atempo={tempo:.6f}']
    cmd += ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)
    return x.reshape(-1, 2).astype(np.float64)

def music(start, beats, extra=0.0):
    # estrae `beats` battiti dalla traccia e li porta a 150 BPM esatti
    return load(HERE + 'track.mp3', start, beats * SRC_B + extra, SRC_B / B)

out = np.zeros((int(TOTAL * SR) + SR, 2))
def put(x, at, g=1.0, fade_in=0.004, fade_out=0.006):
    x = x.copy(); n = len(x)
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi: x[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo: x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    s = int(at * SR); e = min(len(out), s + n)
    out[s:e] += x[:e - s] * g

beat = lambda b: PRE + b * B

# motore: il motorino gira, pausa, e lo scoppio cade sul primo taglio (1.2s nel file = 1.2s nel video)
engine = load(HERE + 'engine.mp3')
put(engine[:int(4.6 * SR)], 0.0, 1.0, 0.002, 0.4)
# traccia: groove pieno sui battiti 0-14
put(music(52.117, 14), beat(0), 0.85)
# battiti 14-16: silenzio prima del drop della traccia + sgasata che sale nel drop
put(music(67.315, 2), beat(14), 0.85)
put(engine[int(1.15 * SR):int(2.05 * SR)], beat(16) - 0.9, 1.1, 0.05, 0.08)
# drop dal battito 16 alla fine, sfuma sul logo
drop = music(68.104, 25, 0.3)
put(drop, beat(16), 0.95, 0.002, 0.0)

# colpo sub sul logo (battito 31)
n = int(2.0 * SR); t = np.arange(n) / SR
f = 32 + 100 * np.exp(-t * 7); ph = 2 * np.pi * np.cumsum(f) / SR
boom = np.tanh(2.0 * np.sin(ph) * np.exp(-t / 0.8))
put(np.stack([boom, boom], 1), beat(31), 0.7)

x = out[:int(TOTAL * SR)]
fn = int(1.6 * SR); x[-fn:] *= (np.linspace(1, 0, fn) ** 1.6)[:, None]
x = np.tanh(x * 1.05); x /= max(1e-9, np.abs(x).max()); x *= 0.9
pcm = (x * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
