# "Regaliamo un'auto": timeline empatica (dettagli in dissolvenza, 2 clip AI, card storia, chiusura)
import json, os, re, sys
R = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, R)
from segs import SEGS

FPS = 30
END = 3.6
W = {k[4:]: v for k, v in json.load(open(os.path.join(R, '../work/v3/words.json'))).items()}

# testo corretto sull'SRT di Meme, per (clip, tempo parola) -> testo ('' = nascosta)
FIX = {
    ('9507', 4.0): 'Nicolò',
    ('9514', 0.0): "Quest'auto", ('9514', 1.12): 'vogliamo', ('9514', 1.44): 'regalare', ('9514', 3.28): 'bisogno.',
    ('9516', 0.4): 'Sappiamo che', ('9516', 6.48): '', ('9516', 6.56): 'colloquio', ('9516', 6.72): 'di',
    ('9516', 8.96): 'automunito?', ('9516', 9.28): '', ('9516', 13.52): 'i tuoi',
    ('9516', 25.68): '500-600', ('9516', 28.8): '1.000-1.200',
    ('9519', 1.44): 'nei', ('9519', 1.68): 'nostri', ('9519', 1.92): 'DM',
}
GOLD = re.compile(r'^(gratis|regalare|famiglia|famiglie|bisogno|cuore|storia|DM|radici|gesto|voltura)$', re.I)


def q(x):
    return round(round(x * FPS) / FPS, 4)


def build():
    t, segs, words = 0.0, [], []
    for c, a, b in SEGS:
        segs.append(dict(clip=c, i=a, o=b, at=round(t, 4)))
        ws = W[c]
        for j, (st, wd) in enumerate(ws):
            if not (a - 0.2 <= st < b - 0.05):
                continue
            nxt = ws[j + 1][0] if j + 1 < len(ws) else st + 0.5
            txt = FIX.get((c, st), wd)
            if txt:
                words.append(dict(t=round(t + st - a, 3), e=round(t + min(nxt, st + 0.7, b) - a, 3), w=txt))
        t += b - a
    return segs, words, round(t, 4)


def chunks(words):
    out, cur = [], []
    for w in words:
        if cur:
            ln = sum(len(x['w']) + 1 for x in cur) + len(w['w'])
            if len(cur) >= 3 or ln > 18 or w['t'] - cur[-1]['e'] > 0.35 or re.search(r'[\.,\?\!]$', cur[-1]['w']):
                out.append(cur); cur = []
        cur.append(w)
    out.append(cur)
    res = []
    for k, c in enumerate(out):
        e = c[-1]['e'] + 0.15
        if k + 1 < len(out):
            e = min(e, out[k + 1][0]['t'])
        res.append(dict(t=c[0]['t'], e=round(e, 3), words=[dict(w=x['w'].rstrip(',.'), t=x['t'], g=bool(GOLD.match(x['w'].rstrip(',.?')))) for x in c]))
    return res


def main():
    segs, words, total = build()

    def O(i, s):
        return q(segs[i]['at'] + s - segs[i]['i'])

    # dettagli in dissolvenza (coprono anche i tagli dentro la stessa ripresa): (inizio, fine, clip, da, velocità)
    B = [
        (O(2, 9.0), O(3, 12.55), '9522', 0.2, 0.85),   # un piccolo gesto
        (O(5, 10.30), O(5, 13.70), '9505', 0.1, 0.95),    # ripagare un pochettino
        (O(5, 18.55), O(6, 1.00), '9523', 0.0, 0.9),      # regalare un'auto: la fiancata
        (O(8, 3.80), O(8, 5.60), '9526', 0.6, 1),         # mezzi pubblici
        (O(8, 12.60), O(9, 19.40), 'ai_bus', 0.0, 0.78),  # figli a scuola con l'inverno (AI)
        (O(9, 24.70), O(9, 27.60), '9525', 0.4, 1),       # potevamo venderla 500-600
        (O(9, 27.60), O(9, 30.45), '9527', 0.1, 1),       # al privato 1.000-1.200
        (O(10, 13.20), O(10, 16.5667), '9524', 0.0, 0.6), # la possibilità di avere un'auto
        (O(12, 12.2667), O(12, 14.40), '9522', 1.6, 0.65),   # copre il taglio
        (O(13, 17.6667), O(13, 19.2333), '9523', 1.6, 1), # tutto qui vi chiediamo
        (O(14, 0.00), O(14, 3.30), 'ai_keys', 0.3, 1.3),    # cambiamo la vita di una famiglia (AI)
    ]
    broll = [dict(s=x[0], e=x[1], src=x[2], frm=x[3], rate=x[4]) for x in B]
    story = dict(s=O(11, 0.70), e=O(13, 19.2333))
    title = dict(s=0.0, e=O(0, 2.25))
    tl = dict(fps=FPS, total=total, dur=round(total + END, 4), segs=segs, broll=broll, story=story, title=title, subs=chunks(words))
    json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'parlato {total:.2f}s, totale {total + END:.2f}s, {len(tl["subs"])} blocchi')


main()
