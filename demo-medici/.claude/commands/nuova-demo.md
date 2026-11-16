---
description: Crea una nuova demo homepage per un medico applicando il METODO DEMO MEDICI
argument-hint: <url-sito-medico>
---

Crea una nuova demo per il medico con sito: $ARGUMENTS

Lavora nella cartella del progetto demo-medici (dove c'è `astro.config.mjs`). Prima di tutto leggi `CLAUDE.md` per intero.
**Applica il METODO DEMO MEDICI di `CLAUDE.md`, tutte e 5 le fasi, in ordine, senza eccezioni e senza saltarne nessuna.** Se qualcosa nel template, nei componenti o nel JSON di esempio contraddice il METODO, vince il METODO: correggi il template.

## 0. Slug
`npm run slug -- <cognome>` → usa lo slug che esce per tutte le cartelle e i file.

## FASE 1 – Estrazione brand → `public/<slug>/brand/`
1. Scarica home e pagine principali (chi sono, servizi/patologie, contatti, sedi, eventuali pagine con foto). Firecrawl con `formats: ["markdown","links","images","branding"]`. **Poi leggi anche l'HTML grezzo** (curl, aggiungendo il dominio del sito e quello del CDN immagini ai domini consentiti se bloccati) e cerca TUTTI gli URL immagine: foto e loghi messi come sfondo CSS non compaiono in `images`.
2. **Logo**: cerca in header, footer, favicon/apple-touch-icon, `og:image`, nomi file con logo/marchio/brand/nome del medico. Scarica la versione più grande; se esistono, chiara e scura. Salva come `logo.<ext>` (`logo-chiaro`, `logo-scuro`).
3. **Foto**: tutte le foto reali del medico, dello studio, dell'attività.
   - Togli dall'URL i parametri di ridimensionamento del CDN (es. `/v1/x_..,w_..,h_..`, `?w=`, `&q=`, `-300x200`, `=s400`, `/resize/`) per avere l'ORIGINALE. Scarica sia la variante "piena" sia, se non esiste, la migliore disponibile e confronta le dimensioni.
   - Scarta: foto stock (nomi tipo `physiotherapist-doing...`, `woman-s-shoulder...`, freepik/shutterstock/istock/unsplash, soggetti generici senza il medico o il suo studio), foto sotto ~800px di lato lungo, foto sgranate o rovinate. Guarda TU ogni foto prima di tenerla.
   - Salva gli originali come `foto-01.<ext>`, `foto-02.<ext>`... con una descrizione in `brand.json`.
   - Foto vere ma piccole: tienile, annotate, solo per usi piccoli (post, avatar).
   - Controlla che nessun dettaglio ingrandito mostri dati personali leggibili (date di nascita su diplomi, documenti, schermi): se sì, sfoca solo quella zona nella versione web.
4. **Colori**: 2-3 colori dal logo (campiona i pixel) e dal CSS (variabili, colori dei pulsanti e dei titoli). Esadecimali.
5. **Font**: famiglie usate dal sito (CSS `font-family`, link Google Fonts/Typekit). Giudica la qualità.
6. **Dati**: nome, titoli, specialità, bio, incarichi, strutture, patologie, sedi, orari, contatti, recensioni reali (alla lettera, con nome come pubblicato).
7. Scrivi tutto in `public/<slug>/brand/brand.json` con, per ogni dato, la pagina da cui viene.
8. Se manca il logo → logotipo tipografico sobrio (nome + specialità), non un'icona inventata.
9. **STOP 1 – Riepilogo a Meme prima di disegnare.** Mostra: logo trovato (o "assente, farò logotipo"), foto tenute e scartate (con motivo), colori, font, dati principali, recensioni. Aspetta la sua risposta prima di passare alla Fase 2.
10. **Se non ci sono foto utilizzabili del medico: fermati qui e diglielo.** Niente segnaposto, niente avatar, niente stock. Non creare JSON né pagine.

## FASE 2 – Principio guida
Prima di disegnare, scrivi in una riga come farai sembrare la demo "il suo sito, ma fatto bene": quale logo, quali colori, quale foto in hero, quali sue parole.

## FASE 3 – Design
1. Prepara le versioni web delle foto in `public/<slug>/img/` (webp, lato lungo max 2000px, qualità ~80; hero max ~2400px). Le pagine usano SOLO queste, mai i file di `brand/`.
2. Crea/aggiorna `src/data/medici/<slug>.json` e adegua il template alle regole del METODO:
   - hero: sua foto vera e grande, nome, specialità, una riga di fatti, due pulsanti (Prenota / Contatta);
   - fondo bianco o quasi bianco; colore del brand con misura (pulsanti, dettagli, una sezione forte);
   - max 2 font, niente corsivi nei titoli, niente card numerate, niente iniziali/avatar, niente gradienti, niente slogan, niente grafica astratta;
   - sezioni con ritmo vario: foto e testo alternati, griglia ordinata, molto spazio bianco;
   - animazioni: solo comparsa morbida allo scroll.
3. Sezioni (in quest'ordine, salvo motivo forte): Hero · Chi è · Di cosa si occupa · Articoli (1 completo + 2 in arrivo) · Dal profilo Instagram (3 post) · Dove riceve · CTA finale + footer. Pagina `/<slug>/articolo`.
   - Instagram: grafiche dei post con il suo logo, i suoi colori e le sue foto; mai iniziali come avatar (usa il logo).
4. Fascia "Anteprima non ufficiale realizzata da Pragma Solutions" e noindex: sempre (vedi Regole fisse).

## FASE 4 – Testi
- **Lei** al paziente, sempre, ovunque (home, articolo, post, pulsanti).
- Fatti concreti dal suo sito, riscritti chiari e brevi. Niente frasi ad effetto.
- Mai inventare recensioni, numeri, premi, titoli, anni. Dato mancante = omesso.
- Pubblicità sanitaria: nessuna promessa di risultato.
- Articolo SEO 800-1000 parole (contale con uno script) su un tema cercato dai pazienti, prudente, nota finale "non sostituisce la visita". 2 titoli "in arrivo". 3 post Instagram con didascalia utile e prudente.

## FASE 5 – Controllo
1. `npm run build` e `npm run shot -- <slug>` → deve finire con "OK: nessun problema rilevato."
2. Screenshot del sito ATTUALE del medico, desktop (1440×900) e mobile (iPhone 13), con Playwright o Firecrawl. Affiancali a quelli della demo (stessa vista) in un'immagine unica e guardali.
3. Rispondi onestamente, per iscritto:
   1. Il medico si riconosce?
   2. È chiaramente più bello del suo sito attuale?
   3. Sembra fatto dall'AI?
4. Si pubblica **solo con: sì, sì, no.** Altrimenti correggi e ricontrolla (torna al punto 1). Controlla anche i divieti della Fase 3 uno per uno.

## Pubblicazione
1. `npm run deploy` → "Deploy OK".
2. Verifica online con Firecrawl (`maxAge: 0`) home e articolo: status 200, `robots: noindex, nofollow`, screenshot coerente con quello locale.
3. `git add` dei file della demo (`public/<slug>/`, JSON, eventuali fix al template), commit `Demo: Dr. <Nome> (<specialità>)`, push sul branch di lavoro. Non committare `shots/`.

## Risposta finale a Meme (breve)
- Link: `https://pragma-anteprime.pages.dev/<slug>` e `/<slug>/articolo` (verificati online)
- Le tre risposte del controllo (sì / sì / no) con una riga di motivazione ciascuna
- Cosa hai preso dal sito, cosa hai scartato e perché, cosa hai scritto tu
- L'immagine affiancata sito attuale vs demo
