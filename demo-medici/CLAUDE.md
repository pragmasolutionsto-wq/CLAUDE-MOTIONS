# Demo homepage medici · Pragma Solutions

Demo di homepage per medici specialisti, una alla volta, per proporre sito, blog e social.
Astro + Tailwind v4, statico. GSAP + ScrollTrigger + Lenis per le animazioni. Nessun backend, nessun database.

**Dominio:** `DA_IMPOSTARE` (es. `demo-medici.pages.dev`) ← aggiornalo dopo il primo deploy. Il comando `/nuova-demo` lo usa per il link finale.

Hosting consigliato: **Cloudflare Pages** (gratis, uso commerciale ammesso). Il noindex via header sta in `public/_headers` (Cloudflare/Netlify) e in `vercel.json` (Vercel): tienili allineati.

## Struttura
- `src/data/medici/<slug>.json` → tutti i contenuti di un medico. Lo schema è quello di `motta-m2zh.json`: stessi campi, sempre.
- `src/layouts/HomeMedico.astro` → unico template della home `/<slug>`.
- `src/pages/[slug]/articolo.astro` → pagina articolo `/<slug>/articolo`.
- `src/pages/index.astro` → root con solo il logo Pragma. **Mai elencare le demo.**
- `src/components/Arte.astro` → grafica astratta. Il campo `tema.motivo` sceglie la composizione (`articolazione`, `onde`, default `orbite`). Per una specialità nuova aggiungi un motivo qui.
- `scripts/slug.mjs` → `npm run slug -- <cognome>` genera `cognome-xxxx` (4 caratteri casuali, unico).
- `scripts/screenshot.mjs` → `npm run shot -- <slug>` builda già fatta → screenshot desktop/mobile in `shots/<slug>/` + controlli automatici.

## Regole fisse
1. **Mobile-first.** Perfetta su smartphone prima di tutto. Niente scroll orizzontale.
2. **Noindex ovunque.** Ogni pagina ha `<meta name="robots" content="noindex, nofollow">` (in `Base.astro`). `vercel.json` manda `X-Robots-Tag: noindex, nofollow` su `/(.*)`. **Non bloccare nulla in robots.txt** (altrimenti Google non vede il noindex).
3. **Fascia fissa in alto**, discreta: "Anteprima non ufficiale realizzata da Pragma Solutions".
4. **Solo informazioni vere** prese dal sito del medico: nome, titoli, sedi, telefoni, patologie, tappe di carriera. **Mai inventare** recensioni, numeri di pazienti, premi, anni di esperienza, citazioni, indirizzi, CAP. Se un dato non c'è, non c'è. Le recensioni presenti sul sito del medico NON si riportano.
5. **Testi medici prudenti**: niente promesse di guarigione, niente diagnosi, niente "risolvi", "elimina il dolore". Tono da ordine dei medici. L'articolo chiude sempre con la nota "non sostituisce la visita".
6. **Niente foto reali di persone** scaricate dal web. Grafica astratta (`Arte.astro`) e segnaposto `FotoSegnaposto.astro`.
7. **Niente gradienti viola, niente emoji come icone** (usa `Icona.astro`), niente layout da template.
8. **Palette diversa per ogni medico**, coerente con la specialità. Font: serif elegante per i titoli + sans pulito per i testi. **Mai Inter, Roboto, Arial.** Usa Google Fonts (Fontshare è bloccato dal proxy del container: le verifiche Playwright non lo vedrebbero).
9. **Linguaggio semplice**, frasi corte, italiano corretto.
10. Post Instagram: sono proposte. Se il medico non ha un profilo, l'handle è inventato in modo plausibile e la sezione dice "Esempi di post realizzati per questa anteprima".

## Note tecniche (imparate sul campo)
- **Mai `transition-all` (o transition su opacity/transform) su elementi animati da GSAP** (`data-reveal`, figli di `data-stagger`): la transizione CSS combatte con GSAP e l'elemento resta invisibile. Usa `transition-[translate,border-color]` ecc.
- Animazioni: `data-hero` (cascata in entrata), `data-reveal` (singolo), `data-stagger` (figli in sequenza), `data-parallax`. Rispettano `prefers-reduced-motion`.
- `line-clamp` va su un `<p>` senza padding, altrimenti la riga tagliata si vede nel padding.
- `npm run shot` fallisce (exit 2) se trova: errori console, richieste fallite, scroll orizzontale, meta robots sbagliato, fascia mancante, elementi rimasti invisibili, font titoli non caricato, link nella root.

## Deploy
Progetto in sottocartella: **Root directory = `demo-medici`**, build `npm run build`, output `dist`. Ogni push sul branch collegato va online da solo.
- Cloudflare Pages: Workers & Pages → Create → Pages → Connect to Git.
- Vercel: solo con piano Pro (Hobby non ammette uso commerciale).
