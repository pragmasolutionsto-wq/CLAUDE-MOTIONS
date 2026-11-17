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

**Link demo (da Delmonte in poi):** `https://anteprima-<slug>.pages.dev/<slug>` (un progetto Pages per medico). Motta e Russo restano su `https://pragma-anteprime.pages.dev/<slug>`.

Hosting: **Cloudflare Pages** (gratis, uso commerciale ammesso). Si pubblica con `npm run deploy -- <slug>`.

## Trello: tenere SEMPRE la bacheca allineata (regola fissa di Meme)
Bacheca "Prospect medici": https://trello.com/b/MqV9G8vV/prospect-medici (connettore Trello).
Liste: 1. Da preparare (demo) → 2. Demo pronta (Loom da fare) → 3. Inviato → 4. Follow-up → 5. Call fissata → 6. Chiuso ✅ → 7. Perso / non ora · ⏸ Conflitto Parisotto (non contattare: mai fare demo per queste schede).
- **Prima** di una demo: leggi la scheda del medico (contatti, aggancio, titoli di post e articolo già decisi) e usali.
- **Dopo** ogni demo pubblicata (e dopo ogni modifica importante a una demo): aggiorna la descrizione della scheda con lo stesso formato di Motta (Link demo, Articolo demo, Sito attuale, Contatti, Problemi/aggancio, Demo, Prossimi passi, Note) e spostala in "2. Demo pronta (Loom da fare)".
- Se dalla ricerca emergono dati che smentiscono la scheda (es. aggancio sbagliato), correggili nella scheda e segnalalo a Meme.
- Non spostare schede oltre la lista 2 (Inviato, Follow-up, ecc.): quelle fasi le gestisce Meme.

## Struttura
- `src/data/medici/<slug>.json` → tutti i contenuti di un medico. Lo schema è quello di `motta-m2zh.json`: stessi campi, sempre.
- `src/layouts/HomeMedico.astro` → unico template della home `/<slug>`.
- `src/pages/[slug]/articolo.astro` → pagina articolo `/<slug>/articolo` (usa `components/ArticoloPagina.astro`).
- Blog (da Cucchiarale): campo `blog` nel JSON = lista di articoli con `id` (stesso schema di `articolo`) → `/<slug>/blog` (indice: articolo principale + blog) e `/<slug>/blog/<id>`; in fondo a ogni articolo "Altri articoli del blog". Header/footer linkano "Blog". Meme: "ricorda anche il blog da mettere dentro" → se il medico ha già approfondimenti sul sito, si trasformano in articoli completi.
- `brand.header: "testo"` = logotipo di solo testo (header, footer). `prenota.saluto` = "Dottoressa" per le dottoresse (messaggi di prenotazione e calendario).
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
Template v3 (`HomeMedico.astro`, `articolo.astro`): stile AutoScout con i colori del medico, prima persona, foto di repertorio con una sola nota nel footer, box prenotazione funzionante (WhatsApp o mail). Prima demo: `motta-m2zh`. Schema dati di riferimento: `src/data/medici/motta-m2zh.json` (campi `brand`, `foto`, `hero.fatti`, `metodo`, `recensioni`, `sedi.strutture` con loghi). Calendario di richiesta prenotazione (`PrenotaCalendario.astro` + `scripts/calendario.ts`, dati in `prenota.calendario`): mese, giorni feriali da domani per N settimane, festivi italiani esclusi, orari mattina/pomeriggio dichiarati "indicativi", form con privacy; l'invio apre WhatsApp o mail già compilati con data e ora. Test: `?oggi=AAAA-MM-GG` fissa la data. Sezioni: Hero (foto) · Chi è (foto sx) · Di cosa si occupa (elenco) · Come lavora (unica sezione scura) · Recensioni reali · Articoli · Instagram · Dove riceve (foto dx) · Contatti · footer con logo chiaro. Ogni demo può cambiare ordine/ritmo se le foto lo suggeriscono.

### Varianti del template (dalla demo Russo)
- `foto.heroTipo: "ritratto"` + `foto.heroSfondo`: hero con ritratto verticale a destra su fondo del colore della foto (bordi del ritratto sfumati in alpha per non vedere il rettangolo); senza heroTipo: foto orizzontale a tutta larghezza.
- `brand.header: "marchio"`: header con marchio + nome nel font del sito (per loghi impilati illeggibili a 40px); logo completo nel footer.
- `foto.dettaglio` assente → in "Chi sono" card con volto + `bio.numeri` (solo numeri veri contati dal sito).
- Più di 2 sedi → nel box hero la sede è un menu a tendina; `sedi.luoghi[].principale` = card grande, le altre in elenco "Visito anche presso".
- `sedi.email` null → niente link mail del medico; `prenota.emailRichieste` (es. Pragma, provvisoria) + `prenota.notaRichieste` dichiarata in pagina.
- `firma` = specialità breve (header, card, post). `prenota.chiamaLabel` = "la segreteria" / "lo studio". `tema.fontUi` = font per etichette e pulsanti se il font dei titoli è un serif.
- Test funzionali: `?oggi=AAAA-MM-GG` fissa la data del calendario.

## Note tecniche (imparate sul campo)
- **Mai `transition-all` (o transition su opacity/transform) su elementi animati da GSAP** (`data-reveal`, figli di `data-stagger`): la transizione CSS combatte con GSAP e l'elemento resta invisibile. Usa `transition-[translate,border-color]` ecc.
- Animazioni (METODO: solo comparsa morbida allo scroll): `data-reveal` (singolo), `data-stagger` (figli in sequenza). Niente parallax, niente effetti. Rispettano `prefers-reduced-motion`.
- `line-clamp` va su un `<p>` senza padding, altrimenti la riga tagliata si vede nel padding.
- Classi custom (`.btn`, `.label`) stanno in `@layer components`: fuori dai layer scavalcano le utility Tailwind (es. `hidden`).
- Lo scroll morbido è CSS (`scroll-behavior: smooth`): nello script screenshot lo scroll va forzato `behavior: 'instant'`.
- **Fase 1 – foto nascoste:** i siti (es. Flazio) mettono foto e loghi come sfondi CSS, che lo scrape "images" non vede. Leggi SEMPRE l'HTML grezzo (curl o rawHtml) e cerca tutti gli URL immagine. Su Motta così sono emerse la foto in sala operatoria e il marchio in alta risoluzione.
- **Privacy nelle foto:** ingrandendo dettagli (diplomi, documenti, schermi) controlla che non si leggano dati personali (data di nascita, codici, pazienti). Se sì, sfoca solo quella parte.
- Foto vere ma piccole (<800px): non in grande; vanno bene in formati piccoli (post Instagram, avatar).
- `prenota.calendario.privacy` null + `privacyTesto`: se il sito del medico non ha una pagina privacy, il link diventa una nota apribile nel form (mai link rotti). `notePlaceholder` cambia l'esempio nel campo note.
- Foto con fondo a tinta unita di terzi (es. verde acqua J|medical): si può scontornare a chiave colore (script in scratchpad `gt-key.py`) e rimettere sul colore del tema. Foto da siti terzi solo con ok di Meme, annotate in brand.json.
- Confronto Fase 5: `shots/<slug>/confronto.png` (sito attuale vs demo, desktop + mobile).
- `npm run shot` fallisce (exit 2) se trova: errori console, richieste fallite, scroll orizzontale, meta robots sbagliato, fascia mancante, elementi rimasti invisibili, font titoli non caricato, link nella root.

## Deploy
`npm run deploy -- <slug>` = build + pubblicazione della sola demo `<slug>` nel suo progetto Cloudflare Pages `anteprima-<slug>` (creato in automatico). `npm run deploy` senza slug ripubblica solo le demo storiche (Motta, Russo) su `pragma-anteprime`. Script: `scripts/deploy.mjs`.
- Il sito statico viene impacchettato in un `_worker.js` (Pages advanced mode) e caricato in **una sola richiesta** API. Il worker serve i file e mette `X-Robots-Tag: noindex, nofollow` su tutto.
- **Non usare wrangler** nei container cloud: il suo upload usa un JWT nell'header Authorization che il proxy sovrascrive col token → deploy "riuscito" ma vuoto (500). E `wrangler pages project create` lancia un'autoconfig che converte il sito in SSR: da evitare.
- Credenziale: token Cloudflare (permesso Pages → Edit) salvato nell'ambiente cloud "Pragma" per `api.cloudflare.com`, iniettato dal proxy. Account ID nello script (non è un segreto).
- Il container non raggiunge `*.pages.dev`: verifica online con Firecrawl (status 200 + meta robots + screenshot).
- `public/_headers` e `vercel.json` restano come riserva se si cambia hosting.
- **Limite di peso:** tutto il sito finisce dentro un unico worker (max ~3 MB sul piano gratuito, e le immagini non si comprimono). Per questo `deploy.mjs` esclude `*/brand/*` (originali) e si blocca sopra 2,8 MB. Le pagine usano solo le versioni web in `img/`. Dal 17/11/2026 ogni demo nuova ha il suo progetto, quindi il limite vale per la singola demo (Delmonte ≈ 0,8 MB). Dopo un deploy l'indirizzo principale può impiegare qualche minuto ad aggiornarsi: verifica prima sull'URL del deploy (`https://<id>.anteprima-<slug>.pages.dev/<slug>`).

## Ogni demo diversa (regola di Meme, 17/11/2026)
Le demo NON devono sembrare tutte uguali con colori diversi. Da Castelli in poi ogni medico ha un layout suo, ricavato dal suo brand e dal materiale che ha: struttura della hero, ordine e forma delle sezioni, forme (angoli, bordi, ombre), tipo di componenti (card, elenchi, zig-zag, accordion, video), font. Restano fissi solo: banner Pragma, noindex, prima persona/Lei, prenotazione funzionante, calendario, articolo, Instagram, sedi, nota repertorio.
- Layout disponibili: `HomeMedico.astro` (v3 "AutoScout": Motta, Russo, Delmonte, Goitre) · `HomeClinica.astro` (`"layout": "clinica"`, Castelli: striscia contatti, hero a due colonne con ritratto scontornato su blocco pieno e barra di prenotazione orizzontale, fascia credenziali, aree a elenco, strumenti a zig-zag, interviste video, FAQ accordion, angoli vivi).
- `HomeLaterale.astro` (`"layout": "laterale"`, Zaccagna): barra laterale scura fissa con ritratto, menu e contatti; hero fotografica a tutta larghezza con pannello pieno; prenotazione a tessere (motivi con icona); percorso del paziente con foto; prestazioni su fondo scuro; timeline orizzontale; angoli molto arrotondati, Poppins.
- `HomeStudio.astro` (`"layout": "studio"`, Aliberti): impostazione editoriale classica, intestazione centrata con nav sotto, hero divisa a metà (foto / pannello scuro con prenotazione a schede per area), numeri grandi in serif, tre colonne editoriali, galleria dello studio a scorrimento con frecce, citazione e formazione all'estero, contatti su fondo scuro; angoli vivi, Playfair (mai corsivo).
- `HomeRecensioni.astro` (`"layout": "recensioni"`, Licciardello): costruito sulle recensioni vere; hero con una frase di un paziente in grande + ritratto medio in card (foto piccola), prenotazione "a frase da completare" su fascia prugna (tendine che si adattano al testo), muro di recensioni a colonne, aree a schede verticali con tag, sedi a righe; angoli molto arrotondati, DM Serif Display + DM Sans.
- `HomeCasistica.astro` (`"layout": "casistica"`, Emanuele Castelli urologo): costruito sui numeri chirurgici (foto solo tessera piccola); header scuro, hero blu notte con "4150+" gigante e prenotazione a guida in 3 passi (area → motivo → sede), grafico a barre della casistica, tecnologie in card, aree a liste, recensioni scure in carosello, formazione a tabella + box pubblicazioni, sedi in card; Space Grotesk + IBM Plex Sans, blu #17457A + arancio #E0892E.
- `HomeInterventi.astro` (`"layout": "interventi"`, Francesco Valentino urologo): costruito sulle sue tecniche chirurgiche; logo SVG vero, hero diviso con nome su due righe (leggero + MAIUSCOLO come nel logo) e foto alta in sala operatoria, prenotazione a lista con pallino + riquadro "Riepilogo" che si scrive da solo, indice interventi con schede alternate (ThuLEP, prostatectomia, RIRS, URS), fascia esami, andrologia a griglia, chi sono scuro con la sua frase, recensioni 1 grande + 4 piccole; angoli quasi vivi (3-4px), Montserrat + Source Sans 3, blu #31556E + verde acqua #63BEAA.
- `HomeRivista.astro` (`"layout": "rivista"`, Giuseppina Cucchiarale urologa): home costruita attorno al BLOG; logotipo di testo in Playfair (niente logo), hero testata + foto vera alla scrivania, prenotazione "Per chi è la visita? Donna / Uomo" → motivi del gruppo → fascia oraria (mail già scritta, script nel layout), colonne Per lei / Per lui con link agli articoli, blog con articolo in evidenza + elenco + intervista TV, chi sono con timeline, fascia scura "In studio"; angoli arrotondati, pulsanti a pillola, Playfair Display + Noto Sans, blu #1D6A8C + azzurro #5BC0EB.
- Per il prossimo medico NON riusare un layout già usato: creane uno nuovo (`src/layouts/Home<Nome>.astro`, dispatch in `src/pages/[slug]/index.astro` con `m.layout`) partendo dai suoi punti forti (foto, video, libri, sedi, FAQ, sport, ecc.).
