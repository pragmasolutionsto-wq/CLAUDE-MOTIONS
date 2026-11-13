# Ford Fiesta ST-Line X: reel solo da foto annuncio + 2 clip AI + voce fuori campo
import json, os, re
R = os.path.dirname(os.path.abspath(__file__))
FPS, END = 30, 2.6
W = json.load(open(os.path.join(R, '../work/fiesta/words.json')))['IMG_VO']
VO = 32.56
FIX = {'festa': 'Fiesta', 'Citicar': 'city car', 'ST': 'ST-Line X', 'Line': '', 'X,': '', 'tagliando': 'tagliandi', 'Car': 'CarPlay', 'Pla': '',
       '71.000': '71.000', 'Automotiva': 'AutoMotiva', 'Whatsapp.': 'WhatsApp.', 'km': 'km'}
GOLD = re.compile(r'^(fiesta|140|cavalli|2020|proprietario|certificati|panoramico|18|riscaldati|riscaldato|carplay|retrocamera|71\.000|automotiva|whatsapp|due|volte)$', re.I)

def q(x): return round(round(x * FPS) / FPS, 4)

# (inizio, clip, tipo, etichetta) — ogni inquadratura finisce dove inizia la successiva
SHOTS = [
    (0.00, 'ai_front', 'v', None),
    (4.95, 'f_03', 'p', 'data'),
    (9.30, 'f_05', 'p', 'check'),
    (13.55, 'ai_roof', 'v', 'TETTO PANORAMICO'),
    (15.25, 'f_07', 'p', 'CERCHI DA 18"'),
    (16.45, 'f_10', 'p', 'SEDILI SPORTIVI RISCALDATI'),
    (18.25, 'f_13', 'p', 'VOLANTE RISCALDATO'),
    (19.55, 'f_12', 'p', 'APPLE CARPLAY · RETROCAMERA'),
    (21.75, 'f_04', 'p', 'km'),
    (24.90, 'f_01', 'p', 'place'),
    (27.90, 'f_09', 'p', None),
]
def main():
    total = q(VO + 0.3)
    shots = []
    for i, (s, src, k, lab) in enumerate(SHOTS):
        e = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else total
        shots.append(dict(s=q(s), e=q(e), src=src, k=k, lab=lab, tr=['zoom', 'whip', 'whipL', 'slide'][i % 4] if i else 'none'))
    words = []
    for j, (t, w) in enumerate(W):
        txt = FIX.get(w, w)
        if not txt: continue
        nxt = W[j + 1][0] if j + 1 < len(W) else t + 0.5
        words.append(dict(t=round(t, 3), e=round(min(nxt, t + 0.7), 3), w=txt))
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= 3 or w['t'] - cur[-1]['e'] > 0.3 or re.search(r'[\.,\?]$', cur[-1]['w'])):
            out.append(cur); cur = []
        cur.append(w)
    out.append(cur)
    subs = []
    for k, c in enumerate(out):
        e = c[-1]['e'] + 0.12
        if k + 1 < len(out): e = min(e, out[k + 1][0]['t'])
        subs.append(dict(t=c[0]['t'], e=round(e, 3), words=[dict(w=x['w'].rstrip(',.'), t=x['t'], g=bool(GOLD.match(x['w'].rstrip(',.')))) for x in c]))
    sfx = [dict(t=round(s['s'] - 0.08, 3), n='whoosh', db=-15) for s in shots[1:]] + [dict(t=total, n='door', db=-5), dict(t=0.0, n='bass_hit', db=-8)]
    tl = dict(fps=FPS, total=total, dur=round(total + END, 4), shots=shots, subs=subs, sfx=sfx)
    json.dump(tl, open(os.path.join(R, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print('totale', tl['dur'], len(subs), 'blocchi')
    print(' | '.join(' '.join(w['w'] for w in s['words']) for s in subs))
main()
