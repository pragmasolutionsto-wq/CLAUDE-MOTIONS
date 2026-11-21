# Audi A3 Identity Black 2024 (bianca) — stessa grammatica del reel A3 2026: parlato tagliato, sketch, inserti, numeri e tag a tempo
import json, os, sys
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
FPS = 30
BEAT = 60 / 124
END = 3.4
SW = json.load(open(os.path.join(R, '../work/n2/segwords.json')))
q = lambda x: round(round(x * FPS) / FPS, 4)

t, segs, words = 0.0, [], []
for k, (sg, ws) in enumerate(zip(SEGS, SW)):
    c, a, b = sg[:3]
    o = sg[3] if len(sg) > 3 else {}
    rate = o.get('rate', 1.0)
    d = q((b - a) / rate)
    z = 1.0 if not segs or segs[-1]['clip'] != c else (1.14 if segs[-1]['z'] == 1.0 else 1.0)
    segs.append(dict(clip=c, i=a, o=b, at=round(t, 4), d=d, z=z, rate=rate, mute=bool(o.get('mute'))))
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
    dict(s=W(7, 'da') - 0.1, e=E_(7), kind='v', src='9732', frm=0.2, rate=1, tr='whip'),
    dict(s=W(8, 'S line') - 0.1, e=W(8, 'che', 1) - 0.05, kind='v', src='9733', frm=3.2, rate=1, tr='whipL'),
    dict(s=W(8, 'interno') - 0.25, e=E_(8), kind='v', src='9737', frm=0.4, rate=1, tr='slide'),
    dict(s=W(13, 'traforato') - 0.1, e=E_(13), kind='p', src='p_11', x0=0.36, x1=0.5, z0=1.0, z1=1.08, tr='zoom'),
    dict(s=W(15, 'tante') - 0.1, e=E_(15), kind='p', src='p_13', x0=0.36, x1=0.62, z0=1.0, z1=1.0, tr='whip'),
    dict(s=W(22, 'Identity') - 0.15, e=E_(22), kind='v', src='9738', frm=0.2, rate=1, tr='zoom'),
    dict(s=W(24, '26.000') + 0.45, e=W(24, 'non') - 0.1, kind='p', src='p_14', x0=0.42, x1=0.56, z0=1.05, z1=1.12, tr='whipL'),
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
    dict(k='title', s=S(1) + 0.03, e=E_(2), a='AUDI A3', b='IDENTITY BLACK', tags=[['2024', S(1) + 0.5], ['150 CV', S(2) + 0.05]]),
    dict(k='tags', s=W(3, 'TFSI') - 0.05, e=E_(3), items=[['35 TFSI', W(3, 'TFSI') - 0.05], ['MILD HYBRID', W(3, 'mild hybrid') - 0.05], ['NIENTE CAVETTO', W(3, 'cavetto') - 0.05]]),
    dict(k='tags', s=W(5, 'Fari full'), e=E_(5), items=[['FULL LED', W(5, 'LED') - 0.05]]),
    dict(k='num', s=W(7, '19') - 0.05, e=E_(7), n=19, unit='″', label='AUDI SPORT', frm=14),
    dict(k='sline', s=W(8, 'S line') - 0.05, e=E_(8), items=[['ESTERNO', W(8, 'esterno') - 0.05], ['INTERNO', W(8, 'interno') - 0.05]]),
    dict(k='tags', s=S(11) + 0.25, e=E_(11), items=[['SEDILE DIETRO.', S(11) + 0.25]]),
    dict(k='tags', s=W(13, 'traforato') - 0.05, e=E_(13), items=[['VOLANTE TRAFORATO', W(13, 'traforato') - 0.05], ['S LINE', W(13, 'S line') - 0.05]]),
    dict(k='stack', s=W(14, 'cruise') - 0.05, e=W(15, 'tante') - 0.1, items=[['CRUISE CONTROL', W(14, 'cruise') - 0.05], ['PALETTE AL VOLANTE', W(15, 'palette') - 0.05]]),
    dict(k='title', s=W(22, 'Identity') - 0.1, e=E_(22), a='IDENTITY', b='BLACK', tags=[]),
    dict(k='num', s=W(24, '26.000') + 0.05, e=W(24, 'non') - 0.1, n=26973, unit='KM', label='CHILOMETRI', frm=9000, big=1),
]
for f in fx:
    f['s'], f['e'] = q(f['s']), q(f['e'])

sfx = [dict(t=S(1), n='hit', db=-9), dict(t=S(2), n='hit', db=-10), dict(t=round(S(11) - 0.05, 3), n='whoosh', db=-11), dict(t=S(12), n='hit', db=-10)]
sfx += [dict(t=round(b['s'] - 0.1, 3), n='whoosh', db=-13) for b in broll]
sfx += [dict(t=f['s'], n='hit', db=-11) for f in fx if f['k'] == 'num']
sfx += [dict(t=it[1], n='tick', db=-13) for f in fx for it in f.get('items', [])]
sfx += [dict(t=round(total - 0.9, 3), n='riser', db=-14), dict(t=total, n='hit', db=-7)]
tl = dict(fps=FPS, beat=BEAT, total=total, dur=round(total + END, 4), segs=segs, hook=[], broll=broll, rets=rets, subs=chunks, fx=fx, sfx=sfx,
          end=dict(kind='v', src='9777', frm=10.6, rate=1))
json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print(f'parlato fino a {total:.2f}s, totale {total + END:.2f}s, {len(chunks)} blocchi, {len(broll)} inserti, {len(fx)} grafiche')
for b in broll: print('  inserto', b['s'], b['e'], b['src'], round(b['e'] - b['s'], 2))
