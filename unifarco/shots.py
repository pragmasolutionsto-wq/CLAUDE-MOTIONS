"""Scaletta (attivi Unifarco): blocchi di grafiche sulla farmacista + 2 inserti Runway, dai tempi parola.
Scrive unifarco/shots.json   uso: python3 unifarco/shots.py"""
import json, os, re

D = os.path.dirname(os.path.abspath(__file__))
WS = json.load(open(f'{D}/words.json')); SE = json.load(open(f'{D}/sents.json')); T = json.load(open(f'{D}/timeline.json'))
norm = lambda s: re.sub(r"[^\wàèéìòóù'€-]", '', s.lower())
def s(k, word, n=1):
    c = 0
    for t, ww, kk in WS:
        if kk == k and norm(ww) == word:
            c += 1
            if c == n: return t
    raise KeyError((k, word))
END = SE[-1]['end']; DUR = END + T['tail']
SH = [  # nome, tipo, inizio, transizione — farmacista con 2 inserti Runway
    ('f_hook', 'face', 0.0, 'none'),
    ('f_wish', 'face', SE[1]['t'] - 0.02, 'none'),
    ('f_change', 'face', SE[2]['t'] - 0.02, 'none'),
    ('f_no', 'face', SE[3]['t'] - 0.02, 'none'),
    ('f_look', 'face', SE[4]['t'] - 0.02, 'none'),
    ('bottles', 'clip', SE[5]['t'] - 0.04, 'cube'),
    ('f_ways', 'face', SE[6]['t'] - 0.04, 'cube'),
    ('f_example', 'face', SE[7]['t'] - 0.02, 'none'),
    ('vitc', 'clip', SE[9]['t'] - 0.04, 'cube'),
    ('f_plus', 'face', s(9, 'puoi') - 0.06, 'cube'),
    ('f_visit', 'face', SE[10]['t'] - 0.02, 'none'),
    ('f_wait', 'face', SE[11]['t'] - 0.02, 'none'),
    ('end', 'mg', END + 0.1, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else DUR
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'desiderio0': s(0, 'desiderio'), 'pelle0': s(0, 'pelle'), 'rughe1': s(1, 'rughe'), 'tono': s(1, 'tono'), 'colorito': s(1, 'colorito'),
    'luminosita1': s(1, 'luminosità'), 'idratazione': s(1, "l'idratazione"), 'cambiare': s(2, 'cambiare'), 'skincare': s(2, 'skincare'),
    'no': s(3, 'no'), 'spiego': s(3, 'spiego'), 'boccettine': s(4, 'boccettine'), 'attivi5': s(5, 'attivi'), 'concentrati': s(5, 'concentrati'),
    'bisogno': s(5, 'bisogno'), 'modi': s(6, 'modi'), 'direttamente': s(6, 'direttamente'), 'mescolandoli': s(6, 'mescolandoli'), 'crema6': s(6, 'crema'),
    'esempio': s(7, 'esempio'), 'antiaging': s(8, 'anti-aging'), 'spenta': s(8, 'spenta'), 'luminosa': s(8, 'luminosa'),
    'vitamina': s(9, 'vitamina'), 'rughe9': s(9, 'rughe'), 'crema9': s(9, 'crema'), 'piu': s(9, 'più'), 'luminosita9': s(9, 'luminosità'),
    'cura': s(10, 'cura'), 'vieni': s(10, 'vieni'), 'farmacia': s(10, 'farmacia'), 'partiamo': s(10, 'partiamo'), 'pelle10': s(10, 'pelle'),
    'attivo10': s(10, "l'attivo"), 'giusto': s(10, 'giusto'), 'aspettiamo': s(11, 'aspettiamo'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:9s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
