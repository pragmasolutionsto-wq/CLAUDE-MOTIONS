"""Scaletta del montaggio (Pastore, caduta capelli) dai tempi della voce: inquadrature [a, b], tipo (clip 3D / motion graphics) e transizione d'ingresso.
Scrive pastore/shots.json (usato da Movie.tsx, prep_ai.py, sfx.py)   uso: python3 pastore/shots.py"""
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
    ('brush', 'clip', 0.0, 'none'),
    ('shoulder', 'clip', s(0, 'sulle') - P, 'whip'),
    ('sink', 'clip', s(0, 'nel') - P, 'whip'),
    ('more', 'mg', s(0, "quest'anno") - P, 'cube'),
    ('follicle', 'clip', st(1), 'cube'),
    ('cycle', 'mg', s(1, 'cresce') - 0.25, 'whip'),
    ('summer', 'mg', st(2), 'cube'),
    ('months', 'mg', s(2, 'poiché') - P, 'whip'),
    ('leaves', 'clip', s(2, 'la') - P, 'whip'),
    ('sun', 'clip', st(3), 'cube'),
    ('stress', 'mg', s(3, 'calore') - P, 'whip'),
    ('radicals', 'clip', st(4), 'cube'),
    ('phase', 'mg', s(4, 'spingendo') - P, 'whip'),
    ('now', 'mg', s(4, 'il') - P, 'whip'),
    ('aspect', 'mg', st(5), 'cube'),
    ('dyes', 'mg', s(5, 'se') - P, 'whip'),
    ('tools', 'clip', s(5, 'oppure') - P, 'whip'),
    ('break', 'clip', s(5, 'possono') - P, 'whip'),
    ('sum', 'mg', st(6), 'cube'),
    ('tips', 'mg', st(7), 'cube'),
    ('shampoo', 'clip', s(7, 'scegli') - P, 'whip'),
    ('protect', 'clip', s(7, 'limita') - P, 'whip'),
    ('supplement', 'clip', s(7, 'dai') - P, 'whip'),
    ('talk', 'mg', st(8), 'cube'),
    ('healthy', 'clip', s(8, 'valuteremo') - P, 'whip'),
    ('end', 'mg', s(8, 'ti', 3) - 0.1, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else T['duration']
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'spazzola': s(0, 'spazzola'), 'spalle': s(0, 'spalle'), 'lavandino': s(0, 'lavandino'), 'ancora': s(0, 'ancora'), 'piu0': s(0, 'più'), 'spiego': s(0, 'spiego'), 'perche': s(0, 'perché'),
    'ciclo': s(1, 'ciclo'), 'naturale': s(1, 'naturale'), 'cresce': s(1, 'cresce'), 'ferma': s(1, 'ferma'), 'cade': s(1, 'cade'),
    'luglio': s(2, 'luglio'), 'agosto': s(2, 'agosto'), 'follicoli': s(2, 'follicoli'), 'riposo2': s(2, 'riposo'), 'dura': s(2, 'dura'), 'due': s(2, 'due'), 'mesi': s(2, 'mesi'),
    'caduta2': s(2, 'caduta'), 'evidente': s(2, 'evidente'), 'settembre': s(2, 'settembre'), 'ottobre': s(2, 'ottobre'), 'novembre': s(2, 'novembre'),
    'estate': s(3, "un'estate"), 'calda': s(3, 'calda'), 'calore': s(3, 'calore'), 'uv': s(3, 'uv'), 'aumentato': s(3, 'aumentato'), 'stress': s(3, 'stress'), 'ossidativo': s(3, 'ossidativo'), 'cuoio': s(3, 'cuoio'),
    'radicali': s(4, 'radicali'), 'danneggiato': s(4, 'danneggiato'), 'cellule': s(4, 'cellule'), 'crescita': s(4, 'crescita'), 'riposo4': s(4, 'riposo'),
    'risultato': s(4, 'risultato'), 'mese': s(4, 'mese'), 'adesso': s(4, 'adesso'),
    'importante': s(5, 'importante'), 'tinte': s(5, 'tinte'), 'schiariture': s(5, 'schiariture'), 'decolorazioni': s(5, 'decolorazioni'),
    'oppure': s(5, 'oppure'), 'stressati': s(5, 'stressati'), 'phon5': s(5, 'phon'), 'spazzola5': s(5, 'spazzola'), 'piastra5': s(5, 'piastra'), 'fragili': s(5, 'fragili'), 'spezzarsi': s(5, 'spezzarsi'),
    'sommano': s(6, 'sommano'), 'cause': s(6, 'cause'), 'caduta6': s(6, 'caduta'),
    'consiglio7': s(7, 'consiglio'), 'shampoo': s(7, 'shampoo'), 'delicato': s(7, 'delicato'), 'calore7': s(7, 'calore'), 'termo': s(7, 'termoprotettore'),
    'nutrimento': s(7, 'nutrimento'), 'integratori': s(7, 'integratori'),
    'vero': s(8, 'vero'), 'venire': s(8, 'venire'), 'parlarne': s(8, 'parlarne'), 'noi': s(8, 'noi'), 'situazione': s(8, 'situazione'), 'vigore': s(8, 'vigore'), 'forza': s(8, 'forza'),
    'aspettiamo': s(8, 'aspettiamo'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:11s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
