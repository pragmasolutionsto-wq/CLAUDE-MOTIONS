'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Mic } from 'lucide-react';
import { COPY } from '@/config/copy';
import { ConnectModal } from '@/components/shared/ConnectModal';
import { ConnectorCard } from '@/components/shared/ConnectorCard';
import { PublicHeader } from '@/components/shell/PublicHeader';
import { Button, buttonClass } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, inputClass } from '@/components/ui/misc';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { company } from '@/mocks/company';
import { connectors as baseConnectors } from '@/mocks/connectors';
import { NOW } from '@/mocks/time';
import type { ConnectorId, ConnectorStatus } from '@/types/domain';

const STEPS = ['Benvenuto', 'La tua azienda', 'Le tue priorità', 'Le tue fonti', 'Il tuo briefing'];
const GOALS = ['Più liquidità', 'Crescere sui clienti', 'Delegare di più', 'Ridurre i costi', 'Accedere a bandi', 'Stare meglio io'];

export default function OnboardingPage() {
  const router = useRouter();
  const setSettings = useApp((s) => s.setSettings);
  const [step, setStep] = useState(0);
  // Step 2
  const [url, setUrl] = useState('');
  const [looking, setLooking] = useState(false);
  const [profile, setProfile] = useState<{ name: string; sector: string; city: string; employees: string } | null>(null);
  // Step 3
  const [goals, setGoals] = useState<string[]>([]);
  const [voice, setVoice] = useState<'idle' | 'listening' | 'done'>('idle');
  // Step 4
  const [connected, setConnected] = useState<ConnectorId[]>([]);
  const [connecting, setConnecting] = useState<ConnectorStatus | null>(null);
  // Step 5
  const [channel, setChannel] = useState<'app' | 'email' | 'audio'>('app');
  const [time, setTime] = useState('07:00');
  const [quietFrom, setQuietFrom] = useState('20:30');
  const [quietTo, setQuietTo] = useState('06:30');

  const toggleGoal = (g: string) => setGoals((l) => (l.includes(g) ? l.filter((x) => x !== g) : l.length < 3 ? [...l, g] : l));
  const lookup = () => {
    setLooking(true);
    setTimeout(() => {
      setProfile({ name: company.name, sector: company.sector, city: `${company.city} (${company.province})`, employees: String(company.employees) });
      setLooking(false);
    }, 1300);
  };
  const view = (c: ConnectorStatus): ConnectorStatus =>
    connected.includes(c.id)
      ? { ...c, state: 'connected', lastSync: NOW.toISOString(), consentExpiresAt: undefined }
      : { ...c, state: 'not_connected', lastSync: undefined, consentExpiresAt: undefined };
  const business = baseConnectors.filter((c) => !c.privateDomain).map(view);
  const personal = baseConnectors.filter((c) => c.privateDomain).map(view);
  const canNext = step === 1 ? !!profile : step === 2 ? goals.length > 0 : true;

  const finish = () => {
    setSettings({ briefingChannel: channel, briefingTime: time, quietFrom, quietTo });
    router.push('/oggi?demo=1');
  };

  return (
    <>
      <PublicHeader cta={false} />
      <main className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6">
        <div className="mb-6">
          <p className="num text-sm text-muted" aria-live="polite">
            Passo {step + 1} di {STEPS.length} · {STEPS[step]}
          </p>
          <div className="mt-2 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Avanzamento">
            {STEPS.map((s, i) => (
              <span key={s} className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-gold' : 'bg-line')} />
            ))}
          </div>
        </div>

        {step === 0 ? (
          <section>
            <h1 className="font-serif text-2xl leading-tight font-semibold sm:text-3xl">{COPY.claim}</h1>
            <p className="mt-4 text-muted">In meno di 10 minuti imposti il tuo copilot. Ecco cosa succede:</p>
            <ol className="mt-4 space-y-3">
              {['Ci dici chi sei e cosa conta quest’anno', 'Colleghi le fonti che vuoi, tutte in sola lettura', 'Scegli quando ricevere il briefing', 'Da domani mattina, in 60 secondi sai cosa conta'].map((t, i) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/60 text-sm font-semibold text-gold-fg">{i + 1}</span>
                  <span className="pt-0.5">{t}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-lg border border-line p-3 text-sm text-muted">{COPY.readOnly}</p>
          </section>
        ) : null}

        {step === 1 ? (
          <section>
            <h1 className="font-serif text-2xl font-semibold">La tua azienda</h1>
            <p className="mt-2 text-muted">Scrivi il sito: precompilo io i dati, tu confermi o correggi.</p>
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1 basis-60">
                <Field label="Sito web">
                  <input className={inputClass} placeholder="www.latuaazienda.it" value={url} onChange={(e) => setUrl(e.target.value)} />
                </Field>
              </div>
              <Button onClick={lookup} disabled={looking || url.trim().length < 4}>
                {looking ? 'Sto leggendo il sito…' : 'Precompila'}
              </Button>
            </div>
            {profile ? (
              <Card className="mt-4 space-y-3">
                <p className="text-sm text-muted">Ho trovato questi dati (simulati nel prototipo). Correggi quello che non torna.</p>
                {(
                  [
                    ['name', 'Ragione sociale'],
                    ['sector', 'Settore'],
                    ['city', 'Sede'],
                    ['employees', 'Dipendenti'],
                  ] as const
                ).map(([k, label]) => (
                  <Field key={k} label={label}>
                    <input className={inputClass} value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
                  </Field>
                ))}
              </Card>
            ) : (
              <button type="button" className="mt-3 text-sm text-muted underline underline-offset-4" onClick={() => setProfile({ name: '', sector: '', city: '', employees: '' })}>
                Non ho un sito: compilo a mano
              </button>
            )}
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <h1 className="font-serif text-2xl font-semibold">Le tue 3 priorità dell’anno</h1>
            <p className="mt-2 text-muted">Servono a decidere cosa mettere in cima al briefing. Scegline fino a 3.</p>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Priorità dell’anno">
              {GOALS.map((g) => {
                const on = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleGoal(g)}
                    className={cn('flex h-11 items-center gap-2 rounded-full border px-4 text-sm', on ? 'border-gold bg-gold/15 font-semibold' : 'border-line text-muted hover:text-fg')}
                  >
                    {on ? <Check size={15} aria-hidden /> : null}
                    {g}
                  </button>
                );
              })}
            </div>
            <p className="num mt-2 text-sm text-muted" aria-live="polite">{goals.length}/3 scelte</p>
            <Card className="mt-5">
              <p className="font-semibold">Oppure dimmelo a voce</p>
              <p className="text-sm text-muted">Racconta in 30 secondi cosa vuoi ottenere quest’anno.</p>
              <Button
                className="mt-3"
                disabled={voice === 'listening'}
                onClick={() => {
                  setVoice('listening');
                  setTimeout(() => {
                    setVoice('done');
                    setGoals(['Più liquidità', 'Delegare di più', 'Stare meglio io']);
                  }, 1800);
                }}
              >
                <Mic size={16} aria-hidden /> {voice === 'listening' ? 'Ti ascolto…' : 'Registra (simulato)'}
              </Button>
              {voice === 'done' ? (
                <div className="mt-3 text-sm" aria-live="polite">
                  <p className="text-muted">
                    Trascrizione: “Quest’anno voglio smettere di rincorrere gli incassi, passare più cose a Giorgio e non arrivare a dicembre distrutto.”
                  </p>
                  <p className="mt-2">Ho estratto 3 obiettivi e li ho selezionati qui sopra. Confermali o cambiali.</p>
                </div>
              ) : null}
            </Card>
          </section>
        ) : null}

        {step === 3 ? (
          <section>
            <h1 className="font-serif text-2xl font-semibold">Collega le fonti</h1>
            <p className="mt-2 text-muted">Ogni fonte è facoltativa: puoi saltarle tutte e collegarle dopo. {COPY.readOnly}</p>
            <h2 className="mt-5 mb-3 text-xs font-semibold tracking-wider text-muted uppercase">Azienda</h2>
            <div className="grid gap-3">
              {business.map((c) => (
                <ConnectorCard key={c.id} connector={c} compact onConnect={() => setConnecting(c)} onRevoke={() => setConnected((l) => l.filter((x) => x !== c.id))} />
              ))}
            </div>
            <h2 className="mt-6 mb-1 text-xs font-semibold tracking-wider text-vital-fg uppercase">Salute (privato, solo piano Business + Health)</h2>
            <p className="mb-3 text-sm text-muted">
              Consenso separato. I dati del wearable restano in un’area che vedi solo tu. Per Apple Watch serve l’app iPhone di CEO AUTOPILOT{' '}
              <span className="underline decoration-dotted underline-offset-4">(link in arrivo)</span>.
            </p>
            <div className="grid gap-3">
              {personal.map((c) => (
                <ConnectorCard key={c.id} connector={c} compact onConnect={() => setConnecting(c)} onRevoke={() => setConnected((l) => l.filter((x) => x !== c.id))} />
              ))}
            </div>
            <p className="num mt-4 text-sm text-muted" aria-live="polite">
              {connected.length} fonti collegate su {baseConnectors.length}.
            </p>
          </section>
        ) : null}

        {step === 4 ? (
          <section>
            <h1 className="font-serif text-2xl font-semibold">Il tuo briefing</h1>
            <p className="mt-2 text-muted">Come e quando vuoi riceverlo.</p>
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium">Canale</legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['app', 'App'],
                    ['email', 'Email'],
                    ['audio', 'Audio'],
                  ] as const
                ).map(([v, l]) => (
                  <button key={v} type="button" aria-pressed={channel === v} onClick={() => setChannel(v)} className={cn('h-11 rounded-lg border px-4 text-sm', channel === v ? 'border-gold bg-gold/15 font-semibold' : 'border-line text-muted')}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field label="Orario">
                <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
              </Field>
              <Field label="Silenzio dalle">
                <input type="time" className={inputClass} value={quietFrom} onChange={(e) => setQuietFrom(e.target.value)} />
              </Field>
              <Field label="Fino alle">
                <input type="time" className={inputClass} value={quietTo} onChange={(e) => setQuietTo(e.target.value)} />
              </Field>
            </div>
            <Card className="mt-5 border-gold/50">
              <p className="num font-semibold">Il primo briefing arriva domani alle {time}.</p>
              <p className="text-sm text-muted">Intanto, ecco un’anteprima con i dati di un’azienda di esempio.</p>
            </Card>
          </section>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          {step > 0 ? (
            <Button onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={16} aria-hidden /> Indietro
            </Button>
          ) : (
            <Link href="/piani" className={buttonClass('ghost')}>
              Vedi i piani
            </Link>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="primary" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              {step === 3 && connected.length === 0 ? 'Salta per ora' : 'Continua'} <ArrowRight size={16} aria-hidden />
            </Button>
          ) : (
            <Button variant="primary" onClick={finish}>
              Vedi l’anteprima <ArrowRight size={16} aria-hidden />
            </Button>
          )}
        </div>
      </main>
      <ConnectModal
        connector={connecting}
        failFirst={connecting?.id === 'bank_intesa'}
        onClose={() => setConnecting(null)}
        onConnected={(c) => {
          setConnected((l) => [...new Set([...l, c.id])]);
          setConnecting(null);
        }}
      />
    </>
  );
}
