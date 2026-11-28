import { differenceInCalendarDays } from 'date-fns';
import { RECEIVABLES } from '@/config/thresholds';
import type { Invoice } from '@/types/domain';

const residual = (i: Invoice) => i.amount - i.paid;
const isOverdue = (i: Invoice) => i.type === 'issued' && residual(i) > 0 && (i.daysOverdue ?? 0) > 0;

export interface CustomerOverdue {
  customer: string;
  amount: number;
  count: number;
  avgDays: number;
  invoices: Invoice[];
}

/** Crediti scaduti raggruppati per cliente, dal più alto. */
export function overdueByCustomer(invoices: Invoice[]): CustomerOverdue[] {
  const map = new Map<string, Invoice[]>();
  for (const i of invoices.filter(isOverdue)) {
    map.set(i.counterparty, [...(map.get(i.counterparty) ?? []), i]);
  }
  return [...map.entries()]
    .map(([customer, list]) => ({
      customer,
      amount: list.reduce((a, i) => a + residual(i), 0),
      count: list.length,
      avgDays: Math.round(list.reduce((a, i) => a + (i.daysOverdue ?? 0), 0) / list.length),
      invoices: list,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
}

/** Aging dei crediti scaduti: 0–30, 31–60, 61–90, oltre 90 giorni. */
export function agingBuckets(invoices: Invoice[]): AgingBucket[] {
  const [a, b, c] = RECEIVABLES.agingBuckets;
  const buckets: AgingBucket[] = [
    { label: `0–${a} giorni`, amount: 0, count: 0 },
    { label: `${a + 1}–${b} giorni`, amount: 0, count: 0 },
    { label: `${b + 1}–${c} giorni`, amount: 0, count: 0 },
    { label: `oltre ${c} giorni`, amount: 0, count: 0 },
  ];
  for (const i of invoices.filter(isOverdue)) {
    const d = i.daysOverdue ?? 0;
    const idx = d <= a ? 0 : d <= b ? 1 : d <= c ? 2 : 3;
    buckets[idx].amount += residual(i);
    buckets[idx].count += 1;
  }
  return buckets;
}

export interface CustomerDelay {
  customer: string;
  avgDelayDays: number;
  sample: number;
}

/** Giorni medi di ritardo per cliente: fatture pagate (data incasso − scadenza) e scadute aperte. */
export function avgDelayByCustomer(invoices: Invoice[]): CustomerDelay[] {
  const map = new Map<string, number[]>();
  for (const i of invoices) {
    if (i.type !== 'issued') continue;
    let delay: number | null = null;
    if (residual(i) > 0 && (i.daysOverdue ?? 0) > 0) delay = i.daysOverdue ?? 0;
    else if (i.status === 'paid' && i.paidDate)
      delay = Math.max(0, differenceInCalendarDays(new Date(i.paidDate), new Date(i.dueDate)));
    if (delay === null) continue;
    map.set(i.counterparty, [...(map.get(i.counterparty) ?? []), delay]);
  }
  return [...map.entries()]
    .map(([customer, d]) => ({
      customer,
      avgDelayDays: Math.round(d.reduce((a, x) => a + x, 0) / d.length),
      sample: d.length,
    }))
    .sort((a, b) => b.avgDelayDays - a.avgDelayDays);
}

export interface Concentration {
  share: number; // quota dei primi N clienti sul fatturato (imponibile)
  top: { customer: string; revenue: number; share: number }[];
  total: number;
}

/** Concentrazione: quota dei primi N clienti sul fatturato del periodo. */
export function concentration(invoices: Invoice[], topN: number = RECEIVABLES.concentrationTopN): Concentration {
  const map = new Map<string, number>();
  let total = 0;
  for (const i of invoices) {
    if (i.type !== 'issued') continue;
    const net = i.amount - i.vat;
    total += net;
    map.set(i.counterparty, (map.get(i.counterparty) ?? 0) + net);
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN);
  const top = sorted.map(([customer, revenue]) => ({ customer, revenue, share: total ? revenue / total : 0 }));
  return { share: top.reduce((a, t) => a + t.share, 0), top, total };
}

export function totalOverdue(invoices: Invoice[]): number {
  return invoices.filter(isOverdue).reduce((a, i) => a + residual(i), 0);
}
