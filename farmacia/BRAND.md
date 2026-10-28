# Farmacia Africa Orientale — bibbia video

Fonte: Drive "FARMACIA AFRICA ORIENTALE" (strategia Pquattro set 2025, PED master 2026, PED operativi mensili, PED realizzati set–nov 2026).

## Chi è
- Brindisi, Corso Garibaldi 49, dal 1909. Tel 0831 597926 · WhatsApp 328 8373357.
- Team: titolari sorelle Olga e Francesca Palamà (farmaciste), Gennaro (farmacista), Sabina (dermocosmesi/integratori), Rosa (magazzino).
- Obiettivo PED: traffico in farmacia + fatturato ricetta, senza perdere commerciale e dermocosmesi.
- Brand da spingere: Goovi (esclusiva a Brindisi), Dolomia, Farmacisti Preparatori (Unifarco), Caudalie, Bioderma, Salugea.
- Competitor diretto: Cannalire (più medico/istituzionale, forte su dermocosmesi premium). Noi: più caldi e vicini.

## Posizionamento e firme
- Claim: "La farmacia di fiducia nel cuore di Brindisi, tra salute, benessere e bellezza."
- Payoff (chiusura video): **"Dal 1909, nel cuore di Brindisi."**
- Archetipi: Caregiver + Saggio, tocco di Innocente → caldo, chiaro, semplice, positivo.
- Tono: frasi brevi, una idea per contenuto, apertura con domanda o dato. Parole: cura, benessere, insieme, siamo qui per te. Verbi: controlla, prenota, prova, chiedi, scopri.
- Vietato: tecnicismi che spaventano, "il cliente/l'utente", toni commerciali aggressivi ("compra ora", "affrettati"). Claim cosmetici solo come da scheda produttore, con asterisco "*Dato dichiarato dal produttore".

## Rubriche (PED master)
Consiglio del farmacista · Bellezza consapevole · Te lo spieghiamo noi (ricette, esenzioni, FSE) · Promozioni e opportunità · Vita della farmacia.
Volume mensile: 4 reel + 4 caroselli + ~20 storie + 2 post Google Profile. Volantino mensile (carosello, card 1 sempre foto farmacista; link al sito).

## Stile visivo (dai PED realizzati)
- Foto reali dello staff in camice dentro la farmacia (scaffali bianchi luminosi sfocati) come base. Volti veri > stock.
- Titoli: condensato heavy MAIUSCOLO (Anton), teal scuro su chiaro; parole chiave dentro box arrotondati (menta con testo teal, oppure teal con testo bianco).
- Testi secondari: sans geometrico semibold (Montserrat).
- Icone 3D morbide verde menta (calendario, cuore in mano, manometro).
- Onde/swoosh menta e teal ai bordi. Pill CTA teal scuro "Scorri →". Logo sempre in basso a destra.
- Eccezione Black Friday ("Black Days"): viola/prugna + oro, stesso layout.

Palette (campionata da logo e card pubblicate):
| ruolo | hex |
|---|---|
| teal scritte / box scuri | #015E56 · #005453 |
| teal profondo (ombre, fondi scuri) | #013F41 |
| verde coppa | #186850 |
| menta (serpente, accenti, box chiari) | #5CC0A8 |
| salvia ("FARMACIA", fondi tenui) | #B8D0C8 · #D8E2DD |
| fondo chiaro | #ECEBEB / bianco |

## Due tipi di video
1. **Reel farmacista (girato)**: selfie verticale, una persona, inquadratura fissa, letto da "scheda di registrazione" (testo in docx = trascrizione di riferimento). Arriva compresso (es. 478×850, 30fps) → serve upscale e pulizia. Montaggio: tagli pause/errori, hook titolato nei primi 2s, sottotitoli parola-per-parola in stile brand, keyword evidenziate nei box, inserti prodotto/icone, end card logo + payoff. Schema prodotti: a cosa serve → perché (ingredienti) → vantaggio → come si usa → CTA "vieni a parlarne con noi".
2. **Reel animato**: senza voce, tutto a sovrimpressione, 9:16, 25–45s, scene 4–5s, 8–13 parole a scena (promo 6s). Chiusura: "In esclusiva da noi a Brindisi" / logo + payoff. Precedenti: Vitamina C, Goovi Splash Me Baby (ott 2026).

## Specifiche tecniche
- Output 1080×1920, 30fps, h264 CRF ~18, AAC. Safe area IG: testi tra y 250 e 1500, margini 80px.
- Asset: `public/logo.png`, `public/mark.png`, foto staff in Drive `2026/foto`.
- Limite: download Drive via connettore max 10 MB/file → i girati grandi vanno caricati in altro modo (vedi README chat).

## Pipeline Runway (standard per tutti i video, come gli altri clienti farmacia)
- **Voce**: `generate_speech`, modello `eleven_v4`, voce libreria **Andromeda – Expressive, Natural** (voiceId `Vij3nOd1u0L4xCy5U9Ws`), `languageCode: it`, `speed 1.05`, `stability 0.5`. Una traccia per scena (con previousText/nextText). In montaggio: silenzi tagliati + `atempo 1.08`.
- **Personaggi 3D**: `generate_image` nano-banana-pro 9:16 con reference taggate (`@signora`, `@farmacista`), stile "3D animated feature-film", palette teal #015E56 + menta #5CC0A8, soggetto nei 2/3 alti, terzo basso libero per i testi, "no text".
  - riferimenti metformina: signora task `29300267-feb3-4487-875e-9c3b7bc59f8e`, farmacista task `7fcec3e0-f6ba-469a-a219-1c8c1e80efb6`.
- **Animazione**: `generate_video` seedance-2-mini 720p 9:16, prompt "Smooth natural 3D character animation with fluid, lifelike body motion… soft easing… slow smooth camera push-in". **Costo reale: ~90 crediti per clip da 6 s** (con o senza audio). Con budget stretto: clip solo sulle scene chiave, le altre keyframe con movimento camera in Remotion.
- **Musica**: `generate_music` lyria-3-pro (8 crediti), strumentale caldo 96 BPM, "keep the mix light so a spoken voice stays clear".
- **Montaggio**: Remotion (`farmacia/kit.tsx` + grafica card), voce+musica con ducking (`build_audio.py`), loudness finale -14 LUFS.
- Costo indicativo reel 11 scene: 11 immagini (~220) + 3 clip (~270) + voce (~12) + musica (8) ≈ 510 crediti. Tutto animato: +~720.
