---
name: skill-advisor
description: Consiglia le skill giuste per il task in corso. Usa quando l'utente dice "che skill mi servono", "esiste una skill per...", "consigliami una skill", "cosa posso usare per...", descrive un lavoro ricorrente (ADV, SEO, Wix, Make, copy, LinkedIn, report) e potrebbe beneficiare di una skill, oppure chiede di cercare/installare skill.
---

# Skill Advisor

Obiettivo: dire a Meme quali skill usare (o installare) per il task, senza giri.

## Flusso

1. Capisci il task reale in una riga. Se è ambiguo, chiedi UNA domanda, poi procedi.
2. Estrai 3-6 keyword dal task (es. "meta ads", "carousel", "report", "wix", "seo").
3. Controlla cosa c'è già:
   - Skill disponibili in sessione (elenco nel system reminder) e `.claude/skills/` nel repo.
   - `ListSkills` per quelle abilitate sull'account.
4. Se niente copre il task:
   - `SearchSkills` con le keyword.
   - `SuggestSkills` (trigger `user_asked`) per mostrare la card di quelle installabili.
5. Se ancora niente e il task è ricorrente: proponi di crearla con `anthropic-skills:skill-creator`.

## Output (breve)

- Usa già: skill che hai e che coprono il task, con quando lanciarla.
- Installa: skill trovate da installare, con perché.
- Crea: se manca, una riga su cosa dovrebbe fare.
- Se nessuna serve, dillo. Non inventare skill per riempire la lista.

## Regole

- Max 3 consigli, ordinati per impatto sul risultato.
- Niente skill "carine ma inutili". Se un task si fa meglio senza skill, dillo.
- Non installare né creare nulla senza un sì esplicito.
- Mai citare una skill che non compare nei risultati dei tool.
