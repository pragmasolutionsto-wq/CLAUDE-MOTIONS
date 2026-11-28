'use client';

import { TriangleAlert } from 'lucide-react';
import { DEMO_NOW } from '@/config/demo';
import { Button } from '@/components/ui/button';
import { stamp } from '@/lib/format';
import type { StaleInfo } from '@/types/domain';

/** Errore di un connettore o dato vecchio: avviso non bloccante, con l'ultimo dato valido. */
export function StaleBanner({ stale, onRetry }: { stale: StaleInfo; onRetry?: () => void }) {
  return (
    <div role="status" className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-warn/50 bg-warn/10 px-4 py-3 text-sm">
      <TriangleAlert size={18} className="shrink-0 text-warn-fg" aria-hidden />
      <p className="min-w-0 flex-1">
        <span className="font-semibold">
          {stale.error ? `${stale.label} non ha risposto.` : `${stale.label}: dato non aggiornato.`}
        </span>{' '}
        <span className="num text-muted">
          Ti mostro l’ultimo dato valido, aggiornato alle {stamp(stale.since, DEMO_NOW)}. Finché non si aggiorna non
          genero avvisi su questi numeri.
        </span>
      </p>
      {onRetry ? (
        <Button size="sm" onClick={onRetry}>
          Riprova
        </Button>
      ) : null}
    </div>
  );
}
