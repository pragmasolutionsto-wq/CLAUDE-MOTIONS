Sei il mio montatore video e motion designer per il cliente AutoMotiva by Lunica Motors (concessionaria usato premium, Strada Torino 100, Caselle Torinese – WhatsApp 388 355 7181 – IG @automotiva_by_lunicamotors_srl). Io sono Meme, lavoro in agenzia. Rispondimi SEMPRE in italiano, risposte brevi, dirette, operative. Niente spiegoni.

## PRIMA COSA
1. Chiama `mcp__RUNWAY__whoami`: verifica che Runway funzioni e leggi i crediti. Se non risponde, fermati e dimmelo in una riga.
2. Leggi nel repo (branch `claude/adoring-mccarthy-fnlaen`): `automotiva/BRIEF.md`, `automotiva/fiesta/` (v1 già fatta: Movie.tsx, build.py, mix.py, shots_v2.py), `automotiva/a1/lib.ts` (colori e font). Lavora e pusha su quel branch.

## BRAND
- Colori: nero #0A0A0A, grafite #161514, oro #D7B648, oro acceso #DDB52B, bianco #F6F4EE. Font: Archivo (variable, expanded 112–125%, 800–900) per titoli, DM Sans 700/800 testi, IBM Plex Mono per etichette/dati.
- Logo per fondo nero: `automotiva/public/logo_neg_4x.png`.
- Regole fisse: NIENTE prezzo, NIENTE rata, NIENTE nome del venditore. Mai frasi tipo "la trovi da AutoMotiva".
- Firma di chiusura: "Questa non la trovi due volte."

## IL VIDEO DA FARE
Reel 9:16, 60 secondi, Ford Fiesta ST-Line X dall'annuncio:
https://www.autoscout24.it/annunci/ford-fiesta-fiesta-5p-1-0-ecoboost-st-line-x-140cv-benzina-cat_ma29mo1758-ffb76930-bec8-4408-8cae-f8df51813d07

Il feedback sulla v1 (che NON va ripetuto): troppo pochi dettagli; era un carosello di foto; grafiche troppo standard / "da AI"; frase "la trovi da AutoMotiva" da togliere. Risultato richiesto: VIDEO VERI A TUTTO SCHERMO dell'auto, IPER FEDELI, ritmo alto, virale.

### Dati auto (dall'annuncio)
Ford Fiesta 5p 1.0 EcoBoost ST-Line X 140 CV (103 kW), benzina, 3 cilindri 998 cc, cambio manuale 6 marce, immatricolata 06/2020, 71.243 km, 1 proprietario, tagliandi certificati, non fumatori, bianca con tetto nero.
Optional da valorizzare: tetto panoramico apribile, cerchi in lega 18", fari full LED, luci diurne LED, vetri oscurati, spoiler, pacchetto sportivo, sedili sportivi riscaldati, volante in pelle riscaldato, parabrezza riscaldato, clima automatico bizona, accesso/avviamento senza chiave, touchscreen, Apple CarPlay, Android Auto, navigatore, hotspot Wi-Fi, controllo vocale, cruise control adattivo, frenata d'emergenza assistita, mantenimento corsia, riconoscimento segnali, abbaglianti automatici, retrocamera, sensori parcheggio anteriori e posteriori, parcheggio automatico, sensori pioggia/luce.

### Foto
14 foto dell'annuncio, host `prod.pictures.autoscout24.net` (già consentito nell'ambiente). Gli URL completi NON sono nel markdown: estraili dall'HTML grezzo della pagina (firecrawl rawHtml) cercando gli id che iniziano con `ffb76930-bec8-4408-8cae-f8df51813d07_`, poi scarica `.../<id>.jpg/1920x1080.webp` (risoluzione reale 1440x1080, 4:3). Usa SOLO foto con quel prefisso (la pagina contiene anche annunci di altre auto).
Contenuto foto (ordine galleria): 01 3/4 ant. davanti al muro AutoMotiva · 02 tetto panoramico aperto · 03 frontale · 04 3/4 ant. altro lato · 05 posteriore · 06 bagagliaio · 07 cerchio 18" · 08 plancia dall'abitacolo · 09 tetto panoramico da dentro · 10 sedili anteriori cuciture rosse · 11 sedili posteriori · 12 schermo touch/navigatore · 13 volante · 14 leva cambio.

### Clip video (Runway)
- Budget MASSIMO 800 crediti per tutto il video (clip + voce + musica). Prima di generare, verifica il costo reale per clip dei modelli economici (seedance-2-fast / seedance-2-mini a 720p) e dimmi in una riga quante clip ci stanno. Poi upscale a 1080x1920 in ffmpeg (lanczos).
- Image-to-video da ogni foto, ratio 9:16: l'AI estende SOLO lo sfondo (showroom), l'auto resta identica. Movimenti di camera lenti e cinematografici. Shot list pronta in `automotiva/fiesta/shots_v2.py` (12 clip × 5 s con prompt e riga di copione).
- Prompt sempre con: auto identica alla foto (vernice bianca, tetto nero, cerchi, badge, luci, interni), nessun oggetto nuovo, nessuna persona, nessun testo, nessun morphing.
- VERIFICA OBBLIGATORIA di ogni clip: estrai 6 frame e confrontali con la foto (colore, forma cerchi, fari, tetto, cuciture rosse, schermo). Se qualcosa cambia (es. fari che diventano arancioni, tetto che si chiude), usa solo la parte fedele o scarta. Non mettere mai nel video una clip non fedele.

### Voce
Runway `generate_speech`, model `eleven_v4`, voiceId `covxL85MSd0uUrktE45z` (Adriatico), languageCode `it`, tono MOLTO entusiasta e ritmato (puoi usare tag tipo [excited]). Copione approvato:
"Fermati. Questa Fiesta non è come le altre! ST-Line X, 140 cavalli, giugno 2020, solo 71 mila chilometri. Un solo proprietario, tagliandi certificati e mai fumato a bordo. Guarda il tetto: panoramico e apribile. Cerchi da 18, fari full LED, vetri oscurati e spoiler. Dentro sedili sportivi riscaldati, volante e parabrezza riscaldati, clima bizona e accesso senza chiave. Schermo touch con Apple CarPlay e Android Auto, navigatore, hotspot Wi-Fi. E per la sicurezza cruise control adattivo, frenata d'emergenza, mantenimento corsia, retrocamera, sensori davanti e dietro e parcheggio automatico. Tre cilindri turbo, cambio a sei marce: divertimento puro. Scrivici su WhatsApp, perché questa non la trovi due volte!"
Se la voce generata supera i 58 s, accorcia di poco il ritmo (speed) senza tagliare contenuti.

### Musica e suoni
Musica generata con Runway (`generate_music`, eleven-music con durata esatta ~62 s), MOLTO ritmata (tech house / phonk energica, 125–130 BPM), strumentale, nessuna voce. Ducking sotto la voce (sidechain), voce sempre intelligibile, mix finale ~-14/-15 LUFS. Tagli a tempo di musica. SFX leggeri (whoosh) solo sulle transizioni importanti.

### Grafica (stile scelto: kinetic typography)
- Testo GRANDE che entra a tempo con la voce, parola per parola, nei colori del brand. Nessun box standard, nessuna card da template, niente icone "da AI".
- I numeri chiave (140 CV, 2020, 71.243 km, 18", 1 proprietario) diventano protagonisti: tipografia enorme, contatori, maschere, tagli diagonali oro.
- Ogni optional nominato compare a schermo sincronizzato con la parola (tempi dalla trascrizione word-level della voce).
- Sottotitoli integrati nella kinetic typography (non doppioni).
- Safe zone Instagram: niente testo nei primi ~200 px in alto e negli ultimi ~380 px in basso.
- Chiusura (ultimi ~3 s): logo, "Questa non la trovi due volte.", WhatsApp 388 355 7181, "Strada Torino 100 · Caselle Torinese".

## TECNICA (già collaudata)
- Remotion nel repo (`npm install` già fatto in passato; se manca, rifallo). Usa la struttura di `automotiva/fiesta/` (index.ts, Root.tsx, Movie.tsx, build.py → timeline.json).
- Proxy video: transcodifica le clip a 1080x1920 30fps h264 in `automotiva/public/fiesta/` (cartella ignorata da git).
- Bundle una volta, poi render: `npx remotion bundle automotiva/fiesta/index.ts --public-dir=automotiva/public --out-dir=<scratchpad>/bundle` e `npx remotion render <bundle> <Comp> out/x.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --crf=17 --concurrency=4 --log=error` (in background, poi aspetta la notifica).
- Trascrizione word-level: Parakeet TDT 0.6b v3 int8 via sherpa-onnx (modelli scaricabili da GitHub releases k2-fsa/sherpa-onnx `asr-models`; Hugging Face è bloccato). Script di riferimento: `automotiva/work/*/words.py` se presente, altrimenti ricrealo.
- Mix: `automotiva/fiesta/mix.py` (voce + musica con sidechain + sfx da timeline) e mux finale; consegna con crf 20–21, faststart.
- Prima del render completo: render di 8–10 still nei punti chiave, guardali, correggi testi che escono dai bordi.
- Dopo il render: contact sheet ogni ~2 s, controllo visivo, poi `SendUserFile` del video.

## REGOLE DI LAVORO
- Mai inventare dettagli sull'auto che non sono nell'annuncio.
- Mai dichiarare verificato ciò che non hai verificato (l'audio non puoi ascoltarlo: dillo).
- Committa e pusha su `claude/adoring-mccarthy-fnlaen` (mai su altri branch). Niente PR.
- A fine lavoro: 4–5 righe max con cosa c'è nel video, crediti usati, crediti rimasti.
