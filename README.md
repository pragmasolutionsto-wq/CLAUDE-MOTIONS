# Longevitas — motion graphics per TV sala d'attesa

Video 1920×1080, 30fps, 60s, pensato per andare in loop (primo e ultimo frame coincidono). Remotion + musica sintetizzata.

Palette brand: blu #112250, avorio #EDE8DF, bianco #FFFFFF, blu notte #0D1B2A, champagne #C9B99A.

La timeline (durate e transizioni) sta in `src/timeline.json`: la musica si risincronizza da sola sui tagli.

```bash
npm install
npm run music     # rigenera public/music.wav dalla timeline
npm run studio    # anteprima
npx remotion render src/index.ts Longevitas out/longevitas_loop.mp4
```
In ambienti senza Chrome di Remotion: `--browser-executable=/path/to/headless_shell`.

## Farmacia Dott.ssa Monaco Carla — reel Unika (`farmacia/`)

Reel 1080×1920, 30fps, ~63s: talking head tagliato sulle pause, punch-in, grafiche a tempo sul parlato, 3 inserti 3D (collagene, 192 LED, offerta 5 trattamenti) e chiusura con logo 3D. Spazio centrale libero per i sottotitoli.

Tagli e cue (parola → secondo nella clip sorgente) stanno in `farmacia/timeline.json`: grafiche, musica ed effetti si risincronizzano da soli.

```bash
# clip originali in farmacia/public/raw/clip1..7.mp4 (non versionate)
bash farmacia/render.sh   # -> out/farmacia_unika_reel.mp4 + out/farmacia_unika_reel_senza_musica.mp4
```
