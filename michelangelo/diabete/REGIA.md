# REGIA — Reel "Diabete: complicanze e piccole attenzioni quotidiane" · Farmacia Michelangelo

Formato 1080×1920 · 30fps · 95 s · versione v2 (Remotion + asset Runway Michelangelo) · voce reale della farmacista (12 clip girate) · inserti 3D Runway con brand identity Michelangelo · musica Runway · versione master senza musica e senza sottotitoli.

Tempi: parola per parola da Whisper (`whisper_med.json`), tagli in `cuts.json`.

| # | Parlato (tempo in uscita) | Inserto 3D (Runway) | Grafica sopra |
|---|---|---|---|
| 1 | "Se hai il diabete e prendi regolarmente farmaci, c'è qualcosa di importante che devi sapere." (0–6 s) | — (volto) | hook "hai il diabete? / devi sapere questo" |
| 2 | "La glicemia può oscillare anche con la terapia: alimentazione, movimento, stress e malattia." (6–14) | **glicemia**: vaso sanguigno con zollette di zucchero che fluttuano, onda che sale e scende | chip alimentazione · movimento · stress · malattia |
| 3 | "E nel tempo il diabete può avere conseguenze su pelle, piedi e occhi." (14–20) | **tre oggetti**: sezione di pelle, piede, occhio (3 clip brevi o 1 carrellata) | parola grande che cambia: PELLE · PIEDI · OCCHI |
| 4-5 | "Nelle donne, sul benessere intimo, favorendo secchezza e infezioni, che incidono sul benessere sessuale." (20–28) | **petalo/rosa** che si idrata (delicato, nessuna nudità) | chip secchezza · infezioni · benessere intimo |
| 6 | "Partiamo dalla pelle. Il diabete può causare secchezza… cosmetici specifici per viso e corpo." (28–38) | **pelle secca** (avambraccio, mano che applica crema) poi **flat lay cosmetici** verdi/crema | titolo "secchezza", "viso e corpo" |
| 7 | "Piedi: sensibilità ridotta. Controllali ogni giorno, asciugali bene, crema emolliente, non tra le dita." (38–50) | **donna con lo specchietto** controlla il piede, poi **crema sul tallone** | checklist: controllali · asciugali · crema · non tra le dita |
| 8 | "Un segnale da non sottovalutare: ferita al piede, piede gonfio, rosso, caldo, anche senza dolore. Contatta subito il medico." (50–62) | **tallone con piccola crepa**, luce calda, nessun sangue | chip ferita · gonfio · rosso · caldo · senza dolore → pillola "contatta subito il medico" |
| 9 | "Anche gli occhi possono diventare secchi: mantienili idratati, visita oculistica periodica." (62–72) | **occhio e goccia di collirio** | chip idratati · visita oculistica |
| 10 | "Per prevenire basta prendersi cura di sé con consapevolezza, ogni giorno." (72–80) | **mani che reggono un cuore luminoso** | "prendersi cura di sé / con consapevolezza / ogni giorno" |
| 11-12 | "Noi possiamo aiutarti… Vieni pure a trovarci, siamo qui per aiutarti a vivere meglio con il diabete." (80–90) | — (volto) | chip soluzioni più adatte · pillola "vieni a trovarci" |
| Chiusura | — | **logo 3D** (caduceo estruso) | "Farmacia Michelangelo · Viale Michelangelo 13, Foggia · 0881 636803" |

Vincoli: niente valori di glicemia a schermo, niente sangue, niente persone con volto riconoscibile oltre alla farmacista, nessun claim terapeutico oltre a quanto dice lei.
Da chiarire col cliente: la frase 4 ("Nelle donne, sul benessere intimo, favorendo…") è senza verbo nel parlato.

## Prompt Runway (brand Michelangelo)

Prefisso comune alle immagini (nano-banana-pro, 9:16, "no text, no logo"):
`3D animated feature-film clay style, soft warm lighting, clean pastel colors, friendly and reassuring mood, vertical 9:16. Palette: teal green #2D9B76, lime green #9BC84B, pale sage #A8D5A3, deep forest green #14382E, warm cream #F4F1EC and white; no pink, no red. Subject in the upper two thirds, lower third left clear for text. No text, no logos.`

| clip | soggetto (aggiunto al prefisso) | animazione (seedance-2-mini, 6 s) |
|---|---|---|
| `blood` | inside a soft glowing blood vessel, round cream-and-teal cells and tiny white sugar cubes floating, a gentle luminous wave rising and falling | slow smooth camera push-in, cells and sugar cubes drift, the wave gently rises and falls |
| `layers` | a clay cross-section block of skin in cream and sage green with tiny lime plants, soft steam rising | slow camera orbit, water droplets rise through the layers and the surface looks hydrated |
| `heel` | close-up of a clay heel standing on a cream towel, a tiny dry crack, warm side light | slow push-in, a soft glow follows the crack |
| `eye` | clay face in close-up, eyes closed, a hand with a deep-green dropper above one eye | the drop falls, the eye opens gently and blinks, relieved smile |
| `petal` | a single cream-and-sage rose with morning dew on soft green leaves | dew drops slowly form and slide, the petals open slightly |
| `arm` | clay forearm with a cream cardigan cuff, dry flaking skin, soft living-room light | a hand applies cream, the skin becomes smooth |
| `flatlay` | top view of cream towel, teal and lime pump bottles and tubes, a glass of water with a leaf | slow push-in, bottles gently slide into place |
| `mirror` | clay woman on a cream sofa checking the sole of her foot with a small round mirror, teal sweater | smooth natural motion, she turns the mirror and nods calmly, slow push-in |
| `cream` | a hand applying white cream on a clay heel, cream towel, deep-green tube | smooth stroke along the heel, the skin looks soft, slow push-in |
| `hands` | two cream clay hands holding a soft glowing heart in sage and lime light, floating leaves | the heart pulses slowly, leaves drift, slow push-in |

Ripresa 6 s a 720p. Se il budget è stretto: clip animate solo su `blood`, `heel`, `eye`, `mirror`, `hands`; le altre come immagine con movimento camera in Remotion.

Musica (eleven-music-v2.5, 95 s, `forceInstrumental`):
`Instrumental background music for a calm, reassuring health-education Instagram reel from a neighbourhood pharmacy, a female pharmacist speaking to camera about daily care for people living with diabetes. Warm, gentle, trustworthy, unhurried: soft felt piano with simple repeating patterns, light acoustic guitar plucks, airy pads, subtle warm bass, very light brushed percussion, about 84 BPM, major key, hopeful and caring, never dramatic, no tension. Very sparse mid-range so a spoken voice sits clearly on top, no lead melody, no vocals. Slowly builds in the first 15 seconds, steady and warm in the middle, ends with a clean resolved soft chord exactly at the end.`

SFX (`generate_sound_effect`): whoosh morbido (transizione a cubo), pop leggero (chip), logo reveal (chiusura). Niente campanelli.

## Crediti Runway (stima)
- 10 immagini ≈ 200 · 5 clip ≈ 450 (8 clip ≈ 720) · musica 95 s ≈ 32 (lyria-3-pro 8) · 3 SFX ≈ 15.
- **Piano base ≈ 700 crediti, piano completo ≈ 970 crediti.**

## Come è stato fatto (v2, in risparmio)
- 9 immagini nano-banana-pro (20 crediti l'una) in palette Michelangelo; solo 5 animate con seedance-2-mini 5 s (75 crediti l'una): `blood`, `heel`, `eye`, `mirror`, `hands`. Le altre 4 (`layers`, `petal`, `arm`, `flatlay`) restano immagini con movimento di camera in Remotion. `heel` e `eye` sono riusate in più scene.
- Musica: lyria-3-pro (8 crediti), 57 s estesi a 95 s con due crossfade da 5 s su punti allineati al ritmo. Effetti sonori sintetizzati in locale (0 crediti).
- Totale 563 crediti spesi su 1002 (439 residui). ID dei task in `runway_tasks.json`.
- Consegna: `mix.sh` produce il master senza musica e senza sottotitoli (voce + sfx) e la versione con musica a -14 LUFS.
- Cerchio con il volto durante gli inserti: 350 px, inquadra tutta la faccia (attaccatura dei capelli → mento).
