# Golf GTI Performance 2019 — stessa grammatica dei reel A3: parlato tagliato, dettagli sopra la voce, numeri e tag a tempo, musica in silenzio su scarico e sketch
import json, os, sys
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
FPS = 30
BEAT = 60 / 124
END = 3.4
SW = json.load(open(os.path.join(R, '../work/n3/segwords.json')))
q = lambda x: round(round(x * FPS) / FPS, 4)

t, segs, words = 0.0, [], []
for k, (sg, ws) in enumerate(zip(SEGS, SW)):
    c, a, b = sg[:3]
    o = sg[3] if len(sg) > 3 else {}
    rate = o.get('rate', 1.0)
    d = q((b - a) / rate)
    z = 1.0 if not segs or segs[-1]['clip'] != c else (1.14 if segs[-1]['z'] == 1.0 else 1.0)
    segs.append(dict(clip=c, i=a, o=b, at=round(t, 4), d=d, z=z, rate=rate, mute=bool(o.get('mute')), nat=bool(o.get('nat'))))
    for j, (wt, w, g) in enumerate(ws):
        e = ws[j + 1][0] if j + 1 < len(ws) else min(wt + 0.7, b - a)
        words.append(dict(t=round(t + wt, 3), e=round(t + e, 3), w=w, g=bool(g), seg=k))
    t = round(t + d, 4)
total = t


def W(i, word, n=0):
    return [x['t'] for x in words if x['seg'] == i and x['w'].lower().strip(',:.?!') == word.lower()][n]


S = lambda i: segs[i]['at']
E_ = lambda i: q(segs[i]['at'] + segs[i]['d'])

subs, cur = [], []
def flush():
    global cur
    if cur:
        subs.append(cur); cur = []
for w in words:
    if cur and (cur[-1]['seg'] != w['seg'] or len(cur) >= 3 or sum(len(x['w']) + 1 for x in cur) + len(w['w']) > 17 or w['t'] - cur[-1]['e'] > 0.35 or cur[-1]['w'][-1] in '.?!'):
        flush()
    cur.append(w)
flush()
chunks = []
for k, c in enumerate(subs):
    e = c[-1]['e'] + 0.12
    if k + 1 < len(subs):
        e = min(e, subs[k + 1][0]['t'])
    e = min(e, E_(c[-1]['seg']))
    chunks.append(dict(t=c[0]['t'], e=round(e, 3), words=[dict(w=x['w'].rstrip(',:'), t=x['t'], g=x['g']) for x in c]))

B = [
    dict(s=S(7), e=E_(7), kind='v', src='9853', frm=0.5, rate=1, tr='zoom'),
    dict(s=W(9, 'diamantati') - 0.1, e=W(9, 'le') - 0.05, kind='v', src='9876', frm=0.2, rate=1, tr='whip'),
    dict(s=W(9, 'pinze') - 0.1, e=W(9, 'che') - 0.05, kind='v', src='9854', frm=0.2, rate=1, tr='slide'),
    dict(s=W(10, '81.000') - 0.2, e=E_(10), kind='p', src='p_13', x0=0.44, x1=0.58, z0=1.05, z1=1.12, tr='zoom'),
    dict(s=W(11, 'filo') - 0.1, e=E_(11), kind='v', src='9868', frm=0.3, rate=1, tr='whipL'),
    dict(s=W(12, 'battitacco') - 0.1, e=E_(12), kind='v', src='9862', frm=0.2, rate=1, tr='zoom'),
    dict(s=W(13, 'interni') - 0.1, e=E_(13), kind='v', src='9863', frm=0.3, rate=1, tr='whip'),
    dict(s=W(14, 'sportivo') - 0.1, e=E_(14), kind='v', src='9860', frm=0.4, rate=1, tr='slide'),
    dict(s=W(15, 'cavalli') - 0.25, e=E_(15), kind='v', src='9859', frm=0.4, rate=1, tr='zoom'),
    dict(s=W(21, 'centrale') - 0.1, e=W(21, 'ha') - 0.05, kind='v', src='9861', frm=0.8, rate=1, tr='whipL'),
    dict(s=S(22), e=E_(22), kind='p', src='p_14', x0=0.36, x1=0.6, z0=1.0, z1=1.0, tr='whip'),
    dict(s=W(27, 'tettuccio') - 0.1, e=E_(27), kind='v', src='9864', frm=0.6, rate=1, tr='whip'),
    dict(s=S(28), e=E_(28), kind='v', src='9849', frm=1.0, rate=1, tr='slide'),
]
broll = []
for b in B:
    b['s'], b['e'] = q(b['s']), q(b['e'])
    broll.append(b)
cuts = sorted({s['at'] for s in segs} | {total})
for b in broll:
    for c in cuts:
        if 0 < c - b['e'] < 0.4: b['e'] = c
        if 0 < b['s'] - c < 0.3: b['s'] = c
rets = [b['e'] for b in broll if b['e'] < total - 0.05]

fx = [
    dict(k='title', s=S(4) + 0.03, e=E_(5), a='GOLF GTI', b='PERFORMANCE', tags=[['2019', S(4) + 0.5], ['245 CV', S(5) + 0.05]]),
    dict(k='tags', s=W(7, 'full') - 0.05, e=E_(7), items=[['FARI FULL LED', W(7, 'full') - 0.05]]),
    dict(k='num', s=W(8, '19') - 0.02, e=E_(8), n=19, unit='″', label='CERCHI DIAMANTATI', frm=14),
    dict(k='tags', s=W(9, 'bicolore') - 0.05, e=E_(9), items=[['BICOLORE', W(9, 'bicolore') - 0.05], ['PINZE ROSSE', W(9, 'pinze') - 0.05]]),
    dict(k='tags', s=W(10, '2019') - 0.05, e=W(10, '81.000') - 0.1, items=[['ANNO 2019', W(10, '2019') - 0.05]]),
    dict(k='num', s=W(10, '81.000') - 0.05, e=E_(10), n=81141, unit='KM', label='CHILOMETRI', frm=60000, big=1),
    dict(k='stack', s=W(13, 'interni') - 0.05, e=E_(14), items=[['INTERNI IN PELLE', W(13, 'interni') - 0.05], ['VOLANTE SPORTIVO', W(14, 'Volante') - 0.05]]),
    dict(k='num', s=W(15, '245') - 0.02, e=E_(15), n=245, unit='CV', label='POTENZA', frm=150),
    dict(k='tags', s=S(17) + 0.15, e=E_(17), items=[['ASCOLTA.', S(17) + 0.15]]),
    dict(k='tags', s=W(18, 'DSG') - 0.05, e=E_(19), items=[['CAMBIO DSG', W(18, 'DSG') - 0.05]]),
    dict(k='stack', s=W(21, "l'infotainment") - 0.05, e=E_(23), items=[['INFOTAINMENT', W(21, "l'infotainment") - 0.05], ['RETROCAMERA', W(23, 'Retrocamera') - 0.05]]),
    dict(k='tags', s=W(27, 'tettuccio') - 0.05, e=E_(28), items=[['TETTO APRIBILE', W(27, 'tettuccio') - 0.05]]),
    dict(k='tags', s=W(31, 'vetri') - 0.05, e=E_(31), items=[['VETRI OSCURATI', W(31, 'vetri') - 0.05]]),
]
for f in fx:
    f['s'], f['e'] = q(f['s']), q(f['e'])

# silenzi della musica: scarico, sketch dei vetri, sgasata finale
silence = [[S(17), S(18)], [q(S(30) - 0.05), S(32)], [S(36), total]]
sfx = [dict(t=S(4), n='hit', db=-9), dict(t=S(5), n='hit', db=-10), dict(t=S(18), n='hit', db=-10), dict(t=S(32), n='hit', db=-10)]
sfx += [dict(t=round(b['s'] - 0.1, 3), n='whoosh', db=-13) for b in broll]
sfx += [dict(t=f['s'], n='hit', db=-11) for f in fx if f['k'] == 'num']
sfx += [dict(t=it[1], n='tick', db=-13) for f in fx for it in f.get('items', [])]
sfx += [dict(t=total, n='hit', db=-7)]
tl = dict(fps=FPS, beat=BEAT, total=total, dur=round(total + END, 4), segs=segs, hook=[], silence=silence, broll=broll, rets=rets, subs=chunks, fx=fx, sfx=sfx,
          end=dict(kind='p', src='p_01', x0=0.36, x1=0.42, z0=1.04, z1=1.12))
json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print(f'parlato fino a {total:.2f}s, totale {total + END:.2f}s, {len(chunks)} blocchi, {len(broll)} inserti, {len(fx)} grafiche')
for b in broll: print('  inserto', b['s'], b['e'], b['src'], round(b['e'] - b['s'], 2))
print('silenzi', silence)
