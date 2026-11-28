import { dateMedium, dayShort, euro, hours, time } from '@/lib/format';
import { overdueByCustomer } from '@/lib/rules/receivables';
import type { SourceRef } from '@/types/domain';
import { getWorld, type Scenario } from './world';

export interface SourceRecord {
  title: string;
  rows: [string, string][];
  href?: string;
  hrefLabel?: string;
  note?: string;
}

/**
 * Il "dato originale" dietro un numero: è quello che si apre cliccando una fonte.
 * Nel prodotto reale restituisce il record così come arriva dal connettore.
 */
// TODO backend: GET /api/sources/:connector/records/:recordId
export async function getSourceRecord(sc: Scenario, ref: SourceRef): Promise<SourceRecord> {
  await new Promise((r) => setTimeout(r, 250));
  const w = getWorld(sc);
  const [kind, id] = (ref.recordId ?? '').split(':');
  const inv = w.invoices.status === 'ok' ? w.invoices.data : [];

  if (kind === 'inv') {
    const i = inv.find((x) => x.id === id);
    if (i)
      return {
        title: `Fattura ${i.number}`,
        rows: [
          [i.type === 'issued' ? 'Cliente' : 'Fornitore', i.counterparty],
          ['Emessa il', dateMedium(i.issueDate)],
          ['Scadenza', dateMedium(i.dueDate)],
          ['Totale documento', euro(i.amount)],
          ['Di cui IVA', euro(i.vat)],
          ['Incassato / pagato', euro(i.paid)],
          ['Residuo', euro(i.amount - i.paid)],
        ],
        href: '/finanza/fatture',
        hrefLabel: 'Vai alle fatture',
      };
  }
  if (kind === 'recv') {
    return {
      title: 'Crediti scaduti per cliente',
      rows: overdueByCustomer(inv).map((o) => [o.customer, `${euro(o.amount)} · ${o.count} fatt. · ${o.avgDays} gg`]),
      href: '/finanza/incassi',
      hrefLabel: 'Vai agli incassi',
    };
  }
  if (kind === 'acct' && w.bank.status === 'ok') {
    return {
      title: 'Saldi dei conti',
      rows: w.bank.data.accounts.map((a) => [`${a.bank} · ${a.name}`, euro(a.balance)]),
      href: '/finanza/banca',
      hrefLabel: 'Vai alla banca',
      note: 'Sola lettura tramite PSD2: il sistema non può disporre pagamenti.',
    };
  }
  if (kind === 'cf' && w.cashflow.status === 'ok') {
    return {
      title: 'Liquidità prevista, prossime settimane',
      rows: w.cashflow.data.slice(0, 6).map((x) => [`Settimana del ${dayShort(x.weekStart)}`, `base ${euro(x.closingBase)} · prudente ${euro(x.closingPrudent)}`]),
      href: '/finanza/liquidita',
      hrefLabel: 'Vai alla liquidità',
      note: 'Calcolo: saldo attuale + incassi attesi − uscite attese. Prudente: incassi −20%, uscite +5%.',
    };
  }
  if (kind === 'mail' && w.threads.status === 'ok') {
    const t = w.threads.data.find((x) => x.id === id);
    if (t)
      return {
        title: t.subject,
        rows: [
          ['Da', `${t.from}${t.org ? ` · ${t.org}` : ''}`],
          ['Ricevuta', `${dayShort(t.receivedAt)}, ${time(t.receivedAt)}`],
          ['Messaggi nel thread', String(t.messages)],
          ['Testo', t.snippet],
        ],
        href: '/inbox',
        hrefLabel: 'Vai alla Inbox',
      };
  }
  if (kind === 'ev' && w.events.status === 'ok') {
    const e = w.events.data.find((x) => x.id === id);
    if (e)
      return {
        title: e.title,
        rows: [
          ['Quando', `${dayShort(e.start)}, ${time(e.start)}–${time(e.end)}`],
          ['Partecipanti', e.participants.join(', ') || 'Solo tu'],
          ['Categoria', e.category],
        ],
        href: '/agenda',
        hrefLabel: 'Vai all’agenda',
      };
  }
  if (kind === 'mtg' && w.meetings.status === 'ok') {
    const m = w.meetings.data.find((x) => x.id === id);
    if (m)
      return {
        title: m.title,
        rows: [
          ['Data', `${dayShort(m.date)}, ${time(m.date)}`],
          ['Partecipanti', m.participants.join(', ')],
          ['Riassunto', m.summary],
        ],
        href: '/riunioni',
        hrefLabel: 'Vai alle riunioni',
      };
  }
  if (kind === 'grant' && w.grants.status === 'ok') {
    const g = w.grants.data.find((x) => x.id === id);
    if (g)
      return {
        title: g.title,
        rows: [
          ['Ente', g.issuer],
          ['Scadenza', dateMedium(g.deadline)],
          ['Importo', g.amountRange],
          ['Fonte ufficiale', g.url],
        ],
        href: '/opportunita',
        hrefLabel: 'Vai alle opportunità',
        note: 'Nel prototipo il collegamento alla fonte ufficiale è un segnaposto.',
      };
  }
  if (kind === 'night' && w.health?.status === 'ok') {
    const d = w.health.data[w.health.data.length - 1];
    return {
      title: 'Notte appena trascorsa',
      rows: [
        ['Sonno', d.sleepHours !== null ? hours(d.sleepHours) : 'Non disponibile'],
        ['HRV', d.hrvMs !== null ? `${d.hrvMs} ms` : 'Non disponibile'],
        ['FC a riposo', d.restingHr !== null ? `${d.restingHr} bpm` : 'Non disponibile'],
      ],
      href: '/salute',
      hrefLabel: 'Vai a Salute',
      note: 'Confronto con i tuoi valori abituali. Non è una valutazione clinica.',
    };
  }
  if (kind === 'clinic') {
    return { title: 'Check-up Longevitas', rows: [['Ultimo check-up', dateMedium(ref.updatedAt)]], href: '/clinica', hrefLabel: 'Vai alla clinica' };
  }

  // Nessun record puntuale: mostro lo stato del connettore.
  const c = w.conn(ref.connector);
  return {
    title: c.name,
    rows: [
      ['Fonte', c.provider],
      ['Ultimo aggiornamento', c.lastSync ? `${dayShort(c.lastSync)}, ${time(c.lastSync)}` : 'Mai'],
      ['Cosa legge', c.reads.join(' · ')],
      ['Cosa non legge', c.doesNotRead.join(' · ')],
    ],
    href: '/connettori',
    hrefLabel: 'Vai ai connettori',
  };
}
