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
