"""Scaletta (prevenzione diabete): blocchi di grafiche sulla farmacista + 3 inserti Runway, dai tempi parola.
Scrive diabete/shots.json   uso: python3 diabete/shots.py"""
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
    ('glucose', 'clip', SE[1]['t'] - 0.04, 'cube'),
    ('f_silent', 'face', SE[2]['t'] - 0.04, 'cube'),
    ('f_two', 'face', SE[3]['t'] - 0.02, 'none'),
    ('drop', 'clip', s(3, 'la') - 0.06, 'cube'),
    ('f_hba1c', 'face', s(3, "l'emoglobina") - 0.06, 'cube'),
    ('f_together', 'face', SE[4]['t'] - 0.02, 'none'),
    ('life', 'clip', SE[6]['t'] - 0.04, 'cube'),
    ('f_who', 'face', SE[7]['t'] - 0.04, 'cube'),
    ('f_risk', 'face', SE[9]['t'] - 0.02, 'none'),
    ('f_woman', 'face', SE[10]['t'] - 0.02, 'none'),
    ('f_promo', 'face', SE[11]['t'] - 0.02, 'none'),
    ('f_area', 'face', SE[12]['t'] - 0.02, 'none'),
    ('f_wait', 'face', SE[13]['t'] - 0.02, 'none'),
    ('end', 'mg', END + 0.1, 'cube'),
]
out = []
for i, (name, kind, a, tr) in enumerate(SH):
    b = SH[i + 1][2] if i + 1 < len(SH) else DUR
    out.append({'name': name, 'kind': kind, 'a': round(a, 3), 'b': round(b, 3), 'tr': tr})
K = {
    'mese': s(0, 'mese'), 'riguarda': s(0, 'riguarda'), 'diabete0b': s(0, 'diabete', 2), 'pensa': s(0, 'pensa'),
    'tipo': s(1, 'tipo'), 'diffuso': s(1, 'diffuso'), 'silenzio': s(1, 'silenzio'),
    'sintomi': s(2, 'sintomi'), 'glicemia2': s(2, 'glicemia'), 'muoverti': s(2, 'muoverti'),
    'esami': s(3, 'esami'), 'glicemia3': s(3, 'glicemia'), 'glucosio': s(3, 'glucosio'), 'prelievo': s(3, 'prelievo'), 'fotografia': s(3, 'fotografia'),
    'emoglobina3': s(3, "l'emoglobina"), 'media': s(3, 'media'), 'mesi': s(3, 'mesi'), 'filmato': s(3, 'filmato'),
    'completo': s(4, 'completo'), 'prediabete': s(4, 'prediabete'), 'ancora': s(5, 'ancora'), 'segnale': s(5, 'segnale'),
    'alimentazione': s(6, 'alimentazione'), 'movimento': s(6, 'movimento'), 'peso': s(6, 'peso'), 'sonno': s(6, 'sonno'), 'ridurre': s(6, 'ridurre'),
    'consigliamo': s(7, 'consigliamo'), 'tutti': s(8, 'tutti'), 'quaranta': s(8, '40-45'),
    'familiari': s(9, 'familiari'), 'sovrappeso': s(9, 'sovrappeso'), 'muove': s(9, 'muove'), 'pressione': s(9, 'pressione'), 'colesterolo': s(9, 'colesterolo'),
    'donna': s(10, 'donna'), 'gravidanza': s(10, 'gravidanza'), 'bambino': s(10, 'bambino'), 'policistico': s(10, 'policistico'), 'condizioni': s(10, 'condizioni'),
    'novembre11': s(11, 'novembre'), 'pacchetto': s(11, 'pacchetto'), 'prezzo': s(11, 'prezzo'),
    'controllo': s(12, 'controllo'), 'area': s(12, 'area'), 'tranquillita': s(12, 'tranquillità'), 'aspettiamo': s(13, 'aspettiamo'), 'sempre13': s(13, 'sempre'),
}
json.dump({'shots': out, 'k': {k: round(v, 3) for k, v in K.items()}}, open(f'{D}/shots.json', 'w'), indent=1)
for o in out: print(f"{o['name']:9s} {o['kind']:4s} {o['a']:6.2f} {o['b']:6.2f} {o['b'] - o['a']:5.2f} {o['tr']}")
