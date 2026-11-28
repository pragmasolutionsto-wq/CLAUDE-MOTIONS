'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import type { ConnectorStatus } from '@/types/domain';

interface Props {
  connector: ConnectorStatus | null;
  onClose: () => void;
  onConnected: (c: ConnectorStatus) => void;
  /** Simula un errore al primo tentativo (usato in onboarding per la banca). */
  failFirst?: boolean;
  renew?: boolean;
}

/** Finestra simulata del provider: cosa stai autorizzando, in sola lettura. */
export function ConnectModal(props: Props) {
  if (!props.connector) return null;
  // La chiave azzera lo stato della finestra a ogni nuovo connettore.
  return <ConnectDialog key={props.connector.id} {...props} connector={props.connector} />;
}

function ConnectDialog({ connector, onClose, onConnected, failFirst, renew }: Props & { connector: ConnectorStatus }) {
  const [phase, setPhase] = useState<'ask' | 'working' | 'error'>('ask');
  const [attempt, setAttempt] = useState(0);
  const [consent, setConsent] = useState(false);
  const isHealth = connector.privateDomain;
  const go = () => {
    setPhase('working');
    setTimeout(() => {
      if (failFirst && attempt === 0) {
        setAttempt(1);
        setPhase('error');
      } else onConnected(connector);
    }, 1200);
  };
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      variant="center"
      title={renew ? `Rinnova il consenso: ${connector.name}` : `Collega ${connector.name}`}
      description="Simulazione della finestra del provider"
    >
      {phase === 'error' ? (
        <div role="alert">
          <p className="font-semibold">{connector.name} non ha risposto.</p>
          <p className="mt-1 text-sm text-muted">Riprova o continua senza: puoi collegarla in qualsiasi momento.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" onClick={go}>
              Riprova
            </Button>
            <Button onClick={onClose}>Continua senza</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm">
            Stai per autorizzare l’accesso <span className="font-semibold">in sola lettura</span> a {connector.name} tramite{' '}
            <span className="text-muted">{connector.provider}</span>.
          </p>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="font-semibold text-ok-fg">Cosa legge</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {connector.reads.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-muted">Cosa non legge</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">
                {connector.doesNotRead.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
          {connector.note ? <p className="mt-3 text-sm text-muted">{connector.note}</p> : null}
          {isHealth ? (
            <label className="mt-4 flex items-start gap-2 rounded-lg border border-vital/40 bg-vital/10 p-3 text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[var(--vital)]" />
              <span>
                Acconsento al trattamento dei miei dati relativi alla salute per ricevere suggerimenti personali. I dati restano in un’area separata,
                visibile solo a me, e posso cancellarli quando voglio.
              </span>
            </label>
          ) : null}
          <p className="mt-3 flex items-start gap-2 text-xs text-muted">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden />
            Puoi revocare l’accesso in qualsiasi momento dalla sezione Connettori.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant={isHealth ? 'vital' : 'primary'} onClick={go} disabled={phase === 'working' || (isHealth && !consent)}>
              {phase === 'working' ? 'Collegamento in corso…' : renew ? 'Rinnova' : 'Autorizza'}
            </Button>
            <Button onClick={onClose}>Annulla</Button>
          </div>
        </>
      )}
    </Sheet>
  );
}
