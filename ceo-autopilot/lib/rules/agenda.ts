import { addDays, isSameDay, startOfDay, startOfWeek } from 'date-fns';
import { BRIDGE } from '@/config/thresholds';
import type { CalendarEvent } from '@/types/domain';

const ms = (iso: string) => new Date(iso).getTime();
const durH = (e: CalendarEvent) => (ms(e.end) - ms(e.start)) / 3_600_000;

export const eventsOn = (events: CalendarEvent[], day: Date) =>
  events.filter((e) => isSameDay(new Date(e.start), day)).sort((a, b) => ms(a.start) - ms(b.start));

/** Ore di riunioni di un giorno (pranzi e impegni personali non contano). */
export function meetingHours(events: CalendarEvent[], day: Date): number {
  return eventsOn(events, day)
    .filter((e) => e.kind === 'meeting')
    .reduce((a, e) => a + durH(e), 0);
}

export function weekMeetingHours(events: CalendarEvent[], anyDayOfWeek: Date): number {
  const start = startOfWeek(anyDayOfWeek, { weekStartsOn: 1 });
  let total = 0;
  for (let i = 0; i < 7; i++) total += meetingHours(events, addDays(start, i));
  return total;
}

export interface FreeBlock {
  start: string;
  end: string;
  minutes: number;
}

/** Spazi liberi nell'orario di lavoro (9–18), tenendo conto di tutti gli impegni. */
export function freeBlocks(events: CalendarEvent[], day: Date, minMinutes = 0): FreeBlock[] {
  const open = new Date(startOfDay(day));
  open.setHours(BRIDGE.workdayStartHour);
  const close = new Date(startOfDay(day));
  close.setHours(BRIDGE.workdayEndHour);
  const blocks: FreeBlock[] = [];
  let cursor = open.getTime();
  for (const e of eventsOn(events, day)) {
    const s = Math.min(Math.max(ms(e.start), open.getTime()), close.getTime());
    const en = Math.min(ms(e.end), close.getTime());
    if (en <= cursor) continue;
    if (s > cursor) blocks.push(mk(cursor, s));
    cursor = Math.max(cursor, en);
  }
  if (cursor < close.getTime()) blocks.push(mk(cursor, close.getTime()));
  return blocks.filter((b) => b.minutes >= minMinutes);
}

const mk = (a: number, b: number): FreeBlock => ({
  start: new Date(a).toISOString(),
  end: new Date(b).toISOString(),
  minutes: Math.round((b - a) / 60000),
});

/** Prossimi n giorni lavorativi a partire da un giorno (compreso se feriale). */
export function workingDays(from: Date, n: number, includeFrom = true): Date[] {
  const out: Date[] = [];
  let d = startOfDay(from);
  if (!includeFrom) d = addDays(d, 1);
  while (out.length < n) {
    if (![0, 6].includes(d.getDay())) out.push(d);
    d = addDays(d, 1);
  }
  return out;
}

/** Il giorno lavorativo con meno ore di riunioni tra quelli indicati. */
export function lightestDay(events: CalendarEvent[], days: Date[]): Date | null {
  if (days.length === 0) return null;
  return days.reduce((best, d) => (meetingHours(events, d) < meetingHours(events, best) ? d : best));
}

/** Sovrapposizioni tra riunioni dello stesso giorno. */
export function overlaps(events: CalendarEvent[]): number {
  const m = events.filter((e) => e.kind === 'meeting').sort((a, b) => ms(a.start) - ms(b.start));
  let n = 0;
  for (let i = 1; i < m.length; i++) if (ms(m[i].start) < ms(m[i - 1].end)) n++;
  return n;
}

export function strategicShare(events: CalendarEvent[]): number {
  const m = events.filter((e) => e.kind === 'meeting');
  const total = m.reduce((a, e) => a + durH(e), 0);
  if (!total) return 0;
  return m.filter((e) => e.category === 'strategico').reduce((a, e) => a + durH(e), 0) / total;
}

export { durH };
