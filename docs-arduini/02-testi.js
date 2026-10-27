const { Doc } = require('./lib');
const d = new Doc('Allevamento degli Arduini', 'Tutti i testi del sito · pronti da incollare');

d.note('**Regole.** Italiano, frasi corte, tono sobrio e caldo, mai commerciale. Niente superlativi non dimostrabili (“il migliore”, “unico”). Tutto ciò che è tra [parentesi quadre] è un dato da confermare con Domenico: non pubblicare finché non è compilato. I testi sono pensati per essere letti da smartphone.');

/* ---------- HOME ---------- */
d.h1('1. Home');
d.h3('Hero');
d.table(['Elemento', 'Testo'], [
  ['Wordmark gigante', 'ARDUINI'],
  ['H1 (nascosto, per SEO)', 'Allevamento degli Arduini · British Shorthair e Longhair a Salussola (Biella)'],
  ['Etichetta', 'Salussola · Biella · dal 2000'],
  ['Testo breve', 'Allevamento di gatti British. Selezione, pazienza e un’idea precisa di bellezza.'],
  ['Titolo a destra', 'British Shorthair\n& British Longhair'],
], [0.3, 0.7]);
d.h3('Manifesto');
d.quote('Dal 2000 alleviamo British come si dipingeva un ritratto: con pazienza, con luce, con carattere.');
d.p('Firma: **Domenico Petraro** · Etichetta: L’allevatore · Link: La storia dell’allevamento');
d.h3('Ritratti (due pannelli)');
d.table(['Pannello', 'Etichetta', 'Titolo', 'Link'], [
  ['Maschi', 'I riproduttori', 'Maschi', 'Entra'],
  ['Femmine', 'Le regine di casa', 'Femmine', 'Entra'],
], [0.2, 0.3, 0.25, 0.25]);
d.h3('Sezione cuccioli');
d.p('Etichetta: Disponibili ora · Titolo: **Cuccioli** · Link: Tutte le schede');
d.h3('Sezione expo');
d.p('Titolo: **Expo** · Testo: Ottimi risultati alle esposizioni. Il lavoro di anni, giudicato da chi se ne intende. · Link: I gatti premiati');
d.note('Il palmarès in home mostra solo le ultime 4 righe reali dal gestionale. Se non ci sono dati veri, la sezione resta nascosta.');
d.h3('Sezione news');
d.p('Etichetta: Dal diario · Titolo: **News & eventi** · Link: Tutto il diario');
d.h3('Chiusura');
d.p('Etichetta: Un British in famiglia · Titolo gigante: **Scrivici.**');
d.p('Sotto: indirizzo, WhatsApp, email, social. Legale: © Allevamento degli Arduini · P.IVA [numero] · Privacy · Cookie.');

/* ---------- ALLEVAMENTO ---------- */
d.h1('2. L’allevamento');
d.h3('Titolo e introduzione');
d.p('**Titolo:** Una storia che comincia nel 2000');
d.p('Nel 2000, a Salussola, tra le colline del Biellese, è cominciata la storia dell’allevamento degli Arduini. Da allora Domenico Petraro seleziona British Shorthair e British Longhair con tre idee fisse: un carattere socievole, una struttura corretta, una salute solida.');
d.p('[Aggiungere 3-4 righe di Domenico: il primo British, il momento che ha segnato la svolta, cosa cerca davvero in un gatto.]');
d.h3('Come lavoriamo');
d.ul([
  '**Selezione.** [Come scegliamo i riproduttori: linee di sangue, tipo, carattere.]',
  '**Salute.** [Test eseguiti sui riproduttori: PKD, HCM, FIV, FeLV. Indicare quali e con che frequenza.]',
  '**Crescita.** [Dove e come crescono i cuccioli: in casa, socializzazione, età di cessione.]',
  '**Dopo l’adozione.** [Assistenza disponibile dopo il ritiro: consigli, contatto diretto.]',
]);
d.p('Link finale: Scopri i nostri gatti · Scrivici su WhatsApp');
d.h3('Domande frequenti');
d.table(['Domanda', 'Risposta'], [
  ['A che età si ritira un cucciolo?', 'I cuccioli lasciano l’allevamento a [12] settimane, vaccinati e microchippati. [Confermare.]'],
  ['Il pedigree è incluso?', '[Sì: ogni cucciolo è ceduto con pedigree / ricevuta di richiesta. Specificare l’ente.]'],
  ['Si può visitare l’allevamento?', '[Sì, su appuntamento. Non organizziamo visite a sorpresa, per il benessere dei gatti.]'],
  ['Quanto costa un cucciolo?', '[Il prezzo dipende da colore, linea e documenti. Indicare fasce oppure: “Scrivici su WhatsApp e ti diciamo tutto.”]'],
  ['Come si prenota?', '[Con una caparra di __ €, saldo alla consegna. Confermare.]'],
  ['Consegnate in altre città?', '[Sì/No. Zone e costi.]'],
  ['Che differenza c’è tra Shorthair e Longhair?', 'Stesso tipo e stesso carattere: cambia solo il pelo. Lo Shorthair ha un mantello corto e denso, il Longhair un mantello semilungo e morbido che chiede più spazzolatura.'],
  ['Il British è adatto a una famiglia con bambini?', 'È un gatto calmo, paziente e socievole, che si adatta bene alla vita in appartamento. Come per ogni animale, il cucciolo va introdotto con rispetto e tempo.'],
], [0.32, 0.68]);

/* ---------- GATTI ---------- */
d.h1('3. I nostri gatti');
d.p('**Titolo pagina:** I nostri gatti');
d.p('**Introduzione:** I riproduttori sono il cuore dell’allevamento. Ogni gatto è scelto per tipo, carattere e salute. Qui li conosci uno per uno: la linea di sangue, i titoli, la storia.');
d.h3('Sezione Maschi');
d.p('Etichetta: I riproduttori · Titolo: **Maschi** · Testo: I nostri maschi portano il tipo e la linea. [Una riga sul criterio di scelta.]');
d.h3('Sezione Femmine');
d.p('Etichetta: Le regine di casa · Titolo: **Femmine** · Testo: Le nostre femmine trasmettono dolcezza, struttura e carattere ai cuccioli. [Una riga sul criterio di scelta.]');
d.h3('Scheda gatto (campi)');
d.table(['Campo', 'Esempio / formato'], [
  ['Nome completo', 'Las Vegas of Britland [da confermare]'],
  ['Ruolo', 'Maschio riproduttore / Femmina riproduttrice'],
  ['Razza', 'British Shorthair / British Longhair'],
  ['Colore', 'Blu · codice EMS [es. BRI a]'],
  ['Nato il', '[gg mese aaaa]'],
  ['Genitori', '[Padre] × [Madre]'],
  ['Titoli', '[Titolo · esposizione · anno]'],
  ['Test sanitari', '[PKD · HCM · FIV · FeLV: esito e data]'],
  ['Carattere', '[Due righe di Domenico sul carattere del gatto]'],
  ['Figli notevoli', '[Link ai cuccioli o ai gatti premiati nati da lui/lei]'],
], [0.3, 0.7]);

/* ---------- CUCCIOLI ---------- */
d.h1('4. Cuccioli');
d.p('**Titolo pagina:** Cuccioli disponibili');
d.p('**Introduzione:** Ogni cucciolo ha la sua scheda: chi sono i genitori, quando è nato, di che colore è, se è ancora disponibile. Se non trovi quello che cerchi, scrivici: [teniamo una lista d’attesa per le prossime cucciolate].');
d.h3('Filtri');
d.p('Razza: Tutti · Shorthair · Longhair   |   Sesso: Tutti · Maschio · Femmina   |   Stato: Disponibili · Prenotati');
d.h3('Etichette di stato');
d.table(['Stato interno', 'Etichetta sito', 'Comportamento'], [
  ['available', 'Disponibile', 'In evidenza, bottone WhatsApp attivo'],
  ['reserved', 'Prenotato / Prenotata', 'Visibile, bottone sostituito da “Chiedi la lista d’attesa”'],
  ['sold', 'Ceduto', 'Nascosto dall’elenco, visibile solo in archivio “Nati da noi” [opzionale]'],
], [0.25, 0.3, 0.45]);
d.h3('Scheda cucciolo (struttura del testo)');
d.table(['Campo', 'Formato'], [
  ['Titolo', '[Nome] degli Arduini'],
  ['Riga razza', 'British Shorthair · Blu · Femmina'],
  ['Nato il', '[gg mese aaaa]'],
  ['Figlio/Figlia di', '[Padre] × [Madre] (con link alle schede dei genitori)'],
  ['Colore e codice', '[Colore] · [codice EMS]'],
  ['Disponibile dal', '[data]'],
  ['Carattere', '[Due-tre righe di Domenico sul temperamento del cucciolo]'],
  ['Cosa riceve', '[Pedigree · microchip · libretto sanitario · vaccini · contratto] da confermare'],
  ['Prezzo', '[€ __ oppure “Scrivici su WhatsApp”]'],
  ['CTA', 'Chiedi di [Nome] su WhatsApp'],
], [0.3, 0.7]);
d.p('**Messaggio WhatsApp precompilato:** Ciao! Sono interessato a [Nome] degli Arduini, [razza], nato il [data]. Possiamo parlarne?');
d.h3('Caratteristiche della razza');
d.h2('British Shorthair');
d.p('Il British Shorthair è un gatto compatto e robusto, dal corpo tondo, la testa larga e le guance piene. Il mantello è corto, denso e soffice, quasi un peluche. Il carattere è calmo, affettuoso e indipendente: ama la compagnia ma non è invadente, e si adatta bene alla vita in appartamento. Cresce lentamente e raggiunge la maturità intorno ai tre anni.');
d.h2('British Longhair');
d.p('Ha lo stesso tipo e lo stesso carattere dello Shorthair, con un mantello semilungo, folto e morbido, più ricco su collo e culotte. Chiede una spazzolatura regolare, ma restituisce un gatto di grande presenza e dolcezza.');
d.note('Peso e tempi di crescita vanno bene come indicazioni generali. Evitare numeri precisi finché Domenico non li conferma.');
d.h3('Come funziona (4 passi)');
d.ol([
  '**Scrivici.** Raccontaci cosa cerchi: colore, sesso, tempi.',
  '**Conosci i cuccioli.** [Visita su appuntamento / video / foto: confermare.]',
  '**Prenota.** [Caparra e contratto: confermare.]',
  '**Ritira.** Il cucciolo parte con documenti e consigli per i primi giorni.',
]);
d.h3('Stato vuoto');
d.p('Al momento non ci sono cuccioli disponibili. Le prossime cucciolate sono previste [periodo]. Scrivici per entrare in lista d’attesa.');

/* ---------- EXPO ---------- */
d.h1('5. Expo e gatti premiati');
d.p('**Titolo pagina:** Expo');
d.p('**Introduzione:** Le esposizioni sono il banco di prova del nostro lavoro: un giudice, un ring, un confronto con gli altri allevatori. Qui trovi i risultati, i gatti premiati e il racconto delle ultime expo.');
d.h3('Palmarès (colonne)');
d.p('Anno · Esposizione · Città · Gatto · Titolo · Federazione');
d.p('Esempio di riga: [2025] · [Nome esposizione internazionale] · [Città] · [Nome del gatto] · [Titolo] · [Federazione]');
d.h3('Gatti premiati');
d.p('Titolo sezione: **Gatti premiati**. Per ogni gatto: nome, razza, colore, titoli ottenuti, foto in ring e foto ritratto.');
d.h3('Come leggere i titoli (mini guida)');
d.p('[Breve glossario con i soli titoli e federazioni che l’allevamento usa davvero (es. CAC, CACIB, Best in Show). Da validare con Domenico: i nomi e il significato dei titoli variano per federazione.]');
d.h3('Stato vuoto');
d.p('I risultati delle prossime expo saranno pubblicati qui. Seguici su Instagram e Facebook per le novità.');

/* ---------- NEWS ---------- */
d.h1('6. News ed eventi');
d.p('**Titolo pagina:** Dal diario · Sottotitolo: News & eventi');
d.p('**Categorie:** Tutte · Cucciolate · Expo · Eventi');
d.h3('Articolo di esempio 1 · Evento (basato su fatti verificati)');
d.p('**Titolo:** I British degli Arduini al Peraga Garden Center');
d.p('**Estratto:** Un weekend tra gatti campioni e conigli Minilop, a Mercenasco, vicino a Torino.');
d.p('Testo: Decine di British Shorthair e di conigli Minilop dell’allevamento degli Arduini hanno animato gli spazi del Peraga Garden Center, in Via Nazionale 9 a Mercenasco (TO), per un fine settimana dedicato agli animali. Gli ospiti hanno potuto conoscere i gatti, chiedere consigli agli allevatori e scoprire i Minilop, una razza di conigli poco diffusa in Italia, riconoscibile dalle orecchie pendenti e da un peso che non supera 1,6 kg. [Aggiornare con le date e i risultati dell’edizione più recente.]');
d.h3('Articolo di esempio 2 · Cucciolata (modello)');
d.p('**Titolo:** Nuova cucciolata: benvenuti piccolini');
d.p('Sono nati [numero] cuccioli da [Madre] e [Padre]: [colori e sesso]. Crescono in [ambiente] e saranno pronti per le nuove famiglie dal [data]. Le schede sono già online: scrivici per prenotare.');
d.h3('Articolo di esempio 3 · Expo (modello)');
d.p('**Titolo:** [Nome esposizione]: i risultati');
d.p('[Città], [data]. Abbiamo portato [numero] gatti: [nome] ha ottenuto [titolo]. [Una riga di racconto: l’attesa, il giudice, la reazione.] Foto e dettagli qui sotto.');
d.h3('Campi SEO per ogni articolo');
d.p('Titolo SEO (max 60 caratteri) · Descrizione (max 155) · Immagine di copertina · Categoria · Data di pubblicazione.');

/* ---------- CONTATTI ---------- */
d.h1('7. Contatti');
d.p('**Titolo pagina:** Scrivici');
d.p('**Introduzione:** Il modo più veloce è WhatsApp. Rispondiamo di persona. Se preferisci, compila il modulo.');
d.table(['Blocco', 'Testo'], [
  ['Indirizzo', 'Cascina Canepali, 2 · 13885 Salussola (BI)'],
  ['WhatsApp', '+39 347 499 1817'],
  ['Email', '[email dell’allevamento]'],
  ['Orari', '[Su appuntamento / giorni e fasce orarie]'],
  ['Social', 'Facebook · Instagram · TikTok'],
], [0.25, 0.75]);
d.h3('Modulo');
d.table(['Campo', 'Etichetta', 'Note'], [
  ['Nome', 'Nome e cognome', 'Obbligatorio'],
  ['Telefono', 'Telefono / WhatsApp', 'Obbligatorio'],
  ['Email', 'Email', 'Facoltativo'],
  ['Interesse', 'Cosa cerchi?', 'British Shorthair · British Longhair · Non lo so ancora · Altro'],
  ['Cucciolo', 'Cucciolo di interesse', 'Pre-compilato se si arriva da una scheda'],
  ['Messaggio', 'Raccontaci cosa cerchi', 'Facoltativo'],
  ['Privacy', 'Acconsento al trattamento dei dati per essere ricontattato. [Link informativa]', 'Obbligatorio'],
], [0.2, 0.45, 0.35]);
d.p('**Bottone:** Invia la richiesta · **Conferma:** Grazie! Ti rispondiamo appena possibile, di solito entro [24 ore]. · **Errore:** Qualcosa è andato storto. Riprova o scrivici su WhatsApp.');
d.p('**WhatsApp precompilato (contatto generico):** Ciao! Vorrei informazioni sui vostri British. Sono interessato a: [Shorthair / Longhair].');

/* ---------- MICROCOPY ---------- */
d.h1('8. Microcopy e stati');
d.table(['Dove', 'Testo'], [
  ['Menu', 'Gatti · Cuccioli · Expo · News · Scrivici'],
  ['Cookie banner', 'Usiamo cookie tecnici e, con il tuo consenso, di misurazione. [Accetta] [Rifiuta] [Personalizza]'],
  ['Pagina 404', 'Questa pagina non esiste. Torna alla home o scrivici su WhatsApp.'],
  ['Immagine mancante', 'Foto in arrivo'],
  ['Caricamento', 'Un momento…'],
  ['Link “torna su”', 'Torna su'],
  ['Footer, descrizione', 'British Shorthair e British Longhair, allevati con passione a Salussola, in provincia di Biella.'],
], [0.28, 0.72]);

/* ---------- SEO ---------- */
d.h1('9. SEO: titoli e descrizioni');
d.table(['Pagina', 'Title (≤60)', 'Meta description (≤155)'], [
  ['Home', 'Allevamento British Shorthair e Longhair | Biella', 'Allevamento di British Shorthair e Longhair a Salussola (Biella), dal 2000. Cuccioli disponibili, gatti premiati e news. Scrivici su WhatsApp.'],
  ['L’allevamento', 'L’allevamento | Degli Arduini, dal 2000', 'La storia, il metodo e le domande frequenti dell’allevamento degli Arduini: British Shorthair e Longhair a Salussola, Biella.'],
  ['I nostri gatti', 'I nostri gatti: riproduttori British | Arduini', 'I maschi e le femmine dell’allevamento degli Arduini: linee di sangue, titoli e test sanitari dei nostri British Shorthair e Longhair.'],
  ['Cuccioli', 'Cuccioli British Shorthair e Longhair | Arduini', 'Cuccioli British disponibili a Salussola (Biella): schede con genitori, colore e data di nascita. Scrivici su WhatsApp per prenotare.'],
  ['Scheda cucciolo', '[Nome] · cucciolo British [colore] | Arduini', '[Nome], British [Shorthair/Longhair] [colore], nato il [data] da [Padre] e [Madre]. Disponibile a Salussola (BI).'],
  ['Expo', 'Expo e gatti premiati | Allevamento degli Arduini', 'Risultati, titoli e gatti premiati alle esposizioni feline: il palmarès dell’allevamento degli Arduini, British dal 2000.'],
  ['News', 'News ed eventi | Allevamento degli Arduini', 'Nuove cucciolate, risultati alle expo ed eventi dell’allevamento degli Arduini di Salussola (Biella).'],
  ['Contatti', 'Contatti e WhatsApp | Allevamento degli Arduini', 'Scrivici su WhatsApp o compila il modulo: Cascina Canepali 2, Salussola (BI). Informazioni su cuccioli e visite.'],
], [0.17, 0.33, 0.5]);

d.save('/home/user/CLAUDE-MOTIONS/docs-arduini/02-Testi-Arduini.docx');
