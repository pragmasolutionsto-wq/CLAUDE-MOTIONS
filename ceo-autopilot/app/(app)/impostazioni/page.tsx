'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PLANS, RENEWAL } from '@/config/pricing';
import { PageHeader } from '@/components/shared/PageHeader';
import { PrivateBadge } from '@/components/shared/PrivateBadge';
import { Badge } from '@/components/ui/badge';
import { Button, buttonClass } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Field, inputClass, Switch } from '@/components/ui/misc';
import { Sheet } from '@/components/ui/sheet';
import { useHydrated } from '@/lib/data/useData';
import { dateMedium, euro } from '@/lib/format';
import { useApp } from '@/lib/store';

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-sm font-medium">{title}</p>
        {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Section({ id, title, badge, children }: { id: string; title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="mb-4" aria-labelledby={id}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <CardTitle id={id}>{title}</CardTitle>
        {badge}
      </div>
      <div className="divide-y divide-line">{children}</div>
    </Card>
  );
}

const num = `${inputClass} num h-10 w-36 text-right text-sm`;
const sel = `${inputClass} h-10 w-auto text-sm`;

export default function SettingsPage() {
  const hydrated = useHydrated();
  const s = useApp();
  const st = s.settings;
  const set = s.setSettings;
  const owner = s.role === 'owner';
  const [invite, setInvite] = useState('');
  const [invited, setInvited] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<null | 'health' | 'all'>(null);
  const [notice, setNotice] = useState('');
  const plan = PLANS[s.plan];
  if (!hydrated) return <PageHeader title="Impostazioni" />;

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ esportatoIl: new Date().toISOString(), impostazioni: st, nota: 'Esportazione di esempio del prototipo.' }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ceo-autopilot-i-miei-dati.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setNotice('Esportazione scaricata.');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Impostazioni" subtitle="Decidi tu quando, come e quanto il sistema ti parla." />
      {notice ? (
        <p role="status" className="mb-4 rounded-lg border border-ok/50 bg-ok/10 px-4 py-3 text-sm">
          {notice}
        </p>
      ) : null}

      <Section id="s-briefing" title="Briefing">
        <Row title="Canale" hint="Dove ricevi il briefing ogni mattina.">
          <select className={sel} aria-label="Canale del briefing" value={st.briefingChannel} onChange={(e) => set({ briefingChannel: e.target.value as typeof st.briefingChannel })}>
            <option value="app">App</option>
            <option value="email">Email</option>
            <option value="audio">Audio</option>
          </select>
        </Row>
        <Row title="Orario" hint="Arriva comunque, anche se non apri l’app per settimane.">
          <input type="time" className={num} aria-label="Orario del briefing" value={st.briefingTime} onChange={(e) => set({ briefingTime: e.target.value })} />
        </Row>
        <Row title="Ore di silenzio" hint="In questa fascia non ricevi nulla.">
          <span className="flex items-center gap-2 text-sm">
            <input type="time" className={`${num} w-28`} aria-label="Silenzio dalle" value={st.quietFrom} onChange={(e) => set({ quietFrom: e.target.value })} />
            –
            <input type="time" className={`${num} w-28`} aria-label="Silenzio fino alle" value={st.quietTo} onChange={(e) => set({ quietTo: e.target.value })} />
          </span>
        </Row>
        <Row title="Lingua dell’audio">
          <select className={sel} aria-label="Lingua dell’audio" value={st.audioLanguage} onChange={(e) => set({ audioLanguage: e.target.value as typeof st.audioLanguage })}>
            <option value="it">Italiano</option>
            <option value="en">Inglese</option>
          </select>
        </Row>
        <Row title="Tema">
          <select className={sel} aria-label="Tema" value={st.theme} onChange={(e) => set({ theme: e.target.value as typeof st.theme })}>
            <option value="dark">Scuro</option>
            <option value="light">Chiaro</option>
          </select>
        </Row>
      </Section>

      <Section id="s-notifiche" title="Soglie degli avvisi">
        <Row title="Riserva di liquidità" hint="Sotto questa cifra ti avviso sempre, qualunque sia il resto.">
          <span className="flex items-center gap-2 text-sm">
            €
            <input type="number" step={5000} min={0} className={num} aria-label="Riserva di liquidità in euro" value={st.liquidityReserve} onChange={(e) => set({ liquidityReserve: Number(e.target.value) || 0 })} />
          </span>
        </Row>
        <Row title="Importo minimo per i solleciti" hint="Sotto questa cifra non ti propongo solleciti.">
          <span className="flex items-center gap-2 text-sm">
            €
            <input type="number" step={500} min={0} className={num} aria-label="Importo minimo per i solleciti in euro" value={st.minReminderAmount} onChange={(e) => set({ minReminderAmount: Number(e.target.value) || 0 })} />
          </span>
        </Row>
        <Row title="Ore di riunioni a settimana" hint="Oltre questa soglia te lo segnalo in Agenda.">
          <span className="flex items-center gap-2 text-sm">
            <input type="number" min={5} max={60} className={`${num} w-24`} aria-label="Ore di riunioni a settimana" value={st.meetingHoursWarn} onChange={(e) => set({ meetingHoursWarn: Number(e.target.value) || 0 })} />
            ore
          </span>
        </Row>
      </Section>

      {owner ? (
        <Section id="s-salute" title="Salute" badge={<PrivateBadge />}>
          {s.plan !== 'health' ? (
            <p className="py-3 text-sm text-muted">
              Disponibile con il piano {PLANS.health.name}.{' '}
              <Link href="/piani" className="text-gold-fg underline underline-offset-4">Vedi i piani</Link>
            </p>
          ) : (
            <>
              <Row title="Incrocio salute-lavoro" hint="Usa il tuo recupero per adattare riunioni e tempistiche delle decisioni.">
                <Switch checked={st.bridgeEnabled} onCheckedChange={(v) => set({ bridgeEnabled: v })} label="Incrocio salute-lavoro" />
              </Row>
              <Row title="Suggerimenti di consulto" hint="Se il recupero resta basso a lungo, ti propongo una videochiamata con un medico.">
                <Switch checked={st.consultSuggestions} onCheckedChange={(v) => set({ consultSuggestions: v })} label="Suggerimenti di consulto" />
              </Row>
              <Row title="Promemoria del check-up" hint="Ti ricordo il check-up semestrale quando si avvicina.">
                <Switch checked={st.checkupReminders} onCheckedChange={(v) => set({ checkupReminders: v })} label="Promemoria del check-up" />
              </Row>
              <Row title="Proposte del tuo medico" hint="Percorsi proposti dal medico dopo un check-up. Mai pubblicità automatica.">
                <Switch checked={st.doctorProposals} onCheckedChange={(v) => set({ doctorProposals: v })} label="Proposte del tuo medico" />
              </Row>
              <Row title="Sede preferita per i check-up">
                <select className={sel} aria-label="Sede preferita per i check-up" value={st.checkupSite} onChange={(e) => set({ checkupSite: e.target.value as typeof st.checkupSite })}>
                  <option value="auto">In base alla distanza</option>
                  <option value="clinic">Clinica di Rivoli</option>
                  <option value="tele">Telemedicina</option>
                </select>
              </Row>
            </>
          )}
        </Section>
      ) : null}

      {owner ? (
        <Section id="s-utenti" title="Utenti">
          <Row title="Marco Ferraris" hint="Titolare · vede tutto">
            <Badge tone="gold">Tu</Badge>
          </Row>
          {invited.map((m) => (
            <Row key={m} title={m} hint="Assistente · vede solo l’area business, mai Salute e Clinica">
              <Badge tone="neutral">Invito inviato</Badge>
            </Row>
          ))}
          <form
            className="flex flex-wrap items-end gap-2 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!invite.includes('@')) return;
              setInvited((l) => [...l, invite]);
              setInvite('');
            }}
          >
            <div className="min-w-0 flex-1 basis-56">
              <Field label="Invita un assistente" hint="Vede solo la parte business. Salute e Clinica restano tue.">
                <input type="email" className={inputClass} placeholder="nome@azienda.it" value={invite} onChange={(e) => setInvite(e.target.value)} />
              </Field>
            </div>
            <Button type="submit" className="mb-5">
              Invia l’invito
            </Button>
          </form>
        </Section>
      ) : null}

      {owner ? (
        <Section id="s-privacy" title="Privacy">
          <Row title="Esporta i miei dati" hint="Scarichi un file con tutto quello che il sistema conserva su di te.">
            <Button size="sm" onClick={exportData}>
              Esporta
            </Button>
          </Row>
          <Row title="Cancella i dati salute" hint="Scollega il wearable ed elimina lo storico. Non si può annullare.">
            <Button size="sm" variant="danger" onClick={() => setConfirm('health')}>
              Cancella
            </Button>
          </Row>
          <Row title="Revoca tutto" hint="Scollega tutte le fonti in un colpo solo.">
            <Button size="sm" variant="danger" onClick={() => setConfirm('all')}>
              Revoca tutto
            </Button>
          </Row>
        </Section>
      ) : null}

      <Section id="s-piano" title="Piano">
        <Row title={plan.name} hint={`${euro(plan.priceYear)}/anno ${plan.vatNote} · rinnovo il ${dateMedium(RENEWAL.renewalDate)}`}>
          {s.plan === 'business' ? (
            <Link href="/piani" className={buttonClass('primary', 'sm')}>
              Passa a {PLANS.health.name}
            </Link>
          ) : (
            <Link href="/piani" className={buttonClass('secondary', 'sm')}>
              Vedi i piani
            </Link>
          )}
        </Row>
      </Section>

      <Sheet
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        variant="center"
        title={confirm === 'health' ? 'Cancellare i dati salute?' : 'Revocare tutte le fonti?'}
        description={confirm === 'health' ? 'Il wearable viene scollegato e lo storico eliminato.' : 'Il sistema smette di leggere tutte le fonti. Potrai ricollegarle una per una.'}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="danger"
            onClick={() => {
              if (confirm === 'health') {
                s.setConnector('wearable', 'not_connected');
                setNotice('Dati salute cancellati e wearable scollegato.');
              } else {
                s.set({ connectorScenario: 'none', connectorOverrides: {} });
                setNotice('Tutte le fonti sono state scollegate.');
              }
              setConfirm(null);
            }}
          >
            Sì, procedi
          </Button>
          <Button onClick={() => setConfirm(null)}>Annulla</Button>
        </div>
      </Sheet>
    </div>
  );
}
