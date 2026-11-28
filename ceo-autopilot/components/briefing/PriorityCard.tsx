'use client';

import Link from 'next/link';
import { Check, HeartPulse, Undo2 } from 'lucide-react';
import { COPY } from '@/config/copy';
import { Badge } from '@/components/ui/badge';
import { Button, buttonClass } from '@/components/ui/button';
import { Tip } from '@/components/ui/misc';
import { DOMAIN_META, SEVERITY_META } from '@/components/shared/domain';
import { PrivateBadge } from '@/components/shared/PrivateBadge';
import { SourceList } from '@/components/shared/SourceBadge';
import { useApp } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import { cn } from '@/lib/utils';
import type { Insight } from '@/types/domain';

interface Props {
  insight: Insight;
  index?: number; // posizione nel briefing (1, 2, 3)
  compact?: boolean;
}

/**
 * Priorità del briefing: fatto osservato → perché conta → azione proposta.
 * Nessuna azione parte da qui: "Approva" apre la revisione con conferma esplicita.
 */
export function PriorityCard({ insight, index, compact }: Props) {
  const action = insight.suggestedAction;
  const status = useApp((s) => (action ? s.actions[action.id] : undefined));
  const ignoredInsight = useApp((s) => s.actions[`ignore-${insight.id}`]);
  const setAction = useApp((s) => s.setAction);
  const openAction = useUi((s) => s.openAction);
  const meta = DOMAIN_META[insight.domain];
  const Icon = meta.icon;
  const personal = insight.domain === 'health';
  const ignored = status === 'ignored' || ignoredInsight === 'ignored';
  const detailOnly = !action || action.kind === 'open_detail' || action.kind === 'book_checkup';
  const detailHref = (action?.kind === 'book_checkup' ? '/clinica' : (action?.payload.href as string | undefined)) ?? insight.href;

  if (ignored) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">
        <span className="min-w-0 truncate">Ignorata: {insight.title}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (action) setAction(action.id, null);
            setAction(`ignore-${insight.id}`, null);
          }}
        >
          <Undo2 size={14} aria-hidden /> Ripristina
        </Button>
      </div>
    );
  }

  return (
    <article
      className={cn(
        'rounded-xl border bg-card p-4 sm:p-5',
        personal ? 'border-vital/50' : insight.severity === 'high' ? 'border-line border-l-4 border-l-alert' : 'border-line',
      )}
      aria-label={insight.title}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            personal ? 'bg-vital/15 text-vital-fg' : 'bg-fg/5 text-muted',
          )}
        >
          <Icon size={16} aria-hidden />
        </span>
        <span className="text-xs font-semibold tracking-wider text-muted uppercase">
          {index ? `${index} · ` : ''}
          {meta.label}
        </span>
        {personal ? <PrivateBadge /> : <Badge tone={SEVERITY_META[insight.severity].tone}>{SEVERITY_META[insight.severity].label}</Badge>}
        {insight.healthAdjusted && !personal ? (
          <Tip content={insight.healthReason ?? 'Il tuo recupero di oggi ha cambiato la tempistica proposta.'}>
            <button type="button" className="rounded-full">
              <Badge tone="vital">
                <HeartPulse size={11} aria-hidden />
                {COPY.healthAdjustedChip}
              </Badge>
            </button>
          </Tip>
        ) : null}
      </div>

      <h3 className={cn('mt-3 font-semibold', compact ? 'text-base' : 'text-lg leading-snug')}>{insight.title}</h3>
      <p className="num mt-1 text-sm text-fg/90">{insight.observedFact}</p>
      {insight.hypothesis ? (
        <p className="mt-2 text-sm text-muted">
          <span className="font-semibold">{COPY.hypothesis}:</span> {insight.hypothesis}
        </p>
      ) : null}
      {personal && insight.healthReason ? <p className="mt-2 text-sm text-muted">Perché: {insight.healthReason}</p> : null}
      {insight.healthAdjusted && !personal && insight.healthReason ? (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-vital-fg">
          <HeartPulse size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            {insight.healthReason} <span className="text-muted">(lo vedi solo tu)</span>
          </span>
        </p>
      ) : null}

      <SourceList sources={insight.sources} className="mt-3" />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status === 'approved' ? (
          <>
            <Badge tone="ok">
              <Check size={12} aria-hidden /> Approvata
            </Badge>
            <Button size="sm" variant="ghost" onClick={() => action && setAction(action.id, null)}>
              Annulla
            </Button>
          </>
        ) : detailOnly ? (
          <>
            {detailHref ? (
              <Link href={detailHref} className={buttonClass(personal ? 'vital' : 'primary', 'sm')}>
                {action?.label ?? 'Vedi dettaglio'}
              </Link>
            ) : null}
            <Button size="sm" variant="ghost" onClick={() => setAction(`ignore-${insight.id}`, 'ignored')}>
              Ignora
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant={personal ? 'vital' : 'primary'} onClick={() => openAction(action, insight, 'review')}>
              Approva
            </Button>
            <Button size="sm" onClick={() => openAction(action, insight, 'edit')}>
              Modifica
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAction(action.id, 'ignored')}>
              Ignora
            </Button>
            {insight.href ? (
              <Link href={insight.href} className="ml-auto text-sm text-muted underline underline-offset-4 hover:text-fg">
                Vedi dettaglio
              </Link>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
