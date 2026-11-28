'use client';

import { Sheet } from '@/components/ui/sheet';
import type { MeetingPrep } from '@/lib/data/api';
import { dayShort, euro, time } from '@/lib/format';
import type { CalendarEvent } from '@/types/domain';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1.5 text-xs font-semibold tracking-wider text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

/** "Prepara la riunione": chi c'è, ultime mail, fatture aperte e decisioni passate con quella controparte. */
export function MeetingPrepSheet({ event, prep, onClose }: { event: CalendarEvent; prep: MeetingPrep; onClose: () => void }) {
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title="Prepara la riunione" description={`${event.title} · ${dayShort(event.start)}, ${time(event.start)}`}>
      <Block title="Chi c’è">
        <p className="text-sm">{prep.participants.join(', ') || 'Solo tu'}</p>
      </Block>
      <Block title="Ultime mail">
        {prep.lastMails.length === 0 ? (
          <p className="text-sm text-muted">Nessuna mail recente con {prep.counterparty}.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {prep.lastMails.map((m) => (
              <li key={m.id} className="rounded-lg border border-line p-3">
                <p className="font-semibold">{m.subject}</p>
                <p className="text-muted">{m.snippet}</p>
              </li>
            ))}
          </ul>
        )}
      </Block>
      <Block title="Fatture aperte">
        {prep.openInvoices.length === 0 ? (
          <p className="text-sm text-muted">Nessuna fattura aperta con {prep.counterparty}.</p>
        ) : (
          <ul className="num divide-y divide-line text-sm">
            {prep.openInvoices.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-1.5">
                <span>
                  Fatt. {i.number}
                  {i.daysOverdue ? <span className="text-alert-fg"> · scaduta da {i.daysOverdue} giorni</span> : null}
                </span>
                <span>{euro(i.amount - i.paid)}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>
      <Block title="Decisioni passate">
        {prep.pastDecisions.length === 0 ? (
          <p className="text-sm text-muted">Nessuna decisione registrata nelle riunioni precedenti.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {prep.pastDecisions.map((d, i) => (
              <li key={i}>
                {d.decision} <span className="text-muted">· {dayShort(d.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>
    </Sheet>
  );
}
