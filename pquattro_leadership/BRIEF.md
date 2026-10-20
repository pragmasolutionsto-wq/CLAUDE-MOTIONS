# Pquattro — Reel Leadership 1

Reel verticale 1080×1920, 30fps, 83,6s → `pquattro_reel_leadership_1.mp4`.
Talking head (10 clip Drive) montato con jump cut, grafiche brand nella fascia sopra la testa,
sottotitoli parola per parola sotto il mento, copertina dell'evento "Da Titolare di farmacia a Leader che ispira", chiusura logo.

## Pipeline
```bash
pquattro_leadership/scripts/clips.sh   # src/c1..c10.mp4 -> public/v (1080x1920 30fps; le 480p con denoise+lanczos)
pquattro_leadership/render.sh          # edl -> audio -> Remotion 60fps -> motion blur -> 30fps + grana -> mux
pquattro_leadership/stills.sh 12.3 40  # provini con ingombro del viso (debug)
```
Sorgenti non in git (`src/`): c1..c10.mp4 (+ .wav mono 48k), music.mp3 ("Inspiring Moment" short 2), logo.webp.

- `scripts/edl.py`: tagli da SRT (TurboScribe) + VAD. Pause interne > 0,42s ridotte a 0,24s; pause drammatiche
  volute dopo "Chi di voi vuole lavorare in farmacia?" e altre frasi chiave (dizionario BEAT).
- `scripts/audio.py`: voce livellata per clip, EQ/de-esser/compressore. Musica 100 BPM riarrangiata a battute
  (parte dalla battuta 3, frase 4-7 ripetuta 7 volte, accordo finale = comparsa logo). Ducking: musica 14 dB sotto
  la voce, +5,5 dB nelle pause, più presente sulla copertina, piena sul logo. Master -14 LUFS / -1,5 dBTP.
- Zone: viso tra y≈560 e y≈1350 (OpenCV); grafiche y 230–585, sottotitoli da y 1372. Mai sul viso.

## Brand
Magenta `#B42583`, turchese `#60AEB4`, navy copertina `#0F2B48`. Playfair Display (titoli, come la copertina) + Montserrat.
Logo scomposto in livelli (`public/logo/`): monogramma PQ con apertura a iride dalla lente, lettere UATTRO a cascata, payoff.
