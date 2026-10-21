"""Colonna sonora: voce montata (da edl.json) + musica fornita, riarrangiata sulle battute.

Musica: 100 BPM, battuta = 2.398s. Le battute 4-7 ripetono le 0-3 (frase di 4 battute = 9.59s),
la battuta 8 (19.944s) è l'accordo finale. Si parte dalla battuta 3, si ripete la frase 4-7
e l'accordo finale cade esattamente su T_LOGO.
Scrive public/timing.json (per Remotion) e out/mix.wav.
"""
import json, os, subprocess
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
OUT = P('..', 'out', 'l2')
os.makedirs(OUT, exist_ok=True)
SR = 48000

BEAT = 60 / 100.08
BAR = 4 * BEAT
DOWN0 = 0.16 + BEAT  # primo battere
bar = lambda k: DOWN0 + k * BAR
START_BAR, LOOP_A, LOOP_B, FINAL = 3, 4, 8, 8
LOOPS = 3

edl = json.load(open(P('public', 'edl.json')))


def run(*a):
    subprocess.run(a, check=True)


# ───────── voce
clips = {}
for n in range(1, 2):
    x, sr = sf.read(P('src', f'c{n}.wav'))
    assert sr == SR
    clips[n] = x


def speech_rms(x):
    fr = SR // 100
    e = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, len(x) - fr, fr)])
    e = e[e > np.percentile(e, 95) * 10 ** (-20 / 20)]
    return np.sqrt(np.mean(e ** 2))


# guadagno per clip: tutte allo stesso livello di parlato
ref = np.median([speech_rms(clips[n]) for n in clips])
gain = {n: ref / speech_rms(clips[n]) for n in clips}

speech = edl['speech']
voice = np.zeros(int((speech + 6) * SR))
F = int(0.012 * SR)  # micro dissolvenza a ogni taglio, niente click
for g in edl['segs']:
    a, b = int(g['s'] * SR), int(g['e'] * SR)
    seg = clips[g['clip']][a:b] * gain[g['clip']]
    ramp = np.linspace(0, 1, F)
    seg[:F] *= ramp
    seg[-F:] *= ramp[::-1]
    o = int(g['out'] * SR)
    voice[o:o + len(seg)] += seg
sf.write(P(OUT, 'voice_raw.wav'), voice, SR)
# catena voce: pulizia bassi, denoise leggero, meno fango, più presenza, de-esser, compressione
run('ffmpeg', '-v', 'error', '-y', '-i', P(OUT, 'voice_raw.wav'), '-af',
    'highpass=f=85,afftdn=nr=8:nf=-42,equalizer=f=220:t=q:w=1.1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2.5,'
    'equalizer=f=10500:t=q:w=0.8:g=1.5,deesser=i=0.25,'
    'acompressor=threshold=-22dB:ratio=3:attack=6:release=140:makeup=3dB,alimiter=limit=0.89:level=false',
    '-ar', str(SR), P(OUT, 'voice.wav'))
voice, _ = sf.read(P(OUT, 'voice.wav'))

# ───────── musica
run('ffmpeg', '-v', 'error', '-y', '-i', P('src', 'music.mp3'), '-ar', str(SR), '-ac', '2', P(OUT, 'music_src.wav'))
m, _ = sf.read(P(OUT, 'music_src.wav'))
X = 0.025  # crossfade sui punti di giunzione (sul battere)
parts = [(bar(START_BAR), bar(LOOP_B))] + [(bar(LOOP_A), bar(LOOP_B))] * LOOPS + [(bar(FINAL), len(m) / SR)]
xs = int(X * SR)
music = np.zeros((0, 2))
for a, b in parts:
    seg = m[int(a * SR) - (xs if len(music) else 0): int(b * SR)].copy()
    if len(music):
        w = np.linspace(0, 1, xs)[:, None]
        music[-xs:] = music[-xs:] * np.sqrt(1 - w) + seg[:xs] * np.sqrt(w)
        seg = seg[xs:]
    music = np.concatenate([music, seg])
T_LOGO = (bar(LOOP_B) - bar(START_BAR)) + LOOPS * (bar(LOOP_B) - bar(LOOP_A))
END = T_LOGO + 4.45
music = music[: int(END * SR)]
fin = int(0.6 * SR)
music[-fin:] *= np.linspace(1, 0, fin)[:, None] ** 2
fi = int(0.35 * SR)
music[:fi] *= np.linspace(0, 1, fi)[:, None]

# ───────── ducking: inviluppo dal parlato reale (VAD sulla voce montata)
N = int(END * SR)
v = np.zeros(N)
v[: min(N, len(voice))] = voice[:N]
hop = SR // 100
lev = np.array([np.sqrt(np.mean(v[i:i + hop] ** 2)) + 1e-9 for i in range(0, N, hop)])
talk = 20 * np.log10(lev) > 20 * np.log10(np.percentile(lev[lev > 1e-6], 95)) - 26
# un respiro tra due parole non è una pausa: chiude i buchi brevi
k = int(0.45 * 100)
t_idx = np.nonzero(talk)[0]
for i0, i1 in zip(t_idx[:-1], t_idx[1:]):
    if 1 < i1 - i0 <= k:
        talk[i0:i1] = True

UNDER, GAP, COVER_UNDER, LOGO = -14.0, -8.5, -11.5, 0.0  # dB rispetto alla musica portata alla loudness della voce
cue_cover = next(w['t'] for w in edl['words'] if w['w'].lower() == 'titolare')
tgt = np.where(talk, UNDER, GAP).astype(float)
times = np.arange(len(tgt)) / 100
tgt[(times >= cue_cover - 0.3) & talk] = COVER_UNDER
tgt[times >= T_LOGO - 0.25] = LOGO
# attack 90ms quando parte la voce, release 450ms quando si ferma
env = np.zeros_like(tgt)
env[0] = tgt[0]
for i in range(1, len(tgt)):
    tau = 0.09 if tgt[i] < env[i - 1] else 0.45
    env[i] = env[i - 1] + (tgt[i] - env[i - 1]) * (1 - np.exp(-0.01 / tau))
gl = np.interp(np.arange(N) / SR, times, 10 ** (env / 20))[:, None]

# musica alla stessa loudness della voce prima del ducking
def lufs_ish(x):
    x = x.mean(1) if x.ndim > 1 else x
    fr = SR // 10
    e = np.array([np.mean(x[i:i + fr] ** 2) for i in range(0, len(x) - fr, fr)])
    e = e[e > np.percentile(e, 50) * 0.1]
    return 10 * np.log10(np.mean(e) + 1e-12)

mus_gain = 10 ** ((lufs_ish(v[: int(speech * SR)]) - lufs_ish(music)) / 20)
mix = music[:N] * mus_gain * gl
mix += v[:N, None]
sf.write(P(OUT, 'bed.wav'), music[:N] * mus_gain * gl, SR, subtype='FLOAT')
sf.write(P(OUT, 'mix_pre.wav'), mix, SR, subtype='FLOAT')

# master: loudnorm a 2 passate, -14 LUFS / -1.5 dBTP (standard social)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', P(OUT, 'mix_pre.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
j = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
run('ffmpeg', '-v', 'error', '-y', '-i', P(OUT, 'mix_pre.wav'), '-af',
    f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true",
    '-ar', str(SR), P(OUT, 'mix.wav'))

json.dump(dict(T_LOGO=round(T_LOGO, 4), END=round(END, 4), BEAT=BEAT, BAR=BAR), open(P('public', 'timing.json'), 'w'), indent=1)
print(f'parlato {speech:.2f}s  logo {T_LOGO:.2f}s  fine {END:.2f}s  musica x{mus_gain:.2f}')
