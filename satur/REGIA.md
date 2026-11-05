# REGIA — Reel Saturimetria notturna (versione economica, senza clip AI) · Farmacia Famiglia Pastore (Brienza)

Formato 1080x1920 · 30fps · ~81s · tutte le scene in 3D/motion graphics fatti in codice (Three.js + Remotion), nessuna clip Runway · stessa voce femminile (modello TTS più economico, stesso timbro) · sottotitoli parola per parola · musica originale senza campanelli · sfx senza campanelli (la sveglia ronza).
Copione della scheda reel invariato ("è sì" corretto). Nessun valore numerico sul saturimetro né sul grafico. Chiusura con logo, niente disclaimer.

| # | Voce | Scena |
|---|---|---|
| 1 | Ti faccio qualche domanda… | Notte stellata con luna, "?" 3D |
| | Durante la notte russi? | Letto 3D con persona che dorme, coperta che respira, Z che salgono |
| | Ti svegli già stanco? | Sveglia 3D che trema |
| | …sonnolenza e stanchezza? | Batteria che si scarica |
| 2 | Se la risposta è sì… | 3 domande che si spuntano, "non sottovalutarli" |
| | …disturbi respiratori durante la notte | Polmoni stilizzati che respirano |
| | Hai mai sentito parlare di apnea notturna? | 3D "APNEA" |
| 3 | Quando il respiro si interrompe più volte… | Linea del respiro che si ferma (PAUSA) 3 volte, letto 3D che si blocca |
| | …ossigeno diminuisce, anidride carbonica aumenta | Flusso sanguigno 3D con bolle di O₂ che calano, barre O₂ ↓ CO₂ ↑ |
| | …mette a rischio la tua salute | Cuore 3D che batte e si arrossa |
| 4 | Ma come puoi sapere…? Saturimetria notturna | "?" 3D → saturimetro 3D sul dito |
| 5 | Si effettua mentre dormi… sensore al dito… registra saturazione e frequenza cardiaca | Saturimetro di notte con Z, grafico della notte 22:00–06:00 senza valori |
| 6 | I dati ci aiutano… variazioni sospette… approfondire | Lente sul calo della curva |
| 7 | Quindi, se russi… vieni a parlarne con noi… Ti aspettiamo! | Riepilogo segnali → logo 3D, "con noi" |
| Chiusura | — | Logo, "saturimetria notturna · dormi bene, respira meglio", indirizzo, tel |

Pipeline: `bash satur/render.sh` (voice → shots → Remotion a blocchi → sfx → mix con musica e senza).
