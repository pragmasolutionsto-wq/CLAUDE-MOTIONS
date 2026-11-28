import { READINESS } from '@/config/thresholds';
import type { HealthDay, ReadinessSnapshot, SourceRef } from '@/types/domain';
import { clamp } from '@/lib/utils';

// Indice di recupero: confronto con i valori abituali della persona.
// Non è un indicatore medico.

export type Band = ReadinessSnapshot['vsBaseline'];

export interface Baseline {
  sleep: number;
  hrv: number;
  restingHr: number;
}

export function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const isValid = (d: HealthDay) =>
  d.valid && d.sleepHours !== null && d.hrvMs !== null && d.restingHr !== null;

/** Notti valide nella finestra che finisce al giorno idx (compreso). */
export function validNights(days: HealthDay[], idx: number): number {
  const from = Math.max(0, idx - READINESS.baselineWindowDays + 1);
  return days.slice(from, idx + 1).filter(isValid).length;
}

/**
 * Baseline = mediana mobile personale sui 28 giorni precedenti (il giorno stesso è escluso).
 * Servono almeno 14 notti valide, altrimenti null.
 */
export function baselineFor(days: HealthDay[], idx: number): Baseline | null {
  const from = Math.max(0, idx - READINESS.baselineWindowDays);
  const window = days.slice(from, idx).filter(isValid);
  if (window.length < READINESS.minValidNights - 1) return null;
  return {
    sleep: median(window.map((d) => d.sleepHours as number)),
    hrv: median(window.map((d) => d.hrvMs as number)),
    restingHr: median(window.map((d) => d.restingHr as number)),
  };
}

/** Score 0–100: 65 = uguale ai tuoi valori abituali. */
export function scoreDay(d: HealthDay, base: Baseline | null): number | null {
  if (!base || !isValid(d)) return null;
  const { weights: w, sensitivity: s, neutralScore } = READINESS;
  const sleep = (d.sleepHours as number) / base.sleep - 1;
  const hrv = (d.hrvMs as number) / base.hrv - 1;
  // Per la frequenza a riposo più basso è meglio: si inverte il rapporto.
  const rhr = base.restingHr / (d.restingHr as number) - 1;
  const delta = w.sleep * sleep * s.sleep + w.hrv * hrv * s.hrv + w.restingHr * rhr * s.restingHr;
  return Math.round(clamp(neutralScore + delta * 100, 0, 100));
}

export function bandOf(score: number | null): Band {
  if (score === null) return 'unknown';
  const b = READINESS.bands;
  if (score >= b.above) return 'above';
  if (score >= b.inRange) return 'in_range';
  if (score >= b.below) return 'below';
  return 'well_below';
}

export const isLow = (band: Band) => band === 'below' || band === 'well_below';

export interface ReadinessPoint {
  date: string;
  score: number | null;
  band: Band;
  baseline: Baseline | null;
}

export function readinessSeries(days: HealthDay[]): ReadinessPoint[] {
  return days.map((d, idx) => {
    const baseline = validNights(days, idx) >= READINESS.minValidNights ? baselineFor(days, idx) : null;
    const score = scoreDay(d, baseline);
    return { date: d.date, score, band: bandOf(score), baseline };
  });
}

export function snapshot(days: HealthDay[], source: SourceRef): ReadinessSnapshot {
  const idx = days.length - 1;
  const today = days[idx];
  const point = readinessSeries(days)[idx];
  return {
    score: point?.score ?? null,
    vsBaseline: point?.band ?? 'unknown',
    sleepHours: today?.sleepHours ?? null,
    hrvMs: today?.hrvMs ?? null,
    restingHr: today?.restingHr ?? null,
    validNights: idx >= 0 ? validNights(days, idx) : 0,
    source,
  };
}

/** Trend del recupero: media degli ultimi 7 giorni contro i 7 precedenti. */
export function recoveryTrend(series: ReadinessPoint[]): 'down' | 'flat' | 'up' {
  const scores = series.map((p) => p.score).filter((s): s is number => s !== null);
  if (scores.length < 14) return 'flat';
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const diff = avg(scores.slice(-7)) - avg(scores.slice(-14, -7));
  return diff <= -4 ? 'down' : diff >= 4 ? 'up' : 'flat';
}
