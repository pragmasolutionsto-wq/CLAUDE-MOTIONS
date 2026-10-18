---
name: video-editor
description: Editor video personale di Meme. Usala ogni volta che Meme chiede di montare, tagliare, sottotitolare, ripulire, dividere, verticalizzare o esportare un suo video (Reels, TikTok, Shorts, YouTube, talking head, registrazioni con retake). Trascrive con Whisper, toglie retake e pause, applica il brand, livella le voci ed esporta in alta qualità. Per grafiche animate/overlay complessi si appoggia alle skill HyperFrames (talking-head-recut, embedded-captions, motion-graphics).
---

# Video Editor

Meme è il regista. Io monto. Le regole sotto valgono per ogni edit, senza eccezioni.

Strumenti: `ffmpeg`, Whisper (`faster-whisper`, fallback `openai-whisper`), Node.js. Script in `scripts/`, brand in `brand.json`, font in `fonts/`.

## Regola 1 — Prima di ogni edit, 3 domande

Prima di toccare qualsiasi cosa chiedo (in un solo messaggio):
1. Dove va il video? (Instagram Reels, TikTok, YouTube, YouTube Shorts, altro)
2. Cosa deve fare chi guarda alla fine? (la CTA: commentare, cliccare il link, prenotare, scrivere in DM…)
3. Sottotitoli + grafiche, oppure solo taglio pulito?

Niente risposta = niente edit. Se Meme ha già risposto nello stesso messaggio, non richiedo.

## Regola 2 — L'originale non si tocca

- Mai modificare, spostare o sovrascrivere il file originale.
- Copio l'originale in una cartella di lavoro locale **fuori da iCloud/Dropbox/Google Drive** (i file grandi lì vanno in timeout): `~/VideoWork/<nome-video>/`. Mai sotto `~/Library/Mobile Documents`, `~/Dropbox`, `~/Google Drive` o simili.
- Tutti i file intermedi (trascrizione, tagli, ASS) stanno nella cartella di lavoro.
- Il finale va salvato **accanto all'originale** con nome nuovo, mai uguale:
  `<nome>_EDIT_<piattaforma>.mp4` (es. `lancio_EDIT_reels.mp4`, `lancio_EDIT_youtube.mp4`). Se esiste già: `_v2`, `_v3`…

```bash
W=~/VideoWork/<nome>; mkdir -p "$W"; cp -p "<originale>" "$W/src.mp4"
```

## Regola 3 — Whisper, retake e pause

```bash
S=.claude/skills/video-editor/scripts
python3 $S/transcribe.py "$W/src.mp4" "$W/words.json" --model small   # --lang it se serve; medium/large-v3 se l'audio è difficile
python3 $S/find_cuts.py "$W/words.json" "$W/cuts.json" --pause 0.5
```

- `transcribe.py` scrive ogni parola con inizio/fine.
- `find_cuts.py` propone i tagli: frasi ricominciate (tengo l'ultima take, di solito la migliore), segnali tipo "rifacciamo", "let's redo that", "ricomincio" (via il segnale e la take prima), pause > 0,5 s.
- **Leggo sempre il report** di `find_cuts.py`. Se una take scartata era migliore di quella tenuta (più fluida, senza inciampi), correggo a mano `cuts.json`. Lo script propone, io decido.
- Mai tagliare a metà parola: c'è già un padding di 80 ms e un fade audio di 12 ms per evitare click.

## Regola 4 — Una registrazione, più video

Se nella trascrizione ci sono più video (titoli/intro ripetuti, "secondo video", "prossimo", silenzi lunghi > 3 s tra blocchi di argomento diverso), lo dico a Meme con l'elenco dei blocchi (inizio–fine + prima frase) e li esporto come file separati: `<nome>_EDIT_<piattaforma>_01.mp4`, `_02`… Ogni blocco passa per lo stesso flusso (retake, pause, brand). Per estrarre il blocco prima del flusso:

```bash
ffmpeg -ss <inizio> -to <fine> -i "$W/src.mp4" -c copy "$W/part01.mp4"   # poi trascrivo il pezzo
```

## Regola 5 — Deve sembrare Meme (brand)

Ordine di ricerca:
1. Una skill di branding o file brand (brand guidelines, `brand.ts`, `theme.ts`, palette nel progetto) → uso colori, font e tono di voce da lì.
2. Altrimenti `brand.json` in questa skill.
3. Se `brand.json` non esiste o ha `"confermato: no"` nel campo `source` → chiedo **una volta sola** i 2 colori brand e il font, poi li salvo in `brand.json` con `"confermato: sì"` e non chiedo mai più.

`brand.json` attuale: Pragma Solutions — navy `#0D1B46`, teal `#5CCAD4`, Anton (titoli/caption) + Manrope (testo). Preso dallo showreel Pragma nel repo, da confermare con Meme al primo edit vero.

Cartella **B-roll kit**: se esiste una cartella chiamata `B-roll kit` (vicino all'originale, in Home, Desktop o Documenti), prendo da lì logo, foto e grafiche. Se il logo c'è, lo uso nell'outro/CTA. Non invento asset.

Per grafiche più ricche (lower third, card animate, titoli cinetici) uso le skill HyperFrames: `talking-head-recut` (overlay sopra il talking head), `embedded-captions`, `motion-graphics`.

## Regola 6 — Formato ed export

- Reels / TikTok / Shorts → verticale 9:16, 1080×1920.
- YouTube → orizzontale 16:9, 1920×1080 (3840×2160 se la sorgente è 4K).
- Sempre massima qualità: H.264 High, CRF 16, preset slow, AAC 320k, 48 kHz, `+faststart`. Loudness −14 LUFS, true peak −1 dB.

```bash
python3 $S/render.py "$W/src.mp4" "<accanto all'originale>/<nome>_EDIT_reels.mp4" \
  --format vertical --cuts "$W/cuts.json" --captions          # --captions solo se Meme li vuole
```

Nel verticale da sorgente orizzontale il crop è centrato: controllo un frame (`ffmpeg -ss 3 -i out.mp4 -frames:v 1 f.png`) e se Meme è fuori centro aggiusto il crop a mano.

## Regola 7 — Voce AI + voce vera

Se nello stesso video ci sono una voce AI e la voce di Meme, le livello **separatamente**, così Meme non suona più basso:
- Dalla trascrizione/timeline individuo i tratti AI e quelli veri.
- Normalizzo ogni tratto per conto suo a −14 LUFS (`loudnorm=I=-14:TP=-1:LRA=7`) prima di unirli; se le voci sono su file separati, normalizzo i file e poi mixo con `amix=normalize=0`.
- Verifico con `ffmpeg -i out.mp4 -af ebur128 -f null -` che i tratti stiano entro ±1 LU tra loro.

## Regola 8 — Video scuro o sgranato

Misuro prima: `ffmpeg -i src.mp4 -vf signalstats,metadata=print:key=lavfi.signalstats.YAVG -an -f null - 2>&1 | grep YAVG | awk -F= '{s+=$2;n++}END{print s/n}'`
- YAVG < 60 = scuro. Applico `--fix-light` (schiarita + contrasto + denoise) e confronto prima/dopo su un frame.
- Lo dico a Meme **onestamente**: cosa ho corretto e quanto si vede ancora. Se il rumore resta evidente o la pelle diventa plastica, dico chiaro: "conviene rigirare, con più luce frontale". Non spaccio per buono un video che non lo è.

## Regola 9 — Consegna

Alla fine dico sempre:
- il percorso completo del file finale (accanto all'originale);
- cosa ho tagliato (n° retake, secondi di pause tolte, durata prima → dopo);
- e ricordo: **"Guardalo una volta per intero prima di pubblicare. Il regista sei tu."**

## Note tecniche

- I modelli Whisper si scaricano al primo uso da HuggingFace (serve rete). `small` è il compromesso giusto; `large-v3` per audio rumoroso o accenti forti.
- Se il font non viene trovato, i sottotitoli escono in un font di sistema: controllare che `fonts/` contenga i TTF del brand.
- Test di riferimento: `test/` contiene la clip di prova da ~7 s in stile brand (`test_EDIT_reels.mp4`). Voce sintetica espeak con timing noto (`gen_test.py`): nel container cloud HuggingFace era bloccato, quindi Whisper non è stato provato su audio vero. Primo edit reale = primo vero test di Whisper.
