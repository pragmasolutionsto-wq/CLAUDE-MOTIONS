'use client';

import { useState } from 'react';
import { addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, HeartPulse } from 'lucide-react';
import { DEMO_NOW } from '@/config/demo';
import { MeetingPrepSheet } from '@/components/agenda/MeetingPrepSheet';
import { PriorityCard } from '@/components/briefing/PriorityCard';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { PageHeader } from '@/components/shared/PageHeader';
import { PrivateBadge } from '@/components/shared/PrivateBadge';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/misc';
import { getAgenda, weekStats, type AgendaView } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { capitalize, dayMonth, hours, percent, time, weekday } from '@/lib/format';
import { bandOf } from '@/lib/rules/readiness';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { CalendarEvent, EventCategory } from '@/types/domain';

const CATEGORY: Record<EventCategory, { label: string; bar: string }> = {
  operativo: { label: 'Operativo', bar: 'bg-info' },
  strategico: { label: 'Strategico', bar: 'bg-gold' },
  clienti: { label: 'Clienti', bar: 'bg-ok' },
  interno: { label: 'Interno', bar: 'bg-muted' },
  personale: { label: 'Personale', bar: 'bg-warn' },
};

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={cn('num font-serif text-xl font-semibold', warn && 'text-warn-fg')}>{value}</p>
    </div>
  );
}

function Week({ v }: { v: AgendaView }) {
  const [idx, setIdx] = useState(1);
  const [overlay, setOverlay] = useState(true);
  const [prepFor, setPrepFor] = useState<CalendarEvent | null>(null);
  const warnHours = useApp((s) => s.settings.meetingHoursWarn);
  const start = new Date(v.weekStarts[idx]);
  const stats = weekStats(v.events, start);
  const days = [0, 1, 2, 3, 4].map((i) => addDays(start, i));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} aria-label="Settimana precedente">
            <ChevronLeft size={18} aria-hidden />
          </Button>
          <p className="min-w-44 text-center text-sm font-semibold" aria-live="polite">
            {idx === 1 ? 'Questa settimana' : idx === 0 ? 'Settimana scorsa' : 'Prossima settimana'} · {dayMonth(start)}
          </p>
          <Button size="sm" variant="ghost" disabled={idx === v.weekStarts.length - 1} onClick={() => setIdx((i) => i + 1)} aria-label="Settimana successiva">
            <ChevronRight size={18} aria-hidden />
          </Button>
        </div>
        <SourceBadge source={v.source} />
      </div>

      <Card className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Ore di riunioni" value={hours(stats.total)} warn={stats.total > warnHours} />
        <Stat label="Quota strategica" value={percent(stats.strategic, 0)} />
        <Stat label="Blocchi focus oltre 60 min" value={String(stats.focusBlocks)} warn={stats.focusBlocks === 0} />
        <Stat label="Sovrapposizioni" value={String(stats.overlaps)} warn={stats.overlaps > 0} />
      </Card>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Legenda categorie">
          {Object.values(CATEGORY).map((c) => (
            <li key={c.label} className="flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-sm', c.bar)} aria-hidden />
              {c.label}
            </li>
          ))}
        </ul>
        {v.recovery ? (
          <label className="flex items-center gap-2 text-sm">
            <HeartPulse size={15} className="text-vital-fg" aria-hidden />
            Mostra il tuo recupero
            <Switch checked={overlay} onCheckedChange={setOverlay} label="Mostra il recupero sopra ogni giorno" />
            <PrivateBadge />
          </label>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {days.map((d, di) => {
          const events = v.events.filter((e) => isSameDay(new Date(e.start), d)).sort((a, b) => a.start.localeCompare(b.start));
          const today = isSameDay(d, DEMO_NOW);
          const rec = v.recovery?.find((r) => isSameDay(new Date(r.date), d));
          return (
            <section key={di} aria-label={`${weekday(d)} ${dayMonth(d)}`} className={cn('rounded-xl border bg-card', today ? 'border-gold/70' : 'border-line')}>
              <header className="border-b border-line px-3 py-2">
                <p className="flex items-baseline justify-between gap-2 text-sm font-semibold">
                  <span>
                    {capitalize(weekday(d))} <span className="num font-normal text-muted">{d.getDate()}</span>
                  </span>
                  <span className="num text-xs font-normal text-muted">{hours(stats.perDay[di])}</span>
                </p>
                {v.recovery && overlay ? (
                  <p className="num mt-1 flex items-center gap-1.5 text-xs text-vital-fg">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
                      {rec?.score != null ? <span className="block h-full rounded-full bg-vital" style={{ width: `${rec.score}%` }} /> : null}
                    </span>
                    {rec?.score != null ? (
                      <span>
                        Recupero {rec.score}
                        <span className="sr-only">, {bandOf(rec.score) === 'in_range' || bandOf(rec.score) === 'above' ? 'nella tua media' : 'sotto la tua media'}</span>
                      </span>
                    ) : (
                      <span className="text-muted">{d > DEMO_NOW ? 'Non ancora rilevato' : 'Non disponibile'}</span>
                    )}
                  </p>
                ) : null}
              </header>
              {events.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted">Nessun impegno.</p>
              ) : (
                <ul className="space-y-1.5 p-2">
                  {events.map((e) => (
                    <li key={e.id} className="relative overflow-hidden rounded-lg border border-line bg-surface py-2 pr-2 pl-3.5 text-sm">
                      <span className={cn('absolute inset-y-0 left-0 w-1.5', CATEGORY[e.category].bar)} aria-hidden />
                      <p className="num text-xs text-muted">
                        {time(e.start)}–{time(e.end)} · {CATEGORY[e.category].label}
                      </p>
                      <p className="leading-snug font-medium">{e.title}</p>
                      {v.prep[e.id] ? (
                        <button type="button" onClick={() => setPrepFor(e)} className="mt-1 min-h-6 text-xs font-medium text-gold-fg underline underline-offset-4">
                          Prepara la riunione
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {idx === 1 ? (
        <section className="mt-6" aria-labelledby="proposte">
          <SectionTitle id="proposte" className="mb-3">Proposte del sistema</SectionTitle>
          {v.proposals.length === 0 ? (
            <Card className="text-sm text-muted">Nessuna proposta: la settimana ha già spazio per lavorare bene.</Card>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {v.proposals.map((p) => (
                <PriorityCard key={p.id} insight={p} compact />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {prepFor && v.prep[prepFor.id] ? <MeetingPrepSheet event={prepFor} prep={v.prep[prepFor.id]} onClose={() => setPrepFor(null)} /> : null}
    </>
  );
}

export default function AgendaPage() {
  const state = useData(getAgenda);
  return (
    <>
      <PageHeader title="Agenda" subtitle="Dove va il tuo tempo, e dove potresti riprendertelo." />
      <Loadable state={state}>
        {(a) => (
          <AvailGuard value={a} onRetry={state.reload}>
            {(v) => <Week v={v} />}
          </AvailGuard>
        )}
      </Loadable>
    </>
  );
}
