# EDL Audi A1 Competition: tagli, B-roll, grafiche, sottotitoli -> timeline.json + voice.wav
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(ROOT, '../raw/a1')
WORK = os.path.join(ROOT, '../work/a1')
PUB = os.path.join(ROOT, '../public/a1')
FPS = 30
END_CARD = 3.2

# (clip, in, out) — solo take buone, pause lunghe tolte
SEGS = [
    ('9369', 0.20, 6.95),   # giorno 2 + Audi A1 Competition
    ('9373', 0.10, 8.05),   # 207 cavalli, 2.0 turbo
    ('9373', 8.45, 10.00),  # spinge da paura
    ('9375', 0.15, 6.80),   # giro esterno
    ('9377', 0.20, 5.35),   # S line... guarda che cerchi
    ('9377', 5.85, 7.75),   # da 18 dorati
    ('9377', 7.90, 11.30),  # staccano... tamarrissima
    ('9377', 11.55, 13.80), # l'animo di questa vettura
    ('9381', 0.15, 7.85),   # vetri privacy, pinze rosse
    ('9387', 0.15, 5.65),   # posteriore
    ('9394', 2.30, 16.55),  # interni S line
    ('9395', 0.70, 7.25),   # volante, palette
    ('9395', 8.15, 14.95),  # virtual cockpit
    ('9399', 1.05, 14.00),  # pacchetto luci
    ('9400', 0.15, 10.05),  # qualità, optional
    ('9400', 10.65, 11.95), # sequenziale
    ('9401', 0.20, 7.00),   # retrocamera
    ('9404', 0.45, 14.30),  # daily car, animo sportivo
    ('9406', 0.95, 3.00),   # in Italia non è conosciuta
    ('9406', 3.45, 11.05),  # rivale: Polo GTI
    ('9406', 14.35, 22.35), # stessi cavalli, auto diverse
    ('9407', 1.10, 15.95),  # poche in Italia... impossibile
    ('9407', 28.65, 34.60), # al tatto lo sentite
    ('9409', 0.60, 7.95),   # Strada Torino 100, Caselle
    ('9413', 8.50, 14.60),  # mandatemi un messaggio, test drive
]

# correzioni trascrizione (clip, parola originale) -> testo a schermo ('' = nascosta)
FIX = {
    ('9369', 'del'): 'il', ('9369', 'due'): '2:', ('9369', 'Audio'): 'Audi', ('9369', 'Uno'): 'A1',
    ('9373', '2000,'): '2.0', ('9373', 'turbo,'): 'turbo', ('9373', 'a'): 'a',
    ('9375', 'a'): '', ('9375', 'uno'): 'A1',
    ('9377', 'slime'): 'S line',
    ('9381', 'vetti'): 'vetri',
    ('9394', 'classic'): 'classiche',
    ('9395', 'e'): '', ('9395', 'tagliato'): '', ('9395', 'tra'): '', ('9395', 'terrazze,'): '',
    ('9395', 'coppy'): 'cockpit', ("9395", "dell'Audi."): 'Audi.',
    ('9399', 'coppio'): 'cockpit', ('9399', '1,'): 'A1,', ("9399", "l'autoguida."): 'lato guida.',
    ('9401', '1,'): 'A1,',
    ('9404', 'da'): 'daily', ('9404', 'di'): '', ('9404', 'car,'): 'car,',
    ("9406", "l'Apolo"): 'la Polo', ('9406', 'GT,'): 'GTI,', ('9406', '1'): 'A1',
    ('9409', 'strato'): 'Strada', ('9409', 'di'): 'Torino', ('9409', 'inocento,'): '100,',
    ('9409', 'caselle'): 'Caselle', ("9409", "d'orinese."): 'Torinese.',
    ('9413', 'mandatevi'): 'mandatemi', ('9413', 'destri.'): 'test drive.',
}
# parole che vanno in oro
GOLD = re.compile(r"^(207|cavalli|competition|2\.0|turbo|paura|18|dorati|tamarrissima|privacy|rosse|rosso|nero|lucido|cromate|scarico|pelle|bianche|cockpit|luci|riscaldati|select|automatico|sequenziale|retrocamera|rarità|sportivo|gridare|polo|gti|stessi|poche|impossibile|tatto|torino|caselle|torinese|messaggio|test|drive|a1|line|qualità|palette)$", re.I)


def load_words():
    w = json.load(open(os.path.join(WORK, 'words.json')))
    return {k[4:]: v for k, v in w.items()}


def dur(c):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{PUB}/{c}.mp4'], capture_output=True, text=True)
    return float(r.stdout.strip())


def q(x):
    return round(round(x * FPS) / FPS, 4)


def build():
    words = load_words()
    t = 0.0
    segs, subs = [], []
    for i, (c, a, b) in enumerate(SEGS):
        a, b = q(a), q(min(b, dur(c) - 2 / FPS))
        segs.append({'clip': c, 'in': a, 'out': b, 'at': round(t, 3)})
        ws = words[c]
        for j, (st, wd) in enumerate(ws):
            if not (a - 0.05 <= st < b - 0.05):
                continue
            nxt = ws[j + 1][0] if j + 1 < len(ws) else st + 0.5
            en = min(nxt, st + 0.7, b)
            txt = FIX.get((c, wd), wd)
            if txt == '':
                continue
            subs.append({'t': round(t + st - a, 3), 'e': round(t + en - a, 3), 'w': txt, 'g': bool(GOLD.match(txt.split()[-1].strip('.,?!:;')))})
        t += b - a
    total = t
    return segs, subs, total


def out_t(segs, idx, src):
    s = segs[idx]
    return round(s['at'] + src - s['in'], 3)


def chunk_subs(subs):
    # blocchi da max 3 parole / 16 caratteri, spezza su punteggiatura e pause
    out, cur = [], []
    for w in subs:
        if cur:
            gap = w['t'] - cur[-1]['e']
            ln = sum(len(x['w']) + 1 for x in cur) + len(w['w'])
            if len(cur) >= 3 or ln > 16 or gap > 0.35 or re.search(r'[\.,\?\!:]$', cur[-1]['w']):
                out.append(cur); cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    res = []
    for k, c in enumerate(out):
        end = c[-1]['e'] + 0.15
        if k + 1 < len(out):
            end = min(end, out[k + 1][0]['t'])
        res.append({'t': c[0]['t'], 'e': round(end, 3), 'words': [{'w': x['w'].rstrip(',.'), 't': x['t'], 'g': x['g']} for x in c]})
    return res


def main():
    segs, subs, total = build()
    O = lambda i, s: out_t(segs, i, s)
    # B-roll a tutto schermo sopra la voce: (start, end, file, from, extra)
    broll0 = [
        dict(s=O(0, 5.10), e=O(0, 6.95), src='9364', frm=0.4, zoom=[1.0, 1.12], fx='whip'),
        dict(s=O(1, 4.05), e=O(1, 5.75), src='9370', frm=0.3, zoom=[1.05, 1.18], fx='flash'),
        dict(s=O(1, 6.30), e=O(1, 8.05), src='ai_front', frm=0.0, zoom=[1.0, 1.04], fx='cine'),
        dict(s=O(3, 2.70), e=O(3, 4.55), src='9367', frm=0.2, zoom=[1.0, 1.1], fx='sweep'),
        dict(s=O(4, 3.95), e=O(5, 7.75), src='9365', frm=0.0, zoom=[1.0, 1.15], fx='whip'),
        dict(s=O(6, 7.90), e=O(6, 9.95), src='ai_wheel', frm=0.5, zoom=[1.0, 1.04], fx='cine'),
        dict(s=O(8, 1.80), e=O(8, 2.70), src='9367', frm=1.2, zoom=[1.08, 1.2], fx='whip'),
        dict(s=O(8, 2.70), e=O(8, 4.40), src='9365', frm=0.3, zoom=[1.9, 2.1], origin=[0.70, 0.56], fx='flash'),
        dict(s=O(9, 1.55), e=O(9, 3.45), src='9382', frm=1.0, zoom=[1.0, 1.12], fx='whip'),
        dict(s=O(9, 3.45), e=O(9, 5.65), src='9366', frm=0.3, zoom=[1.05, 1.15], fx='sweep'),
        dict(s=O(10, 7.80), e=O(10, 11.30), src='9393', frm=0.0, zoom=[1.0, 1.1], fx='whip'),
        dict(s=O(10, 11.30), e=O(10, 14.10), src='9393', frm=3.6, zoom=[1.15, 1.3], fx='sweep'),
        dict(s=O(17, 11.30), e=O(17, 14.30), src='9382', frm=0.0, zoom=[1.15, 1.35], fx='flash'),
        dict(s=O(22, 28.65), e=O(22, 34.60), src='9382', frm=0.2, zoom=[1.0, 1.1], fx='whip', dim=0.55, rate=0.6),
    ]
    broll = [dict(x, s=q(x['s']), e=q(x['e'])) for x in broll0]
    G = []  # grafiche
    G.append(dict(k='tag', s=0.0, e=1.6, text='GIORNO 2'))
    G.append(dict(k='title', s=O(0, 5.15), e=O(0, 6.95), a='AUDI A1', b='COMPETITION'))
    G.append(dict(k='big', s=O(1, 4.10), e=O(1, 5.75), num=207, unit='CV'))
    G.append(dict(k='big', s=O(1, 6.40), e=O(1, 8.05), text='2.0', unit='TFSI'))
    G.append(dict(k='label', s=O(5, 5.95), e=O(5, 7.75), text='CERCHI 18" BRONZO'))
    G.append(dict(k='pop', s=O(6, 10.40), e=O(6, 11.30), text='TAMARRISSIMA'))
    G.append(dict(k='label', s=O(8, 1.85), e=O(8, 2.70), text='VETRI PRIVACY'))
    G.append(dict(k='label', s=O(8, 2.80), e=O(8, 4.40), text='PINZE ROSSE'))
    G.append(dict(k='label', s=O(9, 1.65), e=O(9, 3.45), text='LOGO NERO LUCIDO'))
    G.append(dict(k='label', s=O(9, 3.55), e=O(9, 5.65), text='FINITURE CROMATE'))
    G.append(dict(k='label', s=O(10, 6.00), e=O(10, 7.80), text='BATTITACCO S LINE'))
    G.append(dict(k='label', s=O(10, 7.90), e=O(10, 11.30), text='S LINE · MISTO PELLE'))
    G.append(dict(k='label', s=O(10, 11.40), e=O(10, 14.10), text='CUCITURE A CONTRASTO'))
    G.append(dict(k='label', s=O(11, 0.85), e=O(11, 4.30), text='VOLANTE S LINE'))
    G.append(dict(k='label', s=O(11, 5.00), e=O(11, 7.25), text='PALETTE AL VOLANTE'))
    G.append(dict(k='label', s=O(12, 13.50), e=O(12, 14.95), text='VIRTUAL COCKPIT'))
    G.append(dict(k='label', s=O(13, 3.60), e=O(13, 9.40), text='PACCHETTO LUCI'))
    G.append(dict(k='label', s=O(13, 11.30), e=O(13, 14.00), text='LUCI SULLE PORTIERE'))
    G.append(dict(k='label', s=O(14, 4.20), e=O(14, 5.60), text='SEDILI RISCALDATI'))
    G.append(dict(k='label', s=O(14, 5.65), e=O(14, 7.90), text='DRIVE SELECT'))
    G.append(dict(k='label', s=O(14, 8.10), e=O(15, 11.95), text='S TRONIC'))
    G.append(dict(k='label', s=O(16, 2.00), e=O(16, 3.30), text='RETROCAMERA'))
    G.append(dict(k='pop', s=O(16, 3.30), e=O(16, 4.60), text='RARITÀ'))
    G.append(dict(k='vs', s=O(19, 5.15), e=O(20, 22.35), rival=O(19, 9.90), same=O(20, 15.30)))
    G.append(dict(k='pop', s=O(21, 3.05), e=O(21, 4.90), text='POCHISSIME IN ITALIA'))
    G.append(dict(k='km', s=O(21, 9.60), e=O(21, 11.00), num=25325))
    G.append(dict(k='stamp', s=O(21, 15.35), e=O(21, 15.95) + 0.0, text='PEZZO UNICO'))
    G.append(dict(k='spec', s=O(22, 28.75), e=O(22, 34.60)))
    G.append(dict(k='place', s=O(23, 3.95), e=O(23, 7.95)))
    G.append(dict(k='wa', s=O(24, 9.40), e=O(24, 14.60)))
    G.append(dict(k='end', s=total, e=total + END_CARD))

    # effetti sonori: (t, nome, gain dB)
    S = [(0.0, 'bass_hit', -4), (0.0, 'whoosh', -8), (O(0, 5.10), 'whoosh', -6), (O(0, 5.15), 'bass_hit', -6),
         (O(1, 4.05), 'ticker', -10), (O(1, 4.60), 'bass_hit', -8), (O(1, 6.30), 'riser', -14), (O(2, 8.50), 'engine', -6),
         (O(3, 2.65), 'shimmer', -12), (O(4, 3.90), 'whoosh', -8), (O(5, 5.95), 'pop', -10), (O(6, 7.85), 'shimmer', -10),
         (O(6, 10.40), 'pop', -8), (O(8, 1.75), 'whoosh', -9), (O(8, 2.70), 'turbo', -12), (O(9, 1.50), 'whoosh', -8),
         (O(9, 3.40), 'shimmer', -12), (O(10, 7.75), 'whoosh', -9), (O(11, 0.85), 'pop', -11), (O(11, 5.00), 'pop', -11),
         (O(12, 13.50), 'pop', -11), (O(13, 3.60), 'shimmer', -12), (O(14, 4.20), 'pop', -11), (O(14, 5.65), 'pop', -11),
         (O(14, 8.10), 'pop', -11), (O(16, 2.00), 'pop', -10), (O(16, 3.30), 'bass_hit', -10), (O(17, 11.25), 'engine', -5),
         (O(19, 9.90), 'bass_hit', -8), (O(20, 15.30), 'ticker', -10), (O(21, 3.05), 'pop', -9), (O(21, 9.60), 'ticker', -9),
         (O(21, 15.35), 'stamp', -4), (O(22, 28.70), 'whoosh', -8), (O(23, 3.95), 'pop', -9), (O(24, 9.40), 'pop', -9),
         (total - 0.6, 'riser', -12), (total, 'door', -3), (total, 'bass_hit', -6)]

    tl = dict(fps=FPS, total=round(total, 3), dur=round(total + END_CARD, 3), segs=segs, broll=broll, g=G,
              subs=chunk_subs(subs), sfx=[dict(t=round(a, 3), n=b, db=c) for a, b, c in S])
    os.makedirs(PUB, exist_ok=True)
    json.dump(tl, open(os.path.join(ROOT, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'durata parlato {total:.1f}s, totale {total + END_CARD:.1f}s, {len(tl["subs"])} sottotitoli')


if __name__ == '__main__':
    main()
