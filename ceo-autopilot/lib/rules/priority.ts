import { differenceInHours } from 'date-fns';
import { PRIORITY } from '@/config/thresholds';
import type { Confidence, Domain, Insight, Severity } from '@/types/domain';

export interface PriorityParts {
  severity: number; // 0-100
  urgency: number; // 0-100
  goalImpact: number; // 0-100
  reliability: number; // 0-100
}

/** priority = 0.40*gravità + 0.30*urgenza + 0.20*impatto_obiettivo + 0.10*affidabilità */
export function priorityScore(p: PriorityParts): number {
  const w = PRIORITY.weights;
  const raw =
    w.severity * p.severity + w.urgency * p.urgency + w.goalImpact * p.goalImpact + w.reliability * p.reliability;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

export function urgencyFromDue(dueAt: string | undefined, now: Date): number {
  const u = PRIORITY.urgency;
  if (!dueAt) return u.later;
  const h = differenceInHours(new Date(dueAt), now);
  if (h <= 24) return u.today;
  if (h <= 48) return u.within2d;
  if (h <= 24 * 7) return u.within7d;
  if (h <= 24 * 14) return u.within14d;
  if (h <= 24 * 30) return u.within30d;
  return u.later;
}

// Quanto ogni dominio pesa sugli obiettivi dell'anno scelti in onboarding
// (più liquidità, crescere sui clienti, delegare di più).
export const GOAL_IMPACT: Record<Domain, number> = {
  finance: 90,
  sales: 85,
  mail: 70,
  agenda: 60,
  risk: 55,
  meetings: 50,
  grants: 40,
  health: 60,
};

export function score(
  input: { severity: Severity; confidence: Confidence; domain: Domain; dueAt?: string; reliability?: number },
  now: Date,
): { priorityScore: number; reliability: number } {
  const reliability = input.reliability ?? PRIORITY.reliabilityByConfidence[input.confidence];
  return {
    reliability,
    priorityScore: priorityScore({
      severity: PRIORITY.severityScore[input.severity],
      urgency: urgencyFromDue(input.dueAt, now),
      goalImpact: GOAL_IMPACT[input.domain],
      reliability,
    }),
  };
}

/** Ordina: prima le regole di sicurezza, poi per punteggio. */
export function rank(insights: Insight[]): Insight[] {
  return [...insights].sort((a, b) => {
    if (!!a.safetyRule !== !!b.safetyRule) return a.safetyRule ? -1 : 1;
    return b.priorityScore - a.priorityScore;
  });
}

/**
 * Sceglie le priorità del briefing: massimo 3, solo insight abbastanza affidabili.
 * Gli altri restano consultabili in "Altro da sapere" e nelle rispettive sezioni.
 */
export function selectBriefing(insights: Insight[]): { priorities: Insight[]; other: Insight[] } {
  const ranked = rank(insights);
  const eligible = ranked.filter((i) => i.reliability >= PRIORITY.minReliabilityForBriefing);
  const priorities = eligible.slice(0, PRIORITY.maxBusinessPriorities);
  const ids = new Set(priorities.map((i) => i.id));
  return { priorities, other: ranked.filter((i) => !ids.has(i.id)) };
}
