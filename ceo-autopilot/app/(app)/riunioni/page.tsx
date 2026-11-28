'use client';

import { DEMO_NOW } from '@/config/demo';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { PageHeader } from '@/components/shared/PageHeader';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Badge, type Tone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc';
import { getMeetings } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { dayShort, time } from '@/lib/format';
import { useApp } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import type { MeetingSummary, MeetingTask } from '@/types/domain';

const TASK: Record<MeetingTask['status'], { label: string; tone: Tone }> = {
  open: { label: 'Aperto', tone: 'neutral' },
  done: { label: 'Fatto', tone: 'ok' },
  overdue: { label: 'Scaduto', tone: 'alert' },
};

function TaskRow({ task, meeting, id }: { task: MeetingTask; meeting: string; id: string }) {
  const openAction = useUi((s) => s.openAction);
  const sent = useApp((s) => s.actions[id]) === 'approved';
  const isOwner = task.owner === 'Marco Ferraris';
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-sm">
      <div className="min-w-0 flex-1 basis-60">
        <p>{task.text}</p>
        <p className="num text-xs text-muted">
          {task.owner} · scadenza {dayShort(task.due)} · {meeting}
        </p>
      </div>
      <Badge tone={TASK[task.status].tone}>{TASK[task.status].label}</Badge>
      {task.status !== 'done' && !isOwner ? (
        sent ? (
          <Badge tone="ok">Promemoria inviato</Badge>
        ) : (
          <Button
            size="sm"
            onClick={() =>
              openAction(
                {
                  id,
                  kind: 'draft_email',
                  label: 'Manda un promemoria',
                  requiresApproval: true,
                  payload: {
                    to: task.owner,
                    subject: `Promemoria: ${task.text}`,
                    body: `Ciao ${task.owner.split(' ')[0]},\n\nti ricordo il compito uscito dalla riunione “${meeting}”:\n\n${task.text}\n\nLa scadenza era ${dayShort(task.due)}. Mi dici a che punto sei?\n\nMarco`,
                  },
                },
                undefined,
                'edit',
              )
            }
          >
            Manda un promemoria
          </Button>
        )
      ) : null}
    </li>
  );
}

function MeetingCard({ m }: { m: MeetingSummary }) {
  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">{m.title}</h2>
        <span className="num text-xs text-muted">
          {dayShort(m.date)}, {time(m.date)}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">{m.participants.join(', ')}</p>
      <p className="mt-2 line-clamp-3 text-sm">{m.summary}</p>
      <details className="mt-3">
        <summary className="cursor-pointer py-1 text-sm font-medium text-gold-fg">
          {m.decisions.length} decisioni · {m.tasks.length} compiti
        </summary>
        <h3 className="mt-3 text-xs font-semibold tracking-wider text-muted uppercase">Decisioni</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {m.decisions.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <h3 className="mt-3 text-xs font-semibold tracking-wider text-muted uppercase">Compiti</h3>
        <ul className="mt-1 divide-y divide-line rounded-lg border border-line">
          {m.tasks.map((t, i) => (
            <TaskRow key={i} task={t} meeting={m.title} id={`act-task-${m.id}-${i}`} />
          ))}
        </ul>
      </details>
      <div className="mt-3">
        <SourceBadge source={m.source} />
      </div>
    </Card>
  );
}

export default function MeetingsPage() {
  const state = useData(getMeetings);
  return (
    <>
      <PageHeader title="Riunioni" subtitle="Cosa si è deciso, chi deve fare cosa, cosa è rimasto indietro." />
      <Loadable state={state}>
        {(a) => (
          <AvailGuard value={a} onRetry={state.reload} explain="Servono le trascrizioni delle riunioni registrate (Meet, Teams o un altro strumento di registrazione).">
            {(meetings) => {
              const tasks = meetings
                .flatMap((m) => m.tasks.map((t, i) => ({ t, m, id: `act-task-${m.id}-${i}` })))
                .filter((x) => x.t.status !== 'done')
                .sort((a, b) => (a.t.status === b.t.status ? a.t.due.localeCompare(b.t.due) : a.t.status === 'overdue' ? -1 : 1));
              const overdue = tasks.filter((x) => x.t.status === 'overdue').length;
              return (
                <Tabs defaultValue="meetings">
                  <TabsList aria-label="Viste">
                    <TabsTrigger value="meetings">Riunioni · {meetings.length}</TabsTrigger>
                    <TabsTrigger value="tasks">
                      Compiti aperti · {tasks.length}
                      {overdue ? <Badge tone="alert">{overdue} scaduti</Badge> : null}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="meetings" className="grid gap-3 pt-4 lg:grid-cols-2">
                    {[...meetings]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((m) => (
                        <MeetingCard key={m.id} m={m} />
                      ))}
                  </TabsContent>
                  <TabsContent value="tasks" className="pt-4">
                    <p className="num mb-3 text-sm text-muted">
                      Tutti i compiti usciti dalle riunioni, a oggi {dayShort(DEMO_NOW)}. Prima quelli scaduti.
                    </p>
                    <ul className="divide-y divide-line rounded-xl border border-line bg-card">
                      {tasks.map((x) => (
                        <TaskRow key={x.id} task={x.t} meeting={x.m.title} id={x.id} />
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              );
            }}
          </AvailGuard>
        )}
      </Loadable>
    </>
  );
}
