"""Scaletta del parlato: frasi scelte su raw/merged.mov (stessa base tempi dell'mp3 trascritto), pause lunghe accorciate.
Scrive timeline.json (segmenti tenuti), words.json [[t_out, parola, frase]], sents.json   uso: python3 psa_live/cut.py"""
import json, os, re, subprocess

D = os.path.dirname(os.path.abspath(__file__))
# frase: (inizio, fine) nel file unito, testo dalla trascrizione di Meme. Clip 4bis = ripresa doppia della 4: scartata.
FR = [
    (0.85, 5.72, "Per noi uomini parlare di prostata non è sempre facile, ma è importante sapere certe cose."),
    (9.70, 17.93, "Sicuramente hai sentito parlare di PSA, è una proteina prodotta dalla prostata considerata come marcatore del suo stato di salute."),
    (18.10, 20.36, "Si misura con un semplice prelievo di sangue."),
    (22.35, 25.42, "Quali possono essere le cause di un valore alto di PSA?"),
    (26.34, 27.89, "Sostanzialmente sono due."),
    (28.68, 35.68, "La prostata ingrossata dovuta a infiammazione, infezione, prostatiti oppure un tumore alla prostata."),
    (35.92, 40.70, "Però aspetta, un valore di PSA alto non vuol dire necessariamente tumore."),
    (42.71, 53.84, "Da quale età è importante fare il test del PSA? Generalmente dai 50|3 anni in su, ma anche prima, dai 40-45|8 in caso di familiarità o presenza di fattori di rischio."),
    (70.46, 78.82, "Al di là di un possibile tumore, verificare lo stato di salute della prostata con un esame del sangue è importante. Ma sai perché?"),
    (79.22, 84.73, "Non sempre un valore alto di PSA si manifesta con dei sintomi. Per questo è importante sapere quali sono i fattori di rischio."),
    (87.65, 104.98, "Noi possiamo aiutarti a farlo. Nella nostra area servizi puoi effettuare il test con un prelievo capillare, rapido e discreto. Ti diamo tutte le informazioni che ti servono prima del test. Ti supportiamo nella lettura dei valori e come sempre ti diamo i consigli giusti. In pratica ti seguiamo passo passo."),
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
json.dump({'fps': 30, 'tail': 3.6, 'src': 'raw/merged.mov', 'segs': segs}, open(f'{D}/timeline.json', 'w'), indent=1)
json.dump(words, open(f'{D}/words.json', 'w'), ensure_ascii=False)
json.dump(sents, open(f'{D}/sents.json', 'w'), ensure_ascii=False, indent=1)
print('segmenti', len(segs), 'parlato', round(t, 2), 'totale', round(t + 3.6, 2))
for s in sents: print(s['t'], s['end'], s['txt'][:60])
