"""Montaggio: dai sottotitoli + VAD ricava i segmenti da tenere, le pause e le parole temporizzate.
Scrive public/edl.json (letto da Remotion e da audio.py)."""
import json, os, re
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

HEAD = 0.35  # i primi decimi di ogni clip sono il fruscio del tasto REC
TH = 22  # dB sotto il 95° percentile = parlato

PRE, POST = 0.09, 0.14  # respiro prima/dopo il parlato
MAXSIL, KEEP = 0.42, 0.24  # pause interne oltre MAXSIL ridotte a KEEP (jump cut)
MINSHOT = 1.4  # niente inquadrature più corte di così
# pause drammatiche dopo una frase: silenzio reale di lei in camera
BEAT = {
    'Come funziona la tua farmacia?': 0.40,
    'Come lavorano i tuoi collaboratori?': 0.40,
    'Come si comportano i tuoi clienti?': 0.40,
    'Cosa dicono della tua farmacia?': 0.45,
    'Parla di te.': 0.55,
    'tua farmacia aspetta.': 0.45,
    'Scopri di più cliccando il link.': 0.30,
}
# l'ultimo "Parla di te." resta sospeso più a lungo: è il momento in cui tutto converge su di te
LAST_HOLD = float(os.environ.get('LAST_HOLD', '1.3'))
# correzioni al testo trascritto
FIX = {'all\'Università': 'all’Università', 'un\'aula': 'un’aula'}


def srt(path):
    out = []
    for b in open(path, encoding='utf-8').read().strip().split('\n\n'):
        l = b.strip().split('\n')
        a, z = [sum(float(x) * m for x, m in zip(t.replace(',', '.').split(':'), (3600, 60, 1))) for t in l[1].split(' --> ')]
        txt = re.sub(r'\(Trascritto da TurboScribe[^)]*\)\s*', '', ' '.join(l[2:])).strip()
        for k, v in FIX.items():
            txt = txt.replace(k, v)
        out.append([a, z, txt])
    return out


def vad(n):
    x, sr = sf.read(P('src', f'c{n}.wav'))
    hop, fr = sr // 100, int(sr * 0.03)
    db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) + 1e-9 for i in range(0, len(x) - fr, hop)]))
    on = db > np.percentile(db, 95) - TH
    on[: int(HEAD * 100)] = False
    return on, len(x) / sr


V, OFF, DUR, o = {}, {}, {}, 0.0
for n in range(1, 3):
    V[n], DUR[n] = vad(n)
    OFF[n] = o
    o += DUR[n]

# 1. cue -> clip, bordi stretti sul parlato reale
items = []
for a, z, t in srt(P('sottotitoli.srt')):
    m = (a + z) / 2
    n = max(k for k in OFF if OFF[k] <= m)
    la, lz = a - OFF[n], z - OFF[n]
    on = V[n]
    idx = [i for i in range(int(max(0, la - 0.45) * 100), min(int((lz + 0.35) * 100), len(on))) if on[i]]
    items.append(dict(clip=n, s=idx[0] / 100, e=(idx[-1] + 3) / 100, text=t, la=la, lz=lz))
# nel parlato continuo il confine tra due cue è quello del trascrittore, non il bordo del VAD
for p, q in zip(items, items[1:]):
    if p['clip'] == q['clip'] and q['la'] - p['lz'] < 0.3:
        b = (p['lz'] + q['la']) / 2
        p['e'], q['s'] = min(p['e'], b), max(q['s'], b)

# 2. blocchi per clip: dal primo all'ultimo parlato, più la pausa drammatica
segs = []
for i, it in enumerate(items):
    if segs and segs[-1]['clip'] == it['clip']:
        segs[-1]['cues'].append(i)
    else:
        segs.append(dict(clip=it['clip'], cues=[i]))
for g in segs:
    first, last = items[g['cues'][0]], items[g['cues'][-1]]
    g['s'] = max(HEAD - 0.05, first['s'] - PRE)
    g['talk_end'] = last['e']
    e = min(DUR[g['clip']] - 0.05, last['e'] + max(POST, LAST_HOLD if g['clip'] == 1 else BEAT.get(last['text'], 0)))
    # la coda non deve arrivare al rumore successivo (mano che stoppa la registrazione)
    on = V[g['clip']]
    nxt = next((j / 100 for j in range(int(last['e'] * 100) + 5, len(on)) if on[j]), None)
    g['e'] = min(e, nxt - 0.06) if nxt else e

# 3. jump cut sulle pause interne lunghe
cut = []
for g in segs:
    on, a = V[g['clip']], g['s']
    r0 = None
    for j in range(int(g['s'] * 100), int(g['talk_end'] * 100)):
        if not on[j] and r0 is None:
            r0 = j
        elif on[j] and r0 is not None:
            # dopo una frase chiave la pausa resta più lunga (respiro drammatico)
            keep = next((BEAT[it['text']] for it in items if it['clip'] == g['clip'] and it['text'] in BEAT and abs(it['e'] - r0 / 100) < 0.2), KEEP)
            if (j - r0) / 100 > max(MAXSIL, keep + 0.12) and r0 / 100 > a + MINSHOT and g['talk_end'] - j / 100 > MINSHOT:
                cut.append(dict(clip=g['clip'], s=a, e=r0 / 100 + keep / 2))
                a = j / 100 - keep / 2
            r0 = None
    cut.append(dict(clip=g['clip'], s=a, e=g['e']))
segs = cut
# taglio secco all'inizio di ogni domanda e di ogni "Parla di te.": il ritmo domanda/ritornello (nessun tempo rimosso)
for it in items[:8]:
    x = it['s'] - 0.1
    for k, g in enumerate(segs):
        if g['clip'] == it['clip'] and g['s'] + 0.3 < x < g['e'] - 0.3:
            segs[k:k + 1] = [dict(clip=g['clip'], s=g['s'], e=x), dict(clip=g['clip'], s=x, e=g['e'])]
            break

t = 0.0
for g in segs:
    g['s'], g['e'] = round(g['s'], 3), round(g['e'], 3)
    g['out'] = round(t, 3)
    t += g['e'] - g['s']
speech = round(t, 3)


def to_out(clip, lt):
    """tempo locale di clip -> tempo montato (una pausa tagliata si aggancia al segmento successivo)"""
    nxt = None
    for g in segs:
        if g['clip'] != clip:
            continue
        if g['s'] <= lt <= g['e']:
            return g['out'] + lt - g['s']
        if lt < g['s'] and (nxt is None or g['s'] < nxt['s']):
            nxt = g
    return nxt['out'] if nxt else speech


def syl(w):
    return max(1, len(re.findall(r'[aeiouàèéìòùy]+', w.lower())))


# 4. parole: distribuite per sillabe sui soli frame di parlato della cue
words = []
for ci, it in enumerate(items):
    ws = it['text'].split()
    wt = np.array([syl(w) + 0.35 for w in ws], float)
    edges = np.concatenate([[0], np.cumsum(wt)]) / wt.sum()
    on = V[it['clip']]
    fr = [j / 100 for j in range(int(it['s'] * 100), min(int(it['e'] * 100), len(on))) if on[j]] or [it['s']]
    at = lambda u: fr[min(len(fr) - 1, int(u * (len(fr) - 1) + 0.5))]
    for j, w in enumerate(ws):
        words.append(dict(w=w, t=round(to_out(it['clip'], at(edges[j])), 3), te=round(to_out(it['clip'], at(edges[j + 1])), 3), cue=ci))
for p, q in zip(words, words[1:]):
    q['t'] = max(q['t'], p['t'] + 0.06)
    p['te'] = max(p['t'] + 0.06, min(p['te'], q['t']))

for g in segs:
    g.pop('cues', None)
    g.pop('talk_end', None)
json.dump(dict(segs=segs, words=words, cues=[dict(text=i['text'], t=round(to_out(i['clip'], i['s']), 3), te=round(to_out(i['clip'], i['e']), 3)) for i in items], speech=speech),
          open(P('public', 'edl.json'), 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    for g in segs:
        txt = ' '.join(w['w'] for w in words if g['out'] <= w['t'] < g['out'] + g['e'] - g['s'])
        print(f"c{g['clip']:<2} {g['s']:6.2f}-{g['e']:6.2f} ({g['e'] - g['s']:5.2f}) out {g['out']:6.2f}  {txt}")
    print('parlato montato:', speech)
