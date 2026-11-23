# Consegna dell'auto donata a Denis — timeline empatica: stacchi morbidi tra le riprese, sottotitoli calmi, tre conferme alla consegna chiavi
import json, os, re, sys
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
FPS = 30; END = 4.0
SW = json.load(open(os.path.join(R, '../work/dono/segwords.json')))
GOLD = re.compile(r'^(Denis|gratuitamente|famiglia|famiglie|cielo|manna|benissimo|chiavi|revisione|voltura|pieno|fortuna|donare|iniziativa|mano)$', re.I)
q = lambda x: round(round(x * FPS) / FPS, 4)
t, segs, words = 0.0, [], []
for k, ((c, a, b, _), ws) in enumerate(zip(SEGS, SW)):
    same = bool(segs) and segs[-1]['clip'] == c
    z = (1.1 if segs[-1]['z'] == 1.0 else 1.0) if same else 1.0
    segs.append(dict(clip=c, i=a, o=b, at=round(t, 4), d=q(b - a), z=z, fade=not same and k > 0))
    for j, (wt, w) in enumerate(ws):
        e = ws[j + 1][0] if j + 1 < len(ws) else min(wt + 0.8, b - a)
        words.append(dict(t=round(t + wt, 3), e=round(t + e, 3), w=w, seg=k))
    t = round(t + q(b - a), 4)
total = t
W = lambda i, word: [x['t'] for x in words if x['seg'] == i and x['w'].lower().strip(',.!') == word][0]
subs, cur = [], []
for w in words:
    if cur and (cur[-1]['seg'] != w['seg'] or len(cur) >= 4 or sum(len(x['w']) + 1 for x in cur) + len(w['w']) > 22 or cur[-1]['w'][-1] in '.,!?:'):
        subs.append(cur); cur = []
    cur.append(w)
subs.append(cur)
chunks = []
for k, c in enumerate(subs):
    e = c[-1]['e'] + 0.2
    if k + 1 < len(subs): e = min(e, subs[k + 1][0]['t'])
    chunks.append(dict(t=c[0]['t'], e=round(e, 3), words=[dict(w=x['w'].rstrip(','), t=x['t'], g=bool(GOLD.match(x['w'].strip(',.!?:')))) for x in c]))
K = 21  # consegna chiavi
checks = dict(s=q(W(K, 'revisione') - 0.1), e=q(segs[K + 2]['at'] + segs[K + 2]['d']), items=[['Revisione fatta', W(K, 'revisione')], ['Voltura fatta', W(K, 'voltura')], ['Pieno offerto', W(K + 1, 'pieno')]])
tl = dict(fps=FPS, total=total, dur=round(total + END, 4), segs=segs, subs=chunks, title=dict(s=0.2, e=4.6), checks=checks, sfx=[])
json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print(f'parlato {total:.2f}s, totale {total + END:.2f}s, {len(chunks)} blocchi')
