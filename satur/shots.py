"""Scaletta del montaggio (Pastore, saturimetria notturna) dai tempi della voce: inquadrature [a, b], tipo e transizione d'ingresso.
Versione senza clip AI: tutte le inquadrature sono 3D/motion graphics in Remotion.
Scrive satur/shots.json (usato da Movie.tsx e sfx.py)   uso: python3 satur/shots.py"""
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
    ('ask', 'mg', 0.0, 'none'),
    ('snore', 'mg', s(0, 'durante') - P, 'whip'),
    ('clock', 'mg', s(0, 'ti', 2) - P, 'whip'),
    ('day', 'mg', s(0, 'durante', 2) - P, 'whip'),
    ('signals', 'mg', st(1), 'cube'),
    ('resp', 'mg', s(1, 'perché') - P, 'whip'),
    ('apnea', 'mg', s(1, 'hai') - P, 'whip'),
    ('breath', 'mg', st(2), 'cube'),
    ('oxygen', 'mg', s(2, 'ma') - P, 'whip'),
    ('risk', 'mg', s(2, 'questo') - P, 'whip'),
    ('how', 'mg', st(3), 'cube'),
    ('satur', 'mg', s(3, 'un') - P, 'whip'),
    ('finger', 'mg', st(4), 'cube'),
    ('graph', 'mg', s(4, 'il') - P, 'whip'),
    ('data', 'mg', st(5), 'whip'),
    ('recap', 'mg', st(6), 'cube'),
    ('talk', 'mg', s(6, 'vieni') - P, 'whip'),
    ('end', 'mg', T['sents'][6]['end'] + 0.3, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else T['duration']
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'domanda': s(0, 'domanda'), 'russi0': s(0, 'russi'), 'stanco0': s(0, 'stanco'), 'giorno0': s(0, 'giorno'), 'sonnolenza0': s(0, 'sonnolenza'), 'stanchezza': s(0, 'stanchezza'),
    'risposta': s(1, 'risposta'), 'si1': s(1, 'sì'), 'sottovalutare': s(1, 'sottovalutare'), 'disturbi1': s(1, 'disturbi'), 'respiratori1': s(1, 'respiratori'), 'notte1': s(1, 'notte'),
    'apnea': s(1, 'apnea'), 'notturna1': s(1, 'notturna'),
    'respiro': s(2, 'respiro'), 'interrompe': s(2, 'interrompe'), 'volte': s(2, 'volte'), 'riposi': s(2, 'riposi'), 'bene': s(2, 'bene'),
    'ossigeno2': s(2, 'ossigeno'), 'diminuisca': s(2, 'diminuisca'), 'aumenti': s(2, 'aumenti'), 'anidride': s(2, 'anidride'), 'tempo2': s(2, 'tempo'), 'rischio': s(2, 'rischio'), 'salute': s(2, 'salute'),
    'sapere': s(3, 'sapere'), 'controllo3': s(3, 'controllo'), 'saturimetria3': s(3, 'saturimetria'), 'notturna3': s(3, 'notturna'),
    'dormi': s(4, 'dormi'), 'dito': s(4, 'dito'), 'sensore': s(4, 'sensore'), 'registra': s(4, 'registra'), 'saturazione': s(4, 'saturazione'), 'frequenza': s(4, 'frequenza'),
    'dati': s(5, 'dati'), 'variazioni': s(5, 'variazioni'), 'sospette': s(5, 'sospette'), 'approfondire': s(5, 'approfondire'),
    'russi6': s(6, 'russi'), 'stanco6': s(6, 'stanco'), 'sonnolenza6': s(6, 'sonnolenza'), 'parlarne': s(6, 'parlarne'), 'noi6': s(6, 'noi'),
    'approfondiremo': s(6, 'approfondiremo'), 'saturimetria6': s(6, 'saturimetria'), 'aspettiamo': s(6, 'aspettiamo'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:9s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
