# Demo homepage medici · Pragma Solutions

Demo di homepage per medici specialisti, una alla volta, per proporre sito, blog e social.
Astro + Tailwind v4, statico. GSAP + ScrollTrigger + Lenis per le animazioni. Nessun backend, nessun database.

# METODO DEMO MEDICI

> Vincolante per ogni demo, per ogni medico, senza eccezioni. Se una regola più sotto o il template lo contraddicono, vince il METODO.

## Fase 1 – Estrazione brand
Dal sito del medico ricava e salva in /public/<slug>/brand/:
- LOGO: cercalo in header, footer, favicon e nei nomi dei file (logo, marchio, brand, nome del medico). Prendi la versione a risoluzione più alta e, se esistono, sia la versione chiara sia quella scura.
- FOTO: tutte le foto reali del medico, dello studio e dell'attività, alla risoluzione ORIGINALE. Se l'URL ha parametri di ridimensionamento del CDN (larghezza, qualità, crop), toglili per avere il file pieno. Scarta le foto da banca immagini e quelle troppo piccole o rovinate.
- COLORI: i 2-3 colori del brand, presi dal logo e dal CSS.
- FONT: i font del sito.
- DATI: nome, titoli, specialità, bio, incarichi, strutture, patologie, sedi, orari, contatti, recensioni reali se presenti.
Scrivi tutto in /public/<slug>/brand/brand.json e mostrami un riepilogo prima di disegnare.
Se manca il logo, crea un logotipo tipografico sobrio con nome e specialità.
Se mancano foto utilizzabili del medico, fermati e dimmelo: non procedere con segnaposto.
- FOTO DI REPERTORIO (aggiornamento di Meme): oltre alle foto vere, servono MOLTE foto generiche di riempimento, pertinenti alla specialità. Ordine di scelta: prima le foto stock già presenti sul sito del medico, poi Unsplash con licenza gratuita (mai Unsplash+ / premium, mai siti con licenza incerta). Originali in /public/<slug>/brand/repertorio/. Nessuna didascalia sulle immagini: una sola nota nel footer ("Alcune immagini sono foto di repertorio inserite per questa anteprima."). Mai usarle in modo che sembrino il medico, il suo studio o i suoi pazienti. La foto principale (hero) è sempre una foto vera del medico.

## Fase 2 – Principio guida
La demo deve sembrare "il suo sito, ma fatto bene". Il medico deve riconoscersi al primo sguardo: suo logo, suoi colori, sue foto, sue parole.

## Fase 3 – Design
- Riferimento visivo (aggiornamento di Meme): lo stile di AutoScout24 con i colori del medico. Card bianche arrotondate con ombra, box di prenotazione sopra la foto in hero, chip selezionabili, icone, fascia di fatti con icone, caroselli orizzontali con frecce, una fascia con immagine larga, CTA finale su fascia colorata, footer scuro a colonne. Ricco di decorazioni ma ordinato.
- Pulito e premium, mai esagerato.
- Hero con la sua foto vera e grande, nome, specialità, box di prenotazione (motivo, sede, pulsante chiamata), contatto via mail.
- Fondo bianco o quasi bianco. Il colore del brand si usa con misura: pulsanti, dettagli, una sezione forte.
- Il font del sito si tiene solo se è di qualità; altrimenti uno simile ma migliore. Massimo 2 font.
- Molto spazio bianco, griglia ordinata, sezioni con ritmo vario (foto e testo alternati, non card tutte uguali).
- Animazioni minime: solo comparsa morbida allo scroll.
- Tagli delle foto: mai volti tagliati a metà, mai teste o mani mozzate sul soggetto principale. Ogni ritaglio si fa con un punto focale scelto a mano e si controlla a occhio prima di usarlo.
- VIETATI: fondo crema/beige, titoli serif in corsivo, card numerate 01-02-03, iniziali o avatar al posto delle foto, didascalie "foto di repertorio" sulle immagini, pulsanti o form finti, card "In arrivo", gradienti, effetti vistosi, frasi slogan.

## Fase 4 – Testi
- Il sito è del medico: il medico parla in PRIMA PERSONA ("mi occupo", "Chi sono", "Dove ricevo", "Come lavoro"). Mai la terza persona ("il Dr. Motta è...") nei testi del sito. Le note di Pragma (repertorio, proposte) sono a parte, piccole e marcate col logo Pragma.
- Si dà del "Lei" al paziente, sempre.
- Fatti concreti presi dal suo sito, riscritti in modo chiaro e breve. Niente frasi ad effetto.
- Mai inventare recensioni, numeri, premi, titoli o anni. Dove manca un dato, si omette.
- Rispetto delle regole sulla pubblicità sanitaria: nessuna promessa di risultato.

## Regole fisse aggiuntive (aggiornamento di Meme)
- Mai didascalie "foto di repertorio" sulle immagini: una sola nota nel footer.
- Ogni elemento interattivo deve funzionare davvero. Niente pulsanti o form finti. (Es. box prenotazione: motivo + sede compongono un messaggio "Buongiorno Dottore, vorrei prenotare una visita per [motivo] presso [sede]." che apre WhatsApp se c'è un numero WhatsApp verificato sul sito, altrimenti una mail già compilata. Si testa con Playwright ogni combinazione.)
- Mai card "In arrivo" o contenuti incompleti.
- Controllo finale di tutto il testo per doppioni e refusi (le recensioni citate alla lettera restano come sono).

## Fase 5 – Controllo
- Screenshot desktop e mobile con Playwright, affiancati a quelli del sito attuale del medico.
- Tre domande, a cui rispondere onestamente:
  1. Il medico si riconosce?
  2. È chiaramente più bello del suo sito attuale?
  3. Sembra fatto dall'AI?
- Si pubblica solo con: sì, sì, no. Altrimenti correggi e ricontrolla.

---

**Dominio:** `pragma-anteprime.pages.dev` → link demo: `https://pragma-anteprime.pages.dev/<slug>`

Hosting: **Cloudflare Pages**, progetto `pragma-anteprime` (gratis, uso commerciale ammesso). Si pubblica con `npm run deploy`.

## Struttura
- `src/data/medici/<slug>.json` → tutti i contenuti di un medico. Lo schema è quello di `motta-m2zh.json`: stessi campi, sempre.
- `src/layouts/HomeMedico.astro` → unico template della home `/<slug>`.
- `src/pages/[slug]/articolo.astro` → pagina articolo `/<slug>/articolo`.
- `src/pages/index.astro` → root con solo il logo Pragma. **Mai elencare le demo.**
- `public/<slug>/brand/` → materiale estratto dal sito (logo, foto originali, `brand.json`). **Non va nel deploy** (vedi Deploy).
- `public/<slug>/img/` → versioni web delle foto (webp, lato lungo max 2000px, ~80%) usate dalle pagine.
- `src/components/Arte.astro`, `FotoSegnaposto.astro` → eredità della v1, **non conformi al METODO**: non usarli nelle demo.
- `scripts/slug.mjs` → `npm run slug -- <cognome>` genera `cognome-xxxx` (4 caratteri casuali, unico).
- `scripts/screenshot.mjs` → `npm run shot -- <slug>` builda già fatta → screenshot desktop/mobile in `shots/<slug>/` + controlli automatici.

## Regole fisse
1. **Mobile-first.** Perfetta su smartphone prima di tutto. Niente scroll orizzontale.
2. **Noindex ovunque.** Ogni pagina ha `<meta name="robots" content="noindex, nofollow">` (in `Base.astro`). `vercel.json` manda `X-Robots-Tag: noindex, nofollow` su `/(.*)`. **Non bloccare nulla in robots.txt** (altrimenti Google non vede il noindex).
3. **Fascia fissa in alto**, discreta, con il loghino Pragma (`public/pragma-logo-sm.png`): "Anteprima non ufficiale realizzata da Pragma Solutions".
4. **Solo informazioni vere** prese dal sito del medico. **Mai inventare** recensioni, numeri, premi, titoli, anni, citazioni, indirizzi, CAP. Se un dato non c'è, si omette. Recensioni: solo quelle reali pubblicate sul suo sito, riportate alla lettera, senza ritocchi.
5. **Testi medici prudenti**: niente promesse di risultato, niente diagnosi, niente "risolvi", "elimina il dolore". Si dà del **Lei** al paziente. L'articolo chiude sempre con la nota "non sostituisce la visita".
6. **Foto:** quelle vere del medico prese dal SUO sito + foto di repertorio, segnalate solo dalla nota nel footer (METODO Fase 1). Mai segnaposto grafici, iniziali o avatar. Senza almeno una foto vera del medico ci si ferma.
7. **Niente gradienti, niente emoji come icone** (usa `Icona.astro`), niente layout da template, niente card numerate.
8. **Colori e font del brand del medico** (METODO Fase 1 e 3). Fondo bianco o quasi bianco, mai crema/beige. Massimo 2 font, niente titoli in corsivo. Se il font del sito è scadente, uno simile ma migliore. **Mai Inter, Roboto, Arial.** Font da Google Fonts o self-hosted in `public/` (Fontshare è bloccato dal proxy del container).
9. **Linguaggio semplice**, frasi corte, italiano corretto.
10. Post Instagram: sono proposte. Se il medico non ha un profilo, l'handle è inventato in modo plausibile e la sezione dice "Esempi di post realizzati per questa anteprima".

## Stato del template
Template v3 (`HomeMedico.astro`, `articolo.astro`): stile AutoScout con i colori del medico, prima persona, foto di repertorio con una sola nota nel footer, box prenotazione funzionante (WhatsApp o mail). Prima demo: `motta-m2zh`. Schema dati di riferimento: `src/data/medici/motta-m2zh.json` (campi `brand`, `foto`, `hero.fatti`, `metodo`, `recensioni`, `sedi.strutture` con loghi). Sezioni: Hero (foto) · Chi è (foto sx) · Di cosa si occupa (elenco) · Come lavora (unica sezione scura) · Recensioni reali · Articoli · Instagram · Dove riceve (foto dx) · Contatti · footer con logo chiaro. Ogni demo può cambiare ordine/ritmo se le foto lo suggeriscono.

## Note tecniche (imparate sul campo)
- **Mai `transition-all` (o transition su opacity/transform) su elementi animati da GSAP** (`data-reveal`, figli di `data-stagger`): la transizione CSS combatte con GSAP e l'elemento resta invisibile. Usa `transition-[translate,border-color]` ecc.
- Animazioni (METODO: solo comparsa morbida allo scroll): `data-reveal` (singolo), `data-stagger` (figli in sequenza). Niente parallax, niente effetti. Rispettano `prefers-reduced-motion`.
- `line-clamp` va su un `<p>` senza padding, altrimenti la riga tagliata si vede nel padding.
- Classi custom (`.btn`, `.label`) stanno in `@layer components`: fuori dai layer scavalcano le utility Tailwind (es. `hidden`).
- Lo scroll morbido è CSS (`scroll-behavior: smooth`): nello script screenshot lo scroll va forzato `behavior: 'instant'`.
- **Fase 1 – foto nascoste:** i siti (es. Flazio) mettono foto e loghi come sfondi CSS, che lo scrape "images" non vede. Leggi SEMPRE l'HTML grezzo (curl o rawHtml) e cerca tutti gli URL immagine. Su Motta così sono emerse la foto in sala operatoria e il marchio in alta risoluzione.
- **Privacy nelle foto:** ingrandendo dettagli (diplomi, documenti, schermi) controlla che non si leggano dati personali (data di nascita, codici, pazienti). Se sì, sfoca solo quella parte.
- Foto vere ma piccole (<800px): non in grande; vanno bene in formati piccoli (post Instagram, avatar).
- Confronto Fase 5: `shots/<slug>/confronto.png` (sito attuale vs demo, desktop + mobile).
- `npm run shot` fallisce (exit 2) se trova: errori console, richieste fallite, scroll orizzontale, meta robots sbagliato, fascia mancante, elementi rimasti invisibili, font titoli non caricato, link nella root.

## Deploy
`npm run deploy` = build + pubblicazione su Cloudflare Pages (`scripts/deploy.mjs`).
- Il sito statico viene impacchettato in un `_worker.js` (Pages advanced mode) e caricato in **una sola richiesta** API. Il worker serve i file e mette `X-Robots-Tag: noindex, nofollow` su tutto.
- **Non usare wrangler** nei container cloud: il suo upload usa un JWT nell'header Authorization che il proxy sovrascrive col token → deploy "riuscito" ma vuoto (500). E `wrangler pages project create` lancia un'autoconfig che converte il sito in SSR: da evitare.
- Credenziale: token Cloudflare (permesso Pages → Edit) salvato nell'ambiente cloud "Pragma" per `api.cloudflare.com`, iniettato dal proxy. Account ID nello script (non è un segreto).
- Il container non raggiunge `*.pages.dev`: verifica online con Firecrawl (status 200 + meta robots + screenshot).
- `public/_headers` e `vercel.json` restano come riserva se si cambia hosting.
- **Limite di peso:** tutto il sito finisce dentro un unico worker (max ~3 MB sul piano gratuito, e le immagini non si comprimono). Per questo `deploy.mjs` esclude `*/brand/*` (originali) e si blocca sopra 2,8 MB. Le pagine usano solo le versioni web in `img/`. Quando le demo saranno tante, si passa a un progetto Pages per medico o a R2 per le immagini.
