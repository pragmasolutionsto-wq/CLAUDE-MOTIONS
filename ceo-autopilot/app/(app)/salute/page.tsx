'use client';

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';
import { COPY } from '@/config/copy';
import { READINESS } from '@/config/thresholds';
import { PriorityCard } from '@/components/briefing/PriorityCard';
import { LoadVsRecoveryChart } from '@/components/health/LoadVsRecoveryChart';
import { ReadinessInfo, ReadinessRing } from '@/components/health/ReadinessRing';
import { HealthDisclaimer } from '@/components/shared/HealthDisclaimer';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { PageHeader } from '@/components/shared/PageHeader';
import { OwnerOnly, PlanGate } from '@/components/shared/PlanGate';
import { PrivateBadge } from '@/components/shared/PrivateBadge';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { Card, CardTitle, SectionTitle } from '@/components/ui/card';
import { getHealth, type HealthMetric, type HealthView } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { dateMedium, hours, number } from '@/lib/format';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { SourceRef } from '@/types/domain';

function fmt(m: HealthMetric, v: number): string {
  if (m.key === 'sleep') return hours(v);
  if (m.key === 'steps') return number(v);
  return `${number(v)} ${m.unit}`;
}

function Metric({ m, source }: { m: HealthMetric; source: SourceRef }) {
  const delta = m.value !== null && m.baseline !== null ? m.value - m.baseline : null;
  const worse = delta === null ? false : m.lowerIsBetter ? delta > 0 : delta < 0;
  const deltaLabel =
    delta === null
      ? null
      : m.key === 'sleep'
        ? `${delta >= 0 ? '+' : '−'}${hours(Math.abs(delta))}`
        : `${delta >= 0 ? '+' : '−'}${number(Math.abs(delta))}${m.unit ? ` ${m.unit}` : ''}`;
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-sm text-muted">
        {m.label}
        {m.note ? ` · ${m.note}` : ''}
      </p>
      {m.value === null ? (
        <p className="text-sm">
          <span className="font-semibold">{COPY.notAvailable}</span>
          <span className="block text-muted">Il wearable non ha registrato questo valore.</span>
        </p>
      ) : (
        <p className="num font-serif text-2xl leading-none font-semibold">{fmt(m, m.value)}</p>
      )}
      {m.baseline !== null ? (
        <p className="num text-xs text-muted">
          La tua media: {fmt(m, Math.round(m.baseline * 10) / 10)}
          {deltaLabel ? <span className={cn('ml-1 font-medium', worse ? 'text-warn-fg' : 'text-ok-fg')}>({deltaLabel})</span> : null}
        </p>
      ) : (
        <p className="text-xs text-muted">Media personale in costruzione.</p>
      )}
      <div className="mt-auto pt-1">
        <SourceBadge source={source} />
      </div>
    </Card>
  );
}

function Content({ v }: { v: HealthView }) {
  const bridgeOn = useApp((s) => s.settings.bridgeEnabled);
  const booking = useApp((s) => s.bookings.find((b) => b.kind === 'checkup'));
  const s = v.snapshot;
  const learning = s.score === null;
  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Card className="flex flex-col items-center gap-3 border-vital/50 text-center">
          <ReadinessRing snapshot={s} size={168} />
          <div>
            <p className="flex items-center justify-center gap-1 font-semibold">
              {COPY.readiness.bandLabel[s.vsBaseline]} <ReadinessInfo />
            </p>
            <p className="mt-1 text-sm text-muted">
              {learning ? COPY.readiness.learning(s.validNights, READINESS.minValidNights) : COPY.readiness.bands[s.vsBaseline]}
            </p>
          </div>
          <p className="text-xs text-muted">{COPY.readiness.tooltip}</p>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {v.metrics.map((m) => (
            <Metric key={m.key} m={m} source={v.source} />
          ))}
        </div>
      </div>

      <Card className="mt-4">
        <CardTitle>Quando il lavoro sale, il tuo recupero tiene?</CardTitle>
        <p className="mt-1 text-sm text-muted">Ore di riunioni al giorno e indice di recupero, ultimi 28 giorni.</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gold/60" aria-hidden /> Ore di riunioni (asse sinistro)</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-vital" aria-hidden /> Recupero 0–100 (asse destro)</span>
        </div>
        {learning ? (
          <p className="mt-4 rounded-lg border border-dashed border-line p-4 text-sm text-muted">
            {COPY.readiness.learning(s.validNights, READINESS.minValidNights)}. Il grafico compare quando ho abbastanza notti per conoscere i tuoi valori abituali.
          </p>
        ) : (
          <>
            <div className="mt-3">
              <LoadVsRecoveryChart data={v.chart} />
            </div>
            {v.annotations.length ? (
              <ul className="num mt-3 flex flex-wrap gap-2 text-sm" aria-label="Giorni più pesanti">
                {v.annotations.map((a) => (
                  <li key={a}>
                    <Badge tone="warn">{a}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="num mt-3 text-sm text-muted">
              In sintesi: negli ultimi 7 giorni hai avuto in media {hours(avg(v.chart.slice(-7).map((c) => c.meetingHours)))} di riunioni al giorno e un recupero
              medio di {Math.round(avg(v.chart.slice(-7).flatMap((c) => (c.score === null ? [] : [c.score]))))}/100. Nei 7 giorni precedenti:{' '}
              {hours(avg(v.chart.slice(-14, -7).map((c) => c.meetingHours)))} e{' '}
              {Math.round(avg(v.chart.slice(-14, -7).flatMap((c) => (c.score === null ? [] : [c.score]))))}/100.
            </p>
          </>
        )}
        <div className="mt-3">
          <SourceBadge source={v.source} />
        </div>
      </Card>

      <section className="mt-6" aria-labelledby="adattamenti">
        <SectionTitle id="adattamenti" className="mb-3">Cosa ha cambiato il sistema per te questa settimana</SectionTitle>
        {!bridgeOn ? (
          <Card className="text-sm text-muted">
            L’incrocio tra salute e lavoro è spento. Puoi riaccenderlo in{' '}
            <Link href="/impostazioni" className="text-gold-fg underline underline-offset-4">Impostazioni</Link>.
          </Card>
        ) : v.adjusted.length === 0 ? (
          <Card className="text-sm text-muted">Niente da adattare: carico e recupero sono in equilibrio.</Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {v.adjusted.map((i) => (
              <PriorityCard key={i.id} insight={i} compact />
            ))}
          </div>
        )}
      </section>

      <Card className="mt-6 flex flex-wrap items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-vital/15 text-vital-fg">
          <CalendarCheck size={22} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 basis-56">
          <CardTitle>Check-up semestrale Longevitas</CardTitle>
          <p className="num text-sm text-muted">
            Ultimo: {dateMedium(v.checkup.lastDate)} · prossimo entro il {dateMedium(v.checkup.nextDueDate)}
            {booking ? ` · prenotato per il ${dateMedium(booking.date)} alle ${booking.time}` : ''}
          </p>
        </div>
        <Link href="/clinica" className={buttonClass('vital')}>
          {booking ? 'Vedi la prenotazione' : 'Prenota'}
        </Link>
      </Card>
    </>
  );
}

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

export default function HealthPage() {
  const state = useData(getHealth);
  return (
    <>
      <PageHeader title="Salute" subtitle={COPY.health.onlyYou}>
        <PrivateBadge />
      </PageHeader>
      <Loadable state={state}>
        {(g) =>
          g.gate === 'role' ? (
            <OwnerOnly />
          ) : g.gate === 'plan' ? (
            <PlanGate
              title="Come stai tu, accanto a come sta l’azienda"
              points={[
                'Il tuo recupero ogni mattina, confrontato con i tuoi valori abituali',
                'Riunioni e decisioni adattate alle giornate in cui sei più scarico',
                'Check-up Longevitas ogni 6 mesi, in clinica o in telemedicina',
              ]}
            />
          ) : (
            <AvailGuard value={g.data} onRetry={state.reload} explain="Collega il tuo wearable: sonno, HRV e frequenza a riposo restano in un’area separata, visibile solo a te.">
              {(v) => <Content v={v} />}
            </AvailGuard>
          )
        }
      </Loadable>
      <HealthDisclaimer />
    </>
  );
}
