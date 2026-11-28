'use client';

import { Info } from 'lucide-react';
import { COPY } from '@/config/copy';
import { READINESS } from '@/config/thresholds';
import { Tip } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import type { ReadinessSnapshot } from '@/types/domain';

interface Props {
  snapshot: ReadinessSnapshot;
  size?: number;
  className?: string;
}

/** Anello del recupero del giorno (0–100, relativo ai tuoi valori abituali). Solo area Health, colore teal. */
export function ReadinessRing({ snapshot, size = 96, className }: Props) {
  const stroke = Math.max(6, Math.round(size / 11));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const learning = snapshot.score === null;
  const value = learning ? snapshot.validNights / READINESS.minValidNights : (snapshot.score as number) / 100;
  const label = learning
    ? COPY.readiness.learning(snapshot.validNights, READINESS.minValidNights)
    : `Recupero ${snapshot.score} su 100. ${COPY.readiness.bandLabel[snapshot.vsBaseline]}`;
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--vital)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * Math.min(1, value)} ${c}`}
          strokeOpacity={learning ? 0.5 : 1}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {learning ? (
          <span className="num text-sm font-semibold text-vital-fg">
            {snapshot.validNights}/{READINESS.minValidNights}
          </span>
        ) : (
          <span className="num font-serif leading-none font-semibold" style={{ fontSize: size * 0.34 }}>
            {snapshot.score}
          </span>
        )}
        {size >= 120 ? <span className="mt-1 text-xs text-muted">{learning ? 'notti' : 'su 100'}</span> : null}
      </div>
    </div>
  );
}

/** Tooltip fisso che accompagna sempre l'indice di recupero. */
export function ReadinessInfo() {
  return (
    <Tip content={COPY.readiness.tooltip}>
      <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-fg" aria-label="Cosa significa questo numero">
        <Info size={14} aria-hidden />
      </button>
    </Tip>
  );
}
