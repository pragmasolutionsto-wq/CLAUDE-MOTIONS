"""Scaletta del parlato (prevenzione diabete): frasi scelte su raw/merged.mov (stessa base tempi dell'mp3 trascritto), pause lunghe accorciate.
Scrive timeline.json (segmenti tenuti), words.json [[t_out, parola, frase]], sents.json   uso: python3 psa_live/cut.py"""
import json, os, re, subprocess

D = os.path.dirname(os.path.abspath(__file__))
# frase: (inizio, fine) nel file unito, testo dalla trascrizione di Meme. 
FR = [  # una presa per clip; testo dalla trascrizione di Meme (refusi corretti), tempi dai silenzi reali
    (3.40, 11.30, "Novembre è il mese del diabete e voglio dirti una cosa che riguarda soprattutto chi il diabete non ce l'ha o pensa di non averlo."),
    (15.72, 19.98, "Il diabete di tipo 2|1 è il più diffuso e può crescere in silenzio."),
    (20.42, 26.64, "All'inizio spesso non dà sintomi, per questo conoscere la tua glicemia ti permette di muoverti prima."),
    (30.76, 44.45, "Ci sono 2|2 esami per farlo: la glicemia misura il glucosio nel sangue nel momento del prelievo, è come una fotografia. L'emoglobina glicata misura la media degli ultimi 2|2 o 3|1 mesi, è come un filmato."),
    (49.46, 54.63, "Insieme danno un quadro più completo e possono mostrare un'eventuale prediabete."),
    (55.06, 58.53, "Non è ancora diabete, ma è un segnale che merita attenzione."),
    (58.74, 64.25, "Con alimentazione, movimento, peso e sonno si può ridurre il rischio che peggiori."),
    (67.98, 71.57, "A chi consigliamo di controllare glicemia ed emoglobina glicata?"),
    (72.08, 75.28, "A tutti, a partire dai 40-45|8 anni,"),
    (75.56, 84.45, "in particolar modo a chi ha familiari diabetici, a chi è in sovrappeso o si muove poco, a chi ha pressione e colesterolo o trigliceridi alterati."),
    (88.40, 98.48, "E se sei donna: se hai avuto il diabete in gravidanza, se hai partorito un bambino molto grande o se hai l'ovaio policistico o altre condizioni di insulino-resistenza."),
    (102.55, 109.41, "Per tutto novembre qui da noi trovi il pacchetto glicemia più emoglobina glicata a prezzo promozionale."),
    (113.23, 118.37, "Un controllo semplice da fare nella nostra comoda area servizi, in tranquillità."),
    (118.90, 122.00, "Ti aspettiamo, come sempre siamo qui per te."),
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
