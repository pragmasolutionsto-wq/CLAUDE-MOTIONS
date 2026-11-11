"""Scaletta del parlato (diabete: complicanze e piccole attenzioni): frasi scelte su raw/merged.mov (stessa base tempi dell'mp3 trascritto), pause lunghe accorciate.
Scrive timeline.json (segmenti tenuti), words.json [[t_out, parola, frase]], sents.json   uso: python3 psa_live/cut.py"""
import json, os, re, subprocess

D = os.path.dirname(os.path.abspath(__file__))
# frase: (inizio, fine) nel file unito, testo dalla trascrizione di Meme. 
FR = [  # una presa per clip; testo dalla trascrizione di Meme (refusi corretti), tempi dai silenzi reali
    (0.05, 5.14, "Se convivi con il diabete, devi sapere che anche se prendi i tuoi farmaci, la glicemia può oscillare."),
    (5.62, 10.25, "Contano infatti anche alimentazione, movimento, stress e malattie."),
    (10.98, 14.12, "Per questo, oltre ai farmaci, sono importanti i controlli."),
    (15.48, 20.21, "Il diabete può favorire la pelle secca e, nel tempo, ridurre la sensibilità dei piedi."),
    (20.52, 25.23, "Controllali ogni giorno, asciugali bene, applica una crema emolliente, ma non tra le dita."),
    (26.28, 32.60, "Può favorire anche la secchezza degli occhi. Ricorda che i controlli oculistici, per te che hai il diabete, vanno fatti regolarmente."),
    (35.30, 41.06, "Nelle donne, il diabete può favorire secchezza e infezioni intime, che purtroppo incidono anche sul benessere sessuale."),
    (46.72, 57.14, "Un'altra cosa importante: se compare una ferita al piede, oppure il piede diventa rosso, caldo o gonfio, anche senza dolore, vai dal medico o vieni a parlarne con noi."),
    (61.70, 63.37, "Quindi, in pratica, cosa devi fare?"),
    (63.56, 67.06, "Prenderti cura di te con consapevolezza, senza stress o ansia."),
    (70.98, 80.71, "Noi possiamo aiutarti a scegliere le soluzioni più adatte per proteggere la pelle di viso e corpo, mantenere la lubrificazione degli occhi e, se sei una donna, per il tuo comfort intimo."),
    (84.33, 89.05, "Ricorda che i problemi più seri possono essere evitati con piccoli gesti quotidiani di cura."),
    (89.36, 91.80, "Se hai bisogno di noi, come sempre, siamo qui."),
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
