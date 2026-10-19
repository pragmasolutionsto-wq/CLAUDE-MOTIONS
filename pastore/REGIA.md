# REGIA — Reel caduta capelli d'autunno · Farmacia Famiglia Pastore (Brienza)

Formato 1080x1920 · 30fps · ~92s · tutto animato 3D · voce narrante femminile IT (copione della scheda reel, invariato salvo "che tu ne possa") · sottotitoli burned-in parola per parola · musica: Meme.
Mai la farmacia in terza persona: solo "noi", "con noi", "nella nostra farmacia".

## Look
- Clip 3D Runway (nano-banana-pro → gen-4-turbo): stile clay/Pixar morbido, crema caldo + verde #316C39 + rosa cipria #E6B7AF (colori del logo).
- Motion graphics su due fondi: **Crema** (bolle rosa/salvia, capelli che cadono) e **Bosco** (verde profondo, bokeh rosa).
- Tipografia: Montserrat 900 per i titoli kinetic, Cormorant Garamond corsivo per gli accenti (richiama il logo). Testi 3D estrusi lucidi verde/rosa.
- Logo sempre nello stesso punto in alto a destra (nota del cliente), chiusura con marchio 3D.
- Sottotitoli: bianco con contorno verde, parola attiva su pill rosa, y≈1540.

## Scaletta
| # | Voce | Visual | Motion |
|---|---|---|---|
| Hook | "Capelli sulla spazzola, sulle spalle o nel lavandino…" | 3 clip a taglio rapido: spazzola, spalle, lavandino | 3D "CAPELLI", chip che si accumulano |
| | "quest'anno… ancora di più. E ti spiego perché." | Crema, pioggia di capelli che aumenta | 3D "DI PIÙ", "perché" |
| Ciclo | "Il capello segue un ciclo naturale: cresce, si ferma, e poi cade." | Clip follicoli → follicoli 3D Three.js animati | CRESCE → SI FERMA → CADE |
| Estate | "Tra luglio e agosto… fase di riposo… due o tre mesi…" | Bosco, pagine calendario 3D | "più follicoli", "vanno a riposo", zzz, 3D "2-3" MESI |
| | "…settembre, ottobre e novembre." | Clip foglie e capelli che cadono | chip mesi |
| Caldo | "un'estate tanto calda. Calore e raggi UV… stress ossidativo" | Clip sole sul cuoio capelluto → Bosco caldo | 3D "TANTO" calda, chip CALORE/UV, STRESS che trema |
| Radicali | "I tanti radicali liberi… dalla crescita al riposo… cioè adesso." | Clip radicali liberi + mirini | interruttore CRESCITA→RIPOSO, mesi che scorrono → 3D "ADESSO" |
| Trattamenti | "tinte, schiariture o decolorazioni… phon, spazzola e piastra… fragili, e spezzarsi" | Gocce di colore → clip strumenti → clip capello che si spezza | chip, 3D "FRAGILI", shake |
| Somma | "Quindi, questo autunno si sommano più cause…" | Crema | 3 card che cadono + "= PIÙ CADUTA" |
| Consigli | "Ti do qualche consiglio…" | Bosco + capsule 3D, poi clip shampoo / scudo termico / integratori | 3D "CONSIGLIO", card 1-2-3 |
| Invito | "Ma il vero consiglio… parlarne con noi. Valuteremo…" | Logo 3D, poi clip ragazza con capelli sani | "con noi", 3D "VIGORE", "e forza" |
| Chiusura | "Ti aspettiamo!" | Logo 3D + wordmark | "ti aspettiamo nella nostra farmacia", Via Aceronia 1 · Brienza, Tel. 0975 381021, nota "oltre 3 mesi o diradamento? Parliamone insieme." |

## Pipeline
`bash pastore/render.sh` → voice.py → shots.py → prep_ai.py → Remotion → sfx.py → mix (con voce + sfx, e solo voce).
Task Runway (immagini e clip) in `runway_tasks.json`.
