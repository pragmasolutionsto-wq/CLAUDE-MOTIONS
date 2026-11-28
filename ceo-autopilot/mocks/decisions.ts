import type { Decision } from '@/types/domain';
import { at } from './time';

// Registro della Decision Room: una decisione per ogni stato possibile.
export const decisions: Decision[] = [
  {
    id: 'dec-1',
    question: 'Compro il centro di lavoro a 5 assi da € 420.000 adesso o aspetto il bando regionale?',
    createdAt: at(-5, '18:10'),
    options: [
      {
        label: 'Firmare l’ordine entro venerdì',
        pros: ['Sconto 6% riservato fino al 4 dicembre', 'Consegna a marzo, in tempo per i volumi Alpi Robotics'],
        cons: ['Anticipo del 20% a dicembre, mese già stretto di liquidità'],
        risks: ['Se il bando richiede ordini successivi alla domanda, perdi il contributo'],
      },
      {
        label: 'Aspettare l’apertura del bando',
        pros: ['Contributo possibile dal 20% al 30%'],
        cons: ['Perdi lo sconto del fornitore', 'Consegna che slitta a giugno'],
        risks: ['Il bando potrebbe non essere finanziato o non ammetterti'],
      },
      {
        label: 'Leasing con riscatto',
        pros: ['Nessun anticipo pesante', 'Canone deducibile'],
        cons: ['Costo complessivo più alto'],
        risks: ['Aumenta gli impegni fissi mensili'],
      },
    ],
    missingInfo: [
      'Il bando ammette ordini firmati prima della domanda?',
      'Condizioni del leasing dalla banca',
      'Conferma scritta dei volumi 2027 di Alpi Robotics',
    ],
  },
  {
    id: 'dec-2',
    question: 'Assumo un responsabile qualità o continuo con il consulente esterno?',
    createdAt: at(-24, '08:40'),
    options: [
      { label: 'Assumere', pros: ['Presidio quotidiano', 'Richiesto da due clienti'], cons: ['Costo fisso di circa € 55.000 l’anno'], risks: ['Tempi di inserimento di 3–4 mesi'] },
      { label: 'Tenere il consulente', pros: ['Costo variabile'], cons: ['Presenza di due giorni al mese'], risks: ['Gli audit dei clienti lo segnalano come punto debole'] },
    ],
    missingInfo: [],
    chosen: 'Assumere',
    rationale: 'Due clienti su quattro lo chiedono negli audit. Il costo si ripaga se riduco gli scarti di un punto.',
    reviewAt: at(66),
    readinessAtDecision: 71,
  },
  {
    id: 'dec-3',
    question: 'Accetto la commessa Motori Monviso con margine ridotto per saturare il reparto?',
    createdAt: at(-71, '17:30'),
    options: [
      { label: 'Accettare', pros: ['Satura il reparto fresatura fino a febbraio'], cons: ['Margine al 9% contro il 16% medio'], risks: ['Toglie capacità a commesse più ricche'] },
      { label: 'Rifiutare', pros: ['Tieni libera la capacità'], cons: ['Reparto scarico per sei settimane'], risks: ['Il cliente non torna'] },
    ],
    missingInfo: [],
    chosen: 'Accettare',
    rationale: 'Meglio un margine basso che le macchine ferme. Rivedo dopo la prima consegna.',
    reviewAt: at(-6),
    readinessAtDecision: 68,
  },
  {
    id: 'dec-4',
    question: 'Passo dal contratto energia a prezzo variabile a quello fisso per 12 mesi?',
    createdAt: at(-140, '09:15'),
    options: [
      { label: 'Prezzo fisso 12 mesi', pros: ['Costo prevedibile nel budget'], cons: ['Circa 4% sopra il variabile di allora'], risks: ['Se i prezzi scendono paghi di più'] },
      { label: 'Restare sul variabile', pros: ['Segui il mercato'], cons: ['Budget incerto'], risks: ['Picchi invernali'] },
    ],
    missingInfo: [],
    chosen: 'Prezzo fisso 12 mesi',
    rationale: 'Mi serve un budget stabile per trattare i listini 2027.',
    reviewAt: at(-20),
    outcome: 'Scelta confermata: nei quattro mesi il fisso è costato € 3.100 in meno del variabile.',
    readinessAtDecision: null,
  },
];
