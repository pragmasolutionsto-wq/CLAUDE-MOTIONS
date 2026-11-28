'use client';

import Link from 'next/link';
import { ChevronRight, Sun } from 'lucide-react';
import { CONNECTOR_CTA, COPY } from '@/config/copy';
import { DEMO_NOW } from '@/config/demo';
import { Approvals } from '@/components/briefing/Approvals';
import { AudioBriefing } from '@/components/briefing/AudioBriefing';
import { PriorityCard } from '@/components/briefing/PriorityCard';
import { ReadinessInfo, ReadinessRing } from '@/components/health/ReadinessRing';
import { Loadable } from '@/components/shared/Loadable';
import { MissingData } from '@/components/shared/MissingData';
import { PrivateBadge } from '@/components/shared/PrivateBadge';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { StaleBanner } from '@/components/shared/StaleBanner';
import { Card, SectionTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { getBriefing, type BriefingView } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { capitalize, dayLong, hours, stamp, time } from '@/lib/format';
import { canSeeHealth, useApp } from '@/lib/store';

function OggiSkeleton() {
  return (
    <div aria-busy="true" aria-label="Sto preparando il briefing">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-5 w-48" />
      <Skeleton className="mt-5 h-24" />
      <Skeleton className="mt-4 h-52" />
      <Skeleton className="mt-3 h-52" />
    </div>
  );
}

function DayShape({ b }: { b: BriefingView }) {
  if (b.noSources) return null;
  const s = b.dayShape;
  const free = s.focusBlocks === 0 ? 'nessun blocco libero' : `${s.focusBlocks} ${s.focusBlocks === 1 ? 'blocco libero' : 'blocchi liberi'}${s.firstFree ? ` alle ${time(s.firstFree)}` : ''}`;
  return (
    <p className="num mt-1 text-sm text-muted">
      {hours(s.meetingsHours)} di riunioni · {free}
    </p>
  );
}

function Readiness({ b }: { b: BriefingView }) {
  const wearableMissing = b.missing.find((m) => m.id === 'wearable');
  if (wearableMissing) {
    return (
      <Card className="border-vital/40">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold">Il tuo recupero</span>
          <PrivateBadge />
        </div>
        <MissingData compact reason={COPY.missing.wearable} cta={CONNECTOR_CTA.wearable} />
      </Card>
    );
  }
  if (!b.readiness) return null;
  const r = b.readiness;
  return (
    <Card className="border-vital/40 p-0 sm:p-0">
      <div className="flex items-center gap-4 p-4">
        <Link href="/salute" className="flex min-w-0 flex-1 items-center gap-4 rounded-lg" aria-label="Apri la sezione Salute">
          <ReadinessRing snapshot={r} size={76} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-vital-fg uppercase">
              Il tuo recupero <PrivateBadge />
            </p>
            <p className="mt-1 text-sm font-medium sm:text-base">
              {r.score === null ? COPY.readiness.learning(r.validNights, 14) : COPY.readiness.bands[r.vsBaseline]}
            </p>
            {r.sleepHours !== null ? (
              <p className="num mt-0.5 text-xs text-muted">
                Sonno {hours(r.sleepHours)} · HRV {r.hrvMs} ms · FC a riposo {r.restingHr} bpm
              </p>
            ) : null}
          </div>
          <ChevronRight size={18} className="ml-auto shrink-0 text-muted" aria-hidden />
        </Link>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2">
        <SourceBadge source={r.source} />
        <ReadinessInfo />
      </div>
    </Card>
  );
}

function Briefing({ b, reload }: { b: BriefingView; reload: () => void }) {
  const health = useApp(canSeeHealth);
  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="font-serif text-xl leading-tight font-semibold sm:text-2xl">
          {b.greeting} <span className="text-muted">{capitalize(dayLong(b.date))}.</span>
        </h1>
        <DayShape b={b} />
      </header>

      <div className="mt-4 space-y-3">
        {b.stale.map((s) => (
          <StaleBanner key={s.connector} stale={s} onRetry={reload} />
        ))}
        {health ? <Readiness b={b} /> : null}
      </div>

      {b.noSources ? (
        <MissingData
          className="mt-5"
          reason="Nessuna fonte collegata"
          explain="Senza fonti non posso dirti cosa conta oggi, e non invento numeri. Collega almeno la mail, il calendario o la banca: servono pochi minuti e l’accesso è in sola lettura."
          cta="Collega le fonti"
        />
      ) : b.quietDay ? (
        <Card className="mt-5 flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold-fg">
            <Sun size={30} aria-hidden />
          </span>
          <p className="max-w-sm font-serif text-xl font-semibold">Oggi nessuna urgenza.</p>
          <p className="text-sm text-muted">Le fonti sono aggiornate. Buon lavoro.</p>
        </Card>
      ) : (
        <section className="mt-6" aria-labelledby="priorita">
          <SectionTitle id="priorita" className="mb-3">
            {b.priorities.length === 1 ? 'La priorità di oggi' : `Le ${b.priorities.length} priorità di oggi`}
          </SectionTitle>
          {b.priorities.length === 0 ? (
            <Card className="text-sm text-muted">Nessuna priorità con dati abbastanza affidabili. Guarda “Altro da sapere” qui sotto.</Card>
          ) : (
            <div className="space-y-3">
              {b.priorities.map((p, i) => (
                <PriorityCard key={p.id} insight={p} index={i + 1} />
              ))}
            </div>
          )}
        </section>
      )}

      {b.personalTip ? (
        <section className="mt-6" aria-labelledby="per-te">
          <SectionTitle id="per-te" className="mb-3">
            Un suggerimento per te
          </SectionTitle>
          <PriorityCard insight={b.personalTip} />
        </section>
      ) : null}

      {b.missing.filter((m) => m.id !== 'wearable').length > 0 && !b.noSources ? (
        <Card className="mt-6 text-sm">
          <p className="font-semibold">Fonti non collegate</p>
          <p className="text-muted">
            {b.missing.filter((m) => m.id !== 'wearable').map((m) => m.name).join(', ')}: quello che dipende da queste fonti oggi non è disponibile.
          </p>
          <Link href="/connettori" className="mt-1 inline-block font-medium text-gold-fg underline underline-offset-4">
            Vai ai connettori
          </Link>
        </Card>
      ) : null}

      {!b.noSources ? (
        <>
          <div className="mt-6">
            <Approvals approvals={b.approvals} others={b.otherApprovals} />
          </div>
          <div className="mt-6">
            <AudioBriefing script={b.audioScript} />
          </div>
        </>
      ) : null}

      {b.other.length > 0 ? (
        <details className="mt-6 rounded-xl border border-line">
          <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold">Altro da sapere · {b.other.length}</summary>
          <div className="space-y-3 border-t border-line p-3">
            {b.other.map((o) => (
              <PriorityCard key={o.id} insight={o} compact />
            ))}
          </div>
        </details>
      ) : null}

      {b.sources.length > 0 ? (
        <details className="mt-3 rounded-xl border border-line">
          <summary className="num flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold">
            Fonti aggiornate alle {stamp(b.sources.map((s) => s.lastSync).sort().at(-1) as string, DEMO_NOW)}
          </summary>
          <ul className="divide-y divide-line border-t border-line text-sm">
            {b.sources.map((s) => (
              <li key={s.name} className="flex justify-between gap-3 px-4 py-2">
                <span>{s.name}</span>
                <span className="num text-muted">{stamp(s.lastSync, DEMO_NOW)}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export default function OggiPage() {
  const state = useData(getBriefing);
  return (
    <Loadable state={state} skeleton={<div className="mx-auto max-w-3xl"><OggiSkeleton /></div>}>
      {(b) => <Briefing b={b} reload={state.reload} />}
    </Loadable>
  );
}
