# Farmacia Michelangelo — bibbia video

Fonte: Drive Pquattro › Farmacia Michelangelo (strategia social feb-mar 2026, PED operativi, logo). Logo reale: `montaggi/michelangelo-nov26/logo_michelangelo.png` (caduceo alato + "FARMACIA MICHELANGELO").

## Chi è
- Viale Michelangelo 13, Foggia · 0881 636803 · WhatsApp +39 366 871 4028.
- Farmacia di quartiere, zona residenziale medio-alta, "di fiducia". Titolare storica dott.ssa Rosa/Pina (nome da confermare, non metterlo a schermo), figlia Alessia, farmaciste Marica, Giulia, Francesca.
- Concorrenti: Santa Rita (prezzo), San Michele (servizi e dermocosmesi). Michelangelo si differenzia sulla fiducia, non sul prezzo.

## Posizionamento e tono
- Archetipi: **Custode** dominante + **Saggio** + **Caregiver**. Strutturata ma non rigida, autorevole ma non distante.
- Non deve sembrare la farmacia più "attiva": deve sembrare la più affidabile.
- Tono: chiaro, rassicurante, sobrio. Mai urgenze commerciali, mai allarmismo, mai emotività eccessiva, mai paternalismo.
- Parole: prevenzione, continuità, affidabilità, competenza, presidio, punto di riferimento, supporto.
- Pillar centrale: prevenzione e monitoraggio continuativo (glicemia, pressione).

## Palette (dal logo)
| ruolo | hex |
|---|---|
| verde teal (caduceo, "FARMACIA") | `#2D9B76` |
| verde lime (ali basse, "MICHELANGELO") | `#9BC84B` |
| verde pallido (testa del caduceo) | `#A8D5A3` |
| verde foresta (testi scuri, fondi) | `#14382E` |
| crema (fondo chiaro) | `#F4F1EC` |
| bianco | `#FFFFFF` |

Niente rosa/cipria (è la palette di Pastore). Niente rosso allarme: per ferite e segnali usare corallo tenue solo come dettaglio.

## Tipografia
- Titoli: Anton (condensato heavy MAIUSCOLO) in box arrotondati; parola chiave in box lime con testo foresta.
- Testi: Montserrat 600/800. Payoff in corsivo.

## Stile grafico dei reel girati
- Hook titolato nei primi 2 secondi.
- Voce reale della farmacista, taglio stretto sulle pause, punch-in alternato.
- Grafiche sotto il mento (y 1075–1480), **zona sottotitoli libera da y 1490 in giù** (i sottotitoli e la musica li aggiunge Meme: consegnare sempre anche la versione senza musica e senza sottotitoli).
- Inserti a schermo intero con clip 3D (Runway), transizione a cubo, cerchio con il volto (PiP) durante gli inserti, logo in alto a destra.
- Chiusura: logo 3D (caduceo estruso) + payoff + indirizzo e telefono.

## Pipeline Runway (standard)
- **Immagini**: `generate_image` nano-banana-pro 9:16, stile "3D animated feature-film clay, soft warm lighting, clean pastel colors, friendly and reassuring mood", palette sopra, "no text, no logo", soggetto nei 2/3 alti, terzo basso libero.
- **Clip**: `generate_video` seedance-2-mini 720p 9:16, startFrame = immagine, prompt "Smooth natural 3D character animation with fluid, lifelike body motion… slow smooth camera push-in". Costo reale ~90 crediti per clip da 6 s.
- **Musica**: `generate_music` (eleven-music-v2.5 per durata esatta, o lyria-3-pro 8 crediti), strumentale caldo, "keep the mix light so a spoken voice stays clear".
- **SFX**: `generate_sound_effect` (whoosh, pop, logo reveal), niente campanelli.
- **Montaggio**: Remotion (`michelangelo/diabete/`), loudness finale -14 LUFS.
