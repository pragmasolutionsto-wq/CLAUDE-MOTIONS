"""Montaggio reel "caduta capelli stagionale" (stessa pipeline di cambio stagione).
- video base: pause asciugate con tagli frame-accurate dal girato pulito (ffmpeg) -> nessun nero/flash
- parole: tempi da Whisper (whisper_words.json) mappati sul testo corretto del copione
- audio: stem voce / musica / effetti misurati e mixati con ducking leggero
Scrive edit.json (per Remotion), farmacia/public/capelli/base.mp4, out/cp_mix.wav.
uso: python3 farmacia/capelli/build_edit.py"""
import difflib, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC_VIDEO = os.path.join(ROOT, 'farmacia', 'public', 'capelli', 'girato.mp4')
SRC_AUDIO = os.path.join(ROOT, 'farmacia', 'capelli_stagione', 'audio', 'voice.wav')
BASE = os.path.join(ROOT, 'farmacia', 'public', 'capelli', 'base.mp4')
SFX = os.path.join(HERE, 'sfx')
OUT = os.path.join(ROOT, 'out')
os.makedirs(OUT, exist_ok=True)
FPS = 30
END_HOLD = 3.6
VOICE_LUFS = -16
MUSIC_LUFS = -25

# parlato da tenere (inizio, fine) nel girato: le pause oltre ~0,4 s sono asciugate
SEGS = [(0.48, 4.22), (4.44, 8.22), (8.52, 12.28), (12.54, 25.26), (25.96, 51.72), (52.14, 55.68), (56.00, 66.00), (66.28, 76.16), (77.10, 82.88)]

TEXT = ("Stai perdendo più capelli del solito e inizi a preoccuparti? Tranquilla, può essere semplicemente la normale caduta stagionale. "
        "Il capello segue un ciclo regolare: cresce, si ferma e poi cade. "
        "Molti follicoli entrano in riposo nella stagione estiva, tra luglio e agosto: due o tre mesi dopo, quindi tra settembre e novembre, la caduta aumenta. "
        "Inoltre, dopo un'estate così calda e intensa, UV e calore hanno sicuramente aumentato lo stress ossidativo del nostro capello e del nostro cuoio capelluto. "
        "Per non parlare poi di tinte, schiariture, phon, spazzola e piastra, che ovviamente possono aggiungere fragilità e rottura ai nostri capelli. "
        "Nella maggior parte dei casi, perciò, stai tranquilla: è una cosa temporanea e tende a ridursi nel giro di due o tre mesi. "
        "Se però noti che dura da più di tre mesi, hai vissuto delle malattie, hai fatto diete restrittive o semplicemente hai vissuto un grande stress, "
        "devi approfondire: bisogna capire che cosa è successo. "
        "Cosa ti consiglio nel frattempo? Sicuramente detergenti delicati, meno calore diretto, usa perciò sempre il termoprotettore e un sostegno per i tuoi capelli. "
        "Vieni a parlarne con noi: sapremo sicuramente capire insieme di cosa hanno bisogno i tuoi capelli. Ti aspettiamo!")


def sh(*a):
    return subprocess.run(a, check=True, capture_output=True, text=True)


def norm(s):
    s = s.lower().replace('’', "'")
    s = re.sub(r"[àá]", 'a', s); s = re.sub(r"[èé]", 'e', s); s = re.sub(r"[ìí]", 'i', s); s = re.sub(r"[òó]", 'o', s); s = re.sub(r"[ùú]", 'u', s)
    return [p for p in re.split(r"[^a-z0-9]+", s) if p]


# ---------------------------------------------------------------- segmenti a fotogrammi interi
segments, f = [], 0
for i, (a, b) in enumerate(SEGS):
    n = round((b - a) * FPS)
    segments.append({'src': a, 'srcEnd': round(a + n / FPS, 3), 'start': round(f / FPS, 3), 'end': round((f + n) / FPS, 3)})
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

def src2out(t):
    """tempo nel girato -> tempo nel montato (dentro una pausa tagliata: inizio del segmento dopo)"""
    for i, s in enumerate(segments):
        if t < s['srcEnd']:
            return s['start'] + max(0.0, t - s['src']), i
    s = segments[-1]
    return s['end'], len(segments) - 1


mine = TEXT.split()
mt = [(t, wi) for wi, wd in enumerate(mine) for t in norm(wd)]
sm = difflib.SequenceMatcher(a=[t for t, _ in mt], b=[t[0] for t in wtok], autojunk=False)
st = [None] * len(mine); en = [None] * len(mine)


def put(i, c):
    wi = mt[i][1]
    st[wi] = c[1] if st[wi] is None else min(st[wi], c[1]); en[wi] = c[2] if en[wi] is None else max(en[wi], c[2])


for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal':
        for k in range(i2 - i1):
            put(i1 + k, wtok[j1 + k])
    elif op == 'replace':
        # parole fraintese da Whisper ("viene" per "vieni"): abbinate per posizione dentro il blocco
        for k in range(i2 - i1):
            put(i1 + k, wtok[j1 + min(j2 - j1 - 1, int(k * (j2 - j1) / (i2 - i1)))])
known = [k for k in range(len(mine)) if st[k] is not None]
for k in range(len(mine)):
    if st[k] is None:
        prv = max([j for j in known if j < k], default=None); nxt = min([j for j in known if j > k], default=None)
        t0 = en[prv] if prv is not None else SEGS[0][0]; t1 = st[nxt] if nxt is not None else SEGS[-1][1]
        span = (nxt if nxt is not None else len(mine)) - (prv if prv is not None else -1)
        pos = k - (prv if prv is not None else -1)
        st[k] = t0 + (t1 - t0) * (pos - 1) / span; en[k] = t0 + (t1 - t0) * pos / span
print('parole agganciate a Whisper: %d/%d' % (len(known), len(mine)))
# correzione con l'energia della voce: nessuna parola può iniziare dentro una pausa vera
import wave
import numpy as np
_w = wave.open(SRC_AUDIO); _sr = _w.getframerate()
_x = np.frombuffer(_w.readframes(_w.getnframes()), np.int16) / 32768.0
_h = int(0.02 * _sr); _n = len(_x) // _h
_db = 20 * np.log10(np.sqrt((_x[:_n * _h].reshape(_n, _h) ** 2).mean(1)) + 1e-9)
_v = _db > np.percentile(_db, 90) - 24
pauses, i = [], 0
while i < _n:
    if not _v[i]:
        j = i
        while j < _n and not _v[j]:
            j += 1
        if (j - i) * 0.02 >= 0.14:
            pauses.append((i * 0.02, j * 0.02))
        i = j
    else:
        i += 1
for k in range(len(mine)):
    for a, b in pauses:
        if a - 0.02 <= st[k] < b:
            st[k] = b; en[k] = max(en[k], b + 0.1)
        if a < en[k] <= b and st[k] < a:
            en[k] = a
# isole di voce rimaste senza parole: Whisper ha anticipato la parola precedente -> la sposto dentro l'isola
islands, prev = [], 0.0
for a, b in pauses:
    if a - prev > 0.15:
        islands.append((prev, a))
    prev = b
for ia, (a, b) in enumerate(islands):
    if a < SEGS[0][0] or any(a <= st[k] < b for k in range(len(mine))):
        continue
    before = [k for k in range(len(mine)) if st[k] < a]
    if not before:
        continue
    k = before[-1]
    if mine[k][-1] in '.?!:':
        # fine frase prima della pausa: è Whisper in ritardo sulla parola dopo -> la anticipo all'inizio dell'isola
        after = [j for j in range(len(mine)) if st[j] >= b]
        if after:
            st[after[0]] = a
        continue
    pa, pb = islands[ia - 1] if ia > 0 else (0, a)
    if sum(1 for j in range(len(mine)) if pa <= st[j] < pb) >= 2:
        st[k] = a; en[k] = b

words = []
for k, wd in enumerate(mine):
    s0, si = src2out(max(SEGS[0][0], st[k]))
    e0, _ = src2out(max(st[k] + 0.08, en[k]))
    words.append({'w': wd, 's': round(s0, 3), 'e': round(max(e0, s0 + 0.08), 3), 'seg': si, 'src': round(st[k], 3)})
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
A = {
    'stagionale': at('stagionale.'),
    'cicloIn': round(at('Il') - 0.15, 3), 'cresce': at('cresce,'), 'ferma': at('ferma'), 'cade': at('cade.'),
    'calIn': round(at('Molti') - 0.12, 3), 'luglio': at('luglio'), 'mesiDopo': at('due', 1), 'settembre': at('settembre'), 'aumenta': at('aumenta.'),
    'calOut': segments[3]['end'],
    'sunIn': round(at('dopo', 2) - 0.1, 3), 'uv': at('UV'), 'calore': at('calore', 1), 'ossidativo': at('stress', 1),
    'toolsIn': round(at('Per') - 0.12, 3), 'tinte': at('tinte,'), 'schiariture': at('schiariture,'), 'phon': at('phon,'),
    'spazzola': at('spazzola'), 'piastra': at('piastra,'), 'fragilita': at('fragilità'), 'toolsOut': round(at('Nella', 2) - 0.05, 3),
    'temporanea': at('temporanea'), 'dueTre': at('due', 2),
    'checkIn': round(at('Se', 1) - 0.12, 3), 'treMesi': at('tre', 3), 'malattie': at('malattie,'), 'diete': at('diete'),
    'stress': at('stress', 2), 'approfondire': at('approfondire:'), 'checkOut': segments[6]['end'],
    'consiglio': at('consiglio'), 'careIn': round(at('Sicuramente', 2) - 0.1, 3), 'detergenti': at('detergenti'),
    'menoCalore': at('meno'), 'termo': at('termoprotettore'), 'sostegno': at('sostegno'),
    'vieni': at('Vieni'), 'endIn': round(words[-1]['e'] + 0.35, 3),
}
A['sunOut'] = round(A['sunIn'] + 6.0, 3)
A['careOut'] = round(min(A['careIn'] + 6.0, A['sostegno'] - 0.25), 3)

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
voice = os.path.join(OUT, 'cp_voice.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', SRC_AUDIO, '-filter_complex', ';'.join(af), '-map', '[a]', '-ar', '48000', '-ac', '1', voice)

music = os.path.join(OUT, 'cp_music.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(HERE, 'music.mp3'), '-af',
   f"atrim=0:{total},loudnorm=I={MUSIC_LUFS}:TP=-4:LRA=11,afade=t=in:d=0.25,afade=t=out:st={total - 1.8}:d=1.8",
   '-ar', '48000', '-ac', '2', music)

EV = [  # (tempo, file, guadagno dB)
    (0.12, 'pop', 6), (0.26, 'pop', 3), (A['stagionale'] - 0.05, 'pop', 4),
    (A['cicloIn'] - 0.05, 'whoosh', -6), (A['cresce'] - 0.05, 'pop', 4), (A['ferma'] - 0.05, 'pop', 4), (A['cade'] - 0.05, 'pop', 4),
    (A['calIn'] - 0.05, 'whoosh', -8), (A['luglio'] - 0.05, 'pop', 4), (A['mesiDopo'] - 0.05, 'clock', -12), (A['settembre'] - 0.05, 'pop', 4),
    (A['aumenta'] - 0.05, 'pop', 6),
    (A['sunIn'] - 0.15, 'whoosh', -8), (A['uv'] - 0.05, 'pop', 3), (A['calore'] - 0.05, 'pop', 3), (A['ossidativo'] - 0.05, 'pop', 3),
    (A['toolsIn'] - 0.05, 'whoosh', -6), (A['tinte'] - 0.05, 'pop', 4), (A['schiariture'] - 0.05, 'pop', 4), (A['phon'] - 0.05, 'pop', 4),
    (A['spazzola'] - 0.05, 'pop', 4), (A['piastra'] - 0.05, 'pop', 4), (A['fragilita'] - 0.05, 'pop', 6),
    (A['temporanea'] - 0.05, 'chime', -9), (A['dueTre'] - 0.05, 'pop', 3),
    (A['checkIn'] - 0.05, 'whoosh', -6), (A['treMesi'] - 0.05, 'pop', 4), (A['malattie'] - 0.05, 'pop', 4), (A['diete'] - 0.05, 'pop', 4),
    (A['stress'] - 0.05, 'pop', 4),
    (A['consiglio'] - 0.05, 'pop', 5), (A['careIn'] - 0.15, 'whoosh', -8), (A['detergenti'] - 0.05, 'pop', 3), (A['menoCalore'] - 0.05, 'pop', 3),
    (A['termo'] - 0.05, 'pop', 3), (A['sostegno'] - 0.05, 'pop', 4), (A['vieni'] - 0.05, 'pop', 5),
    (A['endIn'] - 0.1, 'whoosh', -7), (A['endIn'] + 0.2, 'logo', -6),
]
ins, fl = [], []
for k, (t, name, g) in enumerate(EV):
    ins += ['-i', os.path.join(SFX, f'{name}.mp3')]
    fl.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g}dB,adelay={int(t * 1000)}|{int(t * 1000)}[e{k}]")
fl.append(''.join(f'[e{k}]' for k in range(len(EV))) + f"amix=inputs={len(EV)}:normalize=0,apad=whole_dur={total},atrim=0:{total}[x]")
sfx = os.path.join(OUT, 'cp_sfx.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[x]', '-ar', '48000', '-ac', '2', sfx)

mix = os.path.join(OUT, 'cp_mix.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', voice, '-i', music, '-i', sfx, '-filter_complex',
   '[0:a]aformat=channel_layouts=stereo,asplit=2[vo][sc];'
   '[1:a][sc]sidechaincompress=threshold=0.05:ratio=2.5:attack=80:release=500[mu];'
   f'[vo][mu][2:a]amix=inputs=3:normalize=0:duration=longest,atrim=0:{total},alimiter=limit=0.9[out]',
   '-map', '[out]', '-ar', '48000', '-ac', '2', mix)

print('durate  voce %.2f  musica %.2f  sfx %.2f  mix %.2f  (atteso %.2f)' % (dur(voice), dur(music), dur(sfx), dur(mix), total))
print('LUFS    voce %.1f  musica %.1f  sfx %.1f  mix %.1f' % (lufs(voice), lufs(music), lufs(sfx), lufs(mix)))
print('base.mp4 %.2f s' % dur(BASE))

json.dump({'fps': FPS, 'total': total, 'segments': segments,
           'words': words, 'phrases': phr, 'a': A}, open(os.path.join(HERE, 'edit.json'), 'w'), indent=1, ensure_ascii=False)
print('ok', total, 's,', len(words), 'parole,', len(phr), 'frasi')
