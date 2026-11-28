# Presentazione del salone AutoMotiva — tour a ritmo: parlato tagliato, clip dell'auto sopra la voce, marchi in 3D,
# contatore dei tettucci, momenti comici in bianco e nero con la musica in silenzio, parolaccia coperta dal bip
import json, os, re, sys
R = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R)
from segs import SEGS
FPS = 30; END = 3.6
SW = json.load(open(os.path.join(R, '../work/s1/segwords.json')))
GOLD = re.compile(r'^(AutoMotiva|tettuccio|esclusiva|Unica|Brabus|A3|200|tre|GTI|TFSI|Scorpioneoro|oro|numerata|Cooper|Fiesta|Competition|cerchi|Grecale|Europa|strafull|X1|Opaco|Levante|Tonale|X2|90\.000|fresca|diesel|caro|benzina|208|panoramico|300|MHEV|spettacolo|dicembre|cammelli|felici|omaggio|panettone|\*\*\*)$', re.I)
q = lambda x: round(round(x * FPS) / FPS, 4)

t, segs, words = 0.0, [], []
for k, ((c, a, b, txt, o), ws) in enumerate(zip(SEGS, SW)):
    d = q(b - a)
    same = bool(segs) and segs[-1]['clip'] == c
    z = (1.14 if segs[-1]['z'] == 1.0 else 1.0) if same else 1.0
    sg = dict(clip=c, i=a, o=b, at=round(t, 4), d=d, z=z, rate=1.0, mute=bool(o.get('mute')), bw=bool(o.get('bw')), txt=txt)
    if o.get('bleep'):
        sg['bleep'] = [round(t + o['bleep'][0] - a, 3), round(t + o['bleep'][1] - a, 3)]
    segs.append(sg)
    for j, (wt, w) in enumerate(ws):
        e = ws[j + 1][0] if j + 1 < len(ws) else min(wt + 0.7, b - a)
        words.append(dict(t=round(t + wt, 3), e=round(t + e, 3), w=w, seg=k))
    t = round(t + d, 4)
total = t

def F(prefix, n=0):
    """indice del segmento il cui testo inizia con `prefix`"""
    return [i for i, s in enumerate(segs) if s['txt'].startswith(prefix)][n]
S = lambda i: segs[i]['at']
E_ = lambda i: q(segs[i]['at'] + segs[i]['d'])
def W(i, word, n=0):
    return [x['t'] for x in words if x['seg'] == i and x['w'].lower().strip(',:.?!…') == word.lower()][n]

# sottotitoli: blocchi da 1-3 parole, mai a cavallo di due segmenti
subs, cur = [], []
for w in words:
    if cur and (cur[-1]['seg'] != w['seg'] or len(cur) >= 3 or sum(len(x['w']) + 1 for x in cur) + len(w['w']) > 17 or cur[-1]['w'][-1] in '.?!:…'):
        subs.append(cur); cur = []
    cur.append(w)
subs.append(cur)
chunks = []
for k, c in enumerate(subs):
    e = c[-1]['e'] + 0.12
    if k + 1 < len(subs): e = min(e, subs[k + 1][0]['t'])
    e = min(e, E_(c[-1]['seg']))
    chunks.append(dict(t=c[0]['t'], e=round(e, 3), words=[dict(w=x['w'].rstrip(',:'), t=x['t'], g=bool(GOLD.match(x['w'].strip(',:.?!…')))) for x in c]))

# clip dell'auto sopra la voce: (segmento d'inizio, parola o None, segmento di fine, clip, da, transizione)
TR = ['whip', 'zoom', 'whipL', 'slide']
def BR(i0, word, i1, src, frm=0.3, lead=0.1):
    s = S(i0) if word is None else W(i0, word) - lead
    return dict(s=q(s), e=E_(i1), kind='v', src=src, frm=frm, rate=1)
sm, a3, ca, go, a35, ab, mi, fo, a1, gr, x1, le, to, x2, p2, cc = (F(p) for p in ['Smart Brabus', 'Audi A3,', 'Classe A 200', 'Golf GTI', 'Audi A3', 'Abarth Scorpioneoro', 'Mini Cooper', 'Ford Fiesta', 'Audi A1', 'Che dire', 'X1 così', 'Maserati Levante', 'Tonale col', 'BMW X2', '208 automatica', 'Classe C 300'])
a35 = F('Audi A3', 1)
B = [
    BR(sm, 'Tailor', sm + 1, '9922'),
    BR(a3 + 1, None, a3 + 1, '9923'),
    BR(ca, '200', ca, '9924', 0.6), BR(ca + 1, 'tre', ca + 1, '9925', 0.4), BR(ca + 2, '2025', ca + 2, '9926', 0.1),
    BR(go + 1, None, go + 1, '9927', 0.2),
    BR(a35 + 1, None, a35 + 1, '9928', 0.5),
    BR(ab, 'Scorpioneoro', ab, '9929', 0.4),
    BR(mi, 'tettuccio', mi, '9930', 0.8),
    BR(fo, 'col', fo, '9931', 0.3),
    BR(a1 + 1, None, a1 + 1, '9932', 0.4),
    BR(gr, 'Grecale', gr, '9933', 0.3),
    BR(x1 + 1, None, x1 + 1, '9934', 0.3),
    BR(le, 'Levante', le, '9935', 0.4),
    BR(to, 'col', to, '9936', 0.3),
    BR(x2 + 1, None, x2 + 1, '9937', 0.4),
    BR(cc, None, cc + 1, '9942', 0.0),
]
sp = F('Se la guardate')
B += [dict(s=q(W(sp, 'dentro') - 0.1), e=q(W(sp, 'se', 1) - 0.05), kind='v', src='9939', frm=2.2, rate=1),
      dict(s=q(W(sp, 'fuori') - 0.1), e=q(W(sp, 'dove') - 0.05), kind='v', src='9942', frm=2.4, rate=1),
      dict(s=q(W(sp, 'è', 2) - 0.1), e=E_(sp), kind='v', src='9940', frm=2.0, rate=1)]
B.sort(key=lambda b: b['s'])
LEN = {'9927': 3.36, '9942': 4.36, '9926': 2.86}
for x in B:   # se l'inserto è più lungo della clip, la rallento quanto basta
    L = LEN.get(x['src'])
    if L and x['frm'] + (x['e'] - x['s']) > L - 0.05: x['rate'] = round((L - 0.1 - x['frm']) / (x['e'] - x['s']), 3)
cuts = sorted({s['at'] for s in segs} | {total})
for k, b in enumerate(B):
    b['tr'] = TR[k % 4]
    for c in cuts:
        if 0 < c - b['e'] < 0.35: b['e'] = c
        if 0 < b['s'] - c < 0.25: b['s'] = c
rets = [b['e'] for b in B if b['e'] < total - 0.05]

# marchi in 3D + nome del modello
def LG(i, brand, name, sub='', word=None, end=None):
    s = S(i) + 0.05 if word is None else W(i, word) - 0.05
    return dict(k='logo', s=q(s), e=E_(end if end is not None else i), brand=brand, name=name, sub=sub)
fx = [
    dict(k='title', s=S(1) + 0.03, e=E_(1), a='IL SALONE', b='AUTOMOTIVA', tags=[]),
    LG(sm, 'smart', 'SMART BRABUS', 'TAILOR MADE', end=sm + 1),
    LG(a3, 'audi', 'AUDI A3', 'S LINE', end=a3 + 1),
    LG(ca, 'mercedes', 'CLASSE A 200', '3 IN SALONE', end=ca + 2),
    LG(go, None, 'GOLF GTI 7.5', 'LA PIÙ RICHIESTA', end=go + 1),
    LG(a35, 'audi', 'AUDI A3', '35 TFSI', end=a35 + 1),
    LG(ab, None, 'ABARTH', 'SCORPIONEORO'),
    LG(mi, None, 'MINI COOPER', ''),
    LG(fo, None, 'FORD FIESTA', ''),
    LG(a1, 'audi', 'AUDI A1', 'COMPETITION', end=a1 + 1),
    LG(gr, 'maserati', 'MASERATI', 'GRECALE', word='Maserati', end=gr + 2),
    LG(x1, 'bmw', 'BMW X1', 'GRIGIO OPACO', end=x1 + 1),
    LG(le, 'maserati', 'MASERATI', 'LEVANTE'),
    LG(to, 'alfa', 'ALFA ROMEO', 'TONALE', end=to + 1),
    LG(x2, 'bmw', 'BMW X2', '', end=x2 + 1),
    LG(p2, 'peugeot', 'PEUGEOT 208', 'GT LINE', end=p2 + 1),
    LG(cc, 'mercedes', 'CLASSE C 300 d', 'APPENA ARRIVATA', end=cc + 1),
]
# contatore dei tettucci apribili: scatta ogni volta che lo dice
roof = [W(go + 1, 'Tettuccio'), W(mi, 'tettuccio'), W(fo, 'tettuccio'), W(gr + 2, 'Tettuccio'), W(F('Col tettuccio'), 'tettuccio'), W(to, 'tettuccio')]
counter = dict(s=q(roof[0] - 0.1), e=E_(to + 1), hits=[round(x, 3) for x in roof])
# promo di dicembre
dc = F('Per tutto dicembre')
fx += [dict(k='stack', s=q(W(dc, 'dicembre') - 0.05), e=E_(dc + 1), items=[['DICEMBRE', W(dc, 'dicembre') - 0.05], ['FINANZIAMENTO', W(dc, 'finanziamento') - 0.05], ['CONTANTI', W(dc + 1, 'contanti') - 0.05]]),
       dict(k='stack', s=q(W(F('Pieno omaggio'), 'Pieno') - 0.05), e=total, items=[['PIENO OMAGGIO', W(F('Pieno omaggio'), 'Pieno') - 0.05], ['PANETTONE', W(F('e panettone'), 'panettone') - 0.05]])]
bl = [s['bleep'] for s in segs if 'bleep' in s]
for f in fx:
    f['s'], f['e'] = q(f['s']), q(f['e'])
    for it in f.get('items', []): it[1] = round(it[1], 3)

pn = F('e panettone')
pan = dict(seg=pn, at=round(W(pn, 'panettone') - S(pn) - 0.05, 3))
for c in chunks:
    if S(pn) - 0.01 <= c['t'] < E_(pn): c['top'] = 1500
sfx_pan = [dict(t=round(W(pn, 'panettone') - 0.05, 3), n='ping', db=-11)]
# bianco e nero + silenzio della musica: tratti comici contigui uniti
bw = []
for s in segs:
    if s['bw']:
        a, b = s['at'], q(s['at'] + s['d'])
        if bw and abs(bw[-1][1] - a) < 0.05: bw[-1][1] = b
        else: bw.append([a, b])
bleeps = [s['bleep'] for s in segs if 'bleep' in s]
sfx = [dict(t=S(1), n='hit', db=-9)]
sfx += [dict(t=round(b['s'] - 0.1, 3), n='whoosh', db=-14) for b in B]
sfx += [dict(t=f['s'], n='ping', db=-12) for f in fx if f['k'] == 'logo' and f['brand']]
sfx += [dict(t=it[1], n='tick', db=-13) for f in fx for it in f.get('items', [])]
sfx += [dict(t=a, n='stop', db=-12) for a, b in bw] + [dict(t=b, n='hit', db=-10) for a, b in bw]
sfx += sfx_pan + [dict(t=total, n='hit', db=-7)]
# le gag in bianco e nero: niente whoosh/ping dentro i silenzi
inbw = lambda x: any(a - 0.02 <= x < b - 0.05 for a, b in bw)
sfx = [s for s in sfx if s['n'] in ('stop', 'hit') or not inbw(s['t'])]
tl = dict(fps=FPS, total=total, dur=round(total + END, 4), segs=segs, hook=[], silence=bw, bw=bw, bleeps=bleeps, broll=B, rets=rets, subs=chunks, fx=fx, sfx=sfx, panettone=pan,
          end=dict(kind='v', src='9915', frm=3.0, rate=0.8))
json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print(f'parlato fino a {total:.2f}s, totale {total + END:.2f}s, {len(chunks)} blocchi, {len(B)} inserti, {len(fx)} grafiche')
print('b/n', bw, 'bip', bleeps)
for b in B: print('  inserto', b['s'], b['e'], b['src'], round(b['e'] - b['s'], 2), b['tr'])
