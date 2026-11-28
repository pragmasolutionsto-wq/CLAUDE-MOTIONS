'use client';

import { useState } from 'react';
import { Building2, Check, FileText, Video } from 'lucide-react';
import { COPY } from '@/config/copy';
import { SlotPicker } from '@/components/health/SlotPicker';
import { HealthDisclaimer } from '@/components/shared/HealthDisclaimer';
import { Loadable } from '@/components/shared/Loadable';
import { PageHeader } from '@/components/shared/PageHeader';
import { OwnerOnly, PlanGate } from '@/components/shared/PlanGate';
import { PrivateBadge } from '@/components/shared/PrivateBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, SectionTitle } from '@/components/ui/card';
import { inputClass } from '@/components/ui/misc';
import { Sheet } from '@/components/ui/sheet';
import { getClinic, type ClinicView } from '@/lib/data/api';
import { useData } from '@/lib/data/useData';
import { dateMedium, dayLong, euro } from '@/lib/format';
import { useApp, type Booking } from '@/lib/store';
import { cn } from '@/lib/utils';

type Mode = 'clinic' | 'tele';

function CheckupBooking({ v }: { v: ClinicView }) {
  const site = useApp((s) => s.settings.checkupSite);
  const addBooking = useApp((s) => s.addBooking);
  const clinicFirst = site === 'auto' ? v.clinicFirst : site === 'clinic';
  const order: Mode[] = clinicFirst ? ['clinic', 'tele'] : ['tele', 'clinic'];
  const [mode, setMode] = useState<Mode>(order[0]);
  const [city, setCity] = useState('Torino');
  const [center, setCenter] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const cities = [...new Set(v.centers.map((c) => c.city))];
  const ready = date && time && (mode === 'clinic' || center);
  const info: Record<Mode, { title: string; text: string; icon: typeof Video }> = {
    clinic: { title: 'In clinica a Rivoli', text: `Tutto in una mattina, circa 2 ore. A ${v.kmFromClinic} km dalla sede della tua azienda.`, icon: Building2 },
    tele: { title: 'Telemedicina + prelievo vicino a te', text: 'Prelievo in un centro convenzionato, poi visita in video con il tuo medico.', icon: Video },
  };
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Modalità del check-up">
        {order.map((m, i) => {
          const Icon = info[m].icon;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn('rounded-xl border p-4 text-left', mode === m ? 'border-vital bg-vital/10' : 'border-line hover:border-muted')}
            >
              <span className="flex flex-wrap items-center gap-2">
                <Icon size={18} className="text-vital-fg" aria-hidden />
                <span className="font-semibold">{info[m].title}</span>
                {i === 0 ? <Badge tone="vital">Consigliata per te</Badge> : null}
              </span>
              <span className="mt-1 block text-sm text-muted">{info[m].text}</span>
            </button>
          );
        })}
      </div>

      {mode === 'tele' ? (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="citta">Dove vuoi fare il prelievo</label>
          <select id="citta" className={`${inputClass} max-w-xs`} value={city} onChange={(e) => { setCity(e.target.value); setCenter(null); }}>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="Centri prelievi convenzionati">
            {v.centers.filter((c) => c.city === city).map((c) => (
              <button
                key={c.name}
                type="button"
                aria-pressed={center === c.name}
                onClick={() => setCenter(c.name)}
                className={cn('rounded-lg border px-3 py-2 text-left text-sm', center === c.name ? 'border-vital bg-vital/10' : 'border-line')}
              >
                <span className="font-semibold">{c.name}</span>
                <span className="block text-muted">{c.address}, {c.city}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <SlotPicker slots={v.slots} date={date} time={time} onChange={(d, t) => { setDate(d); setTime(t); }} />
      </div>
      <Button className="mt-4" variant="vital" disabled={!ready} onClick={() => setConfirm(true)}>
        Prenota il check-up
      </Button>

      <Sheet open={confirm} onOpenChange={setConfirm} variant="center" title="Confermi la prenotazione?" description="Puoi spostarla o annullarla fino a 48 ore prima.">
        {date && time ? (
          <p className="num text-sm">
            Check-up semestrale, {dayLong(date)} alle {time}. {mode === 'clinic' ? v.clinicAddress : `Prelievo presso ${center}, poi visita in video.`}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="vital"
            onClick={() => {
              addBooking({ kind: 'checkup', mode, date: date as string, time: time as string, center: center ?? undefined });
              setConfirm(false);
            }}
          >
            Sì, prenota
          </Button>
          <Button onClick={() => setConfirm(false)}>Annulla</Button>
        </div>
      </Sheet>
    </>
  );
}

function ConsultBooking({ v }: { v: ClinicView }) {
  const addBooking = useApp((s) => s.addBooking);
  const [doctor, setDoctor] = useState(v.doctors[0].name);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <label className="mb-1.5 block text-sm font-medium" htmlFor="medico">Con chi</label>
      <select id="medico" className={`${inputClass} max-w-sm`} value={doctor} onChange={(e) => setDoctor(e.target.value)}>
        {v.doctors.map((d) => (
          <option key={d.id} value={d.name}>
            {d.name} · {d.specialty}
          </option>
        ))}
      </select>
      <div className="mt-4">
        <SlotPicker slots={v.slots.slice(0, 6)} date={date} time={time} onChange={(d, t) => { setDate(d); setTime(t); }} />
      </div>
      <Button className="mt-4" variant="vital" disabled={!date || !time} onClick={() => setConfirm(true)}>
        Prenota la videochiamata
      </Button>
      <Sheet open={confirm} onOpenChange={setConfirm} variant="center" title="Confermi il consulto?" description={`${v.teleconsult.minutes} minuti in video.`}>
        {date && time ? (
          <p className="num text-sm">
            {doctor}, {dayLong(date)} alle {time}. {v.teleconsult.included ? 'Incluso nel tuo piano.' : `Costo: ${euro(v.teleconsult.price)}.`}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="vital"
            onClick={() => {
              addBooking({ kind: 'consult', mode: 'tele', date: date as string, time: time as string, doctor });
              setConfirm(false);
            }}
          >
            Sì, prenota
          </Button>
          <Button onClick={() => setConfirm(false)}>Annulla</Button>
        </div>
      </Sheet>
    </>
  );
}

function Booked({ b, label }: { b: Booking; label: string }) {
  return (
    <p className="num flex flex-wrap items-center gap-2 rounded-lg border border-ok/50 bg-ok/10 p-3 text-sm" role="status">
      <Check size={16} className="text-ok-fg" aria-hidden />
      <span>
        {label} prenotato: {dayLong(b.date)} alle {b.time}
        {b.kind === 'checkup' ? (b.mode === 'clinic' ? ', in clinica a Rivoli' : `, prelievo presso ${b.center} e visita in video`) : `, in video con ${b.doctor}`}.
      </span>
    </p>
  );
}

function Content({ v }: { v: ClinicView }) {
  const bookings = useApp((s) => s.bookings);
  const set = useApp((s) => s.set);
  const settings = useApp((s) => s.settings);
  const proposalStatus = useApp((s) => s.proposalStatus);
  const checkupBooking = bookings.find((b) => b.kind === 'checkup');
  const consultBooking = bookings.find((b) => b.kind === 'consult');
  const cancel = (kind: Booking['kind']) => set({ bookings: bookings.filter((b) => b.kind !== kind) });
  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Il tuo check-up semestrale</CardTitle>
          <Badge tone={checkupBooking ? 'ok' : 'warn'}>{checkupBooking ? 'Prenotato' : 'Da prenotare'}</Badge>
        </div>
        <p className="num mt-1 text-sm text-muted">
          Ultimo completato il {dateMedium(v.checkup.lastDate)} · prossimo entro il {dateMedium(v.checkup.nextDueDate)}
        </p>
        <details className="mt-2">
          <summary className="cursor-pointer py-1 text-sm font-medium text-vital-fg">Cosa include</summary>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
            {v.checkup.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </details>
        <div className="mt-4 border-t border-line pt-4">
          {checkupBooking ? (
            <>
              <Booked b={checkupBooking} label="Check-up" />
              <Button className="mt-3" size="sm" onClick={() => cancel('checkup')}>
                Cambia o annulla
              </Button>
            </>
          ) : (
            <CheckupBooking v={v} />
          )}
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Consulto in video con un medico Longevitas</CardTitle>
          <Badge tone="neutral">{v.teleconsult.included ? 'Incluso nel piano' : `${euro(v.teleconsult.price)} a consulto`}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted">{v.teleconsult.minutes} minuti per parlare di come stai, senza aspettare il check-up.</p>
        {v.suggestConsult && settings.consultSuggestions && !consultBooking ? (
          <p className="mt-3 rounded-lg border border-vital/40 bg-vital/10 p-3 text-sm">
            Da due settimane il tuo recupero resta sotto la tua media. Potrebbe valere un confronto con un medico: decidi tu se e quando.
          </p>
        ) : null}
        <div className="mt-4 border-t border-line pt-4">
          {consultBooking ? (
            <>
              <Booked b={consultBooking} label="Consulto" />
              <Button className="mt-3" size="sm" onClick={() => cancel('consult')}>
                Cambia o annulla
              </Button>
            </>
          ) : (
            <ConsultBooking v={v} />
          )}
        </div>
      </Card>

      {settings.doctorProposals && v.proposals.length > 0 ? (
        <section className="mt-6" aria-labelledby="proposte-medico">
          <SectionTitle id="proposte-medico" className="mb-3">Proposte del tuo medico Longevitas</SectionTitle>
          {v.proposals.map((p) => {
            const doc = v.doctors.find((d) => d.id === p.doctorId);
            const st = proposalStatus[p.id];
            return (
              <Card key={p.id} className="flex flex-wrap items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-vital/15 font-serif text-lg font-semibold text-vital-fg" aria-hidden>
                  {doc?.initials}
                </span>
                <div className="min-w-0 flex-1 basis-60">
                  <p className="text-xs text-muted">
                    Proposto da {doc?.name} dopo il check-up del {dateMedium(v.checkup.lastDate)}
                  </p>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm">{p.description}</p>
                  <p className="num mt-1 text-sm text-muted">
                    {p.duration} · {euro(p.price)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {st === 'talk' ? (
                      <Badge tone="ok">Il medico ti ricontatta</Badge>
                    ) : st === 'later' ? (
                      <Badge tone="neutral">Messa da parte</Badge>
                    ) : (
                      <>
                        <Button size="sm" variant="vital" onClick={() => set({ proposalStatus: { ...proposalStatus, [p.id]: 'talk' } })}>
                          Ne parlo col medico
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => set({ proposalStatus: { ...proposalStatus, [p.id]: 'later' } })}>
                          Non ora
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      ) : null}

      <section className="mt-6" aria-labelledby="referti">
        <SectionTitle id="referti" className="mb-3">I tuoi referti</SectionTitle>
        <ul className="divide-y divide-line rounded-xl border border-line bg-card">
          {v.reports.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              <FileText size={18} className="text-muted" aria-hidden />
              <span className="min-w-0 flex-1 basis-48">
                <span className="font-semibold">{r.title}</span>
                <span className="num block text-muted">
                  Caricato dalla clinica il {dateMedium(r.date)} · Commentato dalla {r.commentedBy}
                </span>
              </span>
              <Badge tone="neutral">Documento</Badge>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">{COPY.health.reportNote}</p>
      </section>
    </>
  );
}

export default function ClinicPage() {
  const state = useData(getClinic);
  return (
    <>
      <PageHeader title="Clinica" subtitle="Check-up, consulti e referti con i medici Longevitas.">
        <PrivateBadge />
      </PageHeader>
      <Loadable state={state}>
        {(g) =>
          g.gate === 'role' ? (
            <OwnerOnly />
          ) : g.gate === 'plan' ? (
            <PlanGate
              title="Medici veri, quando servono"
              points={[
                'Check-up Longevitas ogni 6 mesi incluso nel piano',
                'In clinica a Rivoli oppure in telemedicina con prelievo vicino a casa',
                'Consulti in video con il tuo medico',
              ]}
            />
          ) : (
            <Content v={g.data} />
          )
        }
      </Loadable>
      <HealthDisclaimer />
    </>
  );
}
