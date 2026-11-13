"""Montaggio reel "Doppia detersione" base (stessa pipeline di pressione e primi freddi).
- sceglie le riprese buone tra due file di girato (prove ed errori scartati), poi asciuga le pause
- video base: pause asciugate con tagli frame-accurate dal girato pulito (ffmpeg) -> nessun nero/flash
- parole: tempi da Whisper (whisper_words.json) mappati sul testo corretto del copione
- audio: stem voce / musica / effetti misurati e mixati con ducking leggero
Scrive edit.json (per Remotion), farmacia/public/detersione2/base.mp4, out/d2_mix.wav.
uso: python3 farmacia/detersione2/build_edit.py"""
import difflib, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC_VIDEO = os.path.join(ROOT, 'farmacia', 'public', 'detersione2', 'girato.mp4')
SRC_AUDIO = os.path.join(ROOT, 'farmacia', 'detersione2_src', 'audio', 'voice.wav')
BASE = os.path.join(ROOT, 'farmacia', 'public', 'detersione2', 'base.mp4')
SFX = os.path.join(HERE, 'sfx')
OUT = os.path.join(ROOT, 'out')
os.makedirs(OUT, exist_ok=True)
FPS = 30
END_HOLD = 3.6
VOICE_LUFS = -16
MUSIC_LUFS = -26

# riprese buone (inizio, fine) nel girato unito (parte 1 + parte 2): i confini vengono agganciati ai minimi di energia,
# poi le pause interne oltre 0,45 s sono asciugate
RANGES = [
    (0.00, 11.78, "Protezione solare, trucco, inquinamento: ogni sera la tua pelle fa i conti con quello che ha incontrato durante tutta la giornata. E da noi, lo sai, soprattutto lo smog è tanto."),
    (19.60, 53.84, "La sera però è il momento di togliere tutto, ma bisogna farlo con cura. Oggi vi parleremo della doppia detersione, di cui tanto si parla. Doppia vuol dire che si utilizzano due detergenti diversi, ma che si completano. Il primo è un olio o un balsamo che scioglie sebo, scioglie il solare e tutti i residui oleosi. Si applica sulla pelle asciutta, si emulsiona con un po' di acqua tiepida e praticamente dopo si risciacqua. Il secondo invece può essere una mousse o una schiuma delicata, per ridurre il sudore e tutte le impurità."),
    (61.38, 65.46, "In questo modo la pelle risulta pulita a fondo, senza però strofinare, ed"),
    (66.62, 84.72, "apparirà sicuramente più luminosa e morbida. Inoltre il siero e la crema, dopo, lavoreranno meglio in combinata. Attenzione però: questo non serve a tutte e non si fa neanche tutte le sere. Se la pelle tira o è arrossata, allora devi fermarti: è meglio un solo passaggio, ma più delicato."),
    (92.32, 97.62, "Ti va di scoprire se la doppia detersione fa al caso tuo? Vieni a scoprirlo con noi, ti aspettiamo."),
]
TEXT = ' '.join(r[2] for r in RANGES)

import wave
import numpy as np
_w0 = wave.open(SRC_AUDIO); _sr0 = _w0.getframerate()
_x0 = np.frombuffer(_w0.readframes(_w0.getnframes()), np.int16) / 32768.0
_h0 = int(0.02 * _sr0); _n0 = len(_x0) // _h0
_db0 = 20 * np.log10(np.sqrt((_x0[:_n0 * _h0].reshape(_n0, _h0) ** 2).mean(1)) + 1e-9)


def snap(t, before):
    """minimo di energia solo prima (inizio) o solo dopo (fine) del confine Whisper: nessuna sillaba tagliata"""
    i0, i1 = (int((t - 0.3) / 0.02), int(t / 0.02)) if before else (int(t / 0.02), int((t + 0.22) / 0.02))
    i0 = max(0, i0); i1 = max(i0 + 1, i1)
    k = i0 + int(np.argmin(_db0[i0:i1]))
    return round(k * 0.02 + 0.01, 3)


_thr = np.percentile(_db0, 90) - 24
EXACT = {65.46, 66.62}   # taglio dentro "ed appare sicuramente, apparirà": resta "ed apparirà"
SEGS = []
for a, b, _ in RANGES:
    a = a if a in EXACT else snap(a, True)
    b = b if b in EXACT else snap(b, False)
    i, cur = int(a / 0.02), a
    end = int(b / 0.02)
    while i < end:
        if _db0[i] <= _thr:
            j = i
            while j < end and _db0[j] <= _thr:
                j += 1
            if (j - i) * 0.02 >= 0.45 and i * 0.02 > cur + 0.3:
                SEGS.append((cur, round(i * 0.02 + 0.1, 3)))
                cur = round(j * 0.02 - 0.14, 3)
            i = j
        else:
            i += 1
    SEGS.append((cur, b))


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
# un pezzo alla volta (memoria minima), ognuno con il numero esatto di fotogrammi, poi concatenati senza ricodifica
TMP = os.path.join(OUT, 'd2_segs'); os.makedirs(TMP, exist_ok=True)
lst = []
for i, sg in enumerate(segments):
    nfr = round((sg['end'] - sg['start']) * FPS)
    fn = os.path.join(TMP, f'seg{i:02d}.mp4')
    sh('ffmpeg', '-loglevel', 'error', '-y', '-ss', f"{sg['src']:.3f}", '-i', SRC_VIDEO, '-frames:v', str(nfr), '-an', '-vf', f'fps={FPS}',
       '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-g', '15', '-pix_fmt', 'yuv420p', fn)
    lst.append(f"file '{fn}'")
open(os.path.join(TMP, 'list.txt'), 'w').write('\n'.join(lst) + '\n')
sh('ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(TMP, 'list.txt'), '-vf',
   f'tpad=stop_mode=clone:stop_duration={END_HOLD},fps={FPS}', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-g', '15', '-pix_fmt', 'yuv420p', BASE)

# ---------------------------------------------------------------- parole: Whisper -> testo corretto
ww = json.load(open(os.path.join(HERE, 'whisper_words.json')))
wtok = []   # (token normalizzato, start, end) del girato
for w in ww:
    if not any(a - 0.3 <= w['s'] < b + 0.1 for a, b, _ in RANGES):
        continue
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
    'protezione': 0.15, 'trucco': at('trucco,'), 'inquinamento': at('inquinamento:'), 'ogni': round(at('ogni') - 0.1, 3), 'danoi': at('noi,'), 'smog': at('smog'),
    'sera2': round(at('sera', 2) - 0.25, 3), 'oggi': at('Oggi'), 'due': at('due'), 'primo': round(at('primo') - 0.3, 3), 'sebo': at('sebo,'),
    'asciutta': at('asciutta,'), 'acqua': at('acqua'), 'secondo': round(at('secondo') - 0.3, 3), 'mousse': at('mousse'), 'sudore': at('sudore'),
    'questo': round(at('questo', 1) - 0.4, 3), 'pulita': at('pulita'), 'luminosa': at('luminosa'), 'siero': round(at('siero') - 0.45, 3),
    'attenzione': at('Attenzione'), 'sere': at('sere.'), 'se': round(at('Se') - 0.1, 3), 'meglio2': at('meglio', 2),
    'tiva': round(at('Ti') - 0.1, 3), 'vieni': at('Vieni'),
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
voice = os.path.join(OUT, 'd2_voice.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', SRC_AUDIO, '-filter_complex', ';'.join(af), '-map', '[a]', '-ar', '48000', '-ac', '1', voice)

music = os.path.join(OUT, 'd2_music.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(HERE, 'music.mp3'), '-af',
   f"atrim=0:{total},loudnorm=I={MUSIC_LUFS}:TP=-4:LRA=11,afade=t=in:d=0.25,afade=t=out:st={total - 1.8}:d=1.8",
   '-ar', '48000', '-ac', '2', music)

# transizioni: whoosh solo sui tagli clip (entrata e uscita), picco sul fotogramma del taglio; pop morbido su schede e chip
WPEAK = 0.10   # picco del whoosh2 nel file
CUTS = [A['ogni'], A['danoi'] - 0.3, A['questo'], A['siero'], A['se'], A['meglio2'] - 0.1, A['endIn']]
EV = [(c - WPEAK, 'whoosh2', -9) for c in CUTS]
EV += [(t, 'pop2', -8) for t in [0.15, A['trucco'], A['inquinamento'], A['smog'], A['sera2'], A['oggi'], A['primo'], A['sebo'], A['asciutta'], A['acqua'],
                                 A['secondo'], A['mousse'], A['sudore'], A['pulita'], A['luminosa'], A['siero'] + 0.3, A['attenzione'] + 0.6, A['sere'],
                                 A['se'] + 0.2, A['meglio2'], A['tiva'], A['vieni']]]
EV += [(A['endIn'] + 0.2, 'logo', -6)]
ins, fl = [], []
for k, (t, name, g) in enumerate(EV):
    ins += ['-i', os.path.join(SFX, f'{name}.mp3')]
    fl.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g}dB,adelay={int(t * 1000)}|{int(t * 1000)}[e{k}]")
fl.append(''.join(f'[e{k}]' for k in range(len(EV))) + f"amix=inputs={len(EV)}:normalize=0,apad=whole_dur={total},atrim=0:{total}[x]")
sfx = os.path.join(OUT, 'd2_sfx.wav')
sh('ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[x]', '-ar', '48000', '-ac', '2', sfx)

mix = os.path.join(OUT, 'd2_mix.wav')
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
