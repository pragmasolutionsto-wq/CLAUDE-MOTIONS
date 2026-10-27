const { Doc } = require('./lib');
const d = new Doc('Allevamento degli Arduini', 'Mega prompt per Lovable');

d.note('**Come usarlo.** 1) In Lovable apri il progetto → Knowledge, carica i tre documenti: Contesto, Testi, Stile. 2) Incolla qui sotto tutto il prompt (dalla sezione “PROMPT” fino alla fine) nella prima chat. 3) Lovable lavora per fasi: dopo ogni fase controlla e rispondi “ok, fase successiva”. Non chiedergli tutto in un colpo solo.');

d.h1('PROMPT');

d.h2('0. Ruolo e obiettivo');
d.p('Sei un senior product designer e full-stack developer. Costruisci il sito dell’**Allevamento degli Arduini**, allevamento di gatti British Shorthair e British Longhair a Salussola (Biella, Piemonte), attivo dal 2000, titolare Domenico Petraro. Il sito deve far nascere contatti WhatsApp per i cuccioli, trasmettere fiducia e permettere al titolare di aggiornare da solo tutti i contenuti tramite un gestionale.');
d.p('Leggi la Knowledge del progetto prima di scrivere codice: **Contesto** (fatti, mercato, concorrenza), **Testi** (tutti i testi, da usare alla lettera), **Stile** (regole di design, obbligatorie). In caso di conflitto prevale il documento Stile per il design e il documento Testi per le parole.');

d.h2('1. Stack e vincoli tecnici');
d.ul([
  'React + TypeScript + Vite + Tailwind CSS + shadcn/ui (solo come base, vedi regole di stile: niente aspetto “shadcn di default”).',
  'Backend: Lovable Cloud / Supabase (Auth, Postgres con RLS, Storage).',
  'Router con una pagina per rotta, `react-helmet-async` per meta tag, `react-query` per i dati.',
  'Lingua: solo italiano. Struttura predisposta per aggiungere l’inglese in futuro (testi in file separati).',
  'Nessun colore, font o spaziatura scritti a mano nei componenti: tutto passa da token semantici in `index.css` e `tailwind.config.ts`.',
  'Nessuna foto di stock. Se un’immagine manca, mostra il componente segnaposto (gradiente caldo scuro + didascalia “Foto in arrivo”).',
]);

d.h2('2. Design system (da implementare per primo)');
d.p('Direzione **Chiaroscuro**: fondo scuro quasi nero, una luce calda sul soggetto, tipografia da rivista d’arte. Dettagli completi nel documento Stile; qui i token obbligatori.');
d.table(['Token', 'Valore'], [
  ['--background', '#17100B (Notte)'],
  ['--surface', '#1D130C (Terra)'],
  ['--line', '#3A2A1F'],
  ['--wordmark', '#43301F (Marrone antico)'],
  ['--foreground', '#EADBC3 (Avorio caldo)'],
  ['--muted', '#B8A388 (Sabbia)'],
  ['--faint', '#8F7B63 (Cenere)'],
  ['--accent', '#C9A24B (Oro antico)'],
  ['--rose', '#D8A89B (Rosa antico, testo)'],
  ['--rose-block', '#D2A79B (Rosa antico, sfondo blocco Expo)'],
  ['--ink', '#1E140D (testo sul blocco rosa)'],
  ['--radius', '0'],
], [0.35, 0.65]);
d.ul([
  'Font Google: **Bodoni Moda** (titoli, nomi, citazioni; regular e corsivo) e **Jost** (etichette 12 px MAIUSCOLO con letter-spacing .24em, testo 17–18 px).',
  'Titoli giganti con `clamp()`; interlinea .9–1,1; letter-spacing da -0,03em a -0,01em.',
  'Angoli sempre 0. Niente ombre pesanti. Niente card arrotondate, niente bottoni a pillola, niente gradienti viola, niente emoji o icone generiche.',
  'Struttura creata da filetti 1 px in `--line`, spazio (130–160 px tra sezioni su desktop) e allineamenti variati: mai due sezioni consecutive con la stessa composizione.',
  'Componenti base da creare: `Nav`, `Footer`, `SectionLabel`, `LinkArrow` (link oro sottolineato), `PortraitFrame` (immagine 4:5 con luce), `PhotoPlaceholder`, `StatusTag`, `RowIndexItem`, `FieldUnderline` (campo con solo filetto), `Reveal` (animazione d’ingresso).',
  'Animazioni: fade + salita 24 px in 600 ms, parallasse lenta sul titolo hero, zoom foto 1.03 in hover. Rispetta `prefers-reduced-motion`.',
  'Accessibilità: contrasto ≥ 4,5:1, focus oro 2 px con offset 4, un solo H1 per pagina, alt descrittivi.',
]);

d.h2('3. Mappa del sito');
d.table(['Rotta', 'Pagina', 'Note'], [
  ['/', 'Home', 'Vedi sezione 4.1'],
  ['/allevamento', 'L’allevamento', 'Storia, metodo, FAQ'],
  ['/gatti', 'I nostri gatti', 'Maschi e Femmine'],
  ['/gatti/:slug', 'Scheda gatto', ''],
  ['/cuccioli', 'Cuccioli disponibili', 'Elenco con filtri'],
  ['/cuccioli/:slug', 'Scheda cucciolo', 'Con CTA WhatsApp'],
  ['/expo', 'Expo e gatti premiati', 'Palmarès, premiati, racconti'],
  ['/news', 'News ed eventi', 'Elenco + categorie'],
  ['/news/:slug', 'Articolo', ''],
  ['/contatti', 'Contatti', 'WhatsApp, modulo, mappa'],
  ['/admin', 'Gestionale', 'Protetto, vedi sezione 6'],
  ['*', '404', 'Testo in documento Testi'],
], [0.22, 0.3, 0.48]);

d.h2('4. Pagine pubbliche');
d.h3('4.1 Home (in quest’ordine)');
d.ol([
  '**Nav** (wordmark “Degli Arduini” corsivo a sinistra; Gatti · Cuccioli · Expo · News · Scrivici a destra).',
  '**Hero**: parola “ARDUINI” gigante in `--wordmark`; sopra, ritaglio verticale (≈440×640) con la foto principale che copre il terzo inferiore delle lettere; luce dorata radiale dietro. Sotto: etichetta “Salussola · Biella · dal 2000” + testo breve a sinistra, “British Shorthair & British Longhair” in Bodoni corsivo a destra. H1 reale nascosto visivamente.',
  '**Manifesto**: una frase a tutta larghezza in Bodoni, con “ritratto” e “carattere” in corsivo `--rose`; firma Domenico Petraro in oro corsivo; link alla pagina Allevamento.',
  '**Ritratti Maschi / Femmine**: due pannelli alti 760 px a contatto (3 px di stacco), foto a tutto riquadro con luce calda (oro / rosa), parola gigante in Bodoni corsivo, link “Entra”.',
  '**Cuccioli**: titolo gigante “Cuccioli”, indice a righe (numero, nome, meta, genitori, stato) con ritratto a destra; i dati arrivano dal database (solo `available` e `reserved`).',
  '**Expo**: blocco a tutta larghezza su `--rose-block`, parola “Expo” fino a 260 px, ultime 4 righe di palmarès dal database. Se non ci sono righe, nascondi tutta la sezione.',
  '**News & eventi**: articolo in evidenza (foto 16:10) + elenco di titoli con filetti.',
  '**Chiusura**: “Scrivici.” in oro corsivo gigante (link a /contatti), sotto indirizzo, WhatsApp, email, social.',
  '**Footer** legale.',
]);
d.h3('4.2 L’allevamento');
d.p('Titolo e testi dal documento Testi (sezione 2). Struttura a due colonne asimmetriche: testo a sinistra, ritratto di Domenico a destra; blocco “Come lavoriamo” in quattro righe con filetti; FAQ come righe espandibili con filetto (accordion senza box).');
d.h3('4.3 I nostri gatti');
d.p('Introduzione, poi due sezioni “Maschi” e “Femmine”. Ogni gatto è una riga/blocco editoriale con ritratto 4:5, nome in Bodoni corsivo, razza, colore, titoli principali. Click → scheda gatto con: ritratto grande, campi del documento Testi (sezione 3), genitori, figli notevoli, galleria.');
d.h3('4.4 Cuccioli');
d.p('Filtri (razza, sesso, stato) come righe di testo con sottolineatura attiva, non come chip colorati. Elenco a righe come in home, ma completo. Scheda cucciolo: ritratto grande + galleria, scheda tecnica (Nato il, Figlio/a di con link ai genitori, Razza, Colore e codice EMS, Sesso, Disponibile dal, Carattere, Cosa riceve, Prezzo), pulsante WhatsApp con messaggio precompilato (vedi Testi). Se lo stato è `reserved` mostra “Chiedi la lista d’attesa”. Stato vuoto come da Testi. Blocchi “Caratteristiche della razza” e “Come funziona” dal documento Testi.');
d.h3('4.5 Expo');
d.p('Introduzione, tabella palmarès (anno, esposizione, città, gatto, titolo, federazione) con filetti, sezione “Gatti premiati” con ritratti, racconti collegati alle news di categoria Expo, galleria foto. Stato vuoto come da Testi.');
d.h3('4.6 News');
d.p('Categorie come link di testo (Tutte · Cucciolate · Expo · Eventi), articolo in evidenza + righe. Articolo: copertina, titolo, data, testo ricco, condivisione, articoli correlati.');
d.h3('4.7 Contatti');
d.p('Colonna sinistra: indirizzo, WhatsApp, email, orari, social. Colonna destra: modulo (campi, etichette e messaggi in Testi). Sotto: mappa incorporata di Cascina Canepali 2, Salussola, con stile scuro se possibile. Il modulo salva la richiesta nella tabella `leads` e mostra il messaggio di conferma.');

d.h2('5. Modello dati (Supabase)');
d.p('Crea queste tabelle con timestamp `created_at` / `updated_at`, chiavi uuid e `is_published` dove indicato. Abilita RLS su tutte.');
d.table(['Tabella', 'Campi principali'], [
  ['user_roles', 'user_id (uuid → auth.users), role (enum: admin). Funzione `has_role(uuid, role)` security definer.'],
  ['cats', 'id, slug (unique), name, sex (enum male|female), breed (enum shorthair|longhair), color, ems_code, birth_date, sire_id → cats, dam_id → cats, titles (text[]), health_tests (text), bio (text), cover_url, gallery (text[]), is_active (bool), is_published (bool), sort_order (int)'],
  ['kittens', 'id, slug (unique), name, sex, breed, color, ems_code, birth_date, sire_id → cats, dam_id → cats, status (enum available|reserved|sold), price (numeric, null), show_price (bool), temperament (text), included (text[]), available_from (date), cover_url, gallery (text[]), is_published, sort_order'],
  ['shows', 'id, date, name, city, country, federation, notes, gallery (text[]), is_published'],
  ['awards', 'id, show_id → shows, cat_id → cats, title, class (text), notes, is_published'],
  ['news', 'id, slug (unique), title, excerpt, body (rich text/HTML sanificato), category (enum cucciolate|expo|eventi|altro), cover_url, published_at, status (enum draft|published), seo_title, seo_description'],
  ['site_settings', 'key (text pk), value (jsonb). Chiavi: phone, whatsapp, email, address, hours, social (facebook, instagram, tiktok), hero_image, manifesto, about_text, vat'],
  ['leads', 'id, name, phone, email, interest, kitten_id → kittens (null), message, consent (bool), status (enum new|handled), created_at'],
], [0.2, 0.8]);
d.h3('Policy RLS');
d.ul([
  '`cats`, `kittens`, `shows`, `awards`, `news`: SELECT pubblico solo se `is_published = true` (per `news` anche `status = published` e `published_at <= now()`). INSERT/UPDATE/DELETE solo per `has_role(auth.uid(), \'admin\')`.',
  '`site_settings`: SELECT pubblico, scrittura solo admin.',
  '`leads`: INSERT consentito agli anonimi (con validazione: nome, telefono e consenso obbligatori), SELECT/UPDATE/DELETE solo admin.',
  '`user_roles`: nessun accesso pubblico; non creare registrazione aperta: l’unico admin si crea dalla dashboard Supabase.',
  'Storage: bucket `media` con lettura pubblica, scrittura solo admin.',
]);

d.h2('6. Gestionale /admin');
d.p('Area riservata sotto `/admin`, con login email + password (Supabase Auth), nessuna registrazione pubblica, sessione persistente. Interfaccia sobria, chiara, in italiano, usabile con una mano da smartphone. Palette del sito ma più funzionale (stesse tinte, più contrasto, font Jost ovunque tranne i titoli).');
d.h3('Sezioni');
d.ul([
  '**Dashboard**: richieste nuove, cuccioli disponibili, ultime news; scorciatoie “+ Cucciolo”, “+ News”.',
  '**Cuccioli**: tabella con miniatura, nome, nato il, genitori, stato. Cambio stato in un tocco (Disponibile / Prenotato / Ceduto). Form “Nuova scheda”: nome, data di nascita, padre e madre (select dai gatti), razza, colore, codice EMS, sesso, stato, carattere, cosa include, prezzo e “mostra prezzo”, disponibile dal, foto di copertina + galleria, pubblica sì/no. Duplica scheda. Riordino con trascinamento.',
  '**Gatti**: stesso schema (riproduttori), con titoli, test sanitari, genitori, bio, galleria.',
  '**Expo**: gestione delle esposizioni e dei premi assegnati ai gatti, con foto.',
  '**News**: editor di testo ricco (TipTap o equivalente) con titolo, estratto, categoria, copertina, data, bozza/pubblicata, campi SEO, anteprima. Slug automatico modificabile.',
  '**Richieste**: elenco dei contatti ricevuti dal modulo, con segna come “gestita”, link “Rispondi su WhatsApp”, esportazione CSV.',
  '**Impostazioni**: contatti, orari, social, testo del manifesto e della pagina allevamento, immagine hero.',
]);
d.h3('Immagini');
d.ul([
  'Caricamento da telefono (camera o galleria), anche multiplo.',
  'Ritaglio guidato 4:5 per i ritratti e 16:10 per le news; conversione automatica in WebP, lato lungo max 2000 px, peso target ≤ 300 KB, generazione di varianti responsive (`srcset`).',
  'Testo alternativo obbligatorio al caricamento (precompilato con nome del gatto).',
]);
d.h3('Sicurezza');
d.ul(['Protezione delle rotte `/admin/*` lato client e policy RLS lato server (mai fidarsi solo del client).', 'Sanificazione dell’HTML delle news prima del salvataggio e della visualizzazione.', 'Nessuna chiave segreta nel codice front-end.']);

d.h2('7. SEO e dati strutturati');
d.ul([
  'Meta title e description per ogni pagina dal documento Testi (sezione 9); per cuccioli e news compilati dal database (con fallback automatici).',
  'Open Graph e Twitter card con immagine; canonical su ogni pagina; `lang="it"`.',
  'JSON-LD `LocalBusiness` (nome, indirizzo Cascina Canepali 2, 13885 Salussola BI, telefono, sameAs: Facebook/Instagram/TikTok, descrizione). JSON-LD `BreadcrumbList` sulle pagine interne. JSON-LD `Article` sulle news.',
  '`sitemap.xml` e `robots.txt` generati dalle rotte e dai contenuti pubblicati.',
  'URL puliti (slug italiani), un solo H1 per pagina, gerarchia H2/H3 coerente.',
  'Immagini con `loading="lazy"` (tranne hero), dimensioni dichiarate per evitare spostamenti di layout, font con `display=swap`.',
  'Aggiungi un file `docs/SEO-NOTE.md` che ricorda: le SPA hanno limiti SEO, valutare prerendering (es. servizio di prerender) prima del lancio.',
]);

d.h2('8. WhatsApp, form e tracciamento');
d.ul([
  'CTA unica e costante: link `https://wa.me/393474991817?text=…` con messaggio precompilato (vedi Testi). Il numero viene da `site_settings.whatsapp`, mai scritto a mano nei componenti.',
  'Pulsante WhatsApp flottante su mobile, discreto, in oro; mai sopra il banner cookie.',
  'Modulo: validazione lato client e server, protezione anti-spam (honeypot + rate limit), consenso privacy obbligatorio, conferma accessibile.',
  'Predisponi Google Analytics 4 e Meta Pixel **caricati solo dopo il consenso cookie**; eventi: `click_whatsapp`, `submit_form`, `view_kitten`. Banner cookie sobrio come da Testi.',
]);

d.h2('9. Dati iniziali');
d.ul([
  'Popola il database con dati di esempio chiaramente riconoscibili (nome “[Nome cucciolo]”, date “[gg mese]”) così il layout si vede completo; contrassegna tutto come `is_published = false` tranne un set demo marcato in modo evidente.',
  'Usa i nomi reali solo se presenti nel documento Contesto (Las Vegas of Britland, Greta Garbo degli Arduini, Mojto, Elodie, Birba) e segna sempre i dati mancanti con [parentesi].',
  'Non inventare titoli, premi, test sanitari, prezzi o numeri. Se un dato manca, mostra il segnaposto o nascondi la sezione.',
]);

d.h2('10. Ordine di lavoro (fermati alla fine di ogni fase)');
d.ol([
  '**Fase 1 – Fondamenta.** Token, font, componenti base, Nav, Footer, `PhotoPlaceholder`, `Reveal`. Poi la **Home completa** con dati di esempio. Fermati e chiedi conferma.',
  '**Fase 2 – Pagine pubbliche.** Gatti, Scheda gatto, Cuccioli, Scheda cucciolo, Expo, News, Articolo, Allevamento, Contatti, 404, con dati mock.',
  '**Fase 3 – Backend.** Schema, RLS, Storage, collegamento delle pagine ai dati reali, modulo contatti che salva in `leads`.',
  '**Fase 4 – Gestionale.** Login, CRUD, upload con ritaglio e conversione, editor news, richieste, impostazioni.',
  '**Fase 5 – Rifinitura.** SEO tecnico e JSON-LD, sitemap, cookie e analytics, performance, accessibilità, responsive, test su telefono.',
]);

d.h2('11. Criteri di accettazione');
d.ul([
  'Il sito non sembra un template: nessuna card in griglia, nessun angolo arrotondato, nessun colore fuori palette.',
  'Domenico carica un nuovo cucciolo da telefono in meno di 3 minuti e compare subito sul sito.',
  'Lighthouse mobile: Performance ≥ 85, Accessibilità ≥ 95, SEO ≥ 95.',
  'Tutti i testi corrispondono al documento Testi; nessun dato inventato.',
  'Nessun errore in console; nessuna chiave esposta; RLS verificata (un utente anonimo non può scrivere né leggere bozze e richieste).',
  'Il sito è leggibile e utilizzabile a 360 px di larghezza.',
]);

d.h2('12. Cosa NON fare');
d.ul([
  'Non usare foto di stock né generare immagini di gatti.',
  'Non introdurre colori, font o componenti non previsti dal documento Stile.',
  'Non rendere centrate e uguali tutte le sezioni.',
  'Non aggiungere funzioni non richieste (shop, carrello, chat bot, newsletter) senza chiedere.',
  'Non cambiare i testi: se un testo ti sembra migliorabile, segnalalo alla fine della fase, non modificarlo.',
]);

d.save('/home/user/CLAUDE-MOTIONS/docs-arduini/04-MegaPrompt-Lovable.docx');
