# BRIEF — Farmacia Famiglia Pastore (Brienza, PZ)

Fonte: Drive Pquattro › FARMACIA PASTORE › OTTOBRE 2026 (PED operativo, modifiche PED, brief reel animati, fonti, volantino).

## Cliente
- Farmacia unica di un piccolo paese, molto radicata. Tono: **empatico**, in "tu", "vieni a parlarne con noi".
- Team social: solo i 3 fratelli farmacisti **Vincenzo, Alda, Isabella** (il padre Pasquale e il resto dello staff non compaiono).
- Contatti: Via Aceronia 1, Brienza · 0975 381021.
- Hashtag fissi: #FarmaciaFamigliaPastoreBrienza #FarmaciaFamigliaPastore #Brienza
- Nota ricorrente del cliente: **il logo sempre nella stessa posizione**; niente sfondi artificiali posticci.

## Brand
- Logo: coppa di Igea rosa + serpente verde a forma di "P"; "FARMACIA" serif maiuscolo spaziato, "Famiglia Pastore" serif corsivo. File: `public/logo.png` (vettoriale.ai/.pdf su Drive › logo).
- Palette dal logo: verde `#316C39`, verde scuro `#26562A`, rosa cipria `#E6B7AF`, malva `#C49994`, bianco.
- Tipografia proposta: serif (Cormorant Garamond) per titoli/payoff in linea col logo, Manrope/Montserrat per testi e sottotitoli.
- Stile animato richiesto dal brief Pquattro: "3D animated style, soft warm lighting, clean pastel colors, friendly and reassuring mood, vertical 9:16" + colori brand.

## PED ottobre 2026
| Data | Tipo | Argomento |
|---|---|---|
| 5 ott | carosello | Nuovo volantino ottobre |
| 12 ott | carosello | Beauty Day Avène 23 ottobre |
| 19 ott | **reel animato** | Caduta capelli stagionale autunno 2026 |
| 24 ott | **reel animato** | Saturimetria notturna (rifare diverso dal reel di Vincenzo già fatto) |

Volantino ottobre collegato al reel capelli: Biomineral One Lacto Plus -50% (€42,50), shampoo/linea capelli Marchio Farmacia -25% su 2 prodotti, preparato capelli D/U €14,85.

## Reel 01 — Caduta capelli d'autunno
Brief Pquattro (Higgsfield): 6 scene × 5s, ~30s, senza voce, testo a schermo:
1. Spazzola piena di capelli — "Più capelli sulla spazzola?"
2. Ciclo del follicolo — "Cresce → riposa → cade"
3. Calendario lug/ago → set/ott/nov con foglie e capelli — "Riposo in estate, caduta in autunno"
4. Sole/calore sul cuoio capelluto — "Il caldo di quest'estate ha stressato il cuoio capelluto"
5. Phon, piastra, tinta, capello che si spezza — "Tinte, phon e piastra li indeboliscono"
6. Farmacista + donna con capelli sani — "Ridai forza ai tuoi capelli. Parliamone in farmacia" + logo

Copione parlato (scheda reel farmacista): ciclo cresce/si ferma/cade; più follicoli in riposo tra luglio e agosto, la fase dura 2–3 mesi → caduta tra settembre e novembre; estate caldissima → UV, calore, stress ossidativo, radicali liberi; tinte/schiariture/phon/piastra → fragilità; consigli: shampoo delicato, limitare il calore + termoprotettore, integratori specifici; "vieni a parlarne con noi".
Fonte tecnica: caduta temporanea, picco in autunno, si riduce in 2–3 mesi; da approfondire se dura oltre 3 mesi, diradamento visibile, malattie/diete/stress.

## Reel 02 — Saturimetria notturna
Brief: 6 scene × 5s; lo stesso uomo nelle scene 1–3 (immagine della scena 1 come riferimento). Russare → stanchezza → respiro che si interrompe → meno ossigeno → sensore al dito di notte → invito in farmacia.
Vincoli: controllo semplice, non invasivo, orientativo; **non sostituisce la valutazione medica**.

## Pipeline
Stessa di `plebiscito/`: REGIA.md → voice.py (TTS Runway) → shots.py → immagini nano-banana-pro + clip gen-4-turbo 5s (Runway) → prep_ai.py → Movie.tsx (Remotion, 1080×1920 30fps) → sfx.py → render.sh (con voce + sfx, e solo voce).
