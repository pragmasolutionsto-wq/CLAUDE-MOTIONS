"""Montaggio reel "cambio stagione": tagli sul girato, attacchi parola per parola dall'energia della voce,
audio voce+musica con ducking. Scrive edit.json (letto da Remotion) e out/cs_mix.wav.
uso: python3 farmacia/cambio/build_edit.py"""
import json, os, re, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
SRC_AUDIO = os.path.join(HERE, '..', 'cambio_stagione', 'audio', 'voice.wav')
MUSIC = os.path.join(HERE, 'music.mp3')
OUT = os.path.join(ROOT, 'out')
os.makedirs(OUT, exist_ok=True)
MUSIC_DB = -15
END_HOLD = 2.6

# (inizio, fine) nel girato + pausa prima del segmento nel montato + testo corretto
SEGS = [
    (0.75, 9.40, 0.0, "Ti senti un po' scarico anche tu? Tranquillo, non è solo colpa dell'umidità, è l'ora solare che ci ha completamente scombussolato."),
    (10.05, 18.65, 0.10, "Con il cambio di stagione e il ritorno all'ora solare, il nostro organismo è un attimino fuori fase e va tutto riequilibrato."),
    (19.45, 21.20, 0.10, "E il risultato qual è?"),
    (22.55, 29.50, 0.35, "Sonnolenza! È quell'umore che va su e giù, difficoltà a concentrarsi, un vero disastro."),
    (48.15, 52.95, 0.20, "La buona notizia è che possiamo aiutare il tuo corpo a riequilibrarsi."),
    (53.15, 63.25, 0.05, "Bastano un po' di sane abitudini quotidiane e, dovesse essere necessario, un aiuto con rimedi naturali per migliorare sonno, digestione e tono dell'umore."),
    (73.10, 82.75, 0.20, "Se in questi giorni ti senti un po' fuori fase, non preoccuparti, vienici a trovare, sapremo trovare il rimedio giusto per ridare sprint al tuo ritmo."),
]

w = wave.open(SRC_AUDIO); SR = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0
HOP = 0.01


def voiced(a, b):
    """frame da 10 ms con voce (energia sopra la soglia adattiva del segmento)"""
    s = x[int(a * SR):int(b * SR)]
    n = len(s) // int(HOP * SR)
    rms = np.sqrt((s[:n * int(HOP * SR)].reshape(n, -1) ** 2).mean(1)) + 1e-9
    db = 20 * np.log10(rms)
    thr = max(np.percentile(db, 30) + 6, db.max() - 32)
    v = db > thr
    # riempi i buchi brevi dentro le parole
    for i in range(1, n - 3):
        if not v[i] and v[i - 1] and v[i + 1:i + 4].any():
            v[i] = True
    return v


def weight(word):
    return max(1, len(re.sub(r"[^\wàèéìòù]", '', word.lower()))) + 1.5


segments, words, t = [], [], 0.0
for (a, b, gap, text) in SEGS:
    t += gap
    seg = {'src': a, 'srcEnd': b, 'start': round(t, 3), 'end': round(t + b - a, 3)}
    segments.append(seg)
    v = voiced(a, b)
    cum = np.cumsum(v) / max(1, v.sum())
    toks = text.split()
    ws = np.array([weight(k) for k in toks]); edges = np.concatenate([[0], np.cumsum(ws) / ws.sum()])
    for i, tok in enumerate(toks):
        s_idx = int(np.searchsorted(cum, edges[i] + 1e-6)); e_idx = int(np.searchsorted(cum, edges[i + 1] - 1e-6))
        ws_, we_ = s_idx * HOP, (e_idx + 1) * HOP
        words.append({'w': tok, 's': round(t + ws_, 3), 'e': round(t + we_, 3), 'seg': len(segments) - 1})
    t += b - a
total = t + END_HOLD

# frasi per i sottotitoli: max 4 parole / 24 caratteri, si chiude sulla punteggiatura
phrases, cur = [], []
for k, wd in enumerate(words):
    cur.append(k)
    txt = ' '.join(words[j]['w'] for j in cur)
    nxt = words[k + 1] if k + 1 < len(words) else None
    if (wd['w'][-1] in '.,?!' or len(cur) >= 4 or len(txt) >= 20 or nxt is None or nxt['seg'] != wd['seg']):
        phrases.append(cur); cur = []
phr = [{'words': p, 's': words[p[0]]['s'] - 0.05, 'e': words[p[-1]]['e'] + 0.12} for p in phrases]

# audio: segmenti concatenati con micro dissolvenze, voce a -16 LUFS, musica sotto con sidechain
filt, labels = [], []
for i, seg in enumerate(segments):
    d = seg['srcEnd'] - seg['src']
    filt.append(f"[0:a]atrim={seg['src']}:{seg['srcEnd']},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={d - 0.03:.3f}:d=0.03,"
                f"adelay={int(seg['start'] * 1000)}|{int(seg['start'] * 1000)},apad=whole_dur={total}[s{i}]")
    labels.append(f'[s{i}]')
filt.append(''.join(labels) + f"amix=inputs={len(labels)}:normalize=0,highpass=f=80,acompressor=threshold=0.12:ratio=2.5:attack=8:release=120,"
            "loudnorm=I=-16:TP=-2:LRA=7,asplit=2[vo][sc]")
filt.append(f"[1:a]atrim=0:{total},loudnorm=I=-16:TP=-2,volume={MUSIC_DB}dB,afade=t=in:d=0.3,afade=t=out:st={total - 2.4}:d=2.4[mu]")
filt.append('[mu][sc]sidechaincompress=threshold=0.02:ratio=4:attack=60:release=600[duck]')
filt.append('[vo][duck]amix=inputs=2:normalize=0,alimiter=limit=0.9[out]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', SRC_AUDIO, '-i', MUSIC, '-filter_complex', ';'.join(filt),
                '-map', '[out]', '-ac', '2', '-ar', '48000', os.path.join(OUT, 'cs_mix.wav')], check=True)

json.dump({'fps': 30, 'total': round(total, 3), 'segments': segments, 'words': words, 'phrases': phr},
          open(os.path.join(HERE, 'edit.json'), 'w'), indent=1, ensure_ascii=False)
print('ok', round(total, 2), 's,', len(words), 'parole,', len(phr), 'frasi')
for s in segments: print(s)
