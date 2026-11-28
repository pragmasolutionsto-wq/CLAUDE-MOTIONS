import { addDays } from 'date-fns';
import { CONNECTOR_CTA, COPY } from '@/config/copy';
import type { BaselineScenario, ConnectorScenario, DayType } from '@/config/demo';
import { CASHFLOW, RECEIVABLES } from '@/config/thresholds';
import { freeBlocks, meetingHours, weekMeetingHours } from '@/lib/rules/agenda';
import { projectCashflow } from '@/lib/rules/cashflow';
import { runBridge, hw7, type BridgeResult, type BridgeSettings } from '@/lib/rules/healthWorkBridge';
import {
  consentInsights,
  decisionEventInsights,
  grantInsight,
  liquidityInsight,
  mailInsights,
  overdueTasksInsight,
  receivablesInsights,
} from '@/lib/rules/insights';
import { selectBriefing } from '@/lib/rules/priority';
import { readinessSeries, recoveryTrend, snapshot, type ReadinessPoint } from '@/lib/rules/readiness';
import { concentration, overdueByCustomer } from '@/lib/rules/receivables';
import { isStale } from '@/lib/rules/staleness';
import { accounts, scheduledItems, transactions } from '@/mocks/bank';
import { calendarHeavy, calendarNormal } from '@/mocks/calendar';
import { checkup } from '@/mocks/clinic';
import { company, CUSTOMERS } from '@/mocks/company';
import { connectors as baseConnectors } from '@/mocks/connectors';
import { grants } from '@/mocks/grants';
import { healthHeavy, healthNormal, workloadHistory } from '@/mocks/health';
import { invoices } from '@/mocks/invoices';
import { threads, whatsappThreads } from '@/mocks/mail';
import { meetings } from '@/mocks/meetings';
import { NOW, TODAY, WEEK_START, at } from '@/mocks/time';
import type {
  Avail,
  BankAccount,
  BankTransaction,
  Briefing,
  CalendarEvent,
  CashflowItem,
  CashflowWeek,
  ConnectorId,
  ConnectorStatus,
  Grant,
  HealthDay,
  Insight,
  Invoice,
  MailThread,
  MeetingSummary,
  Plan,
  ReadinessSnapshot,
  Role,
  SourceRef,
  StaleInfo,
  WorkloadDay,
} from '@/types/domain';

// Il "mondo" simulato: dato uno scenario (piano, ruolo, giornata, connettori) calcola in modo
// deterministico tutto quello che le schermate mostrano. Le funzioni in api.ts ne espongono
// le fette con la stessa forma che avranno le API reali.

export interface Scenario {
  plan: Plan;
  role: Role;
  dayType: DayType;
  connectors: ConnectorScenario;
  baseline: BaselineScenario;
  overrides: Partial<Record<ConnectorId, ConnectorStatus['state']>>;
  reserve: number;
  minReminder: number;
  bridge: BridgeSettings;
}

export interface BankData {
  accounts: BankAccount[];
  transactions: BankTransaction[];
  total: number;
  missingAccounts: ConnectorStatus[];
}

export interface World {
  now: Date;
  sc: Scenario;
  healthVisible: boolean;
  connectors: ConnectorStatus[];
  conn: (id: ConnectorId) => ConnectorStatus;
  src: (id: ConnectorId, recordId?: string, period?: string) => SourceRef;
  invoices: Avail<Invoice[]>;
  bank: Avail<BankData>;
  cashflow: Avail<CashflowWeek[]>;
  threads: Avail<MailThread[]>;
  whatsapp: Avail<MailThread[]>;
  events: Avail<CalendarEvent[]>;
  meetings: Avail<MeetingSummary[]>;
  grants: Avail<Grant[]>;
  health: Avail<HealthDay[]> | null; // null = non visibile a questo utente
  readiness: ReadinessPoint[];
  readinessToday?: ReadinessSnapshot;
  workload: WorkloadDay[];
  bridge: BridgeResult;
  agendaProposals: Insight[];
  insights: Insight[]; // tutti gli insight business, già ordinati
  briefing: Briefing;
  other: Insight[];
  stale: StaleInfo[];
}

function resolveConnectors(sc: Scenario): ConnectorStatus[] {
  return baseConnectors.map((c) => {
    let out: ConnectorStatus = c;
    if (sc.connectors === 'none') out = { ...c, state: 'not_connected', lastSync: undefined, logs: [] };
    if (sc.connectors === 'bank_error' && c.id === 'bank_intesa') {
      out = {
        ...c,
        state: 'error',
        lastSync: at(-3, '07:12'),
        logs: [
          { at: at(0, '07:12'), ok: false, note: 'La banca non ha risposto' },
          { at: at(-1, '07:12'), ok: false, note: 'La banca non ha risposto' },
          { at: at(-2, '07:12'), ok: false, note: 'Sessione scaduta lato banca' },
          { at: at(-3, '07:12'), ok: true, note: '9 movimenti importati' },
        ],
      };
    }
    const ov = sc.overrides[c.id];
    if (ov === 'not_connected') out = { ...out, state: 'not_connected', lastSync: undefined };
    if (ov === 'connected')
      out = {
        ...c,
        state: 'connected',
        lastSync: NOW.toISOString(),
        consentExpiresAt: c.consentExpiresAt ? addDays(NOW, 180).toISOString() : undefined,
        logs: [{ at: NOW.toISOString(), ok: true, note: 'Collegato adesso' }, ...c.logs],
      };
    return out;
  });
}

const missing = <T>(c: ConnectorStatus): Avail<T> => ({
  status: 'missing',
  connector: c.id,
  reason:
    c.id === 'bank_intesa' || c.id === 'bank_bper'
      ? COPY.missing.bank
      : (COPY.missing[c.id as keyof typeof COPY.missing] ?? `${c.name} non collegato`),
  cta: CONNECTOR_CTA[c.id],
});

function buildCashflow(inv: Invoice[], opening: number, reserve: number): CashflowWeek[] {
  const weeks = Array.from({ length: CASHFLOW.weeks }, (_, w) => {
    const start = addDays(WEEK_START, w * 7);
    const end = addDays(start, 7);
    const items: CashflowItem[] = [];
    for (const i of inv) {
      const residual = i.amount - i.paid;
      if (residual <= 0) continue;
      const due = new Date(i.dueDate);
      const kind = i.type === 'issued' ? 'in' : 'out';
      if ((i.daysOverdue ?? 0) > 0) {
        // Crediti già scaduti: non hanno una data certa, li stimiamo tra tre settimane.
        if (w === 3 && i.type === 'issued')
          items.push({ label: `${i.counterparty} · fatt. ${i.number} (scaduta, incasso stimato)`, amount: residual, kind, estimated: true, recordId: `inv:${i.id}` });
        continue;
      }
      if (due >= start && due < end)
        items.push({ label: `${i.counterparty} · fatt. ${i.number}`, amount: residual, kind, recordId: `inv:${i.id}` });
    }
    items.push(...scheduledItems(w, start));
    return { weekStart: start.toISOString(), items };
  });
  return projectCashflow({ openingBalance: opening, reserve, weeks });
}

function buildWorld(sc: Scenario): World {
  const now = NOW;
  const healthVisible = sc.plan === 'health' && sc.role === 'owner';
  const connectors = resolveConnectors(sc);
  const conn = (id: ConnectorId) => connectors.find((c) => c.id === id) as ConnectorStatus;
  const up = (id: ConnectorId) => conn(id).state !== 'not_connected';
  const src = (id: ConnectorId, recordId?: string, period?: string): SourceRef => ({
    connector: id,
    label: conn(id).name,
    updatedAt: conn(id).lastSync ?? now.toISOString(),
    recordId,
    period,
  });
  const staleOf = (id: ConnectorId): StaleInfo | undefined => {
    const c = conn(id);
    if (c.state === 'error' || (up(id) && isStale(id, c.lastSync, now)))
      return { connector: id, label: c.name, since: c.lastSync ?? now.toISOString(), error: c.state === 'error' };
    return undefined;
  };
  const stale = connectors.map((c) => staleOf(c.id)).filter((s): s is StaleInfo => !!s && up(s.connector));

  // Fatture
  const invAvail: Avail<Invoice[]> = up('sdi') ? { status: 'ok', data: invoices, stale: staleOf('sdi') } : missing(conn('sdi'));

  // Banca
  const upAccounts = accounts.filter((a) => up(a.id));
  const bankStale = staleOf('bank_intesa') ?? staleOf('bank_bper');
  const bank: Avail<BankData> =
    upAccounts.length === 0
      ? missing(conn('bank_intesa'))
      : {
          status: 'ok',
          stale: bankStale,
          data: {
            accounts: upAccounts,
            transactions: transactions.filter((t) => up(t.accountId) && (conn(t.accountId).state !== 'error' || new Date(t.date) < new Date(conn(t.accountId).lastSync as string))),
            total: upAccounts.reduce((a, x) => a + x.balance, 0),
            missingAccounts: accounts.filter((a) => !up(a.id)).map((a) => conn(a.id)),
          },
        };

  // Liquidità a 13 settimane: servono sia la banca sia le fatture.
  const cashflow: Avail<CashflowWeek[]> =
    bank.status !== 'ok'
      ? missing(conn('bank_intesa'))
      : invAvail.status !== 'ok'
        ? missing(conn('sdi'))
        : { status: 'ok', stale: bankStale, data: buildCashflow(invAvail.data, bank.data.total, sc.reserve) };

  const threadsAvail: Avail<MailThread[]> = up('gmail') ? { status: 'ok', data: threads, stale: staleOf('gmail') } : missing(conn('gmail'));
  const whatsapp: Avail<MailThread[]> = up('whatsapp_business') ? { status: 'ok', data: whatsappThreads } : missing(conn('whatsapp_business'));
  const calendar = sc.dayType === 'heavy' ? calendarHeavy : calendarNormal;
  const events: Avail<CalendarEvent[]> = up('gcal') ? { status: 'ok', data: calendar, stale: staleOf('gcal') } : missing(conn('gcal'));
  const meetingsAvail: Avail<MeetingSummary[]> = up('meetings') ? { status: 'ok', data: meetings, stale: staleOf('meetings') } : missing(conn('meetings'));
  const grantsAvail: Avail<Grant[]> = up('grants') ? { status: 'ok', data: grants, stale: staleOf('grants') } : missing(conn('grants'));

  // Salute: esiste solo per il titolare con piano Health.
  let days: HealthDay[] = sc.dayType === 'heavy' ? healthHeavy : healthNormal;
  if (sc.baseline === 'learning') days = days.slice(-8);
  const health: World['health'] = !healthVisible ? null : up('wearable') ? { status: 'ok', data: days } : missing(conn('wearable'));
  const hasHealth = health?.status === 'ok';
  const readiness = hasHealth ? readinessSeries(days) : [];
  const readinessToday = hasHealth ? snapshot(days, src('wearable', 'night:today', 'notte appena trascorsa')) : undefined;

  // Carico di lavoro: storico + giorni coperti dal calendario.
  const workload = workloadHistory(sc.dayType === 'heavy').map((w) => {
    const d = new Date(w.date);
    if (d >= addDays(WEEK_START, -7)) return { ...w, meetingHours: meetingHours(calendar, d) };
    return w;
  });
  const weekSum = (start: Date) =>
    workload.filter((w) => new Date(w.date) >= start && new Date(w.date) < addDays(start, 7)).reduce((a, w) => a + w.meetingHours, 0);
  const weeklyMeetingHours = [weekSum(addDays(WEEK_START, -14)), weekMeetingHours(calendar, addDays(WEEK_START, -7)), weekMeetingHours(calendar, WEEK_START)];

  // Incrocio salute-lavoro
  const bridgeInput = {
    now,
    readiness,
    health: days,
    events: calendar,
    weeklyMeetingHours,
    recoveryTrend: recoveryTrend(readiness),
    checkupDueAt: checkup.nextDueDate,
    delegateTo: 'Giorgio Rosso',
    sources: {
      wearable: src('wearable', 'night:today'),
      calendar: src('gcal'),
      clinic: { connector: 'wearable' as ConnectorId, label: 'Clinica Longevitas', updatedAt: checkup.lastDate, recordId: 'clinic:checkup' },
    },
  };
  const bridge: BridgeResult =
    hasHealth && events.status === 'ok' ? runBridge(bridgeInput, sc.bridge) : { active: [], adjustments: [], escalationLevel: 0 };

  // Insight business
  let insights: Insight[] = [];
  const quiet = sc.dayType === 'quiet';
  if (!quiet) {
    if (cashflow.status === 'ok') {
      const i = liquidityInsight(cashflow.data, sc.reserve, [src('bank_intesa', 'cf:13w', 'prossime 13 settimane'), src('sdi')], now, !!bankStale);
      if (i) insights.push(i);
    }
    if (invAvail.status === 'ok') {
      const ranking = concentration(invAvail.data, 8).top.map((t) => t.customer);
      insights.push(
        ...receivablesInsights(overdueByCustomer(invAvail.data), ranking, [src('sdi', 'recv:overdue', 'fatture emesse non incassate')], now, sc.minReminder, {
          [CUSTOMERS.tecnoauto]: 'Il ritardo potrebbe dipendere dal cambio di gestionale di cui hanno parlato nella riunione del 23 novembre.',
        }),
      );
    }
    if (events.status === 'ok' && !events.stale) insights.push(...decisionEventInsights(events.data, src('gcal'), now));
    if (threadsAvail.status === 'ok') insights.push(...mailInsights(threadsAvail.data, src('gmail', undefined, 'ultimi 7 giorni'), now));
    if (meetingsAvail.status === 'ok') {
      const t = overdueTasksInsight(meetingsAvail.data, src('meetings'), now);
      if (t) insights.push(t);
    }
    if (grantsAvail.status === 'ok') {
      const g = grantInsight(grantsAvail.data, src('grants'), now);
      if (g) insights.push(g);
    }
    insights.push(...consentInsights(connectors, now));
  }

  // La salute può cambiare tempistica di una priorità business: solo per il titolare, mai per altri utenti.
  for (const adj of bridge.adjustments) {
    insights = insights.map((i) =>
      i.id === `ins-decision-${adj.eventId}`
        ? { ...i, healthAdjusted: true, healthReason: adj.reason, suggestedAction: adj.action, observedFact: `${i.observedFact} Se puoi, conviene farla in una giornata più leggera.` }
        : i,
    );
  }

  const { priorities, other } = selectBriefing(insights);
  const todayEvents = events.status === 'ok' ? events.data : [];
  const blocks = freeBlocks(todayEvents, TODAY, 60);
  const anyBusinessSource = (['sdi', 'bank_intesa', 'bank_bper', 'gmail', 'gcal', 'meetings', 'grants'] as ConnectorId[]).some(up);

  const briefing: Briefing = {
    date: now.toISOString(),
    greeting: `Buongiorno ${company.owner.firstName}.`,
    readiness: readinessToday,
    priorities,
    personalTip: bridge.personalTip,
    dayShape: {
      meetingsHours: events.status === 'ok' ? meetingHours(todayEvents, TODAY) : 0,
      focusBlocks: blocks.length,
      firstFree: blocks.find((b) => new Date(b.end) > now)?.start ?? null,
    },
    quietDay: anyBusinessSource && insights.filter((i) => i.severity !== 'low').length === 0 && priorities.length === 0,
  };

  // Proposte in agenda: dal bridge per il titolare, altrimenti solo il blocco focus (che non usa dati personali).
  let agendaProposals = bridge.active.filter((o) => ['HW1', 'HW2', 'HW3', 'HW4', 'HW7'].includes(o.rule)).map((o) => o.insight);
  if (!hasHealth && events.status === 'ok') {
    const f = hw7(bridgeInput);
    if (f) agendaProposals = [{ ...f.insight, id: 'ins-focus', domain: 'agenda', healthAdjusted: false, healthReason: undefined, hwRule: undefined, href: '/agenda' }];
  }

  return {
    now,
    sc,
    healthVisible,
    connectors,
    conn,
    src,
    invoices: invAvail,
    bank,
    cashflow,
    threads: threadsAvail,
    whatsapp,
    events,
    meetings: meetingsAvail,
    grants: grantsAvail,
    health,
    readiness,
    readinessToday,
    workload,
    bridge,
    agendaProposals,
    insights: [...priorities, ...other],
    briefing,
    other,
    stale,
  };
}

const cache = new Map<string, World>();

export function getWorld(sc: Scenario): World {
  const key = JSON.stringify(sc);
  let w = cache.get(key);
  if (!w) {
    if (cache.size > 24) cache.clear();
    w = buildWorld(sc);
    cache.set(key, w);
  }
  return w;
}

export const DEFAULT_SCENARIO: Scenario = {
  plan: 'health',
  role: 'owner',
  dayType: 'heavy',
  connectors: 'all',
  baseline: 'complete',
  overrides: {},
  reserve: company.liquidityReserve,
  minReminder: RECEIVABLES.minReminderAmount,
  bridge: { enabled: true, consultSuggestions: true, checkupReminders: true },
};
