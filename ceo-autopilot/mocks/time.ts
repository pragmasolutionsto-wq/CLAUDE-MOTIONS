import { addDays, startOfDay, startOfWeek } from 'date-fns';
import { DEMO_NOW } from '@/config/demo';

export const NOW = DEMO_NOW;
export const TODAY = startOfDay(DEMO_NOW);
export const WEEK_START = startOfWeek(TODAY, { weekStartsOn: 1 });

/** Giorno relativo a oggi, a mezzanotte. */
export function day(offset: number): Date {
  return addDays(TODAY, offset);
}

/** ISO di un giorno relativo a oggi, a una certa ora ("HH:mm"). */
export function at(offset: number, hhmm = '00:00'): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = day(offset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** ISO di un giorno della settimana corrente (0 = lunedì) più un numero di settimane. */
export function weekAt(weekOffset: number, weekdayIdx: number, hhmm = '00:00'): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = addDays(WEEK_START, weekOffset * 7 + weekdayIdx);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
