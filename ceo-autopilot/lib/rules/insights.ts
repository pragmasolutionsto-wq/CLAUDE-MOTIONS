import { differenceInCalendarDays, differenceInHours, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { RECEIVABLES } from '@/config/thresholds';
import type {
  CalendarEvent,
  CashflowWeek,
  ConnectorStatus,
  Grant,
  Insight,
  MailThread,
  MeetingSummary,
  SourceRef,
} from '@/types/domain';
import { euro } from '@/lib/format';
import { firstBelowReserve } from './cashflow';
import { score } from './priority';
import type { CustomerOverdue } from './receivables';

// Insight business: funzioni pure che trasformano i dati in "fatto → perché conta → cosa propongo".
// Qui non entra mai nessun dato di salute.

type Base = Omit<Insight, 'priorityScore' | 'reliability'> & { reliability?: number };
const finish = (i: Base, now: Date): Insight => ({ ...i, ...score(i, now) });
const dm = (iso: string) => format(new Date(iso), 'd MMMM', { locale: it });
const wdl = (iso: string) => format(new Date(iso), 'EEEE', { locale: it });

export function liquidityInsight(
  weeks: CashflowWeek[],
  reserve: number,
  sources: SourceRef[],
  now: Date,
  stale: boolean,
): Insight | null {
  const week = firstBelowReserve(weeks, 'prudent');
  if (!week) return null;
  const bigOut = [...week.items].filter((i) => i.kind === 'out').sort((a, b) => b.amount - a.amount).slice(0, 2);
  return finish(
    {
      id: 'ins-liquidity',
      domain: 'finance',
      title: `Liquidità sotto la riserva nella settimana del ${dm(week.weekStart)}`,
      observedFact: `Nello scenario prudente il saldo scende a ${euro(week.closingPrudent)}, sotto la riserva di ${euro(reserve)}. Pesano ${bigOut.map((o) => `${o.label.toLowerCase()} (${euro(o.amount)})`).join(' e ')}.`,
      hypothesis: stale ? undefined : 'Incassando lo scaduto prima di Natale resteresti sopra la riserva anche nello scenario prudente.',
      severity: 'high',
      // Con dati bancari vecchi l'affidabilità crolla: niente alert assertivi.
      confidence: stale ? 'low' : 'high',
      reliability: stale ? 30 : undefined,
      safetyRule: !stale,
      sources,
      dueAt: week.weekStart,
      href: '/finanza/liquidita',
      suggestedAction: {
        id: 'act-liquidity',
        kind: 'open_detail',
        label: 'Vedi le 13 settimane',
        requiresApproval: true,
        payload: { href: '/finanza/liquidita' },
      },
    },
    now,
  );
}

export function receivablesInsights(
  overdue: CustomerOverdue[],
  ranking: string[], // clienti ordinati per fatturato
  sources: SourceRef[],
  now: Date,
  minAmount: number = RECEIVABLES.minReminderAmount,
  hypotheses: Record<string, string> = {},
): Insight[] {
  const ordinal = ['primo', 'secondo', 'terzo', 'quarto', 'quinto'];
  return overdue
    .filter((o) => o.amount >= minAmount)
    .map((o, idx) => {
      const pos = ranking.indexOf(o.customer);
      const why = pos >= 0 && pos < ordinal.length ? ` È il tuo ${ordinal[pos]} cliente.` : '';
      const n = o.count === 1 ? '1 fattura scaduta' : `${o.count} fatture scadute`;
      const days = o.count === 1 ? `da ${o.avgDays} giorni` : `in media ${o.avgDays} giorni`;
      const numbers = o.invoices.map((i) => i.number).join(', ');
      return finish(
        {
          id: `ins-overdue-${slug(o.customer)}`,
          domain: 'sales',
          title: `${o.customer}: ${euro(o.amount)} scaduti`,
          observedFact: `${o.customer} ha ${n} per ${euro(o.amount)} (${days}).${why} Ti preparo un sollecito cortese?`,
          hypothesis: hypotheses[o.customer],
          severity: idx === 0 ? 'high' : 'medium',
          confidence: 'high',
          sources,
          dueAt: idx === 0 ? now.toISOString() : undefined,
          href: '/finanza/incassi',
          suggestedAction: {
            id: `act-reminder-${slug(o.customer)}`,
            kind: 'payment_reminder',
            label: 'Prepara il sollecito',
            requiresApproval: true,
            payload: {
              to: `Amministrazione ${o.customer}`,
              subject: `Fatture scadute: ${numbers}`,
              body: `Buongiorno,\n\nda un controllo dei nostri conti ${o.count === 1 ? 'risulta ancora aperta la fattura' : 'risultano ancora aperte le fatture'} ${numbers}, per un totale di ${euro(o.amount)}.\n\nVi chiediamo cortesemente di indicarci la data prevista per il pagamento. Se il bonifico è già partito, considerate superata questa mail.\n\nGrazie e buon lavoro,\nMarco Ferraris\nMeccanica Ferraris S.r.l.`,
            },
          },
        },
        now,
      );
    });
}

export function decisionEventInsights(events: CalendarEvent[], source: SourceRef, now: Date): Insight[] {
  return events
    .filter((e) => {
      if (!e.irreversibleDecision) return false;
      const h = differenceInHours(new Date(e.start), now);
      return h >= 0 && h <= 48;
    })
    .map((e) => {
      const when = differenceInCalendarDays(new Date(e.start), now) === 1 ? 'Domani' : capital(wdl(e.start));
      return finish(
        {
          id: `ins-decision-${e.id}`,
          domain: 'agenda',
          title: `${when}: ${lower(e.title)}`,
          observedFact: `È in agenda ${wdl(e.start)} alle ${format(new Date(e.start), 'HH:mm')} con ${e.counterparty ?? e.participants[0]}. È una decisione difficile da annullare e nella Decision Room hai ancora 3 informazioni mancanti.`,
          severity: 'high',
          confidence: 'high',
          sources: [{ ...source, recordId: `ev:${e.id}` }],
          dueAt: e.start,
          href: '/decision-room',
          suggestedAction: {
            id: `act-decision-${e.id}`,
            kind: 'open_detail',
            label: 'Apri la Decision Room',
            requiresApproval: true,
            payload: { href: '/decision-room', eventId: e.id },
          },
        },
        now,
      );
    });
}

const MAIL_META: Record<string, { severity: Insight['severity']; dueInDays?: number }> = {
  'mail-1': { severity: 'medium', dueInDays: 3 },
  'mail-2': { severity: 'medium', dueInDays: 3 },
  'mail-3': { severity: 'high', dueInDays: 2.2 },
  'mail-4': { severity: 'medium', dueInDays: 2 },
  'mail-5': { severity: 'medium', dueInDays: 3 },
};

export function mailInsights(threads: MailThread[], source: SourceRef, now: Date): Insight[] {
  return threads
    .filter((t) => t.bucket === 'todo' && t.draftReply)
    .map((t) => {
      const meta = MAIL_META[t.id] ?? { severity: 'medium' as const };
      return finish(
        {
          id: `ins-${t.id}`,
          domain: 'mail',
          title: `${t.org ?? t.from} · ${lower(t.subject)}`,
          observedFact: `${t.from} ti ha scritto ${rel(t.receivedAt, now)}: “${t.snippet}” Ho preparato una bozza di risposta.`,
          severity: meta.severity,
          confidence: 'medium',
          sources: [{ ...source, recordId: `mail:${t.id}` }],
          dueAt: meta.dueInDays ? new Date(now.getTime() + meta.dueInDays * 86_400_000).toISOString() : undefined,
          href: '/inbox',
          suggestedAction: {
            id: `act-${t.id}`,
            kind: 'draft_email',
            label: 'Rivedi la bozza',
            requiresApproval: true,
            payload: { to: `${t.from}${t.org ? ` · ${t.org}` : ''}`, subject: `Re: ${t.subject}`, body: t.draftReply, threadId: t.id },
          },
        },
        now,
      );
    });
}

export function overdueTasksInsight(meetings: MeetingSummary[], source: SourceRef, now: Date): Insight | null {
  const tasks = meetings.flatMap((m) => m.tasks.filter((t) => t.status === 'overdue').map((t) => ({ ...t, meeting: m.title })));
  if (tasks.length === 0) return null;
  const owners = [...new Set(tasks.map((t) => t.owner))];
  return finish(
    {
      id: 'ins-tasks',
      domain: 'meetings',
      title: `${tasks.length} compiti scaduti dalle riunioni`,
      observedFact: `${tasks.length} compiti assegnati in riunione sono scaduti (${owners.join(', ')}). Il più vecchio: “${tasks[0].text}”. Mando un promemoria?`,
      severity: 'low',
      confidence: 'high',
      sources: [source],
      href: '/riunioni',
      suggestedAction: {
        id: 'act-tasks',
        kind: 'draft_email',
        label: 'Prepara i promemoria',
        requiresApproval: true,
        payload: {
          to: owners.join(', '),
          subject: 'Promemoria: compiti dalle ultime riunioni',
          body: `Ciao,\n\nti ricordo i compiti rimasti aperti dalle ultime riunioni:\n\n${tasks.map((t) => `• ${t.owner}: ${t.text}`).join('\n')}\n\nMi aggiorni entro domani?\n\nMarco`,
        },
      },
    },
    now,
  );
}

export function grantInsight(grants: Grant[], source: SourceRef, now: Date): Insight | null {
  const open = grants.filter((g) => new Date(g.deadline) > now && g.fitScore >= 60).sort((a, b) => b.fitScore - a.fitScore);
  const g = open[0];
  if (!g) return null;
  const days = differenceInCalendarDays(new Date(g.deadline), now);
  return finish(
    {
      id: 'ins-grant',
      domain: 'grants',
      title: `Bando compatibile: ${lower(g.title)}`,
      observedFact: `${g.issuer}: ${lower(g.amountRange)}. Compatibilità stimata ${g.fitScore}/100, scade tra ${days} giorni. ${capital(g.fitReasons[2] ?? g.fitReasons[0])}.`,
      hypothesis: 'Il contributo potrebbe coprire parte del nuovo centro di lavoro. Va verificato con il consulente.',
      severity: 'low',
      confidence: 'medium',
      sources: [{ ...source, recordId: `grant:${g.id}` }],
      dueAt: g.deadline,
      href: '/opportunita',
    },
    now,
  );
}

export function consentInsights(connectors: ConnectorStatus[], now: Date): Insight[] {
  return connectors
    .filter((c) => c.state === 'consent_expiring' && c.consentExpiresAt)
    .map((c) => {
      const days = differenceInCalendarDays(new Date(c.consentExpiresAt as string), now);
      return finish(
        {
          id: `ins-consent-${c.id}`,
          domain: 'risk',
          title: `Consenso ${c.name} in scadenza tra ${days} giorni`,
          observedFact: `Il consenso PSD2 di ${c.name} scade il ${dm(c.consentExpiresAt as string)}. Senza rinnovo perdi saldi e movimenti di quel conto. Si rinnova in 1 minuto.`,
          severity: 'medium',
          confidence: 'high',
          sources: [{ connector: c.id, label: c.name, updatedAt: c.lastSync ?? now.toISOString() }],
          dueAt: c.consentExpiresAt,
          href: '/connettori',
        },
        now,
      );
    });
}

const rel = (iso: string, now: Date) => {
  const d = differenceInCalendarDays(now, new Date(iso));
  return d === 0 ? 'stamattina' : d === 1 ? 'ieri' : wdl(iso);
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
