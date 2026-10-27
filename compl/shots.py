"""Scaletta del montaggio (Pastore, complicanze diabete) dai tempi della voce: inquadrature [a, b], tipo (clip 3D / motion graphics) e transizione d'ingresso.
Scrive compl/shots.json (usato da Movie.tsx, prep_ai.py, sfx.py)   uso: python3 compl/shots.py"""
import json, os, re

D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(f'{D}/timeline.json')); WS = json.load(open(f'{D}/words.json'))
norm = lambda s: re.sub(r"[^\wàèéìòóù'€°-]", '', s.lower())
def s(k, word, n=1):  # n-esima occorrenza della parola nella frase k
    c = 0
    for t, ww, kk in WS:
        if kk == k and norm(ww) == word:
            c += 1
            if c == n: return t
    raise KeyError((k, word))
st = lambda k: T['sents'][k]['t'] - 0.12  # taglio poco prima della frase
P = 0.05
SH = [  # nome, tipo, inizio, transizione d'ingresso
    ('arm', 'clip', 0.0, 'none'),
    ('hook', 'mg', s(0, 'se') - P, 'whip'),
    ('layers', 'clip', st(1), 'cube'),
    ('nerves', 'mg', s(1, 'e') - P, 'whip'),
    ('heel', 'clip', st(2), 'cube'),
    ('warn', 'mg', s(2, 'una') - P, 'whip'),
    ('mirror', 'clip', st(3), 'cube'),
    ('cream', 'clip', s(3, 'asciuga') - P, 'whip'),
    ('eye', 'clip', st(4), 'cube'),
    ('eyecheck', 'mg', s(4, 'parlane') - P, 'whip'),
    ('petal', 'clip', st(5), 'cube'),
    ('taboo', 'mg', s(5, 'non') - P, 'whip'),
    ('helps', 'mg', st(6), 'cube'),
    ('flatlay', 'clip', s(6, 'doccia') - P, 'whip'),
    ('water', 'mg', s(6, 'acqua') - P, 'whip'),
    ('talk', 'mg', st(7), 'cube'),
    ('wound', 'mg', s(7, 'e', 2) - P, 'whip'),
    ('end', 'mg', T['sents'][7]['end'] + 0.3, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else T['duration']
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'secca0': s(0, 'secca'), 'occhi0': s(0, 'occhi'), 'intimi0': s(0, 'intimi'), 'diabete0': s(0, 'diabete'), 'piccoli0': s(0, 'piccoli'),
    'glicemia1': s(1, 'glicemia'), 'disidrata': s(1, 'disidrata'), 'nervi': s(1, 'nervi'), 'sudorazione': s(1, 'sudorazione'), 'gambe': s(1, 'gambe'),
    'secca2': s(2, 'secca'), 'prude': s(2, 'prude'), 'screpola': s(2, 'screpola'), 'crepa': s(2, 'crepa'), 'ferita2': s(2, 'ferita'), 'notare': s(2, 'notare'),
    'controlla': s(3, 'controlla'), 'dita1': s(3, 'dita'), 'asciuga': s(3, 'asciuga'), 'idrata': s(3, 'idrata'), 'emolliente': s(3, 'emolliente'), 'dita2': s(3, 'dita', 2),
    'bruciore4': s(4, 'bruciore'), 'estraneo': s(4, 'estraneo'), 'parlane4': s(4, 'parlane'), 'noi4': s(4, 'noi'), 'attenzione': s(4, 'attenzione'),
    'donne': s(5, 'donne'), 'secchezza': s(5, 'secchezza'), 'intimi5': s(5, 'intimi'), 'tabu': s(5, 'tabù'), 'parla': s(5, 'parla'),
    'aiuta': s(6, 'aiuta'), 'doccia': s(6, 'doccia'), 'detergenti': s(6, 'detergenti'), 'emollienti': s(6, 'emollienti'), 'occhi6': s(6, 'occhi'),
    'acqua': s(6, 'acqua'), 'sorsi': s(6, 'sorsi'), 'glicemia6': s(6, 'glicemia'), 'controllo6': s(6, 'controllo'),
    'aiutiamo': s(7, 'aiutiamo'), 'prodotti': s(7, 'prodotti'), 'ricordare': s(7, 'ricordare'), 'controlli': s(7, 'controlli'),
    'ferita7': s(7, 'ferita'), 'guarisce': s(7, 'guarisce'), 'subito': s(7, 'subito'), 'noi7': s(7, 'noi', 2),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:10s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
