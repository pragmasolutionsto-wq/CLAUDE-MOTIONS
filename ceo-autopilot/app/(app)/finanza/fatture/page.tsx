'use client';

import { useMemo, useState } from 'react';
import { COPY } from '@/config/copy';
import { DEMO_NOW } from '@/config/demo';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Badge, type Tone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { inputClass } from '@/components/ui/misc';
import { getInvoices } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { dateMedium, euro } from '@/lib/format';
import { useUi } from '@/lib/ui-store';
import type { Invoice, SourceRef } from '@/types/domain';

const STATUS: Record<Invoice['status'], { label: string; tone: Tone }> = {
  paid: { label: 'Pagata', tone: 'ok' },
  open: { label: 'Aperta', tone: 'neutral' },
  overdue: { label: 'Scaduta', tone: 'alert' },
  partial: { label: 'Parziale', tone: 'warn' },
};

function Table({ invoices, source }: { invoices: Invoice[]; source: SourceRef }) {
  const [type, setType] = useState<'all' | Invoice['type']>('all');
  const [status, setStatus] = useState<'all' | Invoice['status']>('all');
  const [party, setParty] = useState('all');
  const [days, setDays] = useState(120);
  const [limit, setLimit] = useState(20);
  const openSource = useUi((s) => s.openSource);
  const parties = useMemo(() => [...new Set(invoices.map((i) => i.counterparty))].sort(), [invoices]);
  const rows = invoices.filter(
    (i) =>
      (type === 'all' || i.type === type) &&
      (status === 'all' || i.status === status) &&
      (party === 'all' || i.counterparty === party) &&
      DEMO_NOW.getTime() - new Date(i.issueDate).getTime() <= days * 86_400_000 * 1.1,
  );
  const select = `${inputClass} h-10 text-sm`;
  return (
    <>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select className={select} aria-label="Tipo" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="all">Emesse e ricevute</option>
          <option value="issued">Emesse</option>
          <option value="received">Ricevute</option>
        </select>
        <select className={select} aria-label="Stato" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">Tutti gli stati</option>
          <option value="open">Aperte</option>
          <option value="overdue">Scadute</option>
          <option value="partial">Parziali</option>
          <option value="paid">Pagate</option>
        </select>
        <select className={select} aria-label="Cliente o fornitore" value={party} onChange={(e) => setParty(e.target.value)}>
          <option value="all">Tutte le controparti</option>
          {parties.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select className={select} aria-label="Periodo" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={30}>Ultimi 30 giorni</option>
          <option value={60}>Ultimi 60 giorni</option>
          <option value={120}>Ultimi 120 giorni</option>
        </select>
      </div>
      <Card className="p-0 sm:p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <p className="num text-sm text-muted" role="status">
            {rows.length} fatture · totale {euro(rows.reduce((a, i) => a + i.amount, 0))}
          </p>
          <SourceBadge source={source} />
        </div>
        {rows.length === 0 ? (
          <p className="border-t border-line px-4 py-8 text-center text-sm text-muted">Nessuna fattura con questi filtri. Prova ad allargare il periodo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-y border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-2 font-medium">Numero</th>
                  <th scope="col" className="px-3 py-2 font-medium">Controparte</th>
                  <th scope="col" className="px-3 py-2 font-medium">Emessa</th>
                  <th scope="col" className="px-3 py-2 font-medium">Scadenza</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Totale</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Residuo</th>
                  <th scope="col" className="px-4 py-2 font-medium">Stato</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, limit).map((i) => (
                  <tr key={i.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        className="text-left underline decoration-line decoration-dotted underline-offset-4"
                        onClick={() => openSource({ ...source, recordId: `inv:${i.id}` })}
                      >
                        {i.number}
                      </button>
                      <span className="block text-xs text-muted">{i.type === 'issued' ? 'Emessa' : 'Ricevuta'}</span>
                    </td>
                    <td className="px-3">{i.counterparty}</td>
                    <td className="px-3 whitespace-nowrap">{dateMedium(i.issueDate)}</td>
                    <td className="px-3 whitespace-nowrap">{dateMedium(i.dueDate)}</td>
                    <td className="px-3 text-right">{euro(i.amount)}</td>
                    <td className="px-3 text-right">{i.amount - i.paid > 0 ? euro(i.amount - i.paid) : '€ 0'}</td>
                    <td className="px-4">
                      <Badge tone={STATUS[i.status].tone}>
                        {STATUS[i.status].label}
                        {i.daysOverdue ? ` · ${i.daysOverdue} gg` : ''}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows.length > limit ? (
          <div className="border-t border-line p-3 text-center">
            <Button size="sm" onClick={() => setLimit((l) => l + 20)}>
              Mostra altre 20
            </Button>
          </div>
        ) : null}
      </Card>
      <p className="mt-3 max-w-prose text-sm text-muted">{COPY.invoices.note}</p>
    </>
  );
}

export default function InvoicesPage() {
  const state = useData(getInvoices);
  return (
    <Loadable state={state}>
      {(a) => (
        <AvailGuard value={a} onRetry={state.reload} explain="Le fatture arrivano dal cassetto fiscale tramite SDI, con una tua delega. Funziona con qualunque gestionale.">
          {(v) => <Table invoices={v.invoices} source={v.source} />}
        </AvailGuard>
      )}
    </Loadable>
  );
}
