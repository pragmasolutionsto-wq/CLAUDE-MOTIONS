# CEO AUTOPILOT by Longevitas — prototipo di interfaccia

Prototipo navigabile con dati simulati (Meccanica Ferraris S.r.l., azienda di fantasia).
Nessun backend: i dati arrivano da `lib/data/` che oggi legge i mock in `mocks/` e domani chiamerà le API reali.

## Comandi

```bash
npm install
npm run dev      # sviluppo su http://localhost:3000
npm run check    # lint + test + build
npm run build    # esporta il sito statico in out/
```

## Pannello demo

Apri qualsiasi pagina con `?demo=1` (oppure Ctrl+Shift+D) per cambiare al volo piano, utente,
giornata, connettori e baseline salute.

## Dove sta cosa

- `config/` prezzi, soglie delle regole, testi sensibili, data fissa del prototipo
- `lib/rules/` logica deterministica (priorità, liquidità, incassi, recupero, incrocio salute-lavoro HW1–HW7) con test
- `lib/data/` livello dati: ogni funzione ha il commento con la futura API reale
- `mocks/` dati simulati coerenti tra loro
- `components/` e `app/` interfaccia

La data del prototipo è fissa a martedì 1 dicembre 2026 (`config/demo.ts`).
