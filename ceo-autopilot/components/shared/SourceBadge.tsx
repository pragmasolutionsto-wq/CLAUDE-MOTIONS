'use client';

import { Database } from 'lucide-react';
import { DEMO_NOW } from '@/config/demo';
import { stamp } from '@/lib/format';
import { useUi } from '@/lib/ui-store';
import { cn } from '@/lib/utils';
import type { SourceRef } from '@/types/domain';

/** "Intesa Sanpaolo · 07:12": ogni numero dichiara da dove viene. Cliccando si apre il dato originale. */
export function SourceBadge({ source, className }: { source: SourceRef; className?: string }) {
  const openSource = useUi((s) => s.openSource);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openSource(source);
      }}
      className={cn(
        'num inline-flex min-h-6 items-center gap-1 rounded-md text-xs text-muted underline decoration-line decoration-dotted underline-offset-4 hover:text-fg',
        className,
      )}
      aria-label={`Fonte: ${source.label}, aggiornato ${stamp(source.updatedAt, DEMO_NOW)}. Vedi dettaglio`}
    >
      <Database size={12} aria-hidden />
      {source.label} · {stamp(source.updatedAt, DEMO_NOW)}
    </button>
  );
}

export function SourceList({ sources, className }: { sources: SourceRef[]; className?: string }) {
  return (
    <span className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      {sources.map((s) => (
        <SourceBadge key={`${s.connector}-${s.recordId ?? ''}`} source={s} />
      ))}
    </span>
  );
}
