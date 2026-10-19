"""Scaletta del montaggio dai tempi della voce: inquadrature [a, b], tipo (clip 3D / motion graphics) e transizione d'ingresso.
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
    ('torso', 'clip', 0.0, 'none'),
    ('know', 'mg', s(0, 'ma') - P, 'whip'),
    ('psa3d', 'mg', st(1), 'cube'),
    ('psa', 'clip', s(1, 'è') - P, 'whip'),
    ('drop', 'clip', s(1, 'si') - P, 'whip'),
    ('gauge', 'mg', st(2), 'cube'),
    ('inflamed', 'clip', s(2, 'una') - P, 'whip'),
    ('neq', 'mg', s(2, 'ma') - P, 'whip'),
    ('when', 'mg', st(3), 'cube'),
    ('walk', 'clip', s(3, 'in') - P, 'whip'),
    ('why', 'mg', st(4), 'cube'),
    ('scan', 'clip', s(4, 'perché', 2) - P, 'whip'),
    ('control', 'mg', s(4, 'per') - P, 'whip'),
    ('device', 'clip', st(5), 'cube'),
    ('steps', 'mg', s(5, 'ti') - P, 'whip'),
    ('cross', 'clip', st(6), 'cube'),
    ('end', 'mg', T['sents'][6]['end'] + 0.15, 'whip'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else T['duration']
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
# parole chiave che servono alle grafiche (tempo assoluto)
K = {
    'proteina': s(1, 'proteina'), 'prodotta': s(1, 'prodotta'), 'indicatore': s(1, 'indicatore'), 'prelievo1': s(1, 'prelievo'),
    'alto1': s(2, 'alto'), 'cause': s(2, 'cause'), 'ingrossata': s(2, 'ingrossata'), 'infiammazione': s(2, "un'infiammazione"), 'infezione': s(2, "un'infezione"),
    'tumore1': s(2, 'tumore'), 'attenzione': s(2, 'attenzione'), 'psa_alto': s(2, 'psa'), 'non_vuol': s(2, 'non'), 'necess': s(2, 'necessariamente'), 'tumore2': s(2, 'tumore', 2),
    'test4': s(3, 'test'), 'cinquanta': s(3, '50'), 'gia': s(3, 'già'), 'quaranta': s(3, '40-45'), 'famiglia': s(3, 'famiglia'), 'fattori': s(3, 'fattori'),
    'spesso': s(4, 'spesso'), 'sintomi': s(4, 'sintomi'), 'importante5': s(4, 'importante'), 'controllo': s(4, 'controllo'),
    'farmacia6': s(5, 'farmacia'), 'capillare': s(5, 'capillare'), 'rapido': s(5, 'rapido'), 'discreto': s(5, 'discreto'),
    'step1': s(5, 'ti'), 'step2': s(5, 'ti', 2), 'step3': s(5, 'e'), 'aspettiamo': s(6, 'aspettiamo'),
    'importante1': s(0, 'importante'), 'saperle': s(0, 'saperle'), 'prostata0': s(0, 'prostata'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:9s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
