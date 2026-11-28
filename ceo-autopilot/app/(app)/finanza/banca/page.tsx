'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Link2, TriangleAlert } from 'lucide-react';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { MissingData } from '@/components/shared/MissingData';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Badge } from '@/components/ui/badge';
import { Button, buttonClass } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { getBank, type BankView } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { dayShort, euro } from '@/lib/format';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'matched' | 'unmatched';

function Content({ b }: { b: BankView }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [limit, setLimit] = useState(25);
  const needsMatch = (t: BankView['transactions'][number]) => !t.invoiceId && (t.category === 'incasso' || t.category === 'fornitore' || t.category === 'altro');
  const rows = b.transactions.filter((t) => (filter === 'all' ? true : filter === 'matched' ? !!t.invoiceId : needsMatch(t)));
  const unmatched = b.transactions.filter(needsMatch).length;
  return (
    <>
      {b.consent.map((c) => (
        <div key={c.name} role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-warn/50 bg-warn/10 px-4 py-3 text-sm">
          <TriangleAlert size={18} className="text-warn-fg" aria-hidden />
          <p className="min-w-0 flex-1">
            Il consenso PSD2 di {c.name} scade tra {c.days} giorni. Rinnovalo in 1 minuto.
          </p>
          <Link href="/connettori" className={buttonClass('secondary', 'sm')}>
            Rinnova
          </Link>
        </div>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        {b.accounts.map((a) => (
          <Card key={a.id}>
            <p className="text-sm text-muted">
              {a.bank} · {a.name}
            </p>
            <p className="num mt-1 font-serif text-2xl font-semibold">{euro(a.balance)}</p>
            <p className="num text-xs text-muted">{a.ibanMasked}</p>
            {a.creditLine ? (
              <p className="num mt-2 text-sm">
                Fido {euro(a.creditLine)} · utilizzato {euro(a.creditUsed ?? 0)}
              </p>
            ) : null}
            <div className="mt-3">
              <SourceBadge source={b.sources[a.id]} />
            </div>
          </Card>
        ))}
        {b.missingAccounts.map((m) => (
          <Card key={m.id}>
            <p className="mb-2 text-sm text-muted">{m.name}</p>
            <MissingData compact reason="Banca non collegata" cta="Collega la banca" />
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-0 sm:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <div>
            <CardTitle>Movimenti degli ultimi 90 giorni</CardTitle>
            <p className="num text-sm text-muted">
              {unmatched} movimenti da abbinare a una fattura. L’abbinamento è una proposta: lo confermi tu.
            </p>
          </div>
          <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Filtro riconciliazione">
            {(['all', 'matched', 'unmatched'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn('h-9 rounded-md px-3 text-sm', filter === f ? 'bg-fg/10 font-semibold' : 'text-muted hover:text-fg')}
              >
                {f === 'all' ? 'Tutti' : f === 'matched' ? 'Abbinati' : 'Da abbinare'}
              </button>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-line border-t border-line">
          {rows.slice(0, limit).map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
              <span className="num w-20 shrink-0 text-xs text-muted">{dayShort(t.date)}</span>
              <span className="min-w-0 flex-1 basis-48">
                <span className="block truncate">{t.description}</span>
                <span className="text-xs text-muted">{b.accounts.find((a) => a.id === t.accountId)?.bank}</span>
              </span>
              {t.invoiceId ? (
                <Badge tone="ok">
                  <Link2 size={11} aria-hidden /> Abbinato{b.invoiceNumbers[t.invoiceId] ? ` · ${b.invoiceNumbers[t.invoiceId]}` : ''}
                </Badge>
              ) : needsMatch(t) ? (
                <Badge tone="warn">Da abbinare</Badge>
              ) : null}
              <span className={cn('num w-28 text-right font-medium', t.amount > 0 && 'text-ok-fg')}>
                {t.amount > 0 ? '+ ' : ''}
                {euro(t.amount, Math.abs(t.amount) < 1000)}
              </span>
            </li>
          ))}
        </ul>
        {rows.length > limit ? (
          <div className="border-t border-line p-3 text-center">
            <Button size="sm" onClick={() => setLimit((l) => l + 25)}>
              Mostra altri 25
            </Button>
          </div>
        ) : null}
      </Card>
    </>
  );
}

export default function BankPage() {
  const state = useData(getBank);
  return (
    <Loadable state={state}>
      {(a) => (
        <AvailGuard value={a} onRetry={state.reload} explain="La banca si collega in sola lettura tramite PSD2: il sistema vede saldi e movimenti, non può disporre pagamenti.">
          {(b) => <Content b={b} />}
        </AvailGuard>
      )}
    </Loadable>
  );
}
