'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import type { DataState } from '@/lib/data/useData';
import type { Avail } from '@/types/domain';
import { MissingData } from './MissingData';
import { StaleBanner } from './StaleBanner';

export function PageSkeleton({ tiles = 3, rows = 2 }: { tiles?: number; rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Caricamento in corso">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: tiles }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

/** Gestisce caricamento ed errore di una lettura dati; i figli ricevono il dato pronto. */
export function Loadable<T>({
  state,
  skeleton,
  children,
}: {
  state: DataState<T>;
  skeleton?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  if (state.error) {
    return (
      <Card className="flex flex-col items-start gap-3">
        <p>{state.error}</p>
        <Button onClick={state.reload}>Riprova</Button>
      </Card>
    );
  }
  if (state.data === undefined) return <>{skeleton ?? <PageSkeleton />}</>;
  return <div className={state.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>{children(state.data)}</div>;
}

/** Gestisce dato mancante e dato vecchio; i figli ricevono solo dati veri. */
export function AvailGuard<T>({
  value,
  onRetry,
  explain,
  children,
}: {
  value: Avail<T>;
  onRetry?: () => void;
  explain?: string;
  children: (data: T, stale: boolean) => React.ReactNode;
}) {
  if (value.status === 'missing') return <MissingData reason={value.reason} cta={value.cta} explain={explain} />;
  return (
    <>
      {value.stale ? <StaleBanner stale={value.stale} onRetry={onRetry} /> : null}
      {children(value.data, !!value.stale)}
    </>
  );
}
