import { differenceInCalendarDays } from 'date-fns';
import type { BankAccount, BankTransaction, CashflowItem } from '@/types/domain';
import { seeded } from '@/lib/utils';
import { invoices } from './invoices';
import { TODAY, at, day } from './time';

const rnd = seeded(77);

export const accounts: BankAccount[] = [
  {
    id: 'bank_intesa',
    bank: 'Intesa Sanpaolo',
    name: 'Conto principale',
    ibanMasked: 'IT•• •••• •••• •••• •••• ••41 872',
    balance: 184_300,
  },
  {
    id: 'bank_bper',
    bank: 'BPER',
    name: 'Conto secondario',
    ibanMasked: 'IT•• •••• •••• •••• •••• ••09 316',
    balance: 41_250,
    creditLine: 250_000,
    creditUsed: 0,
  },
];

// Uscite ricorrenti che non passano da fattura elettronica.
export const RECURRING = {
  salaries: 98_400, // netto stipendi, il 27 del mese
  thirteenth: 91_600, // tredicesime, insieme agli stipendi di dicembre
  f24: 46_200, // ritenute e contributi, il 16 del mese
  vatAdvance: 38_500, // acconto IVA, 27 dicembre
  leasing: 12_400, // canone centro di lavoro, il 5 del mese
};

function buildTransactions(): BankTransaction[] {
  const tx: BankTransaction[] = [];
  let n = 0;
  const push = (
    dateOffset: number,
    description: string,
    amount: number,
    category: BankTransaction['category'],
    accountId: BankAccount['id'] = 'bank_intesa',
    invoiceId?: string,
  ) => {
    if (dateOffset > -1 || dateOffset < -90) return;
    tx.push({
      id: `tx-${++n}`,
      accountId,
      date: at(dateOffset, `${String(8 + Math.floor(rnd() * 9)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`),
      description,
      amount,
      category,
      invoiceId,
    });
  };

  for (const inv of invoices) {
    if (!inv.paidDate || inv.paid <= 0) continue;
    const offset = differenceInCalendarDays(new Date(inv.paidDate), TODAY);
    // Due incassi recenti restano "da abbinare": servono a mostrare la riconciliazione.
    const unmatched = inv.type === 'issued' && offset > -9 && rnd() < 0.5;
    if (inv.type === 'issued') {
      push(
        offset,
        `Bonifico da ${inv.counterparty.toUpperCase()}${unmatched ? '' : ` · fatt. ${inv.number}`}`,
        inv.paid,
        'incasso',
        rnd() < 0.8 ? 'bank_intesa' : 'bank_bper',
        unmatched ? undefined : inv.id,
      );
    } else {
      push(offset, `Bonifico a ${inv.counterparty.toUpperCase()} · fatt. ${inv.number}`, -inv.paid, 'fornitore', 'bank_intesa', inv.id);
    }
  }

  // Ricorrenti degli ultimi tre mesi.
  for (const monthsBack of [0, 1, 2, 3]) {
    const base = new Date(TODAY.getFullYear(), TODAY.getMonth() - monthsBack, 1);
    const off = (dom: number) =>
      differenceInCalendarDays(new Date(base.getFullYear(), base.getMonth(), dom), TODAY);
    push(off(27), 'Stipendi dipendenti · distinta', -RECURRING.salaries, 'stipendi');
    push(off(16), 'Delega F24 · ritenute e contributi', -RECURRING.f24, 'imposte');
    push(off(5), 'Canone leasing centro di lavoro', -RECURRING.leasing, 'leasing', 'bank_bper');
    push(off(28), 'Commissioni e spese conto', -84.5, 'spese');
    push(off(12), 'Carta aziendale · saldo mensile', -(2100 + Math.round(rnd() * 1400)), 'spese', 'bank_bper');
  }
  push(-3, 'Bonifico da PNEUMATICA DORA SRL', 7320, 'incasso');
  push(-6, 'Bonifico da M. FERRERO UTENSILI', 1840, 'altro', 'bank_bper');

  return tx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const transactions: BankTransaction[] = buildTransactions();

// Voci di previsione non legate a fatture già emesse/ricevute, per settimana (0 = settimana corrente).
// Sono stime e in UI sono marcate come tali.
export function scheduledItems(weekIndex: number, weekStart: Date): CashflowItem[] {
  const items: CashflowItem[] = [];
  const inWeek = (d: Date) => {
    const diff = differenceInCalendarDays(d, weekStart);
    return diff >= 0 && diff < 7;
  };
  for (let m = 0; m < 5; m++) {
    const y = TODAY.getFullYear();
    const mo = TODAY.getMonth() + m;
    const isDecember = new Date(y, mo, 1).getMonth() === 11;
    // A dicembre stipendi e tredicesime partono prima di Natale.
    const payDay = new Date(y, mo, isDecember ? 22 : 27);
    if (inWeek(payDay)) {
      items.push({ label: 'Stipendi', amount: RECURRING.salaries, kind: 'out' });
      if (isDecember) items.push({ label: 'Tredicesime', amount: RECURRING.thirteenth, kind: 'out' });
    }
    if (inWeek(new Date(y, mo, 16)))
      items.push({ label: 'F24 · ritenute e contributi', amount: RECURRING.f24, kind: 'out' });
    if (inWeek(new Date(y, mo, 5)))
      items.push({ label: 'Canone leasing', amount: RECURRING.leasing, kind: 'out' });
    if (isDecember && inWeek(new Date(y, mo, 27)))
      items.push({ label: 'Acconto IVA', amount: RECURRING.vatAdvance, kind: 'out' });
  }
  // Oltre l'orizzonte delle fatture già in mano, stime da ordini e acquisti ricorrenti.
  const estIn = [0, 0, 0, 0, 20_000, 60_000, 95_000, 120_000, 135_000, 165_000, 165_000, 165_000, 165_000];
  const estOut = [0, 0, 0, 12_000, 30_000, 45_000, 60_000, 70_000, 78_000, 82_000, 85_000, 85_000, 85_000];
  if (estIn[weekIndex])
    items.push({ label: 'Incassi stimati da ordini in portafoglio', amount: estIn[weekIndex], kind: 'in', estimated: true });
  if (estOut[weekIndex])
    items.push({ label: 'Acquisti stimati', amount: estOut[weekIndex], kind: 'out', estimated: true });
  return items;
}

export const lastBankSync = { bank_intesa: at(0, '07:12'), bank_bper: at(0, '07:10') };
export { day };
