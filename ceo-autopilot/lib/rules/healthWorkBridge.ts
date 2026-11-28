import { addDays, differenceInCalendarDays, differenceInHours, format, isSameDay, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { BRIDGE } from '@/config/thresholds';
import type { CalendarEvent, HealthDay, HwRuleId, Insight, ProposedAction, Severity, SourceRef } from '@/types/domain';
import { eventsOn, freeBlocks, lightestDay, meetingHours, workingDays } from './agenda';
import { score } from './priority';
import { isLow, type ReadinessPoint } from './readiness';

// Incrocio salute-lavoro: il cuore del prodotto.
// Ogni regola è una funzione pura: stessi dati in ingresso, stesso suggerimento in uscita.
// Linguaggio: sempre "recupero sotto la tua media", mai termini clinici.

export interface BridgeInput {
  now: Date;
  readiness: ReadinessPoint[]; // serie giornaliera, oggi per ultimo
  health: HealthDay[];
  events: CalendarEvent[];
  weeklyMeetingHours: number[]; // ultime settimane, la corrente per ultima
  recoveryTrend: 'down' | 'flat' | 'up';
  checkupDueAt: string | null;
  delegateTo: string;
  sources: { wearable: SourceRef; calendar: SourceRef; clinic: SourceRef };
}

export interface BridgeAdjustment {
  eventId: string;
  reason: string;
  action: ProposedAction;
}

export interface BridgeOutput {
  rule: HwRuleId;
  insight: Insight;
  /** Se presente, la regola modifica anche una priorità business legata a quell'evento. */
  adjustment?: BridgeAdjustment;
}

const wd = (d: Date) => format(d, 'EEEE', { locale: it });
const hLabel = (h: number) => {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  return min ? `${whole} ore e ${min} minuti` : `${whole} ore`;
};
const relDay = (d: Date, now: Date) => {
  const diff = differenceInCalendarDays(d, now);
  return diff === 0 ? 'oggi' : diff === 1 ? 'domani' : wd(d);
};

function mk(
  rule: HwRuleId,
  now: Date,
  i: {
    title: string;
    observedFact: string;
    healthReason: string;
    severity: Severity;
    sources: SourceRef[];
    action?: ProposedAction;
    dueAt?: string;
    href?: string;
  },
): Insight {
  const s = score({ severity: i.severity, confidence: 'high', domain: 'health', dueAt: i.dueAt }, now);
  return {
    id: `hw-${rule.toLowerCase()}`,
    domain: 'health',
    hwRule: rule,
    title: i.title,
    observedFact: i.observedFact,
    healthReason: i.healthReason,
    healthAdjusted: true,
    suggestedAction: i.action,
    severity: i.severity,
    confidence: 'high',
    sources: i.sources,
    dueAt: i.dueAt,
    href: i.href ?? '/salute',
    ...s,
  };
}

const today = (input: BridgeInput) => input.readiness[input.readiness.length - 1];

/** HW1: recupero molto sotto la media oggi e almeno 5 ore di riunioni → sposta 1–2 riunioni interne non critiche. */
export function hw1(input: BridgeInput): BridgeOutput | null {
  const t = today(input);
  if (!t || t.band !== 'well_below') return null;
  const hours = meetingHours(input.events, input.now);
  if (hours < BRIDGE.hw1.minMeetingHours) return null;
  const movable = eventsOn(input.events, input.now)
    .filter((e) => e.kind === 'meeting' && !e.external && e.importance === 'low' && new Date(e.start) > input.now)
    .slice(0, BRIDGE.hw1.maxToMove);
  if (movable.length === 0) return null;
  const target = lightestDay(input.events, workingDays(input.now, 4, false));
  if (!target) return null;
  const n = movable.length;
  const what = n === 1 ? '1 incontro interno' : `${n} incontri interni`;
  return {
    rule: 'HW1',
    insight: mk('HW1', input.now, {
      title: `Sposta ${what} a ${wd(target)}`,
      observedFact: `Recupero sotto la tua media e ${hLabel(hours)} di riunioni. Ti propongo di spostare ${what} a ${wd(target)}.`,
      healthReason: `Oggi il tuo recupero è ${t.score}/100, molto sotto i tuoi valori abituali, e hai ${hLabel(hours)} di riunioni. Ho scelto incontri interni a bassa priorità.`,
      severity: 'high',
      sources: [input.sources.wearable, input.sources.calendar],
      dueAt: input.now.toISOString(),
      href: '/agenda',
      action: {
        id: 'act-hw1',
        kind: 'reschedule',
        label: `Sposta a ${wd(target)}`,
        requiresApproval: true,
        payload: { eventIds: movable.map((e) => e.id), titles: movable.map((e) => e.title), toDay: target.toISOString() },
      },
    }),
  };
}

/** HW2: decisione irreversibile entro 48 ore e recupero sotto la media → suggerisce la giornata migliore nei prossimi 5 giorni. */
export function hw2(input: BridgeInput): BridgeOutput | null {
  const t = today(input);
  if (!t || !isLow(t.band)) return null;
  const event = input.events.find((e) => {
    if (!e.irreversibleDecision) return false;
    const h = differenceInHours(new Date(e.start), input.now);
    return h >= 0 && h <= BRIDGE.hw2.withinHours;
  });
  if (!event) return null;
  const eventDay = startOfDay(new Date(event.start));
  const best = lightestDay(input.events, workingDays(input.now, BRIDGE.hw2.lookAheadDays, false));
  if (!best || isSameDay(best, eventDay)) return null;
  const reason = `Il tuo recupero è sotto la tua media e questa è una decisione difficile da annullare. ${capital(wd(best))} hai ${hLabel(meetingHours(input.events, best))} di riunioni contro ${hLabel(meetingHours(input.events, eventDay))} di ${wd(eventDay)}: è la giornata più leggera dei prossimi 5 giorni.`;
  const action: ProposedAction = {
    id: 'act-hw2',
    kind: 'reschedule',
    label: `Sposta a ${wd(best)}`,
    requiresApproval: true,
    payload: { eventIds: [event.id], titles: [event.title], toDay: best.toISOString() },
  };
  return {
    rule: 'HW2',
    insight: mk('HW2', input.now, {
      title: `Valuta di decidere ${wd(best)}`,
      observedFact: `"${event.title}" è fissata ${relDay(eventDay, input.now)}. Se puoi, ${wd(best)} è una giornata più leggera.`,
      healthReason: reason,
      severity: 'medium',
      sources: [input.sources.wearable, input.sources.calendar],
      dueAt: event.start,
      href: '/decision-room',
      action,
    }),
    adjustment: { eventId: event.id, reason, action },
  };
}

/** HW3: almeno 3 notti consecutive sotto la baseline di oltre 1 ora → una serata senza impegni. */
export function hw3(input: BridgeInput): BridgeOutput | null {
  const t = today(input);
  const base = t?.baseline;
  if (!base) return null;
  const n = BRIDGE.hw3.consecutiveNights;
  const last = input.health.slice(-n);
  if (last.length < n) return null;
  const short = last.every((d) => d.sleepHours !== null && d.sleepHours < base.sleep - BRIDGE.hw3.hoursBelowBaseline);
  if (!short) return null;
  // Prima serata libera tra oggi e i due giorni successivi.
  const evening = [0, 1, 2]
    .map((o) => addDays(startOfDay(input.now), o))
    .find((d) => !eventsOn(input.events, d).some((e) => new Date(e.end).getHours() >= 19 || new Date(e.start).getHours() >= 18));
  if (!evening) return null;
  const label = isSameDay(evening, input.now) ? 'di oggi' : `di ${wd(evening)}`;
  const start = new Date(evening);
  start.setHours(18, 30);
  return {
    rule: 'HW3',
    insight: mk('HW3', input.now, {
      title: `Tieni libera la serata ${label}`,
      observedFact: `${capital(numWord(n))} notti corte di fila. Ti propongo di tenere libera la serata ${label}.`,
      healthReason: `Nelle ultime ${n} notti hai dormito oltre un’ora in meno della tua media di ${hLabel(base.sleep)}.`,
      severity: 'medium',
      sources: [input.sources.wearable, input.sources.calendar],
      action: {
        id: 'act-hw3',
        kind: 'block_time',
        label: 'Blocca la serata',
        requiresApproval: true,
        payload: { title: 'Serata libera', start: start.toISOString(), minutes: 180 },
      },
    }),
  };
}

/** HW4: oltre 28 ore di riunioni a settimana per 3 settimane e recupero in calo → riunioni ricorrenti da delegare. */
export function hw4(input: BridgeInput): BridgeOutput | null {
  const weeks = input.weeklyMeetingHours.slice(-BRIDGE.hw4.weeks);
  if (weeks.length < BRIDGE.hw4.weeks || !weeks.every((h) => h > BRIDGE.hw4.weeklyHours)) return null;
  if (input.recoveryTrend !== 'down') return null;
  const weekEnd = addDays(startOfDay(input.now), 7);
  const titles = [
    ...new Set(
      input.events
        .filter((e) => e.recurring && !e.ownerIsDecider && new Date(e.start) >= startOfDay(input.now) && new Date(e.start) < weekEnd)
        .map((e) => e.title),
    ),
  ].slice(0, BRIDGE.hw4.maxToDelegate);
  if (titles.length === 0) return null;
  const what = titles.length === 1 ? 'Una riunione ricorrente potrebbe' : `${capital(numWord(titles.length))} riunioni ricorrenti potrebbero`;
  return {
    rule: 'HW4',
    insight: mk('HW4', input.now, {
      title: `Delega ${titles.length} riunioni ricorrenti`,
      observedFact: `${what} andare a ${input.delegateTo}.`,
      healthReason: `Da ${BRIDGE.hw4.weeks} settimane superi le ${BRIDGE.hw4.weeklyHours} ore di riunioni (${weeks.map((h) => Math.round(h)).join(', ')} ore) e il tuo recupero è in calo. In queste riunioni non sei tu a decidere.`,
      severity: 'medium',
      sources: [input.sources.calendar, input.sources.wearable],
      href: '/agenda',
      action: {
        id: 'act-hw4',
        kind: 'delegate',
        label: `Proponi a ${input.delegateTo.split(' ')[0]}`,
        requiresApproval: true,
        payload: { titles, to: input.delegateTo },
      },
    }),
  };
}

/** HW5: recupero sotto la media per almeno 10 giorni su 14 → consulto in telemedicina (escalation livello 1). */
export function hw5(input: BridgeInput): BridgeOutput | null {
  const window = input.readiness.slice(-BRIDGE.hw5.windowDays);
  const low = window.filter((p) => isLow(p.band)).length;
  if (low < BRIDGE.hw5.lowDays) return null;
  return {
    rule: 'HW5',
    insight: mk('HW5', input.now, {
      title: 'Un confronto con un medico Longevitas',
      observedFact:
        'Da due settimane il tuo recupero resta basso. Potrebbe valere una chiacchierata con un medico Longevitas: 20 minuti in video.',
      healthReason: `Negli ultimi ${BRIDGE.hw5.windowDays} giorni il tuo recupero è rimasto sotto la tua media per ${low} giorni.`,
      severity: 'medium',
      sources: [input.sources.wearable],
      href: '/clinica',
      action: {
        id: 'act-hw5',
        kind: 'book_checkup',
        label: 'Prenota un consulto',
        requiresApproval: true,
        payload: { type: 'teleconsult' },
      },
    }),
  };
}

/** HW6: check-up semestrale in scadenza entro 30 giorni, o già scaduto → promemoria con prenotazione. */
export function hw6(input: BridgeInput): BridgeOutput | null {
  if (!input.checkupDueAt) return null;
  const days = differenceInCalendarDays(new Date(input.checkupDueAt), input.now);
  if (days > BRIDGE.hw6.dueWithinDays) return null;
  const when =
    days < 0
      ? `è scaduto da ${-days} giorni`
      : days < 14
        ? `è tra ${days} giorni`
        : `è tra ${Math.round(days / 7)} settimane`;
  return {
    rule: 'HW6',
    insight: mk('HW6', input.now, {
      title: 'Prenota il check-up semestrale',
      observedFact: `Il tuo check-up semestrale ${when}. Vuoi prenotarlo?`,
      healthReason: 'Il piano Business + Health include un check-up Longevitas ogni 6 mesi.',
      severity: 'low',
      sources: [input.sources.clinic],
      dueAt: input.checkupDueAt,
      href: '/clinica',
      action: {
        id: 'act-hw6',
        kind: 'book_checkup',
        label: 'Prenota il check-up',
        requiresApproval: true,
        payload: { type: 'checkup' },
      },
    }),
  };
}

/** HW7: nessuno spazio libero oltre 60 minuti nei prossimi 3 giorni lavorativi → blocco focus. */
export function hw7(input: BridgeInput): BridgeOutput | null {
  const { minFreeBlockMin, workingDays: n, proposedBlockMin } = BRIDGE.hw7;
  const days = workingDays(input.now, n, true);
  const hasSpace = days.some((d) => freeBlocks(input.events, d).some((b) => b.minutes > minFreeBlockMin));
  if (hasSpace) return null;
  // Primo giorno successivo con uno spazio vero.
  const next = workingDays(addDays(days[days.length - 1], 1), 5, true).find((d) =>
    freeBlocks(input.events, d).some((b) => b.minutes > minFreeBlockMin),
  );
  const tomorrow = workingDays(input.now, 1, false)[0];
  const first = eventsOn(input.events, tomorrow)[0];
  const end = first ? new Date(first.start) : new Date(new Date(tomorrow).setHours(10, 30));
  const start = new Date(end.getTime() - proposedBlockMin * 60000);
  return {
    rule: 'HW7',
    insight: mk('HW7', input.now, {
      title: `Blocca ${proposedBlockMin} minuti per pensare`,
      observedFact: `Non hai spazio per pensare ${next ? `fino a ${wd(next)}` : 'nei prossimi giorni'}. Ti blocco ${proposedBlockMin} minuti domani mattina?`,
      healthReason: `Nei prossimi ${n} giorni lavorativi non c’è nessuno spazio libero oltre i ${minFreeBlockMin} minuti.`,
      severity: 'low',
      sources: [input.sources.calendar],
      href: '/agenda',
      action: {
        id: 'act-hw7',
        kind: 'block_time',
        label: 'Blocca il tempo',
        requiresApproval: true,
        payload: { title: 'Blocco focus', start: start.toISOString(), minutes: proposedBlockMin },
      },
    }),
  };
}

export const RULES = { HW1: hw1, HW2: hw2, HW3: hw3, HW4: hw4, HW5: hw5, HW6: hw6, HW7: hw7 } as const;

export interface BridgeSettings {
  enabled: boolean;
  consultSuggestions: boolean; // escalation livello 1 (HW5)
  checkupReminders: boolean; // escalation livello 2 (HW6)
}

export interface BridgeResult {
  active: BridgeOutput[]; // tutte le regole scattate, in ordine HW1…HW7
  personalTip?: Insight; // al massimo 1 suggerimento personale nel briefing
  adjustments: BridgeAdjustment[];
  escalationLevel: 0 | 1 | 2;
}

export function runBridge(input: BridgeInput, settings: BridgeSettings): BridgeResult {
  if (!settings.enabled) return { active: [], adjustments: [], escalationLevel: 0 };
  const active = (Object.keys(RULES) as HwRuleId[])
    .filter((id) => (id === 'HW5' ? settings.consultSuggestions : id === 'HW6' ? settings.checkupReminders : true))
    .map((id) => RULES[id](input))
    .filter((o): o is BridgeOutput => o !== null);
  const byRule = new Map(active.map((o) => [o.rule, o]));
  const tipRule = BRIDGE.tipOrder.find((r) => byRule.has(r));
  return {
    active,
    personalTip: tipRule ? byRule.get(tipRule)?.insight : undefined,
    adjustments: active.flatMap((o) => (o.adjustment ? [o.adjustment] : [])),
    escalationLevel: byRule.has('HW5') ? 1 : 0,
  };
}

function capital(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function numWord(n: number): string {
  return ['zero', 'una', 'due', 'tre', 'quattro', 'cinque'][n] ?? String(n);
}
