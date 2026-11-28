'use client';

import { differenceInCalendarDays } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { COPY } from '@/config/copy';
import { DEMO_NOW } from '@/config/demo';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { PageHeader } from '@/components/shared/PageHeader';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { getGrants } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { dateMedium } from '@/lib/format';
import { useApp } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import { ACCOUNTANT } from '@/mocks/company';
import type { Grant, SourceRef } from '@/types/domain';

function GrantCard({ g, source }: { g: Grant; source: SourceRef }) {
  const openAction = useUi((s) => s.openAction);
  const openSource = useUi((s) => s.openSource);
  const id = `act-grant-${g.id}`;
  const sent = useApp((s) => s.actions[id]) === 'approved';
  const days = differenceInCalendarDays(new Date(g.deadline), DEMO_NOW);
  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="gold">{g.level}</Badge>
        <span className="text-xs text-muted">{g.issuer}</span>
        <span className="num ml-auto text-sm font-semibold text-ok-fg" aria-label={`Compatibilità stimata ${g.fitScore} su 100`}>
          {g.fitScore}/100
        </span>
      </div>
      <h2 className="mt-2 font-semibold">{g.title}</h2>
      <p className="num mt-1 text-sm">{g.amountRange}</p>
      <p className="num mt-1 text-sm text-muted">
        Scade il {dateMedium(g.deadline)} · tra {days} giorni
      </p>
      <h3 className="mt-3 text-xs font-semibold tracking-wider text-muted uppercase">Perché è compatibile</h3>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
        {g.fitReasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <h3 className="mt-3 text-xs font-semibold tracking-wider text-muted uppercase">Cosa ti manca</h3>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
        {g.missingRequirements.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {sent ? (
          <Badge tone="ok">Inviato al commercialista</Badge>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              openAction(
                {
                  id,
                  kind: 'draft_email',
                  label: 'Invia al mio commercialista',
                  requiresApproval: true,
                  payload: {
                    to: `${ACCOUNTANT.name} · ${ACCOUNTANT.email}`,
                    subject: `Bando da valutare: ${g.title}`,
                    body: `Buongiorno Stefano,\n\nvorrei una tua valutazione su questo bando:\n\n${g.title}\n${g.issuer} · scadenza ${dateMedium(g.deadline)}\n${g.amountRange}\n\nDa una prima verifica ci mancano: ${g.missingRequirements.join('; ').toLowerCase()}.\n\nSecondo te siamo ammissibili? Ne parliamo questa settimana?\n\nGrazie,\nMarco`,
                  },
                },
                undefined,
                'edit',
              )
            }
          >
            Invia al mio commercialista
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => openSource({ ...source, recordId: `grant:${g.id}` })}>
          <ExternalLink size={14} aria-hidden /> Fonte ufficiale
        </Button>
      </div>
    </Card>
  );
}

export default function GrantsPage() {
  const state = useData(getGrants);
  return (
    <>
      <PageHeader title="Opportunità" subtitle="Bandi compatibili con la tua azienda. Pochi, ma giusti." />
      <Loadable state={state}>
        {(a) => (
          <AvailGuard value={a} onRetry={state.reload}>
            {({ grants, source }) => {
              const open = grants.filter((g) => new Date(g.deadline) > DEMO_NOW);
              const top = [...open].sort((x, y) => y.fitScore - x.fitScore).slice(0, 3);
              const rest = grants.filter((g) => !top.includes(g));
              return (
                <>
                  <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line px-4 py-3 text-sm" role="note">
                    <span className="min-w-0 flex-1">{COPY.grants.disclaimer}</span>
                    <SourceBadge source={source} />
                  </p>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {top.map((g) => (
                      <GrantCard key={g.id} g={g} source={source} />
                    ))}
                  </div>
                  <section className="mt-6" aria-labelledby="altri">
                    <SectionTitle id="altri" className="mb-3">Altri {rest.length} bandi valutati e scartati</SectionTitle>
                    <ul className="divide-y divide-line rounded-xl border border-line bg-card text-sm">
                      {rest.map((g) => (
                        <li key={g.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
                          <span className="min-w-0 flex-1 basis-60">
                            {g.title}
                            <span className="block text-xs text-muted">
                              {g.issuer} · {g.missingRequirements[0]}
                            </span>
                          </span>
                          <span className="num text-muted">{g.fitScore}/100</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              );
            }}
          </AvailGuard>
        )}
      </Loadable>
    </>
  );
}
