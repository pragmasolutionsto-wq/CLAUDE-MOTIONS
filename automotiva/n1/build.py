# Audi A3 Sportback 2026 — timeline "virale": hook a tempo, parlato tagliato, dettagli/foto a tutto schermo, numeri e tag sincronizzati alle parole
import json, os, sys
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
FPS = 30
BEAT = 60 / 124
HOOK = round(round(6 * BEAT * FPS) / FPS, 4)   # 6 battute di apertura
END = 3.4
SW = json.load(open(os.path.join(R, '../work/n1/segwords.json')))
q = lambda x: round(round(x * FPS) / FPS, 4)

t, segs, words = HOOK, [], []
for k, ((c, a, b), ws) in enumerate(zip(SEGS, SW)):
    # stesso clip tagliato di seguito: alterna lo zoom per far leggere il taglio come cambio inquadratura
    z = 1.0 if not segs or segs[-1]['clip'] != c else (1.14 if segs[-1]['z'] == 1.0 else 1.0)
    segs.append(dict(clip=c, i=a, o=b, at=round(t, 4), z=z))
    for j, (wt, w, g) in enumerate(ws):
        e = ws[j + 1][0] if j + 1 < len(ws) else min(wt + 0.7, b - a)
        words.append(dict(t=round(t + wt, 3), e=round(t + e, 3), w=w, g=bool(g), seg=k))
    t += b - a
total = round(t, 4)


def W(i, word, n=0):
    """istante d'uscita della parola `word` (n-esima) nel segmento i"""
    return [x['t'] for x in words if x['seg'] == i and x['w'].lower().strip(',:') == word.lower()][n]


S = lambda i: segs[i]['at']
E_ = lambda i: q(segs[i]['at'] + segs[i]['o'] - segs[i]['i'])

# sottotitoli: blocchi da 1-3 parole, mai a cavallo di due segmenti
subs, cur = [], []
def flush():
    global cur
    if cur:
        subs.append(cur); cur = []
for w in words:
    if cur and (cur[-1]['seg'] != w['seg'] or len(cur) >= 3 or sum(len(x['w']) + 1 for x in cur) + len(w['w']) > 17 or w['t'] - cur[-1]['e'] > 0.35):
        flush()
    cur.append(w)
flush()
chunks = []
for k, c in enumerate(subs):
    e = c[-1]['e'] + 0.12
    if k + 1 < len(subs):
        e = min(e, subs[k + 1][0]['t'])
    chunks.append(dict(t=c[0]['t'], e=round(e, 3), words=[dict(w=x['w'].rstrip(',:'), t=x['t'], g=x['g']) for x in c]))

# apertura: tre inquadrature a tempo + frase gancio
hook = [
    dict(s=0, e=q(2 * BEAT), kind='v', src='9784', frm=11.2, rate=0.8, text=["QUEST'", 'A3'], gold=1),
    dict(s=q(2 * BEAT), e=q(4 * BEAT), kind='v', src='9783', frm=0.3, rate=0.8, text=['HA UN', 'DETTAGLIO'], gold=1),
    dict(s=q(4 * BEAT), e=HOOK, kind='p', src='p_01', x0=0.30, x1=0.42, z0=1.0, z1=1.1, text=['CHE NON', 'TI ASPETTI.'], gold=1),
]

# dettagli e foto a tutto schermo sopra il parlato
B = [
    dict(s=W(3, '19') - 0.08, e=E_(3), kind='v', src='9780', frm=0.3, rate=1, tr='whip'),
    dict(s=W(4, 'Matrix') - 0.12, e=E_(4), kind='v', src='9785', frm=0.3, rate=1, tr='zoom'),
    dict(s=W(5, 'anteriori') - 0.3, e=W(5, 'sensori', 1) - 0.05, kind='v', src='9782', frm=0.4, rate=1, tr='whipL'),
    dict(s=W(5, 'posteriori') - 0.35, e=E_(5), kind='p', src='p_04', x0=0.44, x1=0.56, z0=1.0, z1=1.08, tr='whip'),
    dict(s=W(8, 'pelle') - 0.15, e=E_(8), kind='v', src='9791', frm=1.3, rate=1, tr='slide'),
    dict(s=W(10, 'Apple') - 0.1, e=E_(10), kind='v', src='9781', frm=15.0, rate=1, tr='zoom'),
    dict(s=W(11, '360°') - 0.3, e=E_(11), kind='p', src='p_13', x0=0.34, x1=0.66, z0=1.0, z1=1.0, tr='whip'),
    dict(s=W(12, 'automatico') - 0.1, e=E_(12), kind='v', src='9781', frm=23.2, rate=1, tr='whipL'),
    dict(s=S(14) + 0.3, e=E_(14), kind='p', src='p_12', x0=0.40, x1=0.56, z0=1.0, z1=1.06, tr='zoom'),
]
broll = []
for b in B:
    b['s'], b['e'] = q(b['s']), q(b['e'])
    broll.append(b)
# niente inquadrature-lampo: se il dettaglio finisce a meno di 0.4 s da un taglio, aggancialo al taglio
cuts = sorted({s['at'] for s in segs} | {total})
for b in broll:
    for c in cuts:
        if 0 < c - b['e'] < 0.4: b['e'] = c
        if 0 < b['s'] - c < 0.3: b['s'] = c
rets = [b['e'] for b in broll if b['e'] < total - 0.05]

# grafiche sincronizzate (s=entrata, e=uscita)
fx = [
    dict(k='title', s=S(0) + 0.05, e=E_(0), a='AUDI A3', b='SPORTBACK', tags=[['1.5 TFSI', W(0, '1.5')], ['MILD HYBRID', W(0, 'mild')]]),
    dict(k='num', s=W(1, '150') - 0.05, e=E_(1), n=150, unit='CV', label='POTENZA', frm=90),
    dict(k='tags', s=W(2, 'automatico') - 0.05, e=E_(2), items=[['S TRONIC', W(2, 'S tronic') - 0.05], ['7 RAPPORTI', W(2, 'sette') - 0.05]]),
    dict(k='num', s=W(3, '19') - 0.05, e=E_(3), n=19, unit='″', label='CERCHI IN LEGA', frm=14),
    dict(k='tags', s=W(4, 'Matrix') - 0.05, e=E_(4), items=[['MATRIX LED', W(4, 'Matrix') - 0.05], ['NUOVA GENERAZIONE', W(4, 'nuova') - 0.05]]),
    dict(k='sonar', s=W(5, 'Sensori') , e=E_(5), items=[['ANTERIORI', W(5, 'anteriori') - 0.05], ['POSTERIORI', W(5, 'posteriori') - 0.05]]),
    dict(k='sline', s=W(6, 'S line') , e=E_(6), items=[['ESTERNO', W(6, 'esterno') - 0.05], ['INTERNO', W(6, 'interno') - 0.05]]),
    dict(k='stack', s=W(10, 'Apple') - 0.05, e=E_(10), items=[['APPLE CARPLAY', W(10, 'Apple') - 0.05], ['ANDROID AUTO', W(10, 'Android') - 0.05], ['NAVIGAZIONE', W(10, 'navigazione') - 0.05]]),
    dict(k='num', s=W(11, '360°') - 0.08, e=E_(11), n=360, unit='°', label='TELECAMERA', frm=180),
    dict(k='num', s=W(12, 'tre') - 0.08, e=E_(12), n=3, unit='ZONE', label='CLIMA AUTOMATICO', frm=1),
    dict(k='tags', s=W(13, 'multifunzione') - 0.05, e=E_(13), items=[['VOLANTE MULTIFUNZIONE', W(13, 'multifunzione') - 0.05], ['PALETTE AL VOLANTE', W(13, 'palette') - 0.05]]),
    dict(k='num', s=W(18, 'meno') - 0.05, e=E_(18), n=7788, unit='KM', label='CHILOMETRI REALI', frm=1200, big=1),
    dict(k='date', s=W(19, 'giugno') - 0.05, e=E_(19), a='06', b='2026', label='IMMATRICOLATA'),
]
for f in fx:
    f['s'], f['e'] = q(f['s']), q(f['e'])

sfx = [dict(t=h['s'], n='hit', db=-9) for h in hook]
sfx += [dict(t=round(b['s'] - 0.1, 3), n='whoosh', db=-13) for b in broll]
sfx += [dict(t=f['s'], n='hit', db=-11) for f in fx if f['k'] in ('num', 'date')]
sfx += [dict(t=it[1], n='tick', db=-13) for f in fx if 'items' in f for it in f['items']]
sfx += [dict(t=round(total - 0.9, 3), n='riser', db=-14), dict(t=total, n='hit', db=-7)]
tl = dict(fps=FPS, beat=BEAT, hookDur=HOOK, total=total, dur=round(total + END, 4), segs=segs, hook=hook, broll=broll, rets=rets, subs=chunks, fx=fx, sfx=sfx)
json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print(f'hook {HOOK}s, parlato fino a {total:.2f}s, totale {total + END:.2f}s, {len(chunks)} blocchi, {len(broll)} inserti, {len(fx)} grafiche')
for b in broll: print('  inserto', b['s'], b['e'], b['src'], round(b['e'] - b['s'], 2))
