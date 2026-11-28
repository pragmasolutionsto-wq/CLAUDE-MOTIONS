import { format, formatDistanceStrict, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';

const eur0 = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0, useGrouping: 'always' });
const eur2 = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: 'always',
});
const num1 = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 });

/** € 42.300 */
export function euro(value: number, cents = false): string {
  const abs = Math.abs(value);
  const body = cents ? eur2.format(abs) : eur0.format(Math.round(abs));
  return `${value < 0 ? '−' : ''}€ ${body}`;
}

/** € 1,2 M — per assi dei grafici */
export function euroCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}€ ${num1.format(abs / 1_000_000)} M`;
  if (abs >= 1_000) return `${sign}€ ${eur0.format(Math.round(abs / 1_000))}k`;
  return `${sign}€ ${eur0.format(abs)}`;
}

/** 12,5% (value in frazione: 0.125) */
export function percent(fraction: number, digits = 1): string {
  return `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(fraction * 100)}%`;
}

export function number(value: number, digits = 0): string {
  return new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(value);
}

/** 6 h 30 */
export function hours(value: number): string {
  const h = Math.floor(value);
  const m = Math.round((value - h) * 60);
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, '0')}`;
}

const d = (iso: string | Date) => (typeof iso === 'string' ? new Date(iso) : iso);

/** mar 1 dic */
export const dayShort = (iso: string | Date) => format(d(iso), 'EEE d MMM', { locale: it });
/** martedì 1 dicembre */
export const dayLong = (iso: string | Date) => format(d(iso), 'EEEE d MMMM', { locale: it });
/** 1 dic 2026 */
export const dateMedium = (iso: string | Date) => format(d(iso), 'd MMM yyyy', { locale: it });
/** 1 dicembre */
export const dayMonth = (iso: string | Date) => format(d(iso), 'd MMMM', { locale: it });
/** 07:12 */
export const time = (iso: string | Date) => format(d(iso), 'HH:mm');
/** martedì */
export const weekday = (iso: string | Date) => format(d(iso), 'EEEE', { locale: it });

/** "07:12" se è oggi, altrimenti "sab 28 nov, 07:12" */
export function stamp(iso: string, now: Date): string {
  const date = d(iso);
  return isSameDay(date, now) ? time(date) : `${dayShort(date)}, ${time(date)}`;
}

/** "2 giorni fa" */
export function ago(iso: string, now: Date): string {
  return `${formatDistanceStrict(d(iso), now, { locale: it })} fa`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
