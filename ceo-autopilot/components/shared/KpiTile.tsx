import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { COPY } from '@/config/copy';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Kpi } from '@/lib/data/api';
import { euro, percent } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Avail } from '@/types/domain';
import { MissingData } from './MissingData';
import { SourceBadge } from './SourceBadge';
import { Sparkline } from './Sparkline';

interface Props {
  label: string;
  kpi: Avail<Kpi>;
  /** true se un aumento è una cattiva notizia (es. crediti scaduti). */
  upIsBad?: boolean;
  format?: (v: number) => string;
  accent?: string; // classe colore del valore, per distinguere fatturato e incassato
  tag?: string;
}

/** Valore grande, variazione sul periodo precedente, andamento, fonte. Se manca il dato lo dice. */
export function KpiTile({ label, kpi, upIsBad, format = (v) => euro(v), accent, tag }: Props) {
  if (kpi.status === 'missing') {
    return (
      <Card className="flex flex-col gap-2">
        <p className="text-sm text-muted">{label}</p>
        <MissingData compact reason={kpi.reason} cta={kpi.cta} />
      </Card>
    );
  }
  const k = kpi.data;
  const delta = k.previous ? (k.value - k.previous) / Math.abs(k.previous) : null;
  const good = delta === null ? null : upIsBad ? delta <= 0 : delta >= 0;
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted">{label}</p>
        {tag ? <Badge tone="neutral">{tag}</Badge> : null}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className={cn('num font-serif text-2xl leading-none font-semibold', accent)}>{format(k.value)}</p>
        {k.spark ? <Sparkline values={k.spark} className="h-7 w-20 text-muted" /> : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {delta !== null ? (
          <span className={cn('num inline-flex items-center gap-0.5 font-medium', good ? 'text-ok-fg' : 'text-alert-fg')}>
            {delta >= 0 ? <ArrowUpRight size={14} aria-hidden /> : <ArrowDownRight size={14} aria-hidden />}
            {delta >= 0 ? '+' : '−'}
            {percent(Math.abs(delta))}
          </span>
        ) : null}
        <span>{k.period}</span>
      </div>
      {k.note ? <p className="num text-xs text-muted">{k.note}</p> : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <SourceBadge source={k.source} />
        {kpi.stale ? <Badge tone="warn">{COPY.staleBadge}</Badge> : null}
      </div>
    </Card>
  );
}
