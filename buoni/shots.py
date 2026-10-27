"""Scaletta del montaggio (Pastore, mese dei buoni) dai tempi della voce: inquadrature [a, b], tipo (clip 3D / motion graphics) e transizione d'ingresso.
Scrive buoni/shots.json (usato da Movie.tsx, prep_ai.py, sfx.py)   uso: python3 buoni/shots.py"""
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
    ('voucher', 'clip', 0.0, 'none'),
    ('coins', 'clip', s(0, 'perché') - P, 'whip'),
    ('returns', 'clip', st(1), 'cube'),
    ('mech', 'mg', st(2), 'cube'),
    ('products', 'clip', s(2, 'su') - P, 'whip'),
    ('gift', 'mg', s(2, 'ricevi') - P, 'whip'),
    ('question', 'mg', st(3), 'cube'),
    ('dec', 'mg', st(4), 'whip'),
    ('bag', 'clip', s(4, 'su') - P, 'whip'),
    ('care', 'clip', st(5), 'cube'),
    ('talk', 'mg', st(6), 'cube'),
    ('end', 'mg', T['sents'][6]['end'] + 0.3, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else T['duration']
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'mese': s(0, 'mese'), 'buoni': s(0, 'buoni'), 'ogni': s(0, 'ogni'), 'euro0': s(0, 'euro'), 'conta': s(0, 'conta'),
    'vantaggio': s(1, 'vantaggio'), 'torna': s(1, 'torna'), 'te': s(1, 'te'),
    'd2': s(2, '2'), 'd30': s(2, '30'), 'novembre': s(2, 'novembre'), 'almeno': s(2, 'almeno'), 'e49': s(2, '49'), 'spesa2': s(2, 'spesa'),
    'viso': s(2, 'viso'), 'corpo': s(2, 'corpo'), 'capelli': s(2, 'capelli'), 'ricevi': s(2, 'ricevi'), 'buono2': s(2, 'buono'), 'e5': s(2, '5'),
    'quando': s(3, 'quando'), 'come': s(3, 'come'), 'utilizzare': s(3, 'utilizzare'),
    'd1': s(4, '1°'), 'd31': s(4, '31'), 'dicembre': s(4, 'dicembre'), 'anno': s(4, '2026'), 'minima': s(4, 'minima'), 'e25': s(4, '25'), 'marchio': s(4, 'marchio'),
    'cura': s(5, 'cura'), 'bisogno': s(5, 'bisogno'), 'lusso': s(5, 'lusso'),
    'noi': s(6, 'noi'), 'aiutiamo': s(6, 'aiutiamo'), 'soddisfarlo': s(6, 'soddisfarlo'), 'aspettiamo': s(6, 'aspettiamo'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:10s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
