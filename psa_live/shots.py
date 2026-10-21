"""Scaletta: inquadrature sul farmacista (face) alternate a clip 3D Runway e schermate grafiche, dai tempi parola.
Scrive psa_live/shots.json   uso: python3 psa_live/shots.py"""
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
SH = [  # nome, tipo (face / clip / mg), inizio, transizione d'ingresso
    ('f_hook', 'face', 0.0, 'none'),
    ('torso', 'clip', s(0, 'prostata') - 0.12, 'cube'),
    ('f_psa', 'face', s(0, 'ma') + 0.1, 'cube'),
    ('psa', 'clip', s(1, 'proteina') - 0.08, 'cube'),
    ('drop', 'clip', SE[2]['t'] - 0.02, 'whip'),
    ('f_cause', 'face', SE[3]['t'] - 0.04, 'cube'),
    ('inflamed', 'clip', SE[5]['t'] - 0.04, 'cube'),
    ('neq', 'mg', SE[6]['t'] - 0.04, 'whip'),
    ('f_age', 'face', SE[7]['t'] - 0.04, 'cube'),
    ('walk', 'clip', s(7, 'generalmente') - 0.08, 'whip'),
    ('f_beyond', 'face', SE[8]['t'] + 0.02, 'cube'),
    ('scan', 'clip', s(8, 'verificare') - 0.1, 'cube'),
    ('f_why', 'face', s(8, 'ma') - 0.1, 'cube'),
    ('f_help', 'face', SE[10]['t'] + 0.02, 'whip'),
    ('device', 'clip', s(10, 'il') - 0.1, 'cube'),
    ('steps', 'mg', s(10, 'ti') - 0.12, 'cube'),
    ('f_step', 'face', s(10, 'in') - 0.1, 'whip'),
    ('end', 'mg', END + 0.1, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else DUR
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'prostata0': s(0, 'prostata'), 'importante0': s(0, 'importante'), 'cose': s(0, 'cose'), 'psa1': s(1, 'psa'), 'proteina': s(1, 'proteina'),
    'prodotta': s(1, 'prodotta'), 'marcatore': s(1, 'marcatore'), 'salute1': s(1, 'salute'), 'prelievo2': s(2, 'prelievo'),
    'cause': s(3, 'cause'), 'alto3': s(3, 'alto'), 'due': s(4, 'due'), 'ingrossata': s(5, 'ingrossata'), 'infiammazione': s(5, 'infiammazione'),
    'infezione': s(5, 'infezione'), 'prostatiti': s(5, 'prostatiti'), 'tumore5': s(5, 'tumore'), 'aspetta': s(6, 'aspetta'), 'psa6': s(6, 'psa'),
    'non6': s(6, 'non'), 'necess': s(6, 'necessariamente'), 'eta': s(7, 'età'), 'test7': s(7, 'test'), 'cinquanta': s(7, '50'), 'prima7': s(7, 'prima'),
    'quaranta': s(7, '40-45'), 'familiarita': s(7, 'familiarità'), 'fattori7': s(7, 'fattori'), 'possibile': s(8, 'possibile'), 'tumore8': s(8, 'tumore'),
    'salute8': s(8, 'salute'), 'esame8': s(8, 'esame'), 'importante8': s(8, 'importante'), 'perche': s(8, 'perché'), 'sempre9': s(9, 'sempre'),
    'sintomi': s(9, 'sintomi'), 'fattori9': s(9, 'fattori'), 'aiutarti': s(10, 'aiutarti'), 'area': s(10, 'area'), 'servizi': s(10, 'servizi'),
    'capillare': s(10, 'capillare'), 'rapido': s(10, 'rapido'), 'info': s(10, 'informazioni'), 'lettura': s(10, 'lettura'), 'consigli': s(10, 'consigli'),
    'seguiamo': s(10, 'seguiamo'), 'passo': s(10, 'passo', 2),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:9s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
