'use client';

import { Check, MessageCircle } from 'lucide-react';
import { COPY } from '@/config/copy';
import { DEMO_NOW } from '@/config/demo';
import { AvailGuard, Loadable } from '@/components/shared/Loadable';
import { MissingData } from '@/components/shared/MissingData';
import { PageHeader } from '@/components/shared/PageHeader';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc';
import { getInbox } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { ago } from '@/lib/format';
import { useApp } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import type { MailThread, ProposedAction } from '@/types/domain';

function draftAction(t: MailThread): ProposedAction {
  return {
    id: `act-${t.id}`,
    kind: 'draft_email',
    label: 'Rivedi la bozza',
    requiresApproval: true,
    payload: { to: `${t.from}${t.org ? ` · ${t.org}` : ''}`, subject: `Re: ${t.subject}`, body: t.draftReply ?? '', threadId: t.id },
  };
}

function ThreadRow({ t }: { t: MailThread }) {
  const openAction = useUi((s) => s.openAction);
  const status = useApp((s) => s.actions[`act-${t.id}`]);
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="min-w-0 truncate text-sm font-semibold">
          {t.from}
          {t.org ? <span className="font-normal text-muted"> · {t.org}</span> : null}
        </p>
        <span className="num text-xs text-muted">{ago(t.receivedAt, DEMO_NOW)}</span>
      </div>
      <p className="mt-0.5 text-sm">{t.subject}</p>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{t.snippet}</p>
      {t.urgencyReason ? (
        <p className="mt-2">
          <Badge tone={t.bucket === 'todo' ? 'warn' : 'neutral'}>{t.urgencyReason}</Badge>
        </p>
      ) : null}
      {t.draftReply ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {status === 'approved' ? (
            <Badge tone="ok">
              <Check size={12} aria-hidden /> Risposta inviata
            </Badge>
          ) : (
            <>
              <Button size="sm" variant="primary" onClick={() => openAction(draftAction(t), undefined, 'edit')}>
                Rivedi la bozza
              </Button>
              <span className="text-xs text-muted">Bozza pronta. Non parte nulla senza la tua conferma.</span>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}

function List({ threads, empty }: { threads: MailThread[]; empty: string }) {
  if (threads.length === 0) return <Card className="text-sm text-muted">{empty}</Card>;
  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-card">
      {threads.map((t) => (
        <ThreadRow key={t.id} t={t} />
      ))}
    </ul>
  );
}

export default function InboxPage() {
  const state = useData(getInbox);
  return (
    <>
      <PageHeader title="Inbox" subtitle="Quello che aspetta te, quello che aspetta gli altri, e il rumore già messo da parte." />
      <Loadable state={state}>
        {(v) => {
          const mail = v.mail.status === 'ok' ? v.mail.data : [];
          const count = (b: MailThread['bucket']) => mail.filter((t) => t.bucket === b).length;
          return (
            <Tabs defaultValue="todo">
              <TabsList aria-label="Cartelle">
                <TabsTrigger value="todo">Da gestire{v.mail.status === 'ok' ? ` · ${count('todo')}` : ''}</TabsTrigger>
                <TabsTrigger value="waiting">In attesa di altri{v.mail.status === 'ok' ? ` · ${count('waiting')}` : ''}</TabsTrigger>
                <TabsTrigger value="noise">Rumore filtrato{v.mail.status === 'ok' ? ` · ${count('noise')}` : ''}</TabsTrigger>
                <TabsTrigger value="whatsapp">
                  <MessageCircle size={15} aria-hidden /> WhatsApp Business
                </TabsTrigger>
              </TabsList>
              {(['todo', 'waiting', 'noise'] as const).map((b) => (
                <TabsContent key={b} value={b} className="pt-4">
                  <AvailGuard value={v.mail} onRetry={state.reload}>
                    {(threads) => (
                      <>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm text-muted">
                            {b === 'todo'
                              ? 'Urgenze vere: persone che aspettano una tua risposta.'
                              : b === 'waiting'
                                ? 'Hai già risposto o delegato: ora tocca a qualcun altro.'
                                : 'Newsletter e notifiche automatiche. Non ti servono oggi.'}
                          </p>
                          <SourceBadge source={v.source} />
                        </div>
                        <List threads={threads.filter((t) => t.bucket === b)} empty="Niente qui. Meglio così." />
                      </>
                    )}
                  </AvailGuard>
                </TabsContent>
              ))}
              <TabsContent value="whatsapp" className="pt-4">
                {v.whatsapp.status === 'missing' ? (
                  <MissingData reason={v.whatsapp.reason} cta={v.whatsapp.cta} explain={COPY.whatsapp.onlyBusiness} />
                ) : (
                  <>
                    <p className="mb-3 text-sm text-muted">{COPY.whatsapp.onlyBusiness}</p>
                    <List threads={v.whatsapp.data} empty="Nessun messaggio sul numero Business." />
                  </>
                )}
              </TabsContent>
            </Tabs>
          );
        }}
      </Loadable>
    </>
  );
}
