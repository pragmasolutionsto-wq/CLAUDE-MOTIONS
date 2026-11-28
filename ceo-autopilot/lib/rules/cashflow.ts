import { CASHFLOW } from '@/config/thresholds';
import type { CashflowItem, CashflowWeek } from '@/types/domain';

export interface CashflowInput {
  openingBalance: number;
  reserve: number;
  weeks: { weekStart: string; items: CashflowItem[] }[];
  prudentInFactor?: number;
  prudentOutFactor?: number;
}

/**
 * Liquidità prospettica: saldo = saldo attuale + incassi attesi − uscite attese.
 * Due scenari che avanzano in parallelo: base e prudente (incassi −20%, uscite +5%).
 * Qui entrano solo incassi e pagamenti: il fatturato non c'entra.
 */
export function projectCashflow(input: CashflowInput): CashflowWeek[] {
  const inF = input.prudentInFactor ?? CASHFLOW.prudentInFactor;
  const outF = input.prudentOutFactor ?? CASHFLOW.prudentOutFactor;
  let base = input.openingBalance;
  let prudent = input.openingBalance;
  return input.weeks.map((w) => {
    const expectedIn = w.items.filter((i) => i.kind === 'in').reduce((a, i) => a + i.amount, 0);
    const expectedOut = w.items.filter((i) => i.kind === 'out').reduce((a, i) => a + i.amount, 0);
    const openingBalance = base;
    base = base + expectedIn - expectedOut;
    prudent = prudent + expectedIn * inF - expectedOut * outF;
    return {
      weekStart: w.weekStart,
      openingBalance,
      expectedIn,
      expectedOut,
      closingBase: Math.round(base),
      closingPrudent: Math.round(prudent),
      belowReserve: prudent < input.reserve,
      belowReserveBase: base < input.reserve,
      items: w.items,
    };
  });
}

export function firstBelowReserve(
  weeks: CashflowWeek[],
  scenario: 'base' | 'prudent',
): CashflowWeek | undefined {
  return weeks.find((w) => (scenario === 'base' ? w.belowReserveBase : w.belowReserve));
}

export function minClosing(weeks: CashflowWeek[], scenario: 'base' | 'prudent'): number {
  return Math.min(...weeks.map((w) => (scenario === 'base' ? w.closingBase : w.closingPrudent)));
}
