---
description: Crea una nuova demo homepage per un medico a partire dall'URL del suo sito
argument-hint: <url-sito-medico>
---

Crea una nuova demo per il medico con sito: $ARGUMENTS

Lavora nella cartella del progetto demo-medici (dove c'è `astro.config.mjs`). Prima di tutto leggi `CLAUDE.md`: le regole fisse lì dentro sono vincolanti. Usa `src/data/medici/motta-m2zh.json` come schema di riferimento (stessi campi, stessa struttura).

## 1. Leggi il sito
Scarica la home e le pagine principali (chi sono / about, servizi / patologie, contatti, eventuali pagine sedi). Usa Firecrawl se disponibile, altrimenti WebFetch. Estrai SOLO dati presenti sul sito:
- nome, titolo, specialità, città
- bio e tappe di carriera, società scientifiche, approccio
- patologie e trattamenti (4-6 da mettere in card)
- sedi, indirizzi, telefoni, email, eventuale Instagram

Tieni una lista di cosa hai preso e da quale pagina. Se un dato manca, NON inventarlo: lascia fuori il campo o la voce. Niente recensioni, numeri, premi, citazioni.

## 2. Scrivi i contenuti
- **1 articolo SEO** (800-1000 parole, conta le parole con uno script) su un tema che i pazienti cercano davvero per quella specialità. Titolo con la keyword principale, intro che aggancia, 6-8 sezioni con H2 chiari, almeno un elenco, nota finale "non sostituisce la visita". Prudente: niente promesse, niente diagnosi.
- **2 titoli "in arrivo"** su altri temi cercati dai pazienti.
- **3 post Instagram** nei tre stili `titolo`, `lista`, `domanda`: testo breve sulla grafica, didascalia utile e prudente, 3-4 hashtag.
- **Hero**: una frase forte centrata sul paziente (`frase` + `fraseAccento`), non sul medico. Eyebrow corto (max ~32 caratteri, deve stare su una riga su mobile).

## 3. Slug e JSON
- `npm run slug -- <cognome>` → usa lo slug che esce.
- Crea `src/data/medici/<slug>.json` con lo stesso schema di Motta. Compila `fonti.pagine` e `fonti.nonUsato`.

## 4. Palette e font
- Palette nuova, diversa dalle demo esistenti, coerente con la specialità (es. cardiologia: rossi profondi/terracotta su avorio; dermatologia: rosa cipria/sabbia; pediatria: toni caldi e chiari; oculistica: blu/acqua). Niente viola. Controlla il contrasto: testo su `bg` e `accent-ink` su `accent` devono essere ben leggibili.
- Font da Google Fonts: un serif elegante per i titoli (es. Newsreader, Fraunces, Instrument Serif, Gloock, Spectral, Libre Caslon) + un sans pulito (es. Hanken Grotesk, Figtree, Manrope, Schibsted Grotesk, Instrument Sans). Mai Inter, Roboto, Arial. Non ripetere la coppia di un'altra demo.
- `tema.motivo`: scegli tra quelli in `src/components/Arte.astro` o aggiungine uno nuovo adatto alla specialità (forme astratte, mai figure umane).

## 5. Build e verifica visiva
1. `npm run build`
2. `npm run shot -- <slug>` → deve finire con "OK: nessun problema rilevato."
3. Guarda TU gli screenshot in `shots/<slug>/` (home e articolo, desktop e mobile; i full-page tagliali a pezzi per leggerli). Controlla: gerarchia chiara, testi leggibili, niente sovrapposizioni, niente a capo brutti, card allineate, contrasto ok, nessuna sezione vuota o invisibile.
4. Correggi e ripeti finché non è bella e pulita. Se correggi il template, verifica che le demo esistenti non si rompano (`npm run shot` anche su una di loro).

## 6. Commit e push
`git add` solo i file della demo (+ eventuali fix al template), commit con messaggio tipo `Demo: Dr. <Nome> (<specialità>)`, push sul branch di lavoro. Non committare `shots/`.

## 7. Risposta finale (breve)
- Link: `https://<dominio>/<slug>` (dominio da `CLAUDE.md`; se è ancora `DA_IMPOSTARE`, dillo).
- Link articolo: `https://<dominio>/<slug>/articolo`
- Riepilogo in pochi punti: cosa hai preso dal sito (con le pagine), cosa hai scritto tu (articolo, post), cosa mancava e hai lasciato fuori, palette e font scelti.
