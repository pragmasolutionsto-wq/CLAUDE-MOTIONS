import { addDays, differenceInCalendarDays, isSameDay, startOfMonth, subMonths } from 'date-fns';
import { CLINIC_PRICING } from '@/config/pricing';
import { RECEIVABLES } from '@/config/thresholds';
import { dayShort, euro, hours } from '@/lib/format';
import { freeBlocks, meetingHours, overlaps, strategicShare, weekMeetingHours } from '@/lib/rules/agenda';
import { firstBelowReserve } from '@/lib/rules/cashflow';
import { median } from '@/lib/rules/readiness';
import {
  agingBuckets,
  avgDelayByCustomer,
  concentration,
  overdueByCustomer,
  totalOverdue,
  type AgingBucket,
  type Concentration,
  type CustomerDelay,
  type CustomerOverdue,
} from '@/lib/rules/receivables';
import { bloodCenters, checkup, clinicAddress, doctors, proposals, reports, slots } from '@/mocks/clinic';
import { company } from '@/mocks/company';
import { decisions } from '@/mocks/decisions';
import { TODAY, WEEK_START } from '@/mocks/time';
import type {
  Avail,
  Briefing,
  CalendarEvent,
  CashflowWeek,
  ConnectorStatus,
  Decision,
  Grant,
  Insight,
  Invoice,
  MailThread,
  MeetingSummary,
  ProposedAction,
  ReadinessSnapshot,
  SourceRef,
  StaleInfo,
} from '@/types/domain';
import { getWorld, type BankData, type Scenario } from './world';

// Livello dati. Ogni funzione è async e ha la forma dell'API reale che la sostituirà:
// oggi legge dal mondo simulato, domani farà una fetch. Le schermate non cambiano.

const latency = () => new Promise<void>((r) => setTimeout(r, 300 + Math.random() * 300));
const mapAvail = <T, U>(a: Avail<T>, f: (t: T) => U): Avail<U> => (a.status === 'ok' ? { ...a, data: f(a.data) } : a);

// ---------------------------------------------------------------- Briefing

export interface Approval {
  insight: Insight;
  action: ProposedAction;
}

export interface BriefingView extends Briefing {
  other: Insight[];
  approvals: Approval[];
  otherApprovals: number; // bozze pronte nelle altre sezioni
  missing: ConnectorStatus[];
  stale: StaleInfo[];
  noSources: boolean;
  audioScript: string;
  sources: { name: string; lastSync: string }[];
  ownerName: string;
}

// TODO backend: GET /api/briefing?date=YYYY-MM-DD
export async function getBriefing(sc: Scenario): Promise<BriefingView> {
  await latency();
  const w = getWorld(sc);
  // Poco, ma giusto: in Oggi si approvano solo le azioni delle priorità del giorno. Le altre restano nelle loro sezioni.
  const all = [...w.briefing.priorities, ...(w.briefing.personalTip ? [w.briefing.personalTip] : [])];
  const isAction = (i: Insight) => !!i.suggestedAction && i.suggestedAction.kind !== 'open_detail';
  const approvals = all.flatMap((i) => (i.suggestedAction && i.suggestedAction.kind !== 'open_detail' ? [{ insight: i, action: i.suggestedAction }] : []));
  const business = w.connectors.filter((c) => !c.privateDomain);
  const b = w.briefing;
  const audioScript = [
    `${b.greeting} Oggi hai ${hours(b.dayShape.meetingsHours)} di riunioni.`,
    b.readiness?.score != null ? `Il tuo recupero è ${b.readiness.score} su 100.` : '',
    ...b.priorities.map((p, i) => `${['Primo', 'Secondo', 'Terzo'][i]}: ${p.title}. ${p.observedFact}`),
    b.personalTip ? `Per te: ${b.personalTip.observedFact}` : '',
    b.quietDay ? 'Oggi nessuna urgenza. Buon lavoro.' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return {
    ...b,
    other: w.other,
    approvals,
    otherApprovals: w.other.filter(isAction).length,
    missing: w.connectors.filter((c) => c.state === 'not_connected' && (!c.privateDomain || w.healthVisible)),
    stale: w.stale,
    noSources: business.every((c) => c.state === 'not_connected'),
    audioScript,
    sources: w.connectors.filter((c) => c.lastSync && (!c.privateDomain || w.healthVisible)).map((c) => ({ name: c.name, lastSync: c.lastSync as string })),
    ownerName: company.owner.firstName,
  };
}

// ---------------------------------------------------------------- Connettori

export interface ConnectorsView {
  business: ConnectorStatus[];
  personal: ConnectorStatus[] | null; // null = l'utente non può vedere l'area personale
  connected: number;
  total: number;
}

// TODO backend: GET /api/connectors
export async function getConnectors(sc: Scenario): Promise<ConnectorsView> {
  await latency();
  const w = getWorld(sc);
  const visible = w.connectors.filter((c) => !c.privateDomain || sc.role === 'owner');
  return {
    business: w.connectors.filter((c) => !c.privateDomain),
    personal: sc.role === 'owner' ? w.connectors.filter((c) => c.privateDomain) : null,
    connected: visible.filter((c) => c.state !== 'not_connected').length,
    total: visible.length,
  };
}

// ---------------------------------------------------------------- Finanza

export interface Kpi {
  value: number;
  previous?: number;
  spark?: number[];
  period: string;
  source: SourceRef;
  note?: string;
}

export interface FinanceOverview {
  balance: Avail<Kpi>;
  liquidity4w: Avail<Kpi>;
  overdue: Avail<Kpi>;
  revenueMonth: Avail<Kpi>;
  collectedMonth: Avail<Kpi>;
  concentration: Avail<Concentration & { source: SourceRef }>;
  bperConsentDays: number | null;
}

const inMonth = (iso: string, monthStart: Date) => {
  const d = new Date(iso);
  return d >= monthStart && d < startOfMonth(addDays(monthStart, 32));
};

// TODO backend: GET /api/finance/overview
export async function getFinanceOverview(sc: Scenario): Promise<FinanceOverview> {
  await latency();
  const w = getWorld(sc);
  const lastMonth = startOfMonth(subMonths(TODAY, 1));
  const prevMonth = startOfMonth(subMonths(TODAY, 2));
  const monthName = new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(lastMonth);
  const bper = w.conn('bank_bper');
  return {
    balance: mapAvail(w.bank, (b) => {
      // Saldo ricostruito all'indietro dai movimenti, una misura a settimana.
      const spark: number[] = [];
      let bal = b.total;
      for (let wk = 0; wk < 12; wk++) {
        spark.unshift(bal);
        const from = addDays(TODAY, -(wk + 1) * 7);
        const to = addDays(TODAY, -wk * 7);
        bal -= b.transactions.filter((t) => new Date(t.date) >= from && new Date(t.date) < to).reduce((a, t) => a + t.amount, 0);
      }
      return {
        value: b.total,
        previous: spark[spark.length - 5],
        spark,
        period: 'oggi, confronto con 4 settimane fa',
        source: w.src(b.accounts[0].id, 'acct:all'),
        note: b.missingAccounts.length ? `Manca ${b.missingAccounts.map((m) => m.name).join(', ')}` : `${b.accounts.length} conti`,
      };
    }),
    liquidity4w: mapAvail(w.cashflow, (weeks) => ({
      value: weeks[3].closingBase,
      previous: weeks[0].openingBalance,
      spark: weeks.slice(0, 5).map((x) => x.closingBase),
      period: `saldo previsto al ${dayShort(addDays(new Date(weeks[3].weekStart), 6))}, scenario base`,
      source: w.src('bank_intesa', 'cf:13w'),
      note: `Prudente: ${euro(weeks[3].closingPrudent)}`,
    })),
    overdue: mapAvail(w.invoices, (inv) => ({
      value: totalOverdue(inv),
      period: 'fatture emesse scadute e non incassate, a oggi',
      source: w.src('sdi', 'recv:overdue'),
      note: `${overdueByCustomer(inv).length} clienti`,
    })),
    revenueMonth: mapAvail(w.invoices, (inv) => {
      const sumNet = (m: Date) => inv.filter((i) => i.type === 'issued' && inMonth(i.issueDate, m)).reduce((a, i) => a + i.amount - i.vat, 0);
      return { value: sumNet(lastMonth), previous: sumNet(prevMonth), period: `fatture emesse a ${monthName}, IVA esclusa`, source: w.src('sdi', 'rev:month') };
    }),
    collectedMonth: mapAvail(w.bank, (b) => {
      const sumIn = (m: Date) => b.transactions.filter((t) => t.category === 'incasso' && inMonth(t.date, m)).reduce((a, t) => a + t.amount, 0);
      return { value: sumIn(lastMonth), previous: sumIn(prevMonth), period: `bonifici ricevuti dai clienti a ${monthName}`, source: w.src(b.accounts[0].id, 'tx:incassi') };
    }),
    concentration: mapAvail(w.invoices, (inv) => ({ ...concentration(inv), source: w.src('sdi', 'rev:customers', 'ultimi 120 giorni') })),
    bperConsentDays: bper.state === 'consent_expiring' && bper.consentExpiresAt ? differenceInCalendarDays(new Date(bper.consentExpiresAt), TODAY) : null,
  };
}

export interface CashflowView {
  weeks: CashflowWeek[];
  reserve: number;
  firstBelowPrudent?: CashflowWeek;
  firstBelowBase?: CashflowWeek;
  sources: SourceRef[];
}

// TODO backend: GET /api/cashflow?weeks=13
export async function getCashflow(sc: Scenario): Promise<Avail<CashflowView>> {
  await latency();
  const w = getWorld(sc);
  return mapAvail(w.cashflow, (weeks) => ({
    weeks,
    reserve: sc.reserve,
    firstBelowPrudent: firstBelowReserve(weeks, 'prudent'),
    firstBelowBase: firstBelowReserve(weeks, 'base'),
    sources: [w.src('bank_intesa', 'acct:all'), w.src('sdi')],
  }));
}

export interface ReceivablesView {
  total: number;
  aging: AgingBucket[];
  byCustomer: CustomerOverdue[];
  delays: CustomerDelay[];
  reminders: Insight[];
  source: SourceRef;
}

// TODO backend: GET /api/receivables
export async function getReceivables(sc: Scenario): Promise<Avail<ReceivablesView>> {
  await latency();
  const w = getWorld(sc);
  return mapAvail(w.invoices, (inv) => ({
    total: totalOverdue(inv),
    aging: agingBuckets(inv),
    byCustomer: overdueByCustomer(inv),
    delays: avgDelayByCustomer(inv),
    reminders: w.insights.filter((i) => i.suggestedAction?.kind === 'payment_reminder'),
    source: w.src('sdi', 'recv:overdue', 'fatture emesse, ultimi 120 giorni'),
  }));
}

// TODO backend: GET /api/invoices?type=&status=&from=&to=
export async function getInvoices(sc: Scenario): Promise<Avail<{ invoices: Invoice[]; source: SourceRef }>> {
  await latency();
  const w = getWorld(sc);
  return mapAvail(w.invoices, (invoices) => ({ invoices, source: { ...w.src('sdi'), label: 'Cassetto fiscale via SDI' } }));
}

export interface BankView extends BankData {
  sources: Record<string, SourceRef>;
  consent: { name: string; days: number }[];
  invoiceNumbers: Record<string, string>;
}

// TODO backend: GET /api/bank/accounts + GET /api/bank/transactions?days=90
export async function getBank(sc: Scenario): Promise<Avail<BankView>> {
  await latency();
  const w = getWorld(sc);
  const inv = w.invoices.status === 'ok' ? w.invoices.data : [];
  return mapAvail(w.bank, (b) => ({
    ...b,
    sources: Object.fromEntries(b.accounts.map((a) => [a.id, w.src(a.id, `acct:${a.id}`)])),
    consent: w.connectors
      .filter((c) => c.state === 'consent_expiring' && c.consentExpiresAt)
      .map((c) => ({ name: c.name, days: differenceInCalendarDays(new Date(c.consentExpiresAt as string), TODAY) })),
    invoiceNumbers: Object.fromEntries(inv.map((i) => [i.id, i.number])),
  }));
}

// ---------------------------------------------------------------- Inbox

export interface InboxView {
  mail: Avail<MailThread[]>;
  whatsapp: Avail<MailThread[]>;
  source: SourceRef;
}

// TODO backend: GET /api/inbox?days=7
export async function getInbox(sc: Scenario): Promise<InboxView> {
  await latency();
  const w = getWorld(sc);
  return { mail: w.threads, whatsapp: w.whatsapp, source: w.src('gmail', undefined, 'ultimi 7 giorni') };
}

// ---------------------------------------------------------------- Agenda

export interface MeetingPrep {
  eventId: string;
  counterparty: string;
  participants: string[];
  lastMails: MailThread[];
  openInvoices: Invoice[];
  pastDecisions: { meeting: string; date: string; decision: string }[];
}

export interface AgendaView {
  events: CalendarEvent[];
  weekStarts: string[]; // settimane disponibili: precedente, corrente, prossima
  proposals: Insight[];
  recovery: { date: string; score: number | null }[] | null; // solo titolare con Health
  prep: Record<string, MeetingPrep>;
  source: SourceRef;
}

// TODO backend: GET /api/calendar?from=&to=
export async function getAgenda(sc: Scenario): Promise<Avail<AgendaView>> {
  await latency();
  const w = getWorld(sc);
  return mapAvail(w.events, (events) => {
    const mails = w.threads.status === 'ok' ? w.threads.data : [];
    const inv = w.invoices.status === 'ok' ? w.invoices.data : [];
    const mts = w.meetings.status === 'ok' ? w.meetings.data : [];
    const prep: Record<string, MeetingPrep> = {};
    for (const e of events) {
      if (!e.external || !e.counterparty || new Date(e.start) < addDays(TODAY, 0)) continue;
      const key = e.counterparty.split(' ')[0].toLowerCase();
      prep[e.id] = {
        eventId: e.id,
        counterparty: e.counterparty,
        participants: e.participants,
        lastMails: mails.filter((m) => m.org?.toLowerCase().includes(key)).slice(0, 3),
        openInvoices: inv.filter((i) => i.counterparty.toLowerCase().includes(key) && i.amount - i.paid > 0),
        pastDecisions: mts
          .filter((m) => m.title.toLowerCase().includes(key))
          .flatMap((m) => m.decisions.map((d) => ({ meeting: m.title, date: m.date, decision: d }))),
      };
    }
    return {
      events,
      weekStarts: [-1, 0, 1].map((o) => addDays(WEEK_START, o * 7).toISOString()),
      proposals: w.agendaProposals,
      recovery: w.health?.status === 'ok' ? w.readiness.slice(-14).map((p) => ({ date: p.date, score: p.score })) : null,
      prep,
      source: w.src('gcal'),
    };
  });
}

export function weekStats(events: CalendarEvent[], weekStart: Date) {
  const week = events.filter((e) => new Date(e.start) >= weekStart && new Date(e.start) < addDays(weekStart, 7));
  let focus = 0;
  let over = 0;
  for (let i = 0; i < 5; i++) {
    const d = addDays(weekStart, i);
    focus += freeBlocks(week, d, 61).length;
    over += overlaps(week.filter((e) => isSameDay(new Date(e.start), d)));
  }
  return { total: weekMeetingHours(events, weekStart), strategic: strategicShare(week), focusBlocks: focus, overlaps: over, perDay: [0, 1, 2, 3, 4].map((i) => meetingHours(week, addDays(weekStart, i))) };
}

// ---------------------------------------------------------------- Riunioni, bandi, decisioni

// TODO backend: GET /api/meetings
export async function getMeetings(sc: Scenario): Promise<Avail<MeetingSummary[]>> {
  await latency();
  return getWorld(sc).meetings;
}

// TODO backend: GET /api/grants
export async function getGrants(sc: Scenario): Promise<Avail<{ grants: Grant[]; source: SourceRef }>> {
  await latency();
  const w = getWorld(sc);
  return mapAvail(w.grants, (grants) => ({ grants, source: w.src('grants') }));
}

export interface DecisionsView {
  decisions: Decision[];
  readiness: ReadinessSnapshot | null; // solo titolare con Health
  betterDay: string | null;
}

// TODO backend: GET /api/decisions
export async function getDecisions(sc: Scenario): Promise<DecisionsView> {
  await latency();
  const w = getWorld(sc);
  const hw2 = w.bridge.active.find((o) => o.rule === 'HW2');
  return {
    decisions: w.healthVisible ? decisions : decisions.map((d) => ({ ...d, readinessAtDecision: undefined })),
    readiness: w.readinessToday ?? null,
    betterDay: (hw2?.adjustment?.action.payload.toDay as string | undefined) ?? null,
  };
}

// ---------------------------------------------------------------- Salute e clinica

export interface HealthMetric {
  key: 'sleep' | 'hrv' | 'rhr' | 'steps';
  label: string;
  value: number | null;
  baseline: number | null;
  unit: string;
  lowerIsBetter?: boolean;
  note?: string;
}

export interface HealthView {
  snapshot: ReadinessSnapshot;
  metrics: HealthMetric[];
  chart: { date: string; meetingHours: number; mails: number; score: number | null; sleep: number | null }[];
  annotations: string[];
  adjusted: Insight[];
  escalationLevel: 0 | 1 | 2;
  checkup: { lastDate: string; nextDueDate: string };
  source: SourceRef;
}

export type Gated<T> = { gate: 'plan' } | { gate: 'role' } | { gate: null; data: T };

// TODO backend: GET /api/health/overview (area privata, solo titolare)
export async function getHealth(sc: Scenario): Promise<Gated<Avail<HealthView>>> {
  await latency();
  if (sc.role !== 'owner') return { gate: 'role' };
  if (sc.plan !== 'health') return { gate: 'plan' };
  const w = getWorld(sc);
  const h = w.health as Avail<import('@/types/domain').HealthDay[]>;
  return {
    gate: null,
    data: mapAvail(h, (days) => {
      const today = days[days.length - 1];
      const yesterday = days[days.length - 2];
      const base = w.readiness[w.readiness.length - 1]?.baseline ?? null;
      const stepsBase = base ? Math.round(median(days.slice(-29, -1).map((d) => d.steps).filter((s): s is number => s !== null))) : null;
      const last28 = days.slice(-28);
      const chart = last28.map((d) => {
        const wl = w.workload.find((x) => isSameDay(new Date(x.date), new Date(d.date)));
        const r = w.readiness.find((x) => x.date === d.date);
        return { date: d.date, meetingHours: wl?.meetingHours ?? 0, mails: wl?.mailsReceived ?? 0, score: r?.score ?? null, sleep: d.sleepHours };
      });
      const worst = [...chart]
        .filter((c) => c.sleep !== null && c.meetingHours >= 6)
        .sort((a, b) => b.meetingHours - (b.sleep as number) - (a.meetingHours - (a.sleep as number)))
        .slice(0, 2)
        .map((c) => `${dayShort(c.date)}: ${hours(c.meetingHours)} di riunioni, ${hours(c.sleep as number)} di sonno`);
      return {
        snapshot: w.readinessToday as ReadinessSnapshot,
        metrics: [
          { key: 'sleep', label: 'Sonno', value: today.sleepHours, baseline: base?.sleep ?? null, unit: 'h' },
          { key: 'hrv', label: 'HRV', value: today.hrvMs, baseline: base?.hrv ?? null, unit: 'ms' },
          { key: 'rhr', label: 'FC a riposo', value: today.restingHr, baseline: base?.restingHr ?? null, unit: 'bpm', lowerIsBetter: true },
          { key: 'steps', label: 'Passi', value: yesterday?.steps ?? null, baseline: stepsBase, unit: '', note: 'ieri' },
        ],
        chart,
        annotations: worst,
        adjusted: w.bridge.active.map((o) => o.insight),
        escalationLevel: w.bridge.escalationLevel,
        checkup: { lastDate: checkup.lastDate, nextDueDate: checkup.nextDueDate },
        source: w.src('wearable', 'night:today'),
      };
    }),
  };
}

export interface ClinicView {
  checkup: typeof checkup;
  clinicFirst: boolean;
  kmFromClinic: number;
  clinicAddress: string;
  centers: typeof bloodCenters;
  slots: ReturnType<typeof slots>;
  doctors: typeof doctors;
  reports: typeof reports;
  proposals: typeof proposals;
  teleconsult: { included: boolean; price: number; minutes: number };
  suggestConsult: boolean;
}

// TODO backend: GET /api/clinic (area privata, solo titolare)
export async function getClinic(sc: Scenario): Promise<Gated<ClinicView>> {
  await latency();
  if (sc.role !== 'owner') return { gate: 'role' };
  if (sc.plan !== 'health') return { gate: 'plan' };
  const w = getWorld(sc);
  return {
    gate: null,
    data: {
      checkup,
      clinicFirst: company.kmFromRivoli <= CLINIC_PRICING.clinicFirstChoiceKm,
      kmFromClinic: company.kmFromRivoli,
      clinicAddress,
      centers: bloodCenters,
      slots: slots(),
      doctors,
      reports,
      // Le proposte esistono solo dopo un check-up completato.
      proposals: checkup.lastDate ? proposals : [],
      teleconsult: { included: CLINIC_PRICING.teleconsultIncluded, price: CLINIC_PRICING.teleconsultPrice, minutes: CLINIC_PRICING.teleconsultMinutes },
      suggestConsult: w.bridge.escalationLevel >= 1,
    },
  };
}

export { RECEIVABLES };
