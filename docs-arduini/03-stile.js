const { Doc } = require('./lib');
const d = new Doc('Allevamento degli Arduini', 'Documento di stile · direzione “Chiaroscuro”');

d.note('**Mockup di riferimento.** La home già approvata come direzione è nell’artifact Claude Design: https://claude.ai/artifact/EonBa5eBNyCncAJQFwY329. Questo documento ne fissa le regole, così lo stile non deriva da una pagina all’altra.');

d.h1('1. Concept');
d.p('**Chiaroscuro.** I gatti sono ritratti come in un dipinto fiammingo: fondo scuro quasi nero, una sola luce calda che li accende, tipografia da rivista d’arte. Il sito è una galleria di ritratti, non un catalogo.');
d.h3('Tre idee che reggono tutto');
d.ol([
  '**La luce è il design.** Il buio non è uno sfondo, è lo spazio dove il gatto appare. Più buio intorno, più il soggetto vale.',
  '**La tipografia è grande o è piccola, mai media.** Titoli enormi, etichette minuscole. Quasi nessun testo di taglia intermedia.',
  '**Niente scatole.** Niente card, niente ombre, niente bordi arrotondati. La struttura la fanno filetti sottili, spazio e allineamenti.',
]);

d.h1('2. Cosa evitare (il “look AI”)');
d.ul([
  'Card arrotondate in griglia 3×N con ombra.',
  'Fondo crema + serif generico + filetti ornamentali + archi decorativi.',
  'Gradienti viola/blu, glassmorphism, bagliori neon.',
  'Icone generiche (stellina, cuoricino, zampetta), emoji, illustrazioni stock.',
  'Bottoni a pillola con ombra, badge colorati, testi centrati su ogni sezione.',
  'Sezioni tutte uguali: titolo centrato + sottotitolo + 3 colonne.',
  'Foto con filtri, cornici o effetti: la foto deve essere vera e fatta bene.',
]);

d.h1('3. Palette');
d.table(['Nome', 'HEX', 'Uso', 'Contrasto'], [
  ['Notte', '#17100B', 'Sfondo principale', '—'],
  ['Terra', '#1D130C', 'Fondo foto, sezioni di stacco', '—'],
  ['Linea', '#3A2A1F', 'Filetti sottili 1 px, bordi', 'Decorativo'],
  ['Marrone antico', '#43301F', 'Wordmark gigante dietro la foto, aree di fondo', 'Decorativo'],
  ['Oro antico', '#C9A24B', 'Etichette, link, accenti, bottone primario, “Scrivici.”', '≈7,8:1 su Notte'],
  ['Rosa antico (blocco)', '#D2A79B', 'Sfondo del blocco Expo a tutta larghezza', 'Testo #1E140D ≈8,5:1'],
  ['Rosa antico (testo)', '#D8A89B', 'Parole in corsivo evidenziate, stati “Prenotato”', '≈8:1 su Notte'],
  ['Avorio caldo', '#EADBC3', 'Testo principale su fondo scuro', '≈14:1 su Notte'],
  ['Sabbia', '#B8A388', 'Testo secondario', '≈7:1 su Notte'],
  ['Cenere', '#8F7B63', 'Note legali, metadati', '≈4,7:1 su Notte'],
  ['Inchiostro', '#1E140D', 'Testo sul blocco rosa', '—'],
], [0.22, 0.14, 0.42, 0.22]);
d.p('Il fondo è sempre scuro, tranne un solo blocco a tutta larghezza in rosa antico (Expo) che spezza il ritmo. L’oro non si usa mai come sfondo di aree grandi: solo per testo, filetti e bottone primario.');

d.h1('4. Tipografia');
d.table(['Ruolo', 'Font', 'Stile', 'Dimensioni'], [
  ['Titoli, nomi, citazioni', 'Bodoni Moda (Google Fonts)', 'Regular 400, corsivo 400 per i nomi', 'Hero wordmark 18,5vw (max 280 px) · Titoli sezione 64–168 px · Nomi cuccioli 32–56 px · Testo manifesto 34–84 px'],
  ['Etichette, link, UI', 'Jost (Google Fonts)', 'Medium 500, MAIUSCOLO, spaziatura .24em', '12 px'],
  ['Testo corrente', 'Jost', 'Regular 400', '17–18 px, interlinea 1,6'],
], [0.22, 0.24, 0.24, 0.30]);
d.ul([
  'Interlinea titoli: 0,9–1,1. Spaziatura lettere titoli: da -0,03em a -0,01em.',
  'Corsivo Bodoni = nomi propri e parole chiave (in rosa antico dentro le frasi lunghe).',
  'Mai maiuscolo nei titoli Bodoni. Il maiuscolo è riservato alle etichette Jost.',
  'Testo mai sotto 12 px; mai bianco puro (#FFF): sempre Avorio caldo.',
]);

d.h1('5. Layout e spaziatura');
d.ul([
  'Larghezza contenuto: 1328 px max, margini laterali 56 px (24 px su smartphone).',
  'Scala spazio: 8 · 16 · 24 · 32 · 48 · 64 · 96 · 130 · 160 px.',
  'Spazio verticale tra sezioni: 130–160 px su desktop, 80–100 px su smartphone.',
  'Griglia libera: le sezioni alternano allineamenti diversi (testo a sinistra, immagine a destra, testo a tutta larghezza). Mai la stessa composizione due volte di fila.',
  'Angoli: **sempre 0**. Nessun border-radius, tranne i campi del modulo (0 anche lì).',
  'Filetti: 1 px in colore Linea (#3A2A1F). Nel blocco rosa: 1 px a rgba(30,20,13,.38).',
]);

d.h1('6. Componenti');
d.h3('Navigazione');
d.p('In alto, non fissa nel hero: wordmark “Degli Arduini” in Bodoni corsivo 26 px a sinistra; a destra Gatti · Cuccioli · Expo · News · **Scrivici** (oro, sottolineato). Etichette Jost 12 px, spaziate. Su smartphone i link vanno a capo; dopo lo scroll la barra diventa sottile con fondo Notte al 92% di opacità.');
d.h3('Hero');
d.p('Wordmark “ARDUINI” gigante in Marrone antico centrato; sopra, ritaglio verticale (circa 440×640) con foto del gatto che copre il terzo inferiore delle lettere. Luce dorata radiale dietro. Sotto: etichetta + riga di testo a sinistra, “British Shorthair & British Longhair” in Bodoni corsivo a destra.');
d.h3('Manifesto');
d.p('Una sola frase a tutta larghezza in Bodoni 34–84 px. Due parole in corsivo rosa antico. Firma in oro corsivo, link sottolineato.');
d.h3('Ritratti Maschi / Femmine');
d.p('Due pannelli alti 760 px a contatto (3 px di stacco), foto a tutto riquadro con luce calda (oro per i maschi, rosa per le femmine). In basso a sinistra: etichetta oro, parola gigante in Bodoni corsivo, link “Entra”.');
d.h3('Indice cuccioli');
d.p('Elenco a righe, mai a card: numero (oro, 12 px) · nome in Bodoni corsivo 32–56 px · meta in Jost (razza, colore, sesso, nato il) e genitori · stato a destra. Filetto sopra ogni riga. A destra del desktop, un ritratto alto 640 px con didascalia del cucciolo selezionato. Stato: “Disponibile” in oro, “Prenotato/a” in rosa antico.');
d.h3('Blocco Expo');
d.p('Sfondo rosa antico a tutta larghezza, parola “Expo” in Bodoni corsivo fino a 260 px, righe di palmarès con filetti sottili: anno · esposizione (Bodoni) · gatto · titolo (maiuscolo Jost).');
d.h3('News');
d.p('Un articolo in evidenza (foto 16:10, categoria e data in oro, titolo Bodoni) accanto a un elenco di titoli con filetti. Nessuna card.');
d.h3('Chiusura');
d.p('Parola “Scrivici.” in Bodoni corsivo oro fino a 260 px, link al contatto; sotto, tre colonne di indirizzo, contatti, social.');
d.h3('Bottoni e link');
d.ul([
  '**Primario:** testo Jost 12 px maiuscolo spaziato, oro, sottolineatura 1 px oro, padding verticale 8 px. Opzionale: riempimento oro con testo Inchiostro (usato solo per “Scrivici su WhatsApp”).',
  '**Secondario:** stesso stile in Avorio con sottolineatura Linea.',
  'Area cliccabile minima 44 px di altezza; focus visibile con contorno oro 2 px, offset 4 px.',
]);
d.h3('Modulo');
d.p('Campi con solo filetto inferiore 1 px (Linea), etichetta Jost 12 px maiuscolo sopra il campo, testo inserito in Avorio 18 px. Focus: filetto oro. Errori in rosa antico (#D8A89B) con messaggio testuale, mai solo colore.');

d.h1('7. Direzione fotografica');
d.p('Il sito vive o muore sulle foto. Con foto da telefono con sfondo di casa il chiaroscuro non regge.');
d.ul([
  '**Fondo scuro uniforme** (telo nero/marrone opaco) o ritaglio pulito su fondo Notte.',
  '**Una sola fonte di luce calda** laterale, leggermente dall’alto, come una finestra. Niente flash.',
  '**Formato ritratto 4:5** per i singoli gatti; 16:10 per eventi e news.',
  'Occhi a fuoco, pelo che prende la luce, testa leggermente inclinata verso la luce.',
  'File originali alti: almeno 2400 px sul lato lungo. Esportazione sito in WebP, max 300 KB.',
  'Set minimo per iniziare: 1 ritratto per ogni riproduttore, 3 foto per ogni cucciolo (intero, primo piano, in movimento), 1 foto di Domenico, 6-8 foto expo.',
  'Finché mancano le foto vere: segnaposto con gradiente caldo scuro e didascalia “Foto in arrivo”, mai foto di stock.',
]);

d.h1('8. Movimento');
d.ul([
  'Ingresso delle sezioni: dissolvenza + salita di 24 px, 600 ms, ease-out, una sola volta.',
  'Titolo hero: parallasse lenta (le lettere salgono più piano della foto).',
  'Hover sulle foto: zoom 1.03 in 600 ms. Hover sui link: sottolineatura che si allunga.',
  'Righe dell’indice cuccioli: al passaggio, il ritratto a destra cambia in dissolvenza.',
  'Rispettare sempre `prefers-reduced-motion`: niente animazioni se l’utente le ha disattivate.',
]);

d.h1('9. Responsive e accessibilità');
d.ul([
  'Mobile first: i testi giganti scalano con clamp(); sotto 800 px margini 24 px, pannelli Maschi/Femmine in colonna, ritratto dell’indice sotto l’elenco.',
  'Contrasto minimo 4,5:1 per il testo (verificato sui valori della palette).',
  'Ogni immagine ha testo alternativo descrittivo (nome del gatto, razza, colore).',
  'Navigazione da tastiera completa; titoli gerarchici (un solo H1 per pagina).',
  'Il wordmark gigante è decorativo (aria-hidden); l’H1 reale è nascosto visivamente ma presente.',
]);

d.h1('10. Voce');
d.ul([
  'Sobria, calda, concreta. Frasi corte. Nessun superlativo non dimostrabile.',
  'Si parla in prima persona plurale (“alleviamo”) e si dà del tu.',
  'I numeri e i titoli sono veri o non ci sono.',
]);

d.save('/home/user/CLAUDE-MOTIONS/docs-arduini/03-Stile-Arduini.docx');
