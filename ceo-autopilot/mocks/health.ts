import type { HealthDay, WorkloadDay } from '@/types/domain';
import { seeded } from '@/lib/utils';
import { at, day } from './time';

// 60 giorni di dati dal wearable. Baseline stabile, poi un calo evidente negli ultimi 10 giorni,
// in corrispondenza delle settimane pesanti: è la storia "carico contro recupero".

const BASE = { sleep: 6.9, hrv: 48, rhr: 56, steps: 7800 };

// Ultimi 10 giorni, dal più vecchio a oggi (dom 22 nov → mar 1 dic).
const DROP = {
  sleep: [6.0, 4.83, 5.4, 5.6, 5.2, 5.5, 6.1, 5.5, 5.3, 4.92],
  hrv: [42, 33, 36, 38, 35, 37, 41, 38, 35, 31],
  rhr: [58, 62, 61, 60, 61, 60, 59, 60, 61, 63],
  steps: [6100, 3900, 4600, 5200, 4100, 4800, 7400, 6900, 4300, 0],
};

function build(withDrop: boolean): HealthDay[] {
  const rnd = seeded(5252);
  const days: HealthDay[] = [];
  for (let offset = -59; offset <= 0; offset++) {
    const n = () => rnd() - 0.5;
    const weekend = [0, 6].includes(day(offset).getDay());
    const i = offset + 9;
    const drop = withDrop && i >= 0;
    days.push({
      date: day(offset).toISOString(),
      sleepHours: drop ? DROP.sleep[i] : Math.round((BASE.sleep + n() * 0.8 + (weekend ? 0.4 : 0)) * 100) / 100,
      hrvMs: drop ? DROP.hrv[i] : Math.round(BASE.hrv + n() * 8),
      restingHr: drop ? DROP.rhr[i] : Math.round(BASE.rhr + n() * 3),
      // I passi di oggi non ci sono ancora: sono le 7 del mattino.
      steps: offset === 0 ? null : drop ? DROP.steps[i] : Math.round(BASE.steps + n() * 3600),
      valid: true,
    });
  }
  // Due notti senza dati (orologio in carica): servono a mostrare che il sistema non inventa.
  for (const idx of [17, 31]) {
    days[idx] = { ...days[idx], sleepHours: null, hrvMs: null, restingHr: null, valid: false };
  }
  return days;
}

export const healthHeavy: HealthDay[] = build(true);
export const healthNormal: HealthDay[] = build(false);
export const wearableSync = at(0, '06:58');

// Carico di lavoro storico (prima delle settimane coperte dal calendario).
export function workloadHistory(heavy = true): WorkloadDay[] {
  const rnd = seeded(909);
  const out: WorkloadDay[] = [];
  for (let offset = -59; offset <= 0; offset++) {
    const d = day(offset);
    const weekend = [0, 6].includes(d.getDay());
    // Tre settimane fa il carico sale: da circa 20 a circa 29 ore di riunioni a settimana.
    const heavyPeriod = heavy && offset >= -22;
    const base = weekend ? 0 : heavyPeriod ? 5.9 : 4.0;
    out.push({
      date: d.toISOString(),
      meetingHours: weekend ? 0 : Math.round((base + (rnd() - 0.5) * 1.2) * 2) / 2,
      mailsReceived: weekend ? Math.round(4 + rnd() * 8) : Math.round((heavyPeriod ? 52 : 38) + (rnd() - 0.5) * 18),
    });
  }
  return out;
}
