# Regole di produzione video: Farmacia Monaco

Regole date da Meme (Pquattro). Vanno applicate a ogni nuovo reel per Farmacia Monaco.

## Voce e testi
- Nei testi parlati e a schermo la farmacia parla in prima persona plurale: "nella nostra farmacia", "da noi", "ti aspettiamo da noi". Mai in terza persona ("in Farmacia Monaco", "alla Farmacia Monaco"). Il nome Farmacia Monaco compare solo nel logo e nell'end card.
- Fonte del testo: il docx del PED (cartella "fonti" del mese). La voce usa il testo della fonte parola per parola, tagliando solo se serve.
- La voce fuori campo si genera su Runway, in italiano, scena per scena (così si conosce la durata di ogni frase): eleven_multilingual_v2, voce Niki, languageCode it, speed 1.12.

## Musica e suoni
- La musica deve essere sempre allegra e ben ritmata (circa 110-120 BPM, battiti di mani, marimba, chitarra), anche nei reel più seri. Si abbassa sotto la voce.
- Effetti sonori leggeri sui cambi scena.

## Clip e movimento
- Le clip generate devono essere pertinenti a quello che dice la voce in quel momento (niente clip astratte).
- Movimenti dei personaggi fluidi e naturali: usare Seedance 2.0 Mini (720p, circa 15 crediti al secondo). Il gen-4-turbo (25 crediti a clip) va bene solo per scene senza personaggi. Per scene con testo leggibile (display, insegne) usare l'immagine statica con zoom lento, e scrivere nel prompt "no letters, no words".
- Metodo: prima l'immagine di ogni scena (nano-banana-2, circa 7 crediti), poi l'animazione partendo dall'immagine. Personaggi ricorrenti: signore anziano (cardigan bordeaux), signora anziana (maglione crema, occhiali), farmacista (camice bianco con colletto teal). Riusare le immagini di riferimento per coerenza.
- Testi a schermo e logo si aggiungono sempre in montaggio, mai dentro la generazione.

## Brand
- Colori: teal #3DAAA7, blu #1383B5. Logo: croce spezzata con puntino, scritta FARMACIA e "Dott.ssa Monaco Carla".
- Testi: Inter ExtraBold maiuscolo, pill bianca, parola chiave in teal.
- Contatti end card: Via Annia 69, Polla (SA), 0975 391117, 334 3924150.
- Non mostrare Gerardina (in maternità dal 1 settembre 2026).

## Processo
- Prima di spendere crediti Runway mostrare l'elenco scene e il costo stimato, e aspettare il via.
- Consegnare il video con SendUserFile, poi commit e push sul branch di lavoro.
