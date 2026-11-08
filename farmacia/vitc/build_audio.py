"""Reel animato Vitamina C: timeline guidata dalla voce (Runway), stem voce / musica / effetti, mix con ducking.
Scrive timeline.json e out/vc_mix.wav.
uso: python3 farmacia/vitc/build_audio.py"""
import json, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'out')
os.makedirs(OUT, exist_ok=True)
IDS = ['hook', 'immuni', 'antiox', 'collagene', 'ferro', 'fabbisogno', 'alimenti', 'consiglio', 'prodotto', 'end']
TEMPO = 1.06
PRE, POST = 0.15, 0.25
END_HOLD = 2.6
VOICE_LUFS, MUSIC_LUFS = -16, -26


def sh(*a):
    return subprocess.run(a, check=True, capture_output=True, text=True).stdout


def dur(p):
    return float(sh('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p))


def lufs(p):
    o = subprocess.run(['ffmpeg', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float([l for l in o.splitlines() if l.strip().startswith('I:')][-1].split()[1])


scenes, t = [], 0.0
for i, sid in enumerate(IDS):
    dst = os.path.join(OUT, f'vc_vo{i + 1:02d}.wav')
    sh('ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(HERE, 'vo', f'v{i + 1:02d}.mp3'), '-af',
       'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
       f'atempo={TEMPO},loudnorm=I={VOICE_LUFS}:TP=-2:LRA=7', '-ar', '48000', '-ac', '1', dst)
    d = dur(dst)
    pre = 0.6 if sid == 'hook' else PRE          # il gancio parte dopo lo splash iniziale
    length = pre + d + POST + (END_HOLD if sid == 'end' else 0)
    f0, f1 = round(t * 30), round((t + length) * 30)   # confini a fotogrammi interi
    scenes.append({'id': sid, 'from': f0 / 30, 'to': f1 / 30, 'vo': round(t + pre, 3), 'voDur': round(d, 3), 'file': dst})
    t = f1 / 30
total = round(t, 3)

# voce
ins, fl = [], []
for k, s in enumerate(scenes):
    ins += ['-i', s['file']]
    fl.append(f"[{k}:a]adelay={int(s['vo'] * 1000)}|{int(s['vo'] * 1000)},apad=whole_dur={total}[v{k}]")
fl.append(''.join(f'[v{k}]' for k in range(len(scenes))) + f'amix=inputs={len(scenes)}:normalize=0,atrim=0:{total}[a]')
voice = os.path.join(OUT, 'vc_voice.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[a]', '-ar', '48000', '-ac', '1', voice)

# musica
music = os.path.join(OUT, 'vc_music.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(HERE, 'music.mp3'), '-af',
   f'atrim=0:{total},loudnorm=I={MUSIC_LUFS}:TP=-4:LRA=11,afade=t=in:d=0.2,afade=t=out:st={total - 2.0}:d=2.0', '-ar', '48000', '-ac', '2', music)

# effetti
S = {s['id']: s for s in scenes}
EV = [(0.05, 'squeeze', -6), (0.35, 'sparkle', -10)]
for s in scenes[1:]:
    EV.append((s['from'] - 0.12, 'whoosh', -12))
    EV.append((s['from'] + 0.05, 'pop', -8))
EV += [(S['immuni']['from'] + 0.6, 'sparkle', -8), (S['antiox']['from'] + 0.8, 'sparkle', -8), (S['collagene']['from'] + 0.5, 'sparkle', -12),
       (S['ferro']['from'] + 0.9, 'squeeze', -6), (S['fabbisogno']['from'] + 0.5, 'drop', -6), (S['alimenti']['from'] + 0.4, 'pop', 0),
       (S['alimenti']['from'] + 0.8, 'pop', -2), (S['prodotto']['from'] + 0.3, 'pop', 2), (S['prodotto']['from'] + 0.7, 'pop', 0),
       (S['end']['from'] + 0.3, 'logo', -6)]
ins, fl = [], []
for k, (tt, name, g) in enumerate(EV):
    ins += ['-i', os.path.join(HERE, 'sfx', f'{name}.mp3')]
    fl.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g}dB,adelay={int(tt * 1000)}|{int(tt * 1000)}[e{k}]")
fl.append(''.join(f'[e{k}]' for k in range(len(EV))) + f'amix=inputs={len(EV)}:normalize=0,apad=whole_dur={total},atrim=0:{total}[x]')
sfx = os.path.join(OUT, 'vc_sfx.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[x]', '-ar', '48000', '-ac', '2', sfx)

mix = os.path.join(OUT, 'vc_mix.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', voice, '-i', music, '-i', sfx, '-filter_complex',
   '[0:a]aformat=channel_layouts=stereo,asplit=2[vo][sc];[1:a][sc]sidechaincompress=threshold=0.05:ratio=2.5:attack=80:release=500[mu];'
   f'[vo][mu][2:a]amix=inputs=3:normalize=0:duration=longest,atrim=0:{total},alimiter=limit=0.9[out]', '-map', '[out]', '-ar', '48000', '-ac', '2', mix)
print('durate  voce %.2f  musica %.2f  sfx %.2f  mix %.2f  (atteso %.2f)' % (dur(voice), dur(music), dur(sfx), dur(mix), total))
print('LUFS    voce %.1f  musica %.1f  sfx %.1f  mix %.1f' % (lufs(voice), lufs(music), lufs(sfx), lufs(mix)))
json.dump({'fps': 30, 'total': total, 'scenes': [{k: v for k, v in s.items() if k != 'file'} for s in scenes]},
          open(os.path.join(HERE, 'timeline.json'), 'w'), indent=1)
for s in scenes:
    print(s['id'], s['from'], s['to'], round(s['to'] - s['from'], 2))
