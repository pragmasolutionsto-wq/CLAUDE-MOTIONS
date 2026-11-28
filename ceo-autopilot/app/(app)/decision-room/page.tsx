'use client';

import { useState } from 'react';
import { HeartPulse, Mic, Send } from 'lucide-react';
import { DEMO_NOW } from '@/config/demo';
import { Loadable } from '@/components/shared/Loadable';
import { PageHeader } from '@/components/shared/PageHeader';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { UrgentHelpBanner } from '@/components/shared/UrgentHelpBanner';
import { Badge, type Tone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, SectionTitle } from '@/components/ui/card';
import { Field, inputClass, Skeleton } from '@/components/ui/misc';
import { getDecisions, type DecisionsView } from '@/lib/data/api';
import { askDecisionRoom, type DecisionAnswer } from '@/lib/data/decisionRoom';
import { useData, useScenario } from '@/lib/data/useData';
import { dateMedium, weekday } from '@/lib/format';
import { isLow } from '@/lib/rules/readiness';
import { detectUrgentHelp } from '@/lib/rules/urgentHelp';
import { useApp } from '@/lib/store';
import type { Decision, DecisionOption } from '@/types/domain';

function statusOf(d: Decision): { label: string; tone: Tone } {
  if (!d.chosen) return { label: 'Aperta', tone: 'info' };
  if (d.outcome) return { label: 'Esito registrato', tone: 'ok' };
  if (d.reviewAt && new Date(d.reviewAt) < DEMO_NOW) return { label: 'Da rivedere', tone: 'warn' };
  return { label: 'Presa', tone: 'neutral' };
}

function Options({ options }: { options: DecisionOption[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {options.map((o) => (
        <div key={o.label} className="rounded-lg border border-line p-3 text-sm">
          <h4 className="font-semibold">{o.label}</h4>
          {(
            [
              ['A favore', o.pros, 'text-ok-fg'],
              ['Contro', o.cons, 'text-warn-fg'],
              ['Rischi', o.risks, 'text-alert-fg'],
            ] as const
          ).map(([label, list, cls]) => (
            <div key={label} className="mt-2">
              <p className={`text-xs font-semibold tracking-wider uppercase ${cls}`}>{label}</p>
              <ul className="mt-0.5 list-disc space-y-0.5 pl-5">
                {list.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function RegisterForm({ answer, readiness, onSaved }: { answer: DecisionAnswer; readiness: number | null; onSaved: () => void }) {
  const addDecision = useApp((s) => s.addDecision);
  const [chosen, setChosen] = useState('');
  const [rationale, setRationale] = useState('');
  const [review, setReview] = useState(answer.reviewAt.slice(0, 10));
  return (
    <form
      className="mt-4 space-y-3 rounded-xl border border-gold/50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!chosen) return;
        addDecision({
          id: `dec-user-${Date.now()}`,
          question: answer.question,
          createdAt: DEMO_NOW.toISOString(),
          options: answer.options,
          missingInfo: answer.missingInfo,
          chosen,
          rationale,
          reviewAt: new Date(review).toISOString(),
          readinessAtDecision: readiness,
        });
        onSaved();
      }}
    >
      <h3 className="font-semibold">Registra la decisione</h3>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Cosa hai scelto</legend>
        <div className="space-y-1">
          {answer.options.map((o) => (
            <label key={o.label} className="flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 text-sm">
              <input type="radio" name="scelta" value={o.label} checked={chosen === o.label} onChange={() => setChosen(o.label)} className="accent-[var(--gold)]" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Perché" hint="Due righe bastano. Tra due mesi ti serviranno per capire se avevi ragione.">
        <textarea className={`${inputClass} h-24 py-2`} value={rationale} onChange={(e) => setRationale(e.target.value)} />
      </Field>
      <Field label="Quando rivedi l’esito">
        <input type="date" className={inputClass} value={review} onChange={(e) => setReview(e.target.value)} />
      </Field>
      <Button type="submit" variant="primary" disabled={!chosen}>
        Salva nel registro
      </Button>
    </form>
  );
}

function Room({ v }: { v: DecisionsView }) {
  const sc = useScenario();
  const added = useApp((s) => s.decisionsAdded);
  const patches = useApp((s) => s.decisionPatches);
  const patchDecision = useApp((s) => s.patchDecision);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<DecisionAnswer | null>(null);
  const [registering, setRegistering] = useState(false);
  const [outcomeFor, setOutcomeFor] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('');
  const urgent = detectUrgentHelp(text) || !!answer?.urgentHelp;
  const lowRecovery = v.readiness && isLow(v.readiness.vsBaseline);
  const all = [...added, ...v.decisions].map((d) => ({ ...d, ...patches[d.id] }));

  const ask = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAnswer(null);
    setRegistering(false);
    setAnswer(await askDecisionRoom(sc, text.trim()));
    setLoading(false);
  };

  return (
    <>
      {urgent ? <UrgentHelpBanner /> : null}
      <Card>
        <label htmlFor="domanda" className="font-serif text-xl font-semibold">
          Che decisione hai davanti?
        </label>
        <textarea
          id="domanda"
          className={`${inputClass} mt-3 h-28 py-3`}
          placeholder="Per esempio: compro il nuovo centro di lavoro adesso o aspetto il bando?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={ask} disabled={!text.trim() || loading}>
            <Send size={16} aria-hidden /> Analizza
          </Button>
          <Button
            onClick={() => {
              setListening(true);
              setTimeout(() => {
                setText('Compro il centro di lavoro a 5 assi da 420.000 euro adesso o aspetto il bando regionale?');
                setListening(false);
              }, 1600);
            }}
            disabled={listening}
            aria-label="Detta la domanda a voce (simulato)"
          >
            <Mic size={16} aria-hidden /> {listening ? 'Ti ascolto…' : 'Detta'}
          </Button>
          <span className="text-xs text-muted">Il microfono è simulato nel prototipo.</span>
        </div>
      </Card>

      {loading ? (
        <div className="mt-4 space-y-3" aria-busy="true" aria-label="Sto preparando l’analisi">
          <Skeleton className="h-24" />
          <Skeleton className="h-48" />
        </div>
      ) : null}

      {answer && !answer.urgentHelp ? (
        <Card className="mt-4" aria-live="polite">
          <CardTitle>{answer.question}</CardTitle>
          <p className="mt-1 text-xs text-muted">Analisi di esempio nel prototipo. Il contesto qui sotto viene dai tuoi dati.</p>

          <h3 className="mt-4 text-xs font-semibold tracking-wider text-muted uppercase">Cosa dicono i tuoi dati</h3>
          {answer.context.length === 0 ? (
            <p className="mt-1 text-sm text-muted">Non disponibile: nessuna fonte collegata da cui prendere il contesto.</p>
          ) : (
            <ul className="mt-1 space-y-2 text-sm">
              {answer.context.map((c) => (
                <li key={c.text} className="flex flex-wrap items-baseline gap-x-3">
                  <span className="num">{c.text}</span>
                  <SourceBadge source={c.source} />
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-4 mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Alternative</h3>
          <Options options={answer.options} />

          <h3 className="mt-4 text-xs font-semibold tracking-wider text-muted uppercase">Informazioni mancanti</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
            {answer.missingInfo.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <span className="font-semibold">Prossima verifica consigliata.</span> {answer.nextCheck}
          </p>

          {lowRecovery ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-vital/40 bg-vital/10 p-3 text-sm">
              <HeartPulse size={16} className="mt-0.5 shrink-0 text-vital-fg" aria-hidden />
              <span>
                Se non è urgente, valuta di decidere in una giornata più recuperata
                {v.betterDay ? ` (${weekday(v.betterDay)} sembra migliore)` : ''}. <span className="text-muted">Lo vedi solo tu.</span>
              </span>
            </p>
          ) : null}

          {registering ? (
            <RegisterForm
              answer={answer}
              readiness={v.readiness?.score ?? null}
              onSaved={() => {
                setAnswer(null);
                setText('');
                setRegistering(false);
              }}
            />
          ) : (
            <Button className="mt-4" variant="primary" onClick={() => setRegistering(true)}>
              Registra la decisione
            </Button>
          )}
        </Card>
      ) : null}

      <section className="mt-8" aria-labelledby="registro">
        <SectionTitle id="registro" className="mb-3">Registro delle decisioni · {all.length}</SectionTitle>
        <ul className="space-y-3">
          {all.map((d) => {
            const st = statusOf(d);
            return (
              <li key={d.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 basis-64 font-semibold">{d.question}</h3>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <p className="num mt-1 text-xs text-muted">
                    Aperta il {dateMedium(d.createdAt)}
                    {d.reviewAt ? ` · revisione ${dateMedium(d.reviewAt)}` : ''}
                    {typeof d.readinessAtDecision === 'number' ? ` · recupero quel giorno ${d.readinessAtDecision}/100` : ''}
                  </p>
                  {d.chosen ? (
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">Scelta:</span> {d.chosen}. {d.rationale}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">
                      Ancora da decidere. Informazioni mancanti: {d.missingInfo.length}.
                    </p>
                  )}
                  {d.outcome ? (
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">Esito:</span> {d.outcome}
                    </p>
                  ) : null}
                  <details className="mt-2">
                    <summary className="cursor-pointer py-1 text-sm font-medium text-gold-fg">Vedi le alternative valutate</summary>
                    <div className="mt-2">
                      <Options options={d.options} />
                    </div>
                  </details>
                  {st.label === 'Da rivedere' ? (
                    outcomeFor === d.id ? (
                      <div className="mt-3 space-y-2">
                        <Field label="Com’è andata?">
                          <textarea className={`${inputClass} h-20 py-2`} value={outcome} onChange={(e) => setOutcome(e.target.value)} />
                        </Field>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!outcome.trim()}
                          onClick={() => {
                            patchDecision(d.id, { outcome: outcome.trim() });
                            setOutcomeFor(null);
                            setOutcome('');
                          }}
                        >
                          Salva l’esito
                        </Button>
                      </div>
                    ) : (
                      <Button className="mt-3" size="sm" onClick={() => setOutcomeFor(d.id)}>
                        Registra l’esito
                      </Button>
                    )
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

export default function DecisionRoomPage() {
  const state = useData(getDecisions);
  return (
    <>
      <PageHeader title="Decision Room" subtitle="Metti in fila i fatti, le alternative e quello che ti manca. Poi decidi tu." />
      <Loadable state={state}>{(v) => <Room v={v} />}</Loadable>
    </>
  );
}
