const { Doc } = require('./lib');
const d = new Doc('Allevamento degli Arduini', 'Documento di contesto · da caricare nella Knowledge del progetto Lovable');

d.note('**Come usarlo.** Questo documento raccoglie tutto ciò che è emerso dalla ricerca online (27/10/2026) sull’allevamento e sul mercato. I fatti sono separati dalle ipotesi. Ciò che è tra [parentesi quadre] va confermato con Domenico Petraro prima della pubblicazione.');

d.h1('1. Il progetto in breve');
d.p('Realizzare il nuovo sito dell’**Allevamento degli Arduini** (British Shorthair e British Longhair, Salussola, Biella) con un gestionale che permetta al titolare di aggiornare da solo cuccioli, gatti, expo e news.');
d.h3('Obiettivi, in ordine di priorità');
d.ol([
  '**Generare contatti WhatsApp** da persone che cercano un cucciolo British in Piemonte e Lombardia.',
  '**Costruire fiducia**: nel mercato degli annunci online circolano molte truffe e annunci fotocopia. Un allevatore con 26 anni di storia, verificabile, ha un vantaggio enorme.',
  '**Posizionarsi sulla ricerca locale** (Biella, Vercelli, Torino, Milano).',
  '**Rendere il titolare autonomo**: caricare un cucciolo o una news deve richiedere meno di 3 minuti da telefono.',
]);

d.h1('2. Scheda dell’allevamento');
d.table(['Voce', 'Dato', 'Fonte / stato'], [
  ['Nome in uso', 'Allevamento “I Gatti Degli Arduini”\nAllevamento British Shorthair degli Arduini (scheda Google)\nAllevamento Degli Arduini Petraro (seconda pagina FB, Infobel)', 'Tre denominazioni diverse: da unificare'],
  ['Titolare', 'Domenico Massimo Petraro', 'Articoli locali su evento Peraga (2023)'],
  ['Attivo dal', '2000', 'Pagina Facebook, scheda agraria.org'],
  ['Sede', 'Cascina Canepali, 2 – 13885 Salussola (BI), Piemonte', 'Scheda Google, agraria.org'],
  ['Telefono / WhatsApp', '+39 347 499 1817', 'Scheda Google, Facebook, Instagram'],
  ['Altro numero', '+39 349 308 4469', 'Elenco AFI: [da verificare se ancora in uso]'],
  ['Email', 'massiarduini@live.it (Facebook, agraria.org)\ninfo@igattidegliarduini.it (elenco AFI)', 'Il dominio igattidegliarduini.it **non risolve il DNS** (verificato il 27/10/2026): la seconda mail è probabilmente non funzionante'],
  ['Razze', 'British Shorthair, British Longhair', 'TikTok: “alleviamo con passione British shorthair e longhair”'],
  ['Colori dichiarati', 'Blu, lilac, blu tabby, chocolate, bicolori blu/bianco', 'agraria.org'],
  ['Attività secondaria', 'Conigli nani Minilop', 'Instagram, evento Peraga'],
  ['Affiliazioni', 'Presente nell’elenco allevatori AFI (Associazione Felina Italiana). Citato come allevamento WCF su Tigri Domestiche.', '[Confermare con Domenico: federazioni, affisso, anno di riconoscimento]'],
], [0.2, 0.45, 0.35]);

d.h1('3. Storia e reputazione (solo fatti verificati)');
d.ul([
  '**Dal 2000** alleva British Shorthair “cercando di avere sempre gatti molto socievoli e di ottimo tipo” (Facebook).',
  'Descrizione su agraria.org: “Dal 2000 alleviamo e selezioniamo British Shorthair blu, lilac, blu tabby, chocolate e bicolori blu white **con ottimi risultati alle expo**”.',
  '**Evento Peraga Garden Center (Mercenasco, TO), 18-19 marzo 2023**: decine di British Shorthair e conigli Minilop in mostra. Il comunicato dell’organizzatore parla di “British Shorthair vincitori di gare europee e mondiali” e definisce l’allevamento “dal 2000 punto di riferimento per gli amanti degli animali”. Un nuovo evento “I British degli Arduini, 14-15 marzo, da Peraga” risulta annunciato da una pagina Facebook terza [anno da confermare].',
  'Recensioni Google: **4,1 su 5 con 15 recensioni**. Una seconda pagina Facebook ha 1 recensione da 5,0 (2018).',
  'Gatti citati online (nomi da confermare): Las Vegas of Britland e Greta Garbo degli Arduini (genitori di una cucciolata del 2018), Mojto degli Arduini, Elodie, Birba degli Arduini.',
]);
d.note('**Attenzione.** “Vincitori di gare europee e mondiali” è una dichiarazione dell’organizzatore dell’evento. Prima di usarla sul sito servono i titoli reali (nome del gatto, esposizione, anno, titolo, federazione).');

d.h1('4. Presenza online oggi');
d.table(['Canale', 'Stato', 'Note'], [
  ['Sito web', 'Assente (dominio non raggiungibile)', 'Ancora linkato su Facebook, AFI, agraria.org, Tigri Domestiche. La scheda Google mostra “Aggiungi sito web”.'],
  ['Facebook – “I Gatti Degli Arduini”', 'Attiva, ~6,6K follower', 'Pagina principale, contenuti recenti (video e foto cucciolate nel 2025-26)'],
  ['Facebook – “Degli Arduini Petraro”', 'Secondaria, ~2,2K follower', 'Da unificare o chiudere'],
  ['Instagram @domenicopetraro', '~870 follower', 'Handle personale, bio: “british shorthair e conigli nani”'],
  ['TikTok @i.gatti.degli.arduini', 'Attivo', 'Metriche non lette'],
  ['Google Business Profile', '4,1 · 15 recensioni', 'Senza sito, senza orari. Da rivendicare e completare.'],
  ['Portali di settore', 'agraria.org, AFI, Tigri Domestiche, Infobel', 'Link al sito ormai morto: da aggiornare appena c’è il nuovo dominio'],
  ['Annunci (AnnunciAnimali, AnimaleAmico)', 'Non trovato nei risultati principali', '[Verificare se pubblicano lì]'],
], [0.28, 0.27, 0.45]);
d.p('Limite della ricerca: Facebook, Instagram e TikTok non sono leggibili dagli strumenti usati. I dati social arrivano da snippet e risultati di ricerca, non da una lettura diretta dei post.');

d.h1('5. Mercato British Shorthair in Italia');
d.h3('Prezzi osservati (annunci di ottobre 2026)');
d.table(['Fascia', 'Cosa trovi', 'Esempi'], [
  ['400–700 €', 'Quasi sempre privati o cuccioli senza pedigree; età spesso già alta', 'Cuccioli senza pedigree, adulti sterilizzati'],
  ['800–1.100 €', 'Cuccioli con libretto e vaccini; a volte pedigree da compagnia', 'Torino 800 €; Bologna 700 € (ANFI); Felicity Golden (TO) blu golden 1.100 €'],
  ['1.200–1.500 €', 'Pedigree, test genetici dei genitori, colori ricercati (lilac, golden, silver, bicolore)', 'Agorà Artemide 1.200–1.500 €; lilac a Milano 1.300–1.400 €'],
  ['1.800 € e oltre', 'Linee selezionate, genitori con campioni nel pedigree', 'Annuncio a Cuneo 1.800 €'],
], [0.17, 0.45, 0.38]);
d.p('Un portale di annunci riporta un prezzo medio di 597 € su 66 annunci (minimo 250 €), ma il campione è dominato da privati. Una discussione Reddit cita 2.000-4.000 $ per veri British: è un riferimento americano, non italiano.');
d.h3('Segnali di mercato');
d.ul([
  '**Crisi di fiducia.** Su AnimaleAmico decine di annunci “Premium” identici compaiono in città diverse (da Brescia a Matera): hanno tutta l’aria di truffe. Un allevatore verificabile, con sito, recensioni e indirizzo reale, si distingue subito.',
  '**Il prezzo segue il colore e la documentazione**, non solo la razza. I colori standard (blu, lilac, bicolore) stanno in 900-1.300 €; golden/silver e linee premiate salgono.',
  '**I concorrenti seri mostrano**: pedigree, test FIV/FeLV/PKD/HCM, età di cessione, assistenza dopo l’adozione, recensioni, visita su appuntamento.',
  '**Il British è la razza più diffusa nei registri GCCF** (Regno Unito) dal 2001, quando ha superato il Persiano (fonte: Wikipedia). Domanda strutturalmente solida.',
]);

d.h1('6. Concorrenza');
d.h3('Piemonte (elenco agraria.org)');
d.ul([
  'Il Pentagramma (Torino): alta genealogia, riconosciuto TICA e WCF, test HCM e PKD.',
  'Blue Rock (Macello, TO): riconosciuto ANFI dal 2007, blue, lilac, colourpoint.',
  'Diamanti Ambrati (Pontecurone, AL): AFEF/WCF, alta genealogia.',
  'Al Lago Incantato (Novara): golden e colourpoint, test PKD-HCM-FIV-FeLV.',
  'I British di Tondagentile (Bistagno, AL), Ainardi (Bruino, TO), Fiori dell’Eridano (Torino).',
  'Altri nel raggio: Felicity Golden (TO), I Gatti di Apriti Cielo (Novara), Raff/Gattimania (Rivarolo Canavese, TO), Casa Mattia (Carignano, TO).',
]);
d.h3('Lombardia');
d.ul(['Casa Dolce Cosi (Casorate Primo, PV), Oasi delle Meraviglie (Settimo Milanese), La Corte di Artù, Barney’s House (BG), Angela’s BriCat (BG), Mamatilda (Rozzano).']);
d.h3('Benchmark siti (analizzati il 27/10/2026)');
d.table(['Sito', 'Giudizio', 'Cosa copiare / evitare'], [
  ['igattidiapriticielo.it (Novara)', 'Il migliore del gruppo', 'Copiare: H1 locale + “da oltre vent’anni”, blocco trasparenza sanitaria (FIV/FeLV, pedigree, microchip, ≥12 settimane, assistenza), recensioni Google in pagina (4,3 su 64), FAQ, WhatsApp ovunque, visite solo su appuntamento. Manca: prezzi, schede cucciolo, test PKD/HCM.'],
  ['agora-artemide.com', 'Completo ma datato (WordPress/WooCommerce)', 'Copiare: scheda cucciolo con razza, mantello, sesso, data di nascita e prezzo visibile; recensioni; consegna in Europa. Evitare: grafica vecchia, shop di accessori che confonde.'],
  ['casadolcecosi.com (Wix)', 'Pulito, minimale', 'Copiare: pagina “10 cose da sapere”, visite su appuntamento. Manca: prezzi e schede.'],
  ['gattimania.it (Jimdo)', 'Scarso', 'Testo da forum, nessuna struttura né prova di fiducia. Vive solo di keyword.'],
  ['allevamentocasamattia.it', 'Scarso', 'Allevamento generalista (British, pastori, labrador), pagina quasi vuota, solo telefono.'],
], [0.25, 0.2, 0.55]);
d.note('**Spazio libero.** Nessuno dei concorrenti ha una grafica d’autore, una linea di sangue raccontata, schede cucciolo complete con genitori e una sezione expo seria. È lì che il nuovo sito vince.');

d.h1('7. Pubblico');
d.ul([
  'Famiglie con bambini e coppie che cercano un gatto calmo e affettuoso, adatto all’appartamento.',
  'Persone che vogliono un cucciolo con pedigree e linee selezionate; interessate al colore (blu, lilac, bicolore).',
  'Utenti da smartphone, che contattano su WhatsApp e diffidano degli annunci anonimi.',
  'Zona di interesse: Biella, Vercelli, Torino, Novara, Milano e hinterland (ipotesi, da validare coi dati dell’allevatore).',
]);

d.h1('8. Strategia del sito');
d.h3('Proposta di valore');
d.quote('“Dal 2000 alleviamo British come si dipingeva un ritratto: con pazienza, con luce, con carattere.”');
d.h3('Leve di fiducia da mostrare ovunque');
d.ul([
  '26 anni di attività e indirizzo reale (Cascina Canepali, Salussola).',
  'Gatti premiati con titolo, expo, anno (prova documentata, non slogan).',
  'Schede cucciolo con genitori, data di nascita, colore, stato.',
  'Garanzie sanitarie e documenti consegnati [da confermare].',
  'Recensioni Google reali in pagina, dopo una campagna per raccoglierne altre.',
]);
d.h3('Parole chiave locali');
d.ul([
  'allevamento british shorthair Biella · allevamento gatti British Piemonte',
  'cuccioli british shorthair Torino · cuccioli british Piemonte con pedigree',
  'british longhair Piemonte · allevamento british Salussola',
]);
d.h3('Conversione');
d.ul(['CTA unica e costante: **WhatsApp** (messaggio precompilato con il nome del cucciolo).', 'Modulo contatti come alternativa, con salvataggio nel gestionale.']);

d.h1('9. Struttura del sito e gestionale (sintesi)');
d.table(['Pagina', 'Contenuto'], [
  ['Home', 'Hero con wordmark, manifesto, ritratti maschi/femmine, cuccioli, expo, news, contatto'],
  ['I nostri gatti', 'Sezioni Maschi (riproduttori) e Femmine, con scheda per gatto'],
  ['Cuccioli', 'Elenco con filtri e scheda tecnica (nome, nato il, figlio di, razza, colore, sesso, stato)'],
  ['Expo e premiati', 'Palmarès, gatti premiati, racconti delle esposizioni'],
  ['News ed eventi', 'Articoli: cucciolate, expo, eventi'],
  ['L’allevamento', 'Storia, metodo, domande frequenti'],
  ['Contatti', 'WhatsApp, modulo, mappa, orari'],
  ['/admin', 'Gestionale riservato: cuccioli, gatti, expo, news, richieste ricevute, impostazioni'],
], [0.25, 0.75]);

d.h1('10. Dati da chiedere a Domenico');
d.ul([
  'Nome ufficiale e affisso; federazioni (ANFI/FIFe, WCF, AFI, TICA) e anno di riconoscimento.',
  'Elenco riproduttori: nome, razza, colore (codice EMS), data di nascita, genitori, titoli, test (PKD, HCM, FIV, FeLV).',
  'Palmarès: expo, città, anno, gatto, titolo, federazione. Foto delle premiazioni e coppe.',
  'Cosa è incluso con ogni cucciolo (pedigree, microchip, vaccini, libretto, contratto, kit) e a che età partono.',
  'Politica prezzi: visibili o “su richiesta”; caparra e modalità di prenotazione; consegna.',
  'Zone di consegna, orari di visita, se si riceve solo su appuntamento.',
  'Numero WhatsApp definitivo, email, P.IVA, ragione sociale per il footer.',
  'Storia personale: primo British, momento chiave, filosofia di selezione (3-4 righe).',
  'Foto professionali o shooting da organizzare (vedi documento Stile).',
  'Decisione sui conigli Minilop: sul sito sì o no.',
]);

d.h1('11. Fonti consultate (27/10/2026)');
d.ul([
  'Google Search, scheda “Allevamento British Shorthair degli Arduini” (4,1 · 15 recensioni).',
  'allevamenti.agraria.org – British Shorthair in Piemonte.',
  'Peraga Garden Center, articolo “Gatti campioni e conigli rari in mostra” (15/03/2023).',
  'afionline.it – elenco British Shorthair; tigri-domestiche.it – elenco WCF.',
  'AnnunciAnimali.it, AnimaleAmico.com – annunci British (ottobre 2026).',
  'agora-artemide.com, casadolcecosi.com, igattidiapriticielo.it, gattimania.it, allevamentocasamattia.it.',
  'Facebook, Instagram e TikTok: solo snippet dei motori di ricerca (pagine non leggibili dagli strumenti).',
]);

d.save('/home/user/CLAUDE-MOTIONS/docs-arduini/01-Contesto-Arduini.docx');
