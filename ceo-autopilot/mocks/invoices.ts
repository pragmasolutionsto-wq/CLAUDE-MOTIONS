import { addDays, differenceInCalendarDays } from 'date-fns';
import type { Invoice } from '@/types/domain';
import { seeded } from '@/lib/utils';
import { CUSTOMERS, SUPPLIERS } from './company';
import { TODAY, day } from './time';

// 120 fatture (72 emesse, 48 ricevute) sugli ultimi 120 giorni.
// Gli scaduti sono scritti a mano, il resto è generato in modo deterministico.

const rnd = seeded(20261201);
const VAT = 0.22;
const round50 = (n: number) => Math.round(n / 50) * 50;

function make(
  id: string,
  type: Invoice['type'],
  counterparty: string,
  number: string,
  issue: Date,
  termDays: number,
  amount: number,
  paid: number,
  paidDate?: Date,
): Invoice {
  const due = addDays(issue, termDays);
  const residual = amount - paid;
  const overdueDays = differenceInCalendarDays(TODAY, due);
  let status: Invoice['status'] = 'open';
  if (residual <= 0) status = 'paid';
  else if (overdueDays > 0) status = paid > 0 ? 'partial' : 'overdue';
  else if (paid > 0) status = 'partial';
  return {
    id,
    type,
    counterparty,
    number,
    issueDate: issue.toISOString(),
    dueDate: due.toISOString(),
    amount,
    vat: Math.round((amount / (1 + VAT)) * VAT),
    paid,
    paidDate: paidDate?.toISOString(),
    status,
    daysOverdue: residual > 0 && overdueDays > 0 ? overdueDays : undefined,
  };
}

interface Profile {
  name: string;
  count: number;
  avg: number;
  term: number;
  maxDelay: number; // giorni di ritardo abituale sul pagamento
}

const customerProfiles: Profile[] = [
  { name: CUSTOMERS.tecnoauto, count: 11, avg: 62000, term: 60, maxDelay: 22 },
  { name: CUSTOMERS.alpi, count: 13, avg: 52000, term: 60, maxDelay: 5 },
  { name: CUSTOMERS.idraulica, count: 11, avg: 36000, term: 30, maxDelay: 9 },
  { name: CUSTOMERS.freni, count: 10, avg: 30000, term: 60, maxDelay: 16 },
  { name: CUSTOMERS.valsusa, count: 5, avg: 14000, term: 30, maxDelay: 12 },
  { name: CUSTOMERS.stampi, count: 6, avg: 17000, term: 30, maxDelay: 4 },
  { name: CUSTOMERS.motori, count: 5, avg: 15000, term: 30, maxDelay: 6 },
  { name: CUSTOMERS.dora, count: 5, avg: 12000, term: 30, maxDelay: 3 },
];

const supplierProfiles: Profile[] = [
  { name: SUPPLIERS.acciai, count: 12, avg: 54000, term: 60, maxDelay: 0 },
  { name: SUPPLIERS.trattamenti, count: 8, avg: 16000, term: 30, maxDelay: 0 },
  { name: SUPPLIERS.utensili, count: 8, avg: 9500, term: 30, maxDelay: 0 },
  { name: SUPPLIERS.energia, count: 4, avg: 23500, term: 20, maxDelay: 0 },
  { name: SUPPLIERS.trasporti, count: 8, avg: 6200, term: 30, maxDelay: 0 },
  { name: SUPPLIERS.lubrificanti, count: 4, avg: 3400, term: 30, maxDelay: 0 },
  { name: SUPPLIERS.studio, count: 4, avg: 2440, term: 15, maxDelay: 0 },
];

function generate(type: Invoice['type'], profiles: Profile[], prefix: string): Invoice[] {
  const out: Invoice[] = [];
  let seq = type === 'issued' ? 412 : 1;
  for (const p of profiles) {
    for (let i = 0; i < p.count; i++) {
      // Emissioni distribuite sugli ultimi 120 giorni.
      const issueOffset = -Math.round(4 + ((i + rnd()) / p.count) * 114);
      const issue = day(issueOffset);
      const amount = round50(p.avg * (0.7 + rnd() * 0.6));
      const due = addDays(issue, p.term);
      const dueIn = differenceInCalendarDays(due, TODAY);
      let paid = 0;
      let paidDate: Date | undefined;
      if (dueIn < 0) {
        // Scadute nel passato: pagate, con il ritardo abituale della controparte.
        const delay = Math.min(Math.round(rnd() * p.maxDelay), -dueIn - 1);
        paid = amount;
        paidDate = addDays(due, Math.max(0, delay));
      }
      const number =
        type === 'issued'
          ? `${seq++}/2026`
          : `${p.name
              .split(' ')
              .map((w) => w[0])
              .join('')}-${2026}-${String(100 + Math.round(rnd() * 800))}`;
      out.push(
        make(`${prefix}-${out.length + 1}`, type, p.name, number, issue, p.term, amount, paid, paidDate),
      );
    }
  }
  return out;
}

// Scaduti scritti a mano: sono la storia degli incassi.
const overdue: Invoice[] = [
  // Tecnoauto Group: 3 fatture, € 38.400, in media 41 giorni di ritardo.
  make('inv-ta-1', 'issued', CUSTOMERS.tecnoauto, '338/2026', day(-118), 60, 12800, 0),
  make('inv-ta-2', 'issued', CUSTOMERS.tecnoauto, '361/2026', day(-101), 60, 14200, 0),
  make('inv-ta-3', 'issued', CUSTOMERS.tecnoauto, '389/2026', day(-84), 60, 11400, 0),
  make('inv-in-1', 'issued', CUSTOMERS.idraulica, '401/2026', day(-42), 30, 9650, 0),
  make('inv-fp-1', 'issued', CUSTOMERS.freni, '322/2026', day(-127), 60, 18300, 6000, day(-30)),
  make('inv-ov-1', 'issued', CUSTOMERS.valsusa, '297/2026', day(-125), 30, 4200, 0),
];

const issued = [...generate('issued', customerProfiles, 'inv-e'), ...overdue];
const received = generate('received', supplierProfiles, 'inv-r');

export const invoices: Invoice[] = [...issued, ...received].sort(
  (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
);
