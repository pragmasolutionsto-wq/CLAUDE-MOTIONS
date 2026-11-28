'use client';

import { differenceInCalendarDays } from 'date-fns';
import { Check, X } from 'lucide-react';
import { DEMO_NOW } from '@/config/demo';
import { Badge, type Tone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dateMedium, stamp } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ConnectorStatus } from '@/types/domain';
import { PrivateBadge } from './PrivateBadge';

const STATE: Record<ConnectorStatus['state'], { label: string; tone: Tone }> = {
  connected: { label: 'Collegato', tone: 'ok' },
  not_connected: { label: 'Da collegare', tone: 'neutral' },
  error: { label: 'In errore', tone: 'alert' },
  consent_expiring: { label: 'Consenso in scadenza', tone: 'warn' },
};

interface Props {
  connector: ConnectorStatus;
  onConnect: () => void;
  onRevoke?: () => void;
  compact?: boolean; // in onboarding: senza registro degli import
}

/** Stato di una fonte: cosa legge, cosa non legge, ultimo aggiornamento, revoca. */
export function ConnectorCard({ connector: c, onConnect, onRevoke, compact }: Props) {
  const up = c.state !== 'not_connected';
  const days = c.consentExpiresAt ? differenceInCalendarDays(new Date(c.consentExpiresAt), DEMO_NOW) : null;
  return (
    <article className={cn('flex flex-col rounded-xl border bg-card p-4', c.privateDomain ? 'border-vital/50' : 'border-line')} aria-label={c.name}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold">{c.name}</h3>
          <p className="text-xs text-muted">{c.provider}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.privateDomain ? <PrivateBadge /> : null}
          <Badge tone={STATE[c.state].tone}>{STATE[c.state].label}</Badge>
        </div>
      </div>
      <p className="num mt-2 text-xs text-muted">
        {c.lastSync ? `Ultimo aggiornamento: ${stamp(c.lastSync, DEMO_NOW)}` : 'Mai aggiornato'}
        {up && c.consentExpiresAt ? ` · consenso fino al ${dateMedium(c.consentExpiresAt)}${days !== null && days <= 30 ? ` (tra ${days} giorni)` : ''}` : ''}
      </p>
      {c.state === 'error' ? <p className="mt-2 text-sm text-alert-fg">La fonte non risponde. Uso l’ultimo dato valido finché non torna.</p> : null}
      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Legge</p>
          <ul className="mt-1 space-y-0.5">
            {c.reads.map((r) => (
              <li key={r} className="flex gap-1.5">
                <Check size={14} className="mt-0.5 shrink-0 text-ok-fg" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">Non legge</p>
          <ul className="mt-1 space-y-0.5 text-muted">
            {c.doesNotRead.map((r) => (
              <li key={r} className="flex gap-1.5">
                <X size={14} className="mt-0.5 shrink-0" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {c.note ? <p className="mt-3 text-sm text-muted">{c.note}</p> : null}
      {!compact && c.logs.length > 0 ? (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer py-1 font-medium text-muted">Ultimi import</summary>
          <ul className="num mt-1 space-y-1">
            {c.logs.map((l, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className={l.ok ? '' : 'text-alert-fg'}>
                  {l.ok ? 'Riuscito' : 'Fallito'} · {l.note}
                </span>
                <span className="shrink-0 text-muted">{stamp(l.at, DEMO_NOW)}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {!up ? (
          <Button size="sm" variant={c.privateDomain ? 'vital' : 'primary'} onClick={onConnect}>
            Collega
          </Button>
        ) : (
          <>
            {c.state === 'consent_expiring' ? (
              <Button size="sm" variant="primary" onClick={onConnect}>
                Rinnova il consenso
              </Button>
            ) : null}
            {c.state === 'error' ? (
              <Button size="sm" variant="primary" onClick={onConnect}>
                Riconnetti
              </Button>
            ) : null}
            {onRevoke ? (
              <Button size="sm" variant="danger" onClick={onRevoke}>
                Revoca
              </Button>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
