'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Sheet } from '@/components/ui/sheet';
import { PrivateBadge } from '@/components/shared/PrivateBadge';
import type { Approval } from '@/lib/data/api';
import { useApp } from '@/lib/store';
import { useUi } from '@/lib/ui-store';

/** Approvazioni in attesa: bozze, solleciti, spostamenti. Una per una oppure in blocco, sempre con conferma. */
export function Approvals({ approvals, others = 0 }: { approvals: Approval[]; others?: number }) {
  const actions = useApp((s) => s.actions);
  const setAction = useApp((s) => s.setAction);
  const openAction = useUi((s) => s.openAction);
  const [bulk, setBulk] = useState(false);
  const pending = approvals.filter((a) => !actions[a.action.id] && a.action.kind !== 'book_checkup');
  const done = approvals.filter((a) => actions[a.action.id] === 'approved').length;

  return (
    <section aria-labelledby="approvazioni">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SectionTitle id="approvazioni">Approvazioni in attesa · {pending.length}</SectionTitle>
        {pending.length > 1 ? (
          <Button size="sm" onClick={() => setBulk(true)}>
            <CheckCheck size={15} aria-hidden /> Approva tutte
          </Button>
        ) : null}
      </div>
      {pending.length === 0 ? (
        <Card className="text-sm text-muted">
          Niente da approvare.{done ? ` Oggi hai approvato ${done} ${done === 1 ? 'azione' : 'azioni'}.` : ''}
        </Card>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-card">
          {pending.map(({ action, insight }) => (
            <li key={action.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1 basis-56">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {action.label}
                  {insight.domain === 'health' ? <PrivateBadge /> : null}
                </p>
                <p className="truncate text-sm text-muted">{insight.title}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => openAction(action, insight, 'review')}>
                  Rivedi
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAction(action.id, 'ignored')}>
                  Ignora
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {others > 0 ? (
        <p className="mt-2 text-sm text-muted">
          Altre {others} bozze pronte ti aspettano in{' '}
          <Link href="/inbox" className="text-gold-fg underline underline-offset-4">Inbox</Link> e{' '}
          <Link href="/finanza/incassi" className="text-gold-fg underline underline-offset-4">Incassi</Link>, senza fretta.
        </p>
      ) : null}
      <Sheet open={bulk} onOpenChange={setBulk} variant="center" title={`Approvare ${pending.length} azioni?`} description="Partono tutte adesso, così come sono state proposte.">
        <ul className="mb-4 space-y-1 text-sm">
          {pending.map(({ action, insight }) => (
            <li key={action.id} className="rounded-lg border border-line px-3 py-2">
              <span className="font-semibold">{action.label}</span>
              <span className="block text-muted">{insight.title}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => {
              pending.forEach((p) => setAction(p.action.id, 'approved'));
              setBulk(false);
            }}
          >
            Sì, approva tutte
          </Button>
          <Button onClick={() => setBulk(false)}>Annulla</Button>
        </div>
      </Sheet>
    </section>
  );
}
