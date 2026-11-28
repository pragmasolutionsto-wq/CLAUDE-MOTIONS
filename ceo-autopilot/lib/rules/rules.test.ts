import { addDays } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SCENARIO, getWorld } from '@/lib/data/world';
import { freeBlocks, meetingHours } from '@/lib/rules/agenda';
import { firstBelowReserve, projectCashflow } from '@/lib/rules/cashflow';
import { hw1, hw2, hw3, hw4, hw5, hw6, hw7, runBridge, type BridgeInput } from '@/lib/rules/healthWorkBridge';
import { priorityScore, selectBriefing, urgencyFromDue } from '@/lib/rules/priority';
import { bandOf, baselineFor, median, readinessSeries, scoreDay, snapshot } from '@/lib/rules/readiness';
import { agingBuckets, concentration, overdueByCustomer } from '@/lib/rules/receivables';
import { isStale } from '@/lib/rules/staleness';
import { detectUrgentHelp } from '@/lib/rules/urgentHelp';
import { calendarHeavy, calendarNormal } from '@/mocks/calendar';
import { healthHeavy, healthNormal } from '@/mocks/health';
import { invoices } from '@/mocks/invoices';
import { NOW, TODAY } from '@/mocks/time';
import type { HealthDay, Insight, SourceRef } from '@/types/domain';

const src: SourceRef = { connector: 'wearable', label: 'Garmin', updatedAt: NOW.toISOString() };
const insight = (p: Partial<Insight>): Insight => ({
  id: 'x', domain: 'finance', title: 't', observedFact: 'f', severity: 'medium', confidence: 'high',
  priorityScore: 50, sources: [], reliability: 90, ...p,
});

describe('priorità', () => {
  it('applica i pesi 40/30/20/10', () => {
    expect(priorityScore({ severity: 100, urgency: 100, goalImpact: 100, reliability: 100 })).toBe(100);
    expect(priorityScore({ severity: 100, urgency: 0, goalImpact: 0, reliability: 0 })).toBe(40);
    expect(priorityScore({ severity: 0, urgency: 100, goalImpact: 0, reliability: 0 })).toBe(30);
    expect(priorityScore({ severity: 0, urgency: 0, goalImpact: 100, reliability: 0 })).toBe(20);
    expect(priorityScore({ severity: 0, urgency: 0, goalImpact: 0, reliability: 100 })).toBe(10);
  });
  it('l’urgenza cresce avvicinandosi alla scadenza', () => {
    expect(urgencyFromDue(addDays(NOW, 1).toISOString(), NOW)).toBeGreaterThan(urgencyFromDue(addDays(NOW, 10).toISOString(), NOW));
    expect(urgencyFromDue(undefined, NOW)).toBeLessThan(urgencyFromDue(addDays(NOW, 20).toISOString(), NOW));
  });
  it('al massimo 3 priorità, esclude gli insight poco affidabili, le regole di sicurezza vincono', () => {
    const list = [
      insight({ id: 'a', priorityScore: 95 }),
      insight({ id: 'b', priorityScore: 90 }),
      insight({ id: 'c', priorityScore: 85 }),
      insight({ id: 'd', priorityScore: 99, reliability: 30 }),
      insight({ id: 'safe', priorityScore: 40, safetyRule: true }),
    ];
    const { priorities, other } = selectBriefing(list);
    expect(priorities.map((i) => i.id)).toEqual(['safe', 'a', 'b']);
    expect(other.map((i) => i.id)).toContain('d');
  });
});

describe('liquidità a 13 settimane', () => {
  const weeks = projectCashflow({
    openingBalance: 200_000,
    reserve: 120_000,
    weeks: [
      { weekStart: '2026-11-30', items: [{ label: 'in', amount: 50_000, kind: 'in' }, { label: 'out', amount: 100_000, kind: 'out' }] },
      { weekStart: '2026-12-07', items: [{ label: 'in', amount: 100_000, kind: 'in' }] },
    ],
  });
  it('saldo prospettico = saldo + incassi − uscite', () => {
    expect(weeks[0].closingBase).toBe(150_000);
    expect(weeks[1].openingBalance).toBe(150_000);
    expect(weeks[1].closingBase).toBe(250_000);
  });
  it('scenario prudente: incassi −20%, uscite +5%', () => {
    expect(weeks[0].closingPrudent).toBe(200_000 + 40_000 - 105_000);
    expect(weeks[1].closingPrudent).toBe(135_000 + 80_000);
  });
  it('segnala le settimane sotto riserva', () => {
    const w = projectCashflow({ openingBalance: 130_000, reserve: 120_000, weeks: [{ weekStart: 'w', items: [{ label: 'o', amount: 12_000, kind: 'out' }] }] });
    expect(w[0].belowReserveBase).toBe(true);
    expect(firstBelowReserve(w, 'prudent')?.weekStart).toBe('w');
  });
  it('nei mock il prudente scende sotto riserva nella settimana del 21 dicembre, la base no', () => {
    const w = getWorld(DEFAULT_SCENARIO);
    if (w.cashflow.status !== 'ok') throw new Error('cashflow mancante');
    expect(firstBelowReserve(w.cashflow.data, 'prudent')?.weekStart.slice(0, 10)).toBe(new Date(2026, 11, 21).toISOString().slice(0, 10));
    expect(firstBelowReserve(w.cashflow.data, 'base')).toBeUndefined();
    expect(w.cashflow.data).toHaveLength(13);
  });
});

describe('incassi', () => {
  it('Tecnoauto: 3 fatture scadute per € 38.400, in media 41 giorni', () => {
    const top = overdueByCustomer(invoices)[0];
    expect(top.customer).toBe('Tecnoauto Group');
    expect(top.amount).toBe(38_400);
    expect(top.count).toBe(3);
    expect(top.avgDays).toBe(41);
  });
  it('aging in 4 fasce che sommano il totale scaduto', () => {
    const b = agingBuckets(invoices);
    expect(b).toHaveLength(4);
    expect(b.reduce((a, x) => a + x.amount, 0)).toBe(38_400 + 9_650 + 12_300 + 4_200);
    expect(b[3].amount).toBe(4_200);
  });
  it('concentrazione dei primi 3 clienti tra 0 e 1', () => {
    const c = concentration(invoices);
    expect(c.top).toHaveLength(3);
    expect(c.share).toBeGreaterThan(0.5);
    expect(c.share).toBeLessThan(1);
  });
  it('i mock hanno 120 fatture', () => expect(invoices).toHaveLength(120));
});

describe('indice di recupero', () => {
  it('mediana', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
  });
  it('valori uguali alla baseline → 65, fascia nella norma', () => {
    const base = { sleep: 7, hrv: 50, restingHr: 55 };
    const d: HealthDay = { date: '', sleepHours: 7, hrvMs: 50, restingHr: 55, steps: 0, valid: true };
    expect(scoreDay(d, base)).toBe(65);
    expect(bandOf(65)).toBe('in_range');
  });
  it('fasce: ≥75 sopra, 55–74 norma, 40–54 sotto, <40 molto sotto', () => {
    expect(bandOf(75)).toBe('above');
    expect(bandOf(74)).toBe('in_range');
    expect(bandOf(55)).toBe('in_range');
    expect(bandOf(54)).toBe('below');
    expect(bandOf(40)).toBe('below');
    expect(bandOf(39)).toBe('well_below');
    expect(bandOf(null)).toBe('unknown');
  });
  it('con meno di 14 notti valide lo score è null', () => {
    const s = snapshot(healthHeavy.slice(-8), src);
    expect(s.score).toBeNull();
    expect(s.vsBaseline).toBe('unknown');
    expect(s.validNights).toBe(8);
    expect(baselineFor(healthHeavy.slice(-8), 7)).toBeNull();
  });
  it('nei mock oggi il recupero è molto sotto la media e gli ultimi 10 giorni sono tutti bassi', () => {
    const series = readinessSeries(healthHeavy);
    expect(series.at(-1)?.band).toBe('well_below');
    expect(series.slice(-10).every((p) => p.band === 'below' || p.band === 'well_below')).toBe(true);
    expect(readinessSeries(healthNormal).at(-1)?.band).toBe('in_range');
  });
});

describe('agenda', () => {
  it('oggi: 6 ore di riunioni e un solo spazio da 60 minuti, alle 15:00', () => {
    expect(meetingHours(calendarHeavy, TODAY)).toBe(6);
    const blocks = freeBlocks(calendarHeavy, TODAY, 60);
    expect(blocks).toHaveLength(1);
    expect(new Date(blocks[0].start).getHours()).toBe(15);
  });
  it('gli impegni serali non creano spazi liberi oltre l’orario di lavoro', () => {
    const thu = addDays(TODAY, 2);
    expect(freeBlocks(calendarHeavy, thu).every((b) => new Date(b.end).getHours() <= 18)).toBe(true);
  });
});

describe('incrocio salute-lavoro (HW1–HW7)', () => {
  const heavy = getWorld(DEFAULT_SCENARIO);
  const normal = getWorld({ ...DEFAULT_SCENARIO, dayType: 'normal' });
  const input = (over: Partial<BridgeInput> = {}): BridgeInput => ({
    now: NOW,
    readiness: heavy.readiness,
    health: healthHeavy,
    events: calendarHeavy,
    weeklyMeetingHours: [29, 33, 28.5],
    recoveryTrend: 'down',
    checkupDueAt: addDays(NOW, 21).toISOString(),
    delegateTo: 'Giorgio Rosso',
    sources: { wearable: src, calendar: src, clinic: src },
    ...over,
  });

  it('giornata pesante: scattano tutte e sette le regole', () => {
    expect(heavy.bridge.active.map((o) => o.rule)).toEqual(['HW1', 'HW2', 'HW3', 'HW4', 'HW5', 'HW6', 'HW7']);
  });
  it('giornata normale: resta solo il promemoria del check-up', () => {
    expect(normal.bridge.active.map((o) => o.rule)).toEqual(['HW6']);
  });
  it('HW1 sposta al massimo 2 riunioni interne a bassa priorità', () => {
    const o = hw1(input());
    expect(o?.insight.suggestedAction?.kind).toBe('reschedule');
    const ids = o?.insight.suggestedAction?.payload.eventIds as string[];
    expect(ids.length).toBeLessThanOrEqual(2);
    for (const id of ids) {
      const e = calendarHeavy.find((x) => x.id === id);
      expect(e?.external).toBe(false);
      expect(e?.importance).toBe('low');
    }
    expect(hw1(input({ events: calendarNormal }))).toBeNull(); // meno di 5 ore
    expect(hw1(input({ readiness: normal.readiness }))).toBeNull(); // recupero nella norma
  });
  it('HW2 propone la giornata più leggera e adatta la priorità business collegata', () => {
    const o = hw2(input());
    expect(o?.adjustment).toBeDefined();
    expect(o?.insight.observedFact).toContain('venerdì');
    const adjusted = heavy.briefing.priorities.find((p) => p.healthAdjusted);
    expect(adjusted?.healthReason).toBeTruthy();
    expect(hw2(input({ readiness: normal.readiness }))).toBeNull();
  });
  it('HW3 richiede 3 notti consecutive oltre un’ora sotto la baseline', () => {
    expect(hw3(input())?.insight.suggestedAction?.kind).toBe('block_time');
    expect(hw3(input({ health: healthNormal, readiness: normal.readiness }))).toBeNull();
  });
  it('HW4 richiede 3 settimane sopra le 28 ore e recupero in calo', () => {
    expect(hw4(input())?.insight.suggestedAction?.kind).toBe('delegate');
    expect(hw4(input({ weeklyMeetingHours: [29, 27, 30] }))).toBeNull();
    expect(hw4(input({ recoveryTrend: 'flat' }))).toBeNull();
  });
  it('HW5 scatta con almeno 10 giorni bassi su 14', () => {
    expect(hw5(input())?.insight.suggestedAction?.payload.type).toBe('teleconsult');
    expect(hw5(input({ readiness: normal.readiness }))).toBeNull();
  });
  it('HW6 scatta entro 30 giorni dal check-up o se è scaduto', () => {
    expect(hw6(input())).not.toBeNull();
    expect(hw6(input({ checkupDueAt: addDays(NOW, -5).toISOString() }))?.insight.observedFact).toContain('scaduto');
    expect(hw6(input({ checkupDueAt: addDays(NOW, 60).toISOString() }))).toBeNull();
  });
  it('HW7 scatta solo senza spazi oltre i 60 minuti nei prossimi 3 giorni lavorativi', () => {
    expect(hw7(input())?.insight.observedFact).toContain('venerdì');
    expect(hw7(input({ events: calendarNormal }))).toBeNull();
  });
  it('al massimo 1 suggerimento personale, nessuno se il bridge è spento', () => {
    expect(heavy.briefing.personalTip?.hwRule).toBe('HW1');
    const off = runBridge(input(), { enabled: false, consultSuggestions: true, checkupReminders: true });
    expect(off.active).toHaveLength(0);
    const noConsult = runBridge(input(), { enabled: true, consultSuggestions: false, checkupReminders: false });
    expect(noConsult.active.map((o) => o.rule)).not.toContain('HW5');
    expect(noConsult.active.map((o) => o.rule)).not.toContain('HW6');
  });
});

describe('briefing e compartimenti', () => {
  it('massimo 3 priorità business', () => {
    expect(getWorld(DEFAULT_SCENARIO).briefing.priorities.length).toBeLessThanOrEqual(3);
  });
  it('piano Business e utente assistente: nessun dato salute, nessun adattamento', () => {
    for (const sc of [{ ...DEFAULT_SCENARIO, plan: 'business' as const }, { ...DEFAULT_SCENARIO, role: 'assistant' as const }]) {
      const w = getWorld(sc);
      expect(w.health).toBeNull();
      expect(w.briefing.readiness).toBeUndefined();
      expect(w.briefing.personalTip).toBeUndefined();
      expect(w.insights.some((i) => i.healthAdjusted || i.domain === 'health')).toBe(false);
      expect(w.agendaProposals.some((i) => i.healthAdjusted || i.hwRule)).toBe(false);
    }
  });
  it('senza connettori non c’è nessun numero inventato', () => {
    const w = getWorld({ ...DEFAULT_SCENARIO, connectors: 'none' });
    expect(w.bank.status).toBe('missing');
    expect(w.cashflow.status).toBe('missing');
    expect(w.invoices.status).toBe('missing');
    expect(w.briefing.priorities).toHaveLength(0);
    expect(w.briefing.quietDay).toBe(false);
  });
  it('banca in errore: la liquidità non entra nel briefing come alert assertivo', () => {
    const w = getWorld({ ...DEFAULT_SCENARIO, connectors: 'bank_error' });
    expect(w.briefing.priorities.some((i) => i.id === 'ins-liquidity')).toBe(false);
    expect(w.stale.some((s) => s.connector === 'bank_intesa' && s.error)).toBe(true);
  });
  it('giornata tranquilla', () => {
    expect(getWorld({ ...DEFAULT_SCENARIO, dayType: 'quiet' }).briefing.quietDay).toBe(true);
  });
});

describe('controlli di sicurezza', () => {
  it('dato vecchio oltre soglia', () => {
    expect(isStale('bank_intesa', addDays(NOW, -3).toISOString(), NOW)).toBe(true);
    expect(isStale('bank_intesa', addDays(NOW, -1).toISOString(), NOW)).toBe(false);
    expect(isStale('gcal', undefined, NOW)).toBe(true);
  });
  it('riconosce le frasi di pericolo immediato', () => {
    expect(detectUrgentHelp('Non ce la faccio più, voglio farla finita')).toBe(true);
    expect(detectUrgentHelp('Compro il macchinario o aspetto il bando?')).toBe(false);
  });
});
