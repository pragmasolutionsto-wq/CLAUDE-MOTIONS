'use client';

import { PriorityCard } from '@/components/briefing/PriorityCard';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Card, CardTitle, SectionTitle } from '@/components/ui/card';
import { getReceivables } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { euro } from '@/lib/format';

export default function ReceivablesPage() {
  const state = useData(getReceivables);
  return (
    <Loadable state={state}>
      {(a) => (
        <AvailGuard value={a} onRetry={state.reload}>
          {(v) => {
            const max = Math.max(...v.aging.map((b) => b.amount), 1);
            return (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardTitle>Da quanto tempo aspetti questi soldi?</CardTitle>
                    <p className="num mt-1 text-sm text-muted">
                      Crediti scaduti: <span className="font-semibold text-fg">{euro(v.total)}</span> da {v.byCustomer.length} clienti.
                    </p>
                    <ul className="mt-4 space-y-3">
                      {v.aging.map((b) => (
                        <li key={b.label}>
                          <div className="num flex justify-between text-sm">
                            <span>{b.label}</span>
                            <span>
                              {euro(b.amount)} <span className="text-muted">· {b.count} fatt.</span>
                            </span>
                          </div>
                          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-line" aria-hidden>
                            <div className="h-full rounded-full bg-warn" style={{ width: `${(b.amount / max) * 100}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <SourceBadge source={v.source} />
                    </div>
                  </Card>
                  <Card className="p-0 sm:p-0">
                    <div className="p-4 sm:p-5">
                      <CardTitle>Chi paga più in ritardo?</CardTitle>
                      <p className="text-sm text-muted">Giorni medi di ritardo sulla scadenza, fatture pagate e scadute.</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-y border-line text-left text-xs text-muted">
                          <th scope="col" className="px-4 py-2 font-medium">Cliente</th>
                          <th scope="col" className="px-3 py-2 text-right font-medium">Ritardo medio</th>
                          <th scope="col" className="px-4 py-2 text-right font-medium">Scaduto oggi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {v.delays.map((d) => {
                          const o = v.byCustomer.find((c) => c.customer === d.customer);
                          return (
                            <tr key={d.customer} className="border-b border-line last:border-0">
                              <th scope="row" className="px-4 py-2.5 text-left font-normal">{d.customer}</th>
                              <td className="px-3 text-right">{d.avgDelayDays} giorni</td>
                              <td className={`px-4 text-right ${o ? 'font-semibold' : 'text-muted'}`}>{o ? euro(o.amount) : 'Nessuno'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                </div>
                <section className="mt-6" aria-labelledby="solleciti">
                  <SectionTitle id="solleciti" className="mb-3">Solleciti proposti</SectionTitle>
                  {v.reminders.length === 0 ? (
                    <Card className="text-sm text-muted">Nessun credito scaduto sopra la soglia che hai impostato.</Card>
                  ) : (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {v.reminders.map((r) => (
                        <PriorityCard key={r.id} insight={r} compact />
                      ))}
                    </div>
                  )}
                </section>
              </>
            );
          }}
        </AvailGuard>
      )}
    </Loadable>
  );
}
