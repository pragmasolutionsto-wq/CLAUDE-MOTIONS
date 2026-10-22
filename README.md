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

---

# Farmacia Monaco — Telecardiologia in convenzione con ASL

Video verticale 1080×1920, 30fps, con voce narrante italiana. Sorgenti in `monaco/`.

- La durata la decide la voce: `monaco/scripts/voice.py` genera `monaco/public/voice.wav` (Kokoro TTS offline, voce femminile `if_sara`, velocità 0.8), la timeline delle scene (`monaco/timeline.json`) e il copione con i tempi (`monaco/voiceover.txt`).
- Logo: `monaco/public/logo.png` (si sostituisce il file, nient'altro).

```bash
pip install kokoro-onnx soundfile
# modelli: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 (kokoro-v1.0.onnx, voices-v1.0.bin)
monaco/scripts/render.sh /percorso/modelli out/farmacia_monaco_telecardiologia.mp4
npx remotion studio monaco/index.ts --public-dir=monaco/public   # anteprima
```
