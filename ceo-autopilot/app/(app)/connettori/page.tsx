'use client';

import { useState } from 'react';
import { COPY } from '@/config/copy';
import { ConnectModal } from '@/components/shared/ConnectModal';
import { ConnectorCard } from '@/components/shared/ConnectorCard';
import { Loadable } from '@/components/shared/Loadable';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Sheet } from '@/components/ui/sheet';
import { getConnectors } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { useApp } from '@/lib/store';
import type { ConnectorStatus } from '@/types/domain';

export default function ConnectorsPage() {
  const state = useData(getConnectors);
  const setConnector = useApp((s) => s.setConnector);
  const [connecting, setConnecting] = useState<ConnectorStatus | null>(null);
  const [revoking, setRevoking] = useState<ConnectorStatus | null>(null);
  return (
    <>
      <PageHeader title="Connettori" subtitle={COPY.readOnly} />
      <Loadable state={state}>
        {(v) => {
          const grid = (list: ConnectorStatus[]) => (
            <div className="grid gap-3 lg:grid-cols-2">
              {list.map((c) => (
                <ConnectorCard key={c.id} connector={c} onConnect={() => setConnecting(c)} onRevoke={() => setRevoking(c)} />
              ))}
            </div>
          );
          return (
            <>
              <Card className="mb-5 flex flex-wrap items-center gap-4">
                <p className="num font-serif text-3xl leading-none font-semibold">
                  {v.connected}
                  <span className="text-muted">/{v.total}</span>
                </p>
                <div className="min-w-0 flex-1 basis-56">
                  <p className="font-semibold">
                    Il tuo copilot vede {v.connected} fonti su {v.total}.
                  </p>
                  <p className="text-sm text-muted">Più fonti colleghi, più il briefing è completo. Ogni fonte è facoltativa e revocabile.</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                    <div className="h-full rounded-full bg-gold" style={{ width: `${(v.connected / v.total) * 100}%` }} />
                  </div>
                </div>
              </Card>
              <SectionTitle className="mb-3">Azienda</SectionTitle>
              {grid(v.business)}
              {v.personal ? (
                <>
                  <SectionTitle className="mt-6 mb-1">Personale (privato)</SectionTitle>
                  <p className="mb-3 text-sm text-muted">
                    {COPY.health.onlyYou} Per Apple Watch serve l’app iPhone di CEO AUTOPILOT{' '}
                    <span className="underline decoration-dotted underline-offset-4">(link in arrivo)</span>.
                  </p>
                  {grid(v.personal)}
                </>
              ) : null}
            </>
          );
        }}
      </Loadable>
      <ConnectModal
        connector={connecting}
        renew={connecting?.state === 'consent_expiring'}
        onClose={() => setConnecting(null)}
        onConnected={(c) => {
          setConnector(c.id, 'connected');
          setConnecting(null);
        }}
      />
      <Sheet
        open={!!revoking}
        onOpenChange={(o) => !o && setRevoking(null)}
        variant="center"
        title={`Revocare l’accesso a ${revoking?.name}?`}
        description="Il sistema smette subito di leggere questa fonte. Quello che dipende da questi dati diventa “Non disponibile”."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="danger"
            onClick={() => {
              if (revoking) setConnector(revoking.id, 'not_connected');
              setRevoking(null);
            }}
          >
            Sì, revoca
          </Button>
          <Button onClick={() => setRevoking(null)}>Annulla</Button>
        </div>
      </Sheet>
    </>
  );
}
