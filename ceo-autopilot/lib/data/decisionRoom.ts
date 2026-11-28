import { addDays } from 'date-fns';
import { euro } from '@/lib/format';
import { detectUrgentHelp } from '@/lib/rules/urgentHelp';
import { decisions } from '@/mocks/decisions';
import { NOW } from '@/mocks/time';
import type { DecisionOption, SourceRef } from '@/types/domain';
import { getWorld, type Scenario } from './world';

export interface DecisionAnswer {
  urgentHelp: boolean;
  question: string;
  context: { text: string; source: SourceRef }[];
  options: DecisionOption[];
  missingInfo: string[];
  nextCheck: string;
  reviewAt: string;
}

const GENERIC: DecisionOption[] = [
  { label: 'Procedere adesso', pros: ['Chiudi il tema e liberi attenzione'], cons: ['Decidi con le informazioni che hai oggi'], risks: ['Se mancano dati importanti potresti dover tornare indietro'] },
  { label: 'Fare una prova limitata', pros: ['Impari spendendo poco', 'Resta reversibile'], cons: ['Tempi più lunghi'], risks: ['La prova potrebbe non essere rappresentativa'] },
  { label: 'Rimandare a una data precisa', pros: ['Raccogli le informazioni mancanti'], cons: ['Il problema resta aperto'], risks: ['Rimandare senza data equivale a non decidere'] },
];

const HIRING: DecisionOption[] = [
  { label: 'Assumere a tempo indeterminato', pros: ['Presidio stabile', 'Competenza che resta in azienda'], cons: ['Costo fisso in più'], risks: ['Inserimento di 3–4 mesi prima di vedere risultati'] },
  { label: 'Partire con un contratto a termine o un consulente', pros: ['Costo variabile', 'Verifichi il bisogno reale'], cons: ['Meno continuità'], risks: ['Le persone migliori cercano stabilità'] },
  { label: 'Riorganizzare con le persone attuali', pros: ['Nessun costo aggiuntivo'], cons: ['Carico in più su chi è già pieno'], risks: ['Sposti il collo di bottiglia senza toglierlo'] },
];

const PRICING: DecisionOption[] = [
  { label: 'Aumentare i prezzi dal primo gennaio', pros: ['Recuperi margine sui costi cresciuti'], cons: ['Trattativa con i clienti principali'], risks: ['Un cliente concentrato può spostare volumi'] },
  { label: 'Aumento differenziato per cliente', pros: ['Proteggi i clienti strategici'], cons: ['Più complesso da gestire'], risks: ['I clienti si parlano tra loro'] },
  { label: 'Tenere i prezzi e ridurre i costi', pros: ['Nessun attrito commerciale'], cons: ['Margine sotto pressione'], risks: ['I risparmi potrebbero non bastare'] },
];

/**
 * Risposta strutturata della Decision Room. Nel prototipo è una risposta simulata scelta per parole chiave;
 * il contesto invece viene dai dati reali dello scenario, con le fonti.
 */
// TODO backend: POST /api/decision-room/ask { question }
export async function askDecisionRoom(sc: Scenario, question: string): Promise<DecisionAnswer> {
  await new Promise((r) => setTimeout(r, 900));
  const w = getWorld(sc);
  const q = question.toLowerCase();
  const context: DecisionAnswer['context'] = [];
  if (w.bank.status === 'ok') context.push({ text: `Saldo totale dei conti: ${euro(w.bank.data.total)}.`, source: w.src(w.bank.data.accounts[0].id, 'acct:all') });
  if (w.cashflow.status === 'ok') {
    const min = Math.min(...w.cashflow.data.map((x) => x.closingPrudent));
    context.push({ text: `Nelle prossime 13 settimane lo scenario prudente tocca un minimo di ${euro(min)} (riserva: ${euro(sc.reserve)}).`, source: w.src('bank_intesa', 'cf:13w') });
  }
  if (w.invoices.status === 'ok') {
    const overdue = w.invoices.data.filter((i) => i.type === 'issued' && (i.daysOverdue ?? 0) > 0).reduce((a, i) => a + i.amount - i.paid, 0);
    context.push({ text: `Crediti scaduti da incassare: ${euro(overdue)}.`, source: w.src('sdi', 'recv:overdue') });
  }

  let options = GENERIC;
  let missingInfo = ['Quanto costa non decidere per un altro mese?', 'Chi in azienda deve essere d’accordo perché funzioni?', 'Qual è il segnale che ti farebbe cambiare idea?'];
  if (/macchin|centro di lavoro|investiment|compro|acquist/.test(q)) {
    options = decisions[0].options;
    missingInfo = decisions[0].missingInfo;
    if (w.grants.status === 'ok') context.push({ text: 'C’è un bando regionale compatibile (stima 86/100) per macchinari connessi.', source: w.src('grants', 'grant:grant-1') });
  } else if (/assum|assunzion|persona|responsabile|dipendent/.test(q)) {
    options = HIRING;
    missingInfo = ['Costo aziendale annuo completo', 'Quali attività passerebbero alla nuova persona', 'Tempi realistici di selezione'];
  } else if (/prezz|listin|aument|sconto|margin/.test(q)) {
    options = PRICING;
    missingInfo = ['Margine attuale per cliente', 'Scadenze dei contratti quadro', 'Prezzi dei concorrenti sugli stessi particolari'];
  }

  return {
    urgentHelp: detectUrgentHelp(question),
    question,
    context,
    options,
    missingInfo,
    nextCheck: 'Rivedi l’esito tra 60 giorni: bastano 5 minuti per scrivere com’è andata.',
    reviewAt: addDays(NOW, 60).toISOString(),
  };
}
