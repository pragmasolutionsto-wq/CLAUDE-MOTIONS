"""Scaletta del montaggio (bioimpedenziometria) dai tempi della voce: inquadrature [a, b], tipo (clip 3D / motion graphics) e transizione d'ingresso.
Scrive plebiscito/shots.json (usato da Movie.tsx, prep_ai.py, sfx.py)   uso: python3 plebiscito/shots.py"""
import json, os, re

D = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(f'{D}/timeline.json')); WS = json.load(open(f'{D}/words.json'))
norm = lambda s: re.sub(r"[^\wàèéìòóù'€-]", '', s.lower())
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
    ('body', 'clip', 0.0, 'none'),
    ('weight', 'mg', s(0, 'il') - P, 'whip'),
    ('bia3d', 'mg', st(1), 'cube'),
    ('signal', 'clip', s(1, 'un') - P, 'whip'),
    ('comp', 'mg', s(1, 'massa') - P, 'whip'),
    ('notonly', 'mg', st(2), 'cube'),
    ('muscle', 'clip', s(2, 'pensa') - P, 'whip'),
    ('walk', 'clip', s(2, 'ma') - P, 'whip'),
    ('water', 'clip', st(3), 'cube'),
    ('time', 'mg', s(3, 'ripetendolo') - P, 'whip'),
    ('scan', 'clip', s(3, 'i', 2) - P, 'whip'),
    ('service', 'mg', st(4), 'cube'),
    ('bubble', 'clip', s(4, 'e') - P, 'whip'),
    ('ask', 'mg', st(5), 'cube'),
    ('steps', 'mg', s(5, 'vieni') - P, 'whip'),
    ('end', 'mg', T['sents'][5]['end'] + 0.15, 'whip'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else T['duration']
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'corpo': s(0, 'corpo'), 'cambiando': s(0, 'cambiando'), 'peso': s(0, 'peso'), 'racconta': s(0, 'racconta'),
    'bio': s(1, 'bioimpedenziometria'), 'stima': s(1, 'stima'), 'grassa': s(1, 'grassa'), 'magra': s(1, 'magra'), 'muscoli1': s(1, 'muscoli'), 'acqua': s(1, "l'acqua"),
    'dimagrire': s(2, 'dimagrire'), 'muscoli2': s(2, 'muscoli'), 'allenarti': s(2, 'allenarti'), 'muoverti': s(2, 'muoverti'), 'autonomia': s(2, 'autonomia'), 'anni': s(2, 'anni'),
    'idratazione': s(3, "sull'idratazione"), 'condizioni': s(3, 'condizioni'), 'cambiamenti': s(3, 'cambiamenti'), 'tempo': s(3, 'tempo'), 'interpretati': s(3, 'interpretati'), 'percorso': s(3, 'percorso'),
    'farmacia': s(4, 'farmacia'), 'semplice': s(4, 'semplice'), 'invasivo': s(4, 'invasivo'), 'calma': s(4, 'calma'), 'risultati': s(4, 'risultati'),
    'utile': s(5, 'utile'), 'ascoltiamo': s(5, 'ascoltiamo'), 'spieghiamo': s(5, 'spieghiamo'), 'prenotiamo': s(5, 'prenotiamo'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:9s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
