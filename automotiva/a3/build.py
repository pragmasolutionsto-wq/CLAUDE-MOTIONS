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
    ('9353', 'intanto'): 'Intanto', ('9353', 'lead'): 'LED', ('9353', 'identity'): 'Identity', ('9353', 'dire?'): 'dire', ('9353', 'Signi'): '',
    ('9353', '19.'): '19.',
    ('9329', 'Dicevamo'): 'Dicevamo,', ('9329', 'quindi'): 'quindi', ('9329', '3'): 'A3', ('9329', '1500'): '1.5', ('9329', 'Meb,'): 'MHEV,', ('9329', 'la'): 'da', ('9329', 'dirlo,'): 'dirlo.',
    ('9334', 'mistopelle'): 'misto pelle', ('9334', 'e'): 'S line',
    ('9339', 'e'): '', ('9339', 'selana.'): 'S line,', ('9339', 'pelle.'): 'pelle,', ('9339', 'Cockpic'): 'cockpit',
    ('9346', 'estate,'): "d'estate", ('9346', 'cames.'): 'cabeza,', ('9346', 'Petto'): 'tetto',
    ('9349', 'mi'): 'vi',
    ('9351', 'motor'): 'motore', ('9351', '1500'): '1.5', ('9351', 'mab,'): 'MHEV.', ('9351', 'E'): 'È',
}
# parole delle frasi tagliate che i timestamp in anticipo farebbero rientrare nei sottotitoli
HIDE = {('9353', 3.52), ('9346', 6.48)}
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
            if not (a - 0.12 <= st < b - 0.05):
                continue
            nxt = ws[j + 1][0] if j + 1 < len(ws) else st + 0.5
            if (c, st) in HIDE:
                continue
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
        (O(2, 6.0667), O(2, 9.25), '9298', 0.0, 0.85),   # cerchi Audi Sport 19
        (O(2, 9.30), O(2, 11.05), '9296', 0.2),  # fari full LED
        (O(2, 11.05), O(2, 14.85), '9297', 0.0, 0.85), # identity black: griglia e anelli neri
        (O(2, 14.85), O(2, 17.85), '9300', 0.0, 0.72), # loghi in nero lucido
        (O(3, 2.30), O(3, 3.7667), '9312', 0.75),   # scarico
        (O(4, 4.80), O(4, 6.20), '9306', 0.4),   # identity black
        (O(4, 6.20), O(4, 7.55), '9308', 0.4),   # cerchi da 19
        (O(4, 7.55), O(4, 9.30), '9307', 0.3),   # S line
        (O(5, 3.0), O(5, 4.70), '9303', 1.0),   # interni S line
        (O(5, 4.70), O(5, 8.90), '9321', 0.4),   # sedili misto pelle
        (O(6, 9.60), O(6, 13.0333), '9315', 0.0), # virtual cockpit
        (O(7, 3.85), O(7, 6.5667), '9309', 0.2),   # tetto apribile da fuori
        (O(8, 8.45), O(8, 9.2), '9352', 0.0),   # motore
        (O(10, 7.40), O(10, 11.2), '9352', 0.5, 0.85),  # benzina 150 cavalli
        (O(12, 10.5333), O(12, 11.8), '9306', 1.6),  # è in vendita
    ]
    broll = [dict(s=x[0], e=x[1], src=x[2], frm=x[3], rate=x[4] if len(x) > 4 else 1) for x in B]
    # niente inquadrature-lampo: aggancia inizi e fine dei dettagli ai tagli vicini (< 0.45s)
    bounds = sorted({sg['at'] for sg in segs} | {b['s'] for b in broll} | {total})
    for b in broll:
        nxt = [x for x in bounds if x > b['e'] - 1e-3]
        if nxt and nxt[0] - b['e'] < 0.45:
            b['e'] = nxt[0]
        prv = [x for x in bounds if x <= b['s'] + 1e-3 and x not in (b['s'],)]
        if prv and b['s'] - prv[-1] < 0.45:
            b['s'] = prv[-1]
    # transizioni: da parlato -> dettaglio alterna whip (sx/dx) e zoom; dettaglio -> dettaglio = slide verticale
    rets, k = [], 0
    for i, b in enumerate(broll):
        prev = broll[i - 1] if i else None
        if prev and abs(prev['e'] - b['s']) < 0.05:
            b['tr'] = 'slide'
        else:
            b['tr'] = ['whip', 'zoom', 'whipL', 'zoom'][k % 4]; k += 1
        nxt = broll[i + 1] if i + 1 < len(broll) else None
        if not (nxt and abs(nxt['s'] - b['e']) < 0.05) and b['e'] < total - 0.1:
            rets.append(b['e'])
        # sotto lo slide del dettaglio successivo deve restare questo dettaglio, non il parlato
        b['hold'] = 0.3 if (nxt and abs(nxt['s'] - b['e']) < 0.05) else 0
    card = dict(s=O(4, 10.30), e=O(4, 12.05))   # "26.000 km"
    sfx = [dict(t=O(8, 8.40), n='engine', db=-12), dict(t=total, n='door', db=-4)]
    sfx += [dict(t=round(b['s'] - 0.08, 3), n='whoosh', db=-15 if b['tr'] != 'slide' else -19) for b in broll]
    tl = dict(fps=FPS, rets=rets, total=total, dur=round(total + END, 4), segs=segs, broll=broll, card=card, subs=chunks(words), sfx=sfx)
    json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'parlato {total:.2f}s, totale {total + END:.2f}s, {len(tl["subs"])} blocchi sottotitoli')


main()
