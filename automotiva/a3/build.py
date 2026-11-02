# Audi A3 Identity Black: timeline sobria (tagli netti, dettagli a tutto schermo, 1 card dati, chiusura)
import json, os, re, subprocess, sys
R = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, R)
from segs import SEGS

FPS = 30
END = 2.8
W = json.load(open(os.path.join(R, '../work/v2/words.json')))
W = {k[4:]: v for k, v in W.items()}

# testo a schermo corretto sull'SRT di Meme ('' = parola nascosta)
FIX = {
    ('9353', 'lead'): 'LED', ('9353', 'identity'): 'Identity', ('9353', 'dire?'): 'dire', ('9353', 'Signi'): '',
    ('9353', '19.'): '19.',
    ('9329', '3'): 'A3', ('9329', '1500'): '1.5', ('9329', 'Meb,'): 'MHEV,', ('9329', 'la'): 'da', ('9329', 'dirlo,'): 'dirlo.',
    ('9334', 'mistopelle'): 'misto pelle',
    ('9339', 'e'): '', ('9339', 'selana.'): 'S line,', ('9339', 'pelle.'): 'pelle,', ('9339', 'Cockpic'): 'cockpit',
    ('9346', 'estate,'): "d'estate", ('9346', 'cames.'): 'cabeza,', ('9346', 'Petto'): 'tetto',
    ('9349', 'mi'): 'vi',
    ('9351', 'motor'): 'motore', ('9351', '1500'): '1.5', ('9351', 'mab,'): 'MHEV.', ('9351', 'E'): 'È',
}
GOLD = re.compile(r'^(19|LED|Identity|Black|A3|2024|1\.5|MHEV|26\.000|150|cavalli|cockpit|motore)$', re.I)


def q(x):
    return round(round(x * FPS) / FPS, 4)


def build():
    t, segs, words = 0.0, [], []
    for c, a, b in SEGS:
        a, b = q(a), q(b)
        segs.append(dict(clip=c, i=a, o=b, at=round(t, 4)))
        ws = W[c]
        for j, (st, wd) in enumerate(ws):
            if not (a - 0.05 <= st < b - 0.05):
                continue
            nxt = ws[j + 1][0] if j + 1 < len(ws) else st + 0.5
            txt = FIX.get((c, wd), wd)
            if txt:
                words.append(dict(t=round(t + st - a, 3), e=round(t + min(nxt, st + 0.7, b) - a, 3), w=txt))
        t += b - a
    return segs, words, round(t, 4)


def chunks(words):
    out, cur = [], []
    for w in words:
        if cur:
            ln = sum(len(x['w']) + 1 for x in cur) + len(w['w'])
            if len(cur) >= 3 or ln > 18 or w['t'] - cur[-1]['e'] > 0.3 or re.search(r'[\.,\?\!]$', cur[-1]['w']):
                out.append(cur); cur = []
        cur.append(w)
    out.append(cur)
    res = []
    for k, c in enumerate(out):
        e = c[-1]['e'] + 0.12
        if k + 1 < len(out):
            e = min(e, out[k + 1][0]['t'])
        res.append(dict(t=c[0]['t'], e=round(e, 3), words=[dict(w=x['w'].rstrip(',.'), t=x['t'], g=bool(GOLD.match(x['w'].rstrip(',.?')))) for x in c]))
    return res


def main():
    segs, words, total = build()

    def O(i, s):  # tempo sorgente nel segmento i -> tempo d'uscita
        return q(segs[i]['at'] + s - segs[i]['i'])

    # dettagli a tutto schermo mentre lui ne parla: (inizio, fine, clip, da)
    B = [
        (O(2, 6.95), O(2, 9.25), '9298', 0.3),   # cerchi Audi Sport 19
        (O(2, 9.30), O(2, 11.05), '9296', 0.2),  # fari full LED
        (O(2, 11.05), O(2, 14.85), '9297', 0.0, 0.85), # identity black: griglia e anelli neri
        (O(2, 14.85), O(2, 17.85), '9300', 0.0, 0.75), # loghi in nero lucido
        (O(3, 2.15), O(3, 3.85), '9312', 0.6),   # scarico
        (O(4, 4.80), O(4, 6.20), '9306', 0.4),   # identity black
        (O(4, 6.20), O(4, 7.55), '9308', 0.4),   # cerchi da 19
        (O(4, 7.55), O(4, 9.30), '9307', 0.3),   # S line
        (O(5, 2.88), O(5, 4.70), '9303', 1.0),   # interni S line
        (O(5, 4.70), O(5, 8.90), '9321', 0.4),   # sedili misto pelle
        (O(7, 10.60), O(7, 12.80), '9315', 0.0), # virtual cockpit
        (O(8, 3.85), O(8, 6.40), '9309', 0.2),   # tetto apribile da fuori
        (O(9, 8.45), O(9, 9.35), '9352', 0.0),   # motore
        (O(11, 7.55), O(11, 10.95), '9352', 0.5, 0.95),# benzina 150 cavalli
    ]
    broll = [dict(s=x[0], e=x[1], src=x[2], frm=x[3], rate=x[4] if len(x) > 4 else 1) for x in B]
    card = dict(s=O(4, 10.30), e=O(4, 12.05))   # "26.000 km"
    sfx = [dict(t=O(9, 8.40), n='engine', db=-12), dict(t=total, n='door', db=-4)]
    tl = dict(fps=FPS, total=total, dur=round(total + END, 4), segs=segs, broll=broll, card=card, subs=chunks(words), sfx=sfx)
    json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'parlato {total:.2f}s, totale {total + END:.2f}s, {len(tl["subs"])} blocchi sottotitoli')


main()
