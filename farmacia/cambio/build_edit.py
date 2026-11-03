"""Montaggio reel "cambio stagione".
- video base: tagli frame-accurate dal girato pulito (ffmpeg), le pause restano dentro i segmenti -> nessun nero/flash
- parole: tempi da Whisper (whisper_words.json, sul girato originale) mappati sul testo corretto
- audio: stem voce / musica / effetti misurati e mixati con ducking leggero
Scrive edit.json (per Remotion), farmacia/public/cambio/base.mp4, out/cs_mix.wav.
uso: python3 farmacia/cambio/build_edit.py"""
import difflib, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC_VIDEO = os.path.join(ROOT, 'farmacia', 'public', 'cambio', 'girato.mp4')
SRC_AUDIO = os.path.join(ROOT, 'farmacia', 'cambio_stagione', 'audio', 'voice.wav')
BASE = os.path.join(ROOT, 'farmacia', 'public', 'cambio', 'base.mp4')
SFX = os.path.join(HERE, 'sfx')
OUT = os.path.join(ROOT, 'out')
os.makedirs(OUT, exist_ok=True)
FPS = 30
END_HOLD = 3.6      # cartello finale dopo l'ultima parola
VOICE_LUFS = -16
MUSIC_LUFS = -25    # letto musicale ~9 dB sotto la voce, il ducking lo abbassa ancora un po' sotto le frasi

# (inizio, fine parlato nel girato, pausa che segue presa dal girato stesso, testo corretto)
SEGS = [
    (0.75, 9.40, 0.10, "Ti senti un po' scarico anche tu? Tranquillo, non è solo colpa del lunedì, è l'ora solare che ci ha completamente scombussolato."),
    (9.90, 18.65, 0.12, "Con il cambio di stagione e il ritorno all'ora solare, il nostro organismo è un attimino fuori fase e va tutto riequilibrato."),
    (19.55, 21.20, 0.40, "E il risultato qual è?"),
    (22.50, 29.45, 0.20, "Sonnolenza! È quell'umore che va su e giù, difficoltà a concentrarsi, un vero disastro."),
    (48.15, 52.95, 0.10, "La buona notizia è che possiamo aiutare il tuo corpo a riequilibrarsi."),
    (53.15, 63.20, 0.25, "Bastano un po' di sane abitudini quotidiane e, dovesse essere necessario, un aiuto con rimedi naturali per migliorare sonno, digestione e tono dell'umore."),
    (73.12, 82.75, 0.00, "Se in questi giorni ti senti un po' fuori fase, non preoccuparti, vienici a trovare, sapremo trovare il rimedio giusto per ridare sprint al tuo ritmo."),
]


def sh(*a):
    return subprocess.run(a, check=True, capture_output=True, text=True)


def norm(s):
    s = s.lower().replace('’', "'")
    s = re.sub(r"[àá]", 'a', s); s = re.sub(r"[èé]", 'e', s); s = re.sub(r"[ìí]", 'i', s); s = re.sub(r"[òó]", 'o', s); s = re.sub(r"[ùú]", 'u', s)
    return [p for p in re.split(r"[^a-z0-9]+", s) if p]


# ---------------------------------------------------------------- segmenti a fotogrammi interi
segments, f = [], 0
for i, (a, b, gap, text) in enumerate(SEGS):
    n = round((b - a + gap) * FPS)
    segments.append({'src': a, 'srcEnd': round(a + n / FPS, 3), 'start': round(f / FPS, 3), 'end': round((f + n) / FPS, 3), 'text': text})
    f += n
speech_end = f / FPS
total = round(speech_end + END_HOLD, 3)

# ---------------------------------------------------------------- video base (un solo file, tagli netti)
vf = [f"[0:v]trim=start={s['src']}:end={s['srcEnd']},setpts=PTS-STARTPTS[v{i}]" for i, s in enumerate(segments)]
vf.append(''.join(f'[v{i}]' for i in range(len(segments))) + f"concat=n={len(segments)}:v=1:a=0,tpad=stop_mode=clone:stop_duration={END_HOLD},fps={FPS}[v]")
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', SRC_VIDEO, '-filter_complex', ';'.join(vf), '-map', '[v]',
   '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-g', '15', '-pix_fmt', 'yuv420p', BASE)

# ---------------------------------------------------------------- parole: Whisper -> testo corretto
ww = json.load(open(os.path.join(HERE, 'whisper_words.json')))
wtok = []   # (token normalizzato, start, end) del girato
for w in ww:
    toks = norm(w['w'])
    for k, t in enumerate(toks):
        d = (w['e'] - w['s']) / len(toks)
        wtok.append((t, w['s'] + k * d, w['s'] + (k + 1) * d))

words = []
for si, s in enumerate(segments):
    cand = [t for t in wtok if s['src'] - 0.4 <= t[1] < s['srcEnd']]
    mine = s['text'].split()
    mt = []   # token -> indice parola
    for wi, wd in enumerate(mine):
        for t in norm(wd):
            mt.append((t, wi))
    sm = difflib.SequenceMatcher(a=[t for t, _ in mt], b=[t[0] for t in cand], autojunk=False)
    st = [None] * len(mine); en = [None] * len(mine)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            wi = mt[blk.a + k][1]; c = cand[blk.b + k]
            st[wi] = c[1] if st[wi] is None else min(st[wi], c[1]); en[wi] = c[2] if en[wi] is None else max(en[wi], c[2])
    # buchi: interpolazione tra le parole agganciate
    known = [k for k in range(len(mine)) if st[k] is not None]
    for k in range(len(mine)):
        if st[k] is None:
            prv = max([j for j in known if j < k], default=None); nxt = min([j for j in known if j > k], default=None)
            t0 = en[prv] if prv is not None else s['src']; t1 = st[nxt] if nxt is not None else s['srcEnd'] - 0.1
            span = (nxt if nxt is not None else len(mine)) - (prv if prv is not None else -1)
            pos = k - (prv if prv is not None else -1)
            st[k] = t0 + (t1 - t0) * (pos - 1) / span; en[k] = t0 + (t1 - t0) * pos / span
    for k, wd in enumerate(mine):
        a = max(s['src'], st[k]); b = max(a + 0.08, en[k])
        words.append({'w': wd, 's': round(s['start'] + a - s['src'], 3), 'e': round(s['start'] + b - s['src'], 3), 'seg': si})
# monotonia
for k in range(1, len(words)):
    if words[k]['s'] < words[k - 1]['s'] + 0.04:
        words[k]['s'] = round(words[k - 1]['s'] + 0.04, 3)

# frasi: max 3 parole / 18 caratteri, si chiudono sulla punteggiatura e sui tagli
phrases, cur = [], []
for k, wd in enumerate(words):
    cur.append(k)
    txt = ' '.join(words[j]['w'] for j in cur)
    nxt = words[k + 1] if k + 1 < len(words) else None
    if wd['w'][-1] in '.,?!' or len(cur) >= 3 or len(txt) >= 18 or nxt is None or nxt['seg'] != wd['seg']:
        phrases.append(cur); cur = []
phr = []
for p in phrases:
    sg = segments[words[p[0]]['seg']]
    s0 = max(sg['start'], words[p[0]]['s'] - 0.06)          # mai prima del taglio
    e0 = min(sg['end'], words[p[-1]]['e'] + 0.25)            # mai oltre il taglio
    phr.append({'words': p, 's': round(s0, 3), 'e': round(e0, 3)})
for k in range(len(phr) - 1):          # nessuna sovrapposizione tra frasi
    phr[k]['e'] = round(min(phr[k]['e'], phr[k + 1]['s']), 3)


def at(word, occ=1):
    n = 0
    for w in words:
        if norm(w['w']) and norm(w['w'])[0] == norm(word)[0]:
            n += 1
            if n == occ:
                return w['s']
    raise KeyError(word)


# ---------------------------------------------------------------- ancore per grafiche ed effetti
seg = segments
A = {
    'clockIn': round(at("l'ora") - 0.15, 3), 'clockOut': seg[0]['end'],
    'yawnIn': seg[3]['start'], 'yawnOut': seg[3]['end'],
    'umore': at("quell'umore"), 'concentr': at('concentrarsi,'),
    'buona': at('buona', 1), 'abitudini': at('sane'),
    'remIn': round(at('aiuto') - 0.2, 3), 'remOut': seg[5]['end'],
    'sonno': at('sonno,'), 'digestione': at('digestione'), 'tono': at('tono'),
    'fuoriFase1': at('fuori', 1), 'cambio': at('cambio'),
    'fuoriFase2': at('fuori', 2), 'vienici': at('vienici'),
    'endIn': round(words[-1]['e'] + 0.35, 3),
}

# ---------------------------------------------------------------- audio
def lufs(path, a=None, b=None):
    cmd = ['ffmpeg'] + (['-ss', str(a), '-to', str(b)] if a is not None else []) + ['-i', path, '-af', 'ebur128', '-f', 'null', '-']
    o = subprocess.run(cmd, capture_output=True, text=True).stderr
    return float([l for l in o.splitlines() if l.strip().startswith('I:')][-1].split()[1])


def dur(path):
    return float(sh('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path).stdout)


# voce: stessi tagli del video (sincrono per costruzione), micro dissolvenze sui tagli
af = [f"[0:a]atrim=start={s['src']}:end={s['srcEnd']},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,"
      f"afade=t=out:st={s['srcEnd'] - s['src'] - 0.02:.3f}:d=0.02[a{i}]" for i, s in enumerate(segments)]
af.append(''.join(f'[a{i}]' for i in range(len(segments))) + f"concat=n={len(segments)}:v=0:a=1,highpass=f=80,"
          f"acompressor=threshold=0.1:ratio=2.5:attack=8:release=150,loudnorm=I={VOICE_LUFS}:TP=-2:LRA=7,apad=whole_dur={total}[a]")
voice = os.path.join(OUT, 'cs_voice.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', SRC_AUDIO, '-filter_complex', ';'.join(af), '-map', '[a]', '-ar', '48000', '-ac', '1', voice)

music = os.path.join(OUT, 'cs_music.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(HERE, 'music.mp3'), '-af',
   f"atrim=0:{total},loudnorm=I={MUSIC_LUFS}:TP=-4:LRA=11,afade=t=in:d=0.25,afade=t=out:st={total - 1.8}:d=1.8",
   '-ar', '48000', '-ac', '2', music)

EV = [  # (tempo, file, guadagno dB)
    (0.12, 'pop', 6), (0.26, 'pop', 3),
    (A['cambio'] - 0.05, 'pop', 3), (A['fuoriFase1'] - 0.05, 'pop', 4),
    (A['clockIn'] - 0.05, 'whoosh', -6), (A['clockIn'] + 0.45, 'clock', -9), (A['clockOut'] - 0.3, 'whoosh', -8),
    (A['yawnIn'] - 0.15, 'whoosh', -8), (A['yawnIn'] + 0.05, 'pop', 6), (A['yawnIn'] + 0.25, 'yawn', -1),
    (A['umore'] - 0.05, 'pop', 3), (A['concentr'] - 0.05, 'pop', 3),
    (A['buona'] - 0.05, 'chime', -8), (A['abitudini'] - 0.05, 'pop', 3),
    (A['remIn'] - 0.05, 'whoosh', -6), (A['sonno'] - 0.05, 'pop', 4), (A['digestione'] - 0.05, 'pop', 4), (A['tono'] - 0.05, 'pop', 4),
    (A['remOut'] - 0.3, 'whoosh', -8),
    (A['fuoriFase2'] - 0.05, 'pop', 3), (A['vienici'] - 0.05, 'pop', 5),
    (A['endIn'] - 0.1, 'whoosh', -7), (A['endIn'] + 0.2, 'logo', -6),
]
ins, fl = [], []
for k, (t, name, g) in enumerate(EV):
    ins += ['-i', os.path.join(SFX, f'{name}.mp3')]
    fl.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g}dB,adelay={int(t * 1000)}|{int(t * 1000)}[e{k}]")
fl.append(''.join(f'[e{k}]' for k in range(len(EV))) + f"amix=inputs={len(EV)}:normalize=0,apad=whole_dur={total},atrim=0:{total}[x]")
sfx = os.path.join(OUT, 'cs_sfx.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[x]', '-ar', '48000', '-ac', '2', sfx)

mix = os.path.join(OUT, 'cs_mix.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', voice, '-i', music, '-i', sfx, '-filter_complex',
   '[0:a]aformat=channel_layouts=stereo,asplit=2[vo][sc];'
   '[1:a][sc]sidechaincompress=threshold=0.05:ratio=2.5:attack=80:release=500[mu];'
   f'[vo][mu][2:a]amix=inputs=3:normalize=0:duration=longest,atrim=0:{total},alimiter=limit=0.9[out]',
   '-map', '[out]', '-ar', '48000', '-ac', '2', mix)

print('durate  voce %.2f  musica %.2f  sfx %.2f  mix %.2f  (atteso %.2f)' % (dur(voice), dur(music), dur(sfx), dur(mix), total))
print('LUFS    voce %.1f  musica %.1f  sfx %.1f  mix %.1f' % (lufs(voice), lufs(music), lufs(sfx), lufs(mix)))
print('base.mp4 %.2f s' % dur(BASE))

json.dump({'fps': FPS, 'total': total, 'segments': [{k: v for k, v in s.items() if k != 'text'} for s in segments],
           'words': words, 'phrases': phr, 'a': A}, open(os.path.join(HERE, 'edit.json'), 'w'), indent=1, ensure_ascii=False)
print('ok', total, 's,', len(words), 'parole,', len(phr), 'frasi')
