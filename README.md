# Longevitas — video motion graphics

Video di presentazione (1920×1080, 30fps, ~99s) di [longevitas.it](https://www.longevitas.it), clinica di medicina di precisione e longevità a Rivoli (TO). Fatto con Remotion.

## Scene
00 Intro logo · Hero "Medicina della longevità a Torino" · 01 Chi siamo · 02 Metodo MitoGen11 · 03 50 biomarcatori + App · 04 Tecnologie (12 trattamenti) · 05 Focus IHHT · 06 Medical Labs (Beauty Lab, Sport Lab, Pelvic+) · 07 A Casa Tua · 08 Il percorso · 09 Masterclass & rete partner · Outro contatti

## Comandi
```bash
npm install
npm run music     # rigenera la colonna sonora (numpy)
npm run studio    # anteprima
npx remotion render src/index.ts Longevitas out/longevitas.mp4
```
In ambienti senza Chrome di Remotion: `--browser-executable=/path/to/headless_shell`.
