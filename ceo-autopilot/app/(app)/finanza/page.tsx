'use client';

import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { COPY } from '@/config/copy';
import { RECEIVABLES } from '@/config/thresholds';
import { KpiTile } from '@/components/shared/KpiTile';
import { Loadable, PageSkeleton } from '@/components/shared/Loadable';
import { MissingData } from '@/components/shared/MissingData';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { getFinanceOverview } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { percent } from '@/lib/format';

export default function FinancePage() {
  const state = useData(getFinanceOverview);
  return (
    <Loadable state={state} skeleton={<PageSkeleton tiles={6} rows={1} />}>
      {(f) => (
        <>
          {f.bperConsentDays !== null ? (
            <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-warn/50 bg-warn/10 px-4 py-3 text-sm">
              <TriangleAlert size={18} className="text-warn-fg" aria-hidden />
              <p className="min-w-0 flex-1">
                Il consenso PSD2 di BPER scade tra {f.bperConsentDays} giorni. Rinnovalo in 1 minuto.
              </p>
              <Link href="/connettori" className={buttonClass('secondary', 'sm')}>
                Rinnova
              </Link>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <KpiTile label="Saldo totale dei conti" kpi={f.balance} />
            <KpiTile label="Liquidità a 4 settimane" kpi={f.liquidity4w} />
            <KpiTile label="Crediti scaduti" kpi={f.overdue} upIsBad />
            <KpiTile label="Fatturato del mese" kpi={f.revenueMonth} tag="Fatturato" accent="text-info-fg" />
            <KpiTile label="Incassato del mese" kpi={f.collectedMonth} tag="Incassato" accent="text-ok-fg" />
            <Card className="flex flex-col gap-2">
              <p className="text-sm text-muted">Concentrazione clienti</p>
              {f.concentration.status === 'missing' ? (
                <MissingData compact reason={f.concentration.reason} cta={f.concentration.cta} />
              ) : (
                <>
                  <p className="num font-serif text-2xl leading-none font-semibold">{percent(f.concentration.data.share, 0)}</p>
                  <p className="text-xs text-muted">quota dei primi 3 clienti sul fatturato, ultimi 120 giorni</p>
                  <ul className="space-y-1 text-sm">
                    {f.concentration.data.top.map((t) => (
                      <li key={t.customer} className="flex justify-between gap-2">
                        <span className="truncate">{t.customer}</span>
                        <span className="num text-muted">{percent(t.share, 0)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    <SourceBadge source={f.concentration.data.source} />
                    {f.concentration.data.share > RECEIVABLES.concentrationWarn ? <Badge tone="warn">Dipendenza alta</Badge> : null}
                    {f.concentration.stale ? <Badge tone="warn">{COPY.staleBadge}</Badge> : null}
                  </div>
                </>
              )}
            </Card>
          </div>
          <Card className="mt-4">
            <CardTitle>Fatturato e incassato non sono la stessa cosa</CardTitle>
            <p className="mt-1 max-w-prose text-sm text-muted">
              Il <span className="font-semibold text-info-fg">fatturato</span> sono le fatture che hai emesso. L’
              <span className="font-semibold text-ok-fg">incassato</span> sono i soldi arrivati davvero in banca. La
              liquidità si calcola solo sugli incassi.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/finanza/liquidita" className={buttonClass('primary', 'sm')}>
                Liquidità a 13 settimane
              </Link>
              <Link href="/finanza/incassi" className={buttonClass('secondary', 'sm')}>
                Chi ti deve dei soldi
              </Link>
            </div>
          </Card>
        </>
      )}
    </Loadable>
  );
}
