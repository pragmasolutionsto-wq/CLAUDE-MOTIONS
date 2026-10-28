"""Allinea la voce (Runway, una traccia per scena) e mixa la musica con ducking.
Scrive timeline_vo.json (scene guidate dalla voce) e out/met_mix.wav.
uso: python3 farmacia/metformina/build_audio.py"""
import json, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
VO = os.path.join(HERE, 'vo')
OUT = os.path.join(HERE, '..', '..', 'out')
os.makedirs(OUT, exist_ok=True)
IDS = ['hook', 'cosa', 'errore', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 'end']
TEMPO = 1.08      # voce leggermente più svelta, intonazione invariata
PRE, POST = 0.12, 0.18
END_HOLD = 2.4    # logo e payoff restano a schermo dopo l'ultima parola


def sh(*a):
    return subprocess.run(a, check=True, capture_output=True, text=True).stdout


def dur(p):
    return float(sh('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p))


scenes, t = [], 0.0
for i, sid in enumerate(IDS):
    src = os.path.join(VO, f'v{i + 1:02d}.mp3')
    dst = os.path.join(OUT, f'met_vo{i + 1:02d}.wav')
    sh('ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af',
       'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
       f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={TEMPO}', '-ar', '48000', '-ac', '1', dst)
    d = dur(dst)
    length = PRE + d + POST + (END_HOLD if sid == 'end' else 0)
    scenes.append({'id': sid, 'from': round(t, 3), 'to': round(t + length, 3), 'vo': round(t + PRE, 3), 'voDur': round(d, 3), 'file': dst})
    t += length
total = t

# voce: ogni traccia al suo attacco; musica sotto con sidechain e dissolvenze
inputs, filt = [], []
for k, s in enumerate(scenes):
    inputs += ['-i', s['file']]
    filt.append(f'[{k}:a]adelay={int(s["vo"] * 1000)}|{int(s["vo"] * 1000)},apad=whole_dur={total}[v{k}]')
n = len(scenes)
inputs += ['-i', os.path.join(VO, 'music.mp3')]
filt.append(''.join(f'[v{k}]' for k in range(n)) + f'amix=inputs={n}:normalize=0,volume=1.0,asplit=2[vo][sc]')
filt.append(f'[{n}:a]atrim=0:{total},volume=0.42,afade=t=in:d=0.4,afade=t=out:st={total - 2.2}:d=2.2[mu]')
filt.append('[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[duck]')
filt.append('[vo][duck]amix=inputs=2:normalize=0,alimiter=limit=0.9,aresample=48000[out]')
sh('ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[out]', '-ac', '2', os.path.join(OUT, 'met_mix.wav'))

json.dump({'fps': 30, 'total': round(total, 3), 'scenes': [{k: v for k, v in s.items() if k != 'file'} for s in scenes]},
          open(os.path.join(HERE, 'timeline_vo.json'), 'w'), indent=1)
print('ok', round(total, 2), 's')
