"""Scaletta del montaggio (Pastore, prevenzione diabete) dai tempi della voce: inquadrature [a, b], tipo (clip 3D / motion graphics) e transizione d'ingresso.
Scrive diabete/shots.json (usato da Movie.tsx, prep_ai.py, sfx.py)   uso: python3 diabete/shots.py"""
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
SH = [  # nome, tipo, inizio, transizione d'ingresso
    ('calm', 'clip', 0.0, 'none'),
    ('doubt', 'mg', st(1), 'whip'),
    ('hourglass', 'clip', st(2), 'cube'),
    ('blood', 'clip', st(3), 'whip'),
    ('meter', 'clip', st(4), 'cube'),
    ('range', 'mg', st(5), 'whip'),
    ('risk', 'mg', st(6), 'cube'),
    ('hands', 'clip', st(7), 'whip'),
    ('gesture', 'clip', st(8), 'whip'),
    ('book', 'mg', st(9), 'cube'),
    ('end', 'mg', T['sents'][9]['end'] + 0.6, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else T['duration']
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'diabete0': s(0, 'diabete'), 'bene': s(0, 'bene'),
    'sai': s(1, 'sai'), 'davvero': s(1, 'davvero'),
    'tipo': s(2, 'tipo'), 'silenzioso': s(2, 'silenzioso'), 'anni': s(2, 'anni'),
    'sintomi': s(3, 'sintomi'), 'tardi': s(3, 'tardi'), 'semplicita': s(3, 'semplicità'),
    'glicemia5': s(4, 'glicemia'), 'farmacia': s(4, 'farmacia'), 'controllo': s(4, 'controllo'), 'rapido': s(4, 'rapido'),
    'capire': s(5, 'capire'), 'norma': s(5, 'norma'), 'fattore': s(5, 'fattore'), 'rischio': s(5, 'rischio'),
    'familiarita': s(6, 'familiarità'), 'sovrappeso': s(6, 'sovrappeso'), 'pressione': s(6, 'pressione'), 'superato': s(6, 'superato'), 'q45': s(6, '45'),
    'paura': s(7, 'paura'), 'serve2': s(7, 'serve', 2), 'informarsi': s(7, 'informarsi'),
    'prevenire': s(8, 'prevenire'), 'piccolo': s(8, 'piccolo'), 'gesto': s(8, 'gesto'),
    'prenota': s(9, 'prenota'), 'misurazione': s(9, 'misurazione'), 'venerdi': s(9, 'venerdì'), 'tredici': s(9, '13'), 'novembre': s(9, 'novembre'), 'soli': s(9, 'soli'), 'euro': s(9, 'euro'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:10s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
