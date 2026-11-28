'use client';

import { Fragment, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CashflowChart } from '@/components/finance/CashflowChart';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { SourceList } from '@/components/shared/SourceBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';
import { getCashflow, type CashflowView } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { dayMonth, euro } from '@/lib/format';
import { minClosing } from '@/lib/rules/cashflow';
import { cn } from '@/lib/utils';

type Scenario = 'both' | 'base' | 'prudent';

function Content({ v, stale }: { v: CashflowView; stale: boolean }) {
  const [scenario, setScenario] = useState<Scenario>('both');
  const [open, setOpen] = useState<string | null>(null);
  const below = v.firstBelowPrudent;
  const belowCount = v.weeks.filter((w) => w.belowReserve).length;
  const message = v.firstBelowBase
    ? `Nella settimana del ${dayMonth(v.firstBelowBase.weekStart)} anche lo scenario base scende sotto la riserva di ${euro(v.reserve)}.`
    : below
      ? `Nella settimana del ${dayMonth(below.weekStart)} lo scenario prudente scende sotto la riserva di ${euro(v.reserve)}.`
      : `Nelle prossime 13 settimane resti sopra la riserva di ${euro(v.reserve)} in entrambi gli scenari.`;
  return (
    <>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Avrai abbastanza liquidità nelle prossime 13 settimane?</CardTitle>
            <p className={cn('num mt-1 text-sm', below && !stale ? 'font-semibold text-alert-fg' : 'text-muted')}>
              {stale ? 'Con i dati bancari non aggiornati la previsione è solo indicativa. ' : ''}
              {message}
            </p>
          </div>
          <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Scenario">
            {(['both', 'base', 'prudent'] as Scenario[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={scenario === s}
                onClick={() => setScenario(s)}
                className={cn('h-9 rounded-md px-3 text-sm', scenario === s ? 'bg-fg/10 font-semibold' : 'text-muted hover:text-fg')}
              >
                {s === 'both' ? 'Entrambi' : s === 'base' ? 'Base' : 'Prudente'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-info" aria-hidden /> Base: incassi e uscite attesi</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-gold" aria-hidden /> Prudente: incassi −20%, uscite +5%</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-alert" aria-hidden /> Settimana sotto riserva</span>
        </div>
        <div className="mt-3">
          <CashflowChart weeks={v.weeks} reserve={v.reserve} scenario={scenario} />
        </div>
        <p className="num mt-3 text-sm text-muted">
          In sintesi: parti da {euro(v.weeks[0].openingBalance)}. Il punto più basso è {euro(minClosing(v.weeks, 'base'))} nello scenario base e{' '}
          {euro(minClosing(v.weeks, 'prudent'))} nel prudente. Settimane sotto riserva nello scenario prudente: {belowCount} su {v.weeks.length}.
        </p>
        <SourceList sources={v.sources} className="mt-3" />
      </Card>

      <Card className="mt-4 p-0 sm:p-0">
        <div className="p-4 sm:p-5">
          <CardTitle>Settimana per settimana</CardTitle>
          <p className="text-sm text-muted">Tocca una settimana per vedere le voci. Qui entrano solo incassi e pagamenti, non il fatturato.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-line text-left text-xs text-muted">
                <th scope="col" className="px-4 py-2 font-medium">Settimana del</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Incassi attesi</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Uscite attese</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Saldo base</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">Saldo prudente</th>
              </tr>
            </thead>
            <tbody>
              {v.weeks.map((w) => {
                const isOpen = open === w.weekStart;
                return (
                  <Fragment key={w.weekStart}>
                    <tr className={cn('border-b border-line', w.belowReserve && 'bg-alert/10')}>
                      <th scope="row" className="px-4 py-0 text-left font-normal">
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : w.weekStart)}
                          aria-expanded={isOpen}
                          className="flex h-11 items-center gap-2"
                        >
                          <ChevronDown size={15} className={cn('text-muted transition-transform', isOpen && 'rotate-180')} aria-hidden />
                          {dayMonth(w.weekStart)}
                          {w.belowReserve ? <Badge tone="alert">Sotto riserva</Badge> : null}
                        </button>
                      </th>
                      <td className="px-3 text-right text-ok-fg">{euro(w.expectedIn)}</td>
                      <td className="px-3 text-right">{euro(w.expectedOut)}</td>
                      <td className={cn('px-3 text-right', scenario !== 'prudent' && 'font-semibold')}>{euro(w.closingBase)}</td>
                      <td className={cn('px-4 text-right', scenario !== 'base' && 'font-semibold', w.belowReserve && 'text-alert-fg')}>{euro(w.closingPrudent)}</td>
                    </tr>
                    {isOpen ? (
                      <tr className="border-b border-line bg-surface">
                        <td colSpan={5} className="px-4 py-3">
                          {w.items.length === 0 ? (
                            <p className="text-muted">Nessuna voce prevista.</p>
                          ) : (
                            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                              {w.items.map((i, idx) => (
                                <li key={idx} className="flex justify-between gap-3">
                                  <span className="min-w-0 truncate">
                                    {i.label}
                                    {i.estimated ? <span className="text-muted"> · stima</span> : null}
                                  </span>
                                  <span className={i.kind === 'in' ? 'text-ok-fg' : ''}>
                                    {i.kind === 'in' ? '+' : '−'} {euro(i.amount).replace('€ ', '€ ')}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export default function LiquidityPage() {
  const state = useData(getCashflow);
  return (
    <Loadable state={state}>
      {(a) => (
        <AvailGuard value={a} onRetry={state.reload} explain="Per la previsione servono i saldi dei conti e le fatture con le scadenze. Senza, non stimo nulla.">
          {(v, stale) => <Content v={v} stale={stale} />}
        </AvailGuard>
      )}
    </Loadable>
  );
}
