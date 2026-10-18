#!/usr/bin/env python3
"""Dalle parole di Whisper decide cosa tenere: via retake, frasi rifatte e pause > soglia.

uso: find_cuts.py WORDS.json CUTS.json [--pause 0.5] [--pad 0.08]
Output: {"keep": [[s, e], ...], "dropped": [{"text", "reason"}], "words": [...parole tenute...]}
Il report a schermo va SEMPRE riletto: è una proposta, la decisione finale è dell'editor.
"""
import argparse, json, re, unicodedata

ap = argparse.ArgumentParser()
ap.add_argument("words")
ap.add_argument("out")
ap.add_argument("--pause", type=float, default=0.5)
ap.add_argument("--pad", type=float, default=0.08)
a = ap.parse_args()

words = json.load(open(a.words))["words"]

# frasi che segnalano "rifaccio": la frase che le contiene e quella prima vanno via
REDO = [r"let'?s redo( that)?", r"redo that", r"let me (start|try) (again|over)", r"take (two|2|three|3)",
        r"one more time", r"from the top", r"rifacciamo", r"rifaccio", r"la rifaccio", r"ricomincio",
        r"da capo", r"riproviamo", r"riprovo", r"scusa+,? (rifaccio|ricomincio)", r"ok,? (di nuovo|ancora)"]
REDO_RE = re.compile(r"\b(" + "|".join(REDO) + r")\b", re.I)


def norm(t):
    t = unicodedata.normalize("NFKD", t.lower())
    return re.sub(r"[^a-z0-9' ]", "", t).strip()


# 1. spezza in frasi: pausa lunga o punteggiatura finale
sents, cur = [], []
for i, w in enumerate(words):
    if cur and (w["s"] - cur[-1]["e"] > a.pause or re.search(r"[.!?]$", cur[-1]["w"])):
        sents.append(cur)
        cur = []
    cur.append(w)
if cur:
    sents.append(cur)

text = lambda s: " ".join(w["w"] for w in s)
drop = {}

# 2. "rifacciamo" & co: via la frase del segnale e quella prima
for i, s in enumerate(sents):
    if REDO_RE.search(norm(text(s))):
        drop[i] = "segnale di retake"
        if i > 0 and i - 1 not in drop:
            drop[i - 1] = "take scartato (prima del segnale)"

# 3. frase ricominciata: se una delle 2 frasi dopo parte con le stesse 2-3 parole, tengo l'ultima
for i, s in enumerate(sents):
    if i in drop:
        continue
    head = [norm(w["w"]) for w in s[:3]]
    n = 3 if len(s) >= 3 else len(s)
    for j in range(i + 1, min(i + 3, len(sents))):
        if j in drop:
            continue
        other = [norm(w["w"]) for w in sents[j][:n]]
        if n >= 2 and head[:n] == other[:n]:
            drop[i] = f"ripartenza (rifatta alla frase {j + 1})"
            break

kept_words = [w for i, s in enumerate(sents) if i not in drop for w in s]

# 4. segmenti da tenere: unisco le parole finché il buco è <= soglia pausa
keep = []
for w in kept_words:
    s, e = max(0.0, w["s"] - a.pad), w["e"] + a.pad
    if keep and s - keep[-1][1] <= a.pause:
        keep[-1][1] = max(keep[-1][1], e)
    else:
        if keep and s < keep[-1][1]:
            s = keep[-1][1]
        keep.append([round(s, 3), round(e, 3)])

dropped = [{"n": i + 1, "text": text(sents[i]), "reason": r} for i, r in sorted(drop.items())]
json.dump({"keep": keep, "dropped": dropped, "words": kept_words}, open(a.out, "w"), ensure_ascii=False, indent=1)

dur_in = words[-1]["e"] if words else 0
dur_out = sum(e - s for s, e in keep)
print(f"frasi: {len(sents)}  scartate: {len(dropped)}  segmenti: {len(keep)}")
print(f"durata parlato: {dur_in:.1f}s -> {dur_out:.1f}s")
for d in dropped:
    print(f"  ✂ [{d['n']}] {d['reason']}: {d['text']}")
