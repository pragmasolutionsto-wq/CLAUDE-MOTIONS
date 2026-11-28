'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { COPY } from '@/config/copy';
import { Button, buttonClass } from '@/components/ui/button';
import { Field, inputClass } from '@/components/ui/misc';
import { Sheet } from '@/components/ui/sheet';
import { dayLong, time } from '@/lib/format';
import { useApp } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import type { ProposedAction } from '@/types/domain';

const KIND: Record<ProposedAction['kind'], { title: string; confirm: string; done: string; ask: string }> = {
  draft_email: { title: 'Bozza di risposta', confirm: 'Invia', done: 'Mail inviata', ask: 'Confermi l’invio? La mail parte adesso.' },
  payment_reminder: { title: 'Sollecito di pagamento', confirm: 'Invia il sollecito', done: 'Sollecito inviato', ask: 'Confermi l’invio del sollecito? Parte adesso.' },
  reschedule: { title: 'Spostamento proposto', confirm: 'Sposta', done: 'Riunioni spostate', ask: 'Confermi lo spostamento? I partecipanti ricevono il nuovo invito.' },
  delegate: { title: 'Delega proposta', confirm: 'Proponi la delega', done: 'Proposta inviata', ask: 'Confermi? Mando la proposta alla persona indicata.' },
  block_time: { title: 'Blocco in agenda', confirm: 'Blocca', done: 'Tempo bloccato in agenda', ask: 'Confermi? Aggiungo il blocco al tuo calendario.' },
  book_checkup: { title: 'Prenotazione', confirm: 'Vai alla prenotazione', done: '', ask: '' },
  open_detail: { title: 'Dettaglio', confirm: 'Apri', done: '', ask: '' },
};

/** Pannello per rivedere, modificare e approvare un'azione proposta. Due passi: revisione, poi conferma esplicita. */
export function ActionDrawer() {
  const current = useUi((s) => s.action);
  if (!current) return null;
  // La chiave azzera lo stato del pannello a ogni nuova azione aperta.
  return <ActionPanel key={`${current.action.id}-${current.mode}`} current={current} />;
}

type Current = NonNullable<ReturnType<typeof useUi.getState>['action']>;

function ActionPanel({ current }: { current: Current }) {
  const close = useUi((s) => s.close);
  const setAction = useApp((s) => s.setAction);
  const action = current.action;
  const [step, setStep] = useState<'review' | 'confirm' | 'done'>('review');
  const [to, setTo] = useState(String(action.payload.to ?? ''));
  const [subject, setSubject] = useState(String(action.payload.subject ?? ''));
  const [body, setBody] = useState(String(action.payload.body ?? ''));
  const meta = KIND[action.kind];
  const isMail = action.kind === 'draft_email' || action.kind === 'payment_reminder';
  const editable = current.mode === 'edit';
  const titles = (action.payload.titles as string[] | undefined) ?? [];
  const toDay = action.payload.toDay as string | undefined;
  const start = action.payload.start as string | undefined;

  return (
    <Sheet open onOpenChange={(o) => !o && close()} title={meta.title} description={current.insight?.title}>
      {step === 'done' ? (
        <div className="flex flex-col items-start gap-4" role="status">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ok/15 text-ok-fg">
            <Check size={22} aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{meta.done}</p>
            <p className="text-sm text-muted">Nel prototipo l’azione è simulata: non è partito nulla di reale.</p>
          </div>
          <Button onClick={close}>Chiudi</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {isMail ? (
            <>
              <Field label="A">
                <input className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} readOnly={!editable} />
              </Field>
              <Field label="Oggetto">
                <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} readOnly={!editable} />
              </Field>
              <Field label="Testo" hint={editable ? 'Puoi cambiare tutto prima di inviare.' : undefined}>
                <textarea
                  className={`${inputClass} h-64 resize-y py-2 leading-relaxed`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  readOnly={!editable}
                />
              </Field>
            </>
          ) : null}

          {action.kind === 'reschedule' ? (
            <div className="text-sm">
              <p className="text-muted">Riunioni da spostare</p>
              <ul className="mt-1 space-y-1">
                {titles.map((t) => (
                  <li key={t} className="rounded-lg border border-line px-3 py-2">
                    {t}
                  </li>
                ))}
              </ul>
              {toDay ? (
                <p className="mt-3">
                  Nuovo giorno: <span className="font-semibold">{dayLong(toDay)}</span>, nel primo spazio libero comune.
                </p>
              ) : null}
            </div>
          ) : null}

          {action.kind === 'delegate' ? (
            <div className="text-sm">
              <p className="text-muted">Riunioni ricorrenti in cui non sei tu a decidere</p>
              <ul className="mt-1 space-y-1">
                {titles.map((t) => (
                  <li key={t} className="rounded-lg border border-line px-3 py-2">
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Da proporre a <span className="font-semibold">{String(action.payload.to)}</span>, con un riepilogo
                settimanale per te.
              </p>
            </div>
          ) : null}

          {action.kind === 'block_time' && start ? (
            <p className="text-sm">
              <span className="font-semibold">{String(action.payload.title)}</span>: {dayLong(start)}, dalle {time(start)} per{' '}
              {String(action.payload.minutes)} minuti.
            </p>
          ) : null}

          {action.kind === 'book_checkup' ? (
            <p className="text-sm">Scegli giorno, orario e modalità nella sezione Clinica.</p>
          ) : null}

          {current.insight?.healthReason ? (
            <p className="rounded-lg border border-vital/40 bg-vital/10 p-3 text-sm">
              <span className="font-semibold text-vital-fg">Perché te lo propongo.</span> {current.insight.healthReason}
            </p>
          ) : null}

          <p className="flex items-start gap-2 text-xs text-muted">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden />
            {COPY.readOnly}
          </p>

          {action.kind === 'book_checkup' ? (
            <Link href="/clinica" onClick={close} className={buttonClass('vital')}>
              {meta.confirm}
            </Link>
          ) : step === 'review' ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => setStep('confirm')}>
                {meta.confirm}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setAction(action.id, 'ignored');
                  close();
                }}
              >
                Ignora
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-gold/60 bg-gold/10 p-4" role="alertdialog" aria-label="Conferma">
              <p className="text-sm font-semibold">{meta.ask}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  autoFocus
                  onClick={() => {
                    setAction(action.id, 'approved');
                    setStep('done');
                  }}
                >
                  Sì, conferma
                </Button>
                <Button onClick={() => setStep('review')}>Torna indietro</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
