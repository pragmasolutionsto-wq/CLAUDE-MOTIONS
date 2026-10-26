"""Scaletta del parlato (attivi Unifarco): frasi scelte su raw/merged.mov (stessa base tempi dell'mp3 trascritto), pause lunghe accorciate.
Scrive timeline.json (segmenti tenuti), words.json [[t_out, parola, frase]], sents.json   uso: python3 psa_live/cut.py"""
import json, os, re, subprocess

D = os.path.dirname(os.path.abspath(__file__))
# frase: (inizio, fine) nel file unito, testo dalla trascrizione di Meme. 
FR = [  # ripresa migliore di ogni modulo (2 prese per modulo); modulo 3: prima presa, la seconda parte con una falsa partenza
    (18.42, 22.36, "Sono certa che in questo momento hai un desiderio per la pelle del tuo viso."),
    (22.70, 27.30, "Ridurre le rughe, migliorare il tono, il colorito, la luminosità e l'idratazione."),
    (45.62, 49.42, "È necessario cambiare la tua skincare per realizzare questo desiderio?"),
    (49.62, 51.58, "In realtà no, e ti spiego perché."),
    (55.20, 56.50, "Vedi queste boccettine?"),
    (56.85, 60.82, "Contengono attivi concentrati specifici per ogni bisogno della pelle."),
    (61.20, 66.08, "Li puoi usare in 2|1 modi, o direttamente sul viso o mescolandoli alla crema che usi sempre."),
    (108.85, 109.88, "Facciamo un esempio."),
    (110.04, 115.36, "Usi già una crema anti-aging, ma in questo momento vedi la tua pelle spenta e poco luminosa."),
    (115.76, 124.12, "Utilizzando l'attivo concentrato alla vitamina C, puoi continuare ad agire sulle rughe con la crema. E in più, grazie all'attivo, anche sulla luminosità."),
    (146.33, 155.50, "Se hai voglia di prenderti cura di te, vieni a trovarci in farmacia. Partiamo da come sta la tua pelle in questo momento e capiamo qual è l'attivo concentrato giusto per te."),
    (155.88, 156.72, "Ti aspettiamo!"),
]
GAP_MAX, KEEP = 0.38, 0.14  # pause più lunghe di GAP_MAX ridotte a 2*KEEP
out = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{D}/raw/merged.mov', '-af', 'silencedetect=n=-34dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
SIL = list(zip(st, en))
syl = lambda w: max(1, len(re.findall(r'[aeiouàèéìòóù]+', w.lower())))
segs, words, sents, t = [], [], [], 0.0
for k, (a, b, txt) in enumerate(FR):
    # parlato dentro la frase = [a,b] meno i silenzi
    v, cur = [], a
    for s0, s1 in SIL:
        if s1 <= a or s0 >= b: continue
        if s0 > cur: v.append([cur, s0])
        cur = max(cur, s1)
    if cur < b: v.append([cur, b])
    v = [x for x in v if x[1] - x[0] > 0.06]
    # segmenti tenuti: unisce i pezzi con pause brevi, accorcia le lunghe
    keep = [[v[0][0] - 0.08, v[0][1]]]
    for p, q in v[1:]:
        if p - keep[-1][1] <= GAP_MAX: keep[-1][1] = q
        else: keep[-1][1] += KEEP; keep.append([p - KEEP, q])
    keep[-1][1] += 0.12
    t0 = t
    for p, q in keep:
        segs.append({'in': round(p, 3), 'out': round(q, 3), 'k': k}); t += q - p
    # parole: sillabe distribuite sul parlato, poi mappate nel tempo di uscita
    toks, n = txt.split(), []
    for i, w in enumerate(toks):
        m = re.match(r'^(.*)\|(\d+)(.*)$', w)
        if m: toks[i] = m.group(1) + m.group(3); n.append(int(m.group(2)))
        else: n.append(syl(w))
    lens = [q - p for p, q in v]; V = sum(lens); tot = sum(n); c = 0
    def src_at(f):
        r = f * V
        for (p, q), L in zip(v, lens):
            if r <= L: return p + r
            r -= L
        return v[-1][1]
    def to_out(x):
        acc = t0
        for p, q in keep:
            if x < q: return acc + max(0, x - p)
            acc += q - p
        return acc
    for w, q in zip(toks, n):
        words.append([round(to_out(src_at(c / tot)), 3), w, k]); c += q
    sents.append({'t': round(t0, 3), 'end': round(t, 3), 'txt': re.sub(r'\|\d+', '', txt)})
json.dump({'fps': 30, 'tail': 4.2, 'src': 'raw/merged.mov', 'segs': segs}, open(f'{D}/timeline.json', 'w'), indent=1)
json.dump(words, open(f'{D}/words.json', 'w'), ensure_ascii=False)
json.dump(sents, open(f'{D}/sents.json', 'w'), ensure_ascii=False, indent=1)
print('segmenti', len(segs), 'parlato', round(t, 2), 'totale', round(t + 4.2, 2))
for s in sents: print(s['t'], s['end'], s['txt'][:60])
