"""Scaletta (diabete: complicanze e piccole attenzioni): grafiche sul farmacista + 3 inserti Runway, dai tempi parola.
Scrive diab2/shots.json   uso: python3 diab2/shots.py"""
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
SH = [  # nome, tipo, inizio, transizione — farmacista + 3 inserti Runway
    ('f_hook', 'face', 0.0, 'none'),
    ('glucose', 'clip', s(0, 'la') - 0.08, 'cube'),
    ('f_checks', 'face', SE[2]['t'] - 0.04, 'cube'),
    ('f_skin', 'face', SE[3]['t'] - 0.02, 'none'),
    ('feet', 'clip', SE[4]['t'] - 0.04, 'cube'),
    ('eye', 'clip', SE[5]['t'] - 0.04, 'whip'),
    ('f_eyes', 'face', s(5, 'ricorda') - 0.06, 'cube'),
    ('f_women', 'face', SE[6]['t'] - 0.02, 'none'),
    ('f_foot', 'face', SE[7]['t'] - 0.02, 'none'),
    ('f_what', 'face', SE[8]['t'] - 0.02, 'none'),
    ('f_care', 'face', SE[9]['t'] - 0.02, 'none'),
    ('f_help', 'face', SE[10]['t'] - 0.02, 'none'),
    ('f_small', 'face', SE[11]['t'] - 0.02, 'none'),
    ('f_here', 'face', SE[12]['t'] - 0.02, 'none'),
    ('end', 'mg', END + 0.1, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else DUR
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'diabete0': s(0, 'diabete'), 'farmaci0': s(0, 'farmaci'), 'glicemia0': s(0, 'glicemia'), 'oscillare': s(0, 'oscillare'),
    'alimentazione': s(1, 'alimentazione'), 'movimento': s(1, 'movimento'), 'stress': s(1, 'stress'), 'malattie': s(1, 'malattie'),
    'oltre': s(2, 'oltre'), 'controlli2': s(2, 'controlli'), 'secca': s(3, 'secca'), 'sensibilita': s(3, 'sensibilità'), 'piedi3': s(3, 'piedi'),
    'controllali': s(4, 'controllali'), 'asciugali': s(4, 'asciugali'), 'crema': s(4, 'crema'), 'dita': s(4, 'dita'), 'ma4': s(4, 'ma'),
    'secchezza5': s(5, 'secchezza'), 'oculistici': s(5, 'oculistici'), 'regolarmente': s(5, 'regolarmente'),
    'donne': s(6, 'donne'), 'secchezza6': s(6, 'secchezza'), 'infezioni': s(6, 'infezioni'), 'benessere': s(6, 'benessere'),
    'importante7': s(7, 'importante'), 'ferita': s(7, 'ferita'), 'rosso': s(7, 'rosso'), 'caldo': s(7, 'caldo'), 'gonfio': s(7, 'gonfio'),
    'senza7': s(7, 'senza'), 'vai': s(7, 'vai'), 'vieni': s(7, 'vieni'),
    'pratica': s(8, 'pratica'), 'cura9': s(9, 'cura'), 'consapevolezza': s(9, 'consapevolezza'), 'stress9': s(9, 'stress'),
    'aiutarti': s(10, 'aiutarti'), 'proteggere': s(10, 'proteggere'), 'mantenere': s(10, 'mantenere'), 'donna10': s(10, 'donna'),
    'problemi': s(11, 'problemi'), 'piccoli': s(11, 'piccoli'), 'bisogno': s(12, 'bisogno'), 'siamo': s(12, 'siamo'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:9s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
