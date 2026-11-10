# Longevitas Dermatologia — spot motion graphics 20s

Racconta la landing Dermatologia in 20s, 16:9 + 9:16, 60fps → motion blur → 30fps. Palette e font della landing (navy, oro, azzurro · Playfair Display + Inter).

| s | scena | transizione |
|---|---|---|
| 0–2.5 | Hook "La tua pelle non è standard●": il punto esplode e riempie lo schermo | — |
| 2.5–4.5 | "Il controllo nemmeno." + anello da dermatoscopio | iris |
| 4.5–7 | Dott.ssa Ana Júlia Campos: foto + cornice oro sfalsata | iris dalla lente |
| 7–9 | Numeri Longevitas (contatori) | lamelle verticali |
| 9–11.5 | Servizi: lista rotante + icone che si disegnano | taglio diagonale |
| 11.5–15.5 | ABCDE: il neo si trasforma dentro la lente | iris sul neo |
| 15.5–17 | La visita in 3 passi | lamelle orizzontali |
| 17–20 | CTA: la landing scorre nel telefono, click su "Prenota la visita" | taglio diagonale |

Asset in `public/` estratti dal PDF della landing (foto e screenshot completo): per la consegna finale sostituire `doc.jpg` con l'originale in alta risoluzione.

```bash
bash dermatologia/render.sh            # entrambi i formati -> out/longevitas_dermatologia_16x9.mp4 / _9x16.mp4
bash dermatologia/sheet.sh DermaV      # contact sheet di controllo
```
