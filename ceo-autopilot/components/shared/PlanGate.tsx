'use client';

import Link from 'next/link';
import { HeartPulse, Lock } from 'lucide-react';
import { COPY } from '@/config/copy';
import { PLANS } from '@/config/pricing';
import { buttonClass } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { euro } from '@/lib/format';

/**
 * Funzione del piano Business + Health vista da chi ha il piano Business:
 * anteprima sfocata fatta di sole forme (nessun dato reale) e invito a passare di piano.
 */
export function PlanGate({ title, points }: { title: string; points: string[] }) {
  const plan = PLANS.health;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line">
      <div className="pointer-events-none grid gap-4 p-5 opacity-60 blur-[6px] select-none sm:grid-cols-3" aria-hidden>
        <div className="flex items-center justify-center">
          <div className="h-36 w-36 rounded-full border-[10px] border-vital/60" />
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-16 rounded-lg bg-card" />
            <div className="h-16 rounded-lg bg-card" />
          </div>
        ))}
        <div className="h-40 rounded-lg bg-card sm:col-span-3" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-bg/70 p-4">
        <Card className="max-w-md border-gold/60 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-vital/15 text-vital-fg">
            <HeartPulse size={22} aria-hidden />
          </div>
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <ul className="mt-3 space-y-1.5 text-left text-sm text-muted">
            {points.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-vital" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/piani" className={buttonClass('primary', 'md', 'mt-4 w-full')}>
            Passa a {plan.name}
          </Link>
          <p className="num mt-2 text-xs text-muted">
            {euro(plan.priceYear)}/anno {plan.vatNote}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted">
            <Lock size={11} aria-hidden /> {COPY.health.onlyYou}
          </p>
        </Card>
      </div>
    </div>
  );
}

/** Area riservata al titolare: un assistente non vede mai Salute e Clinica. */
export function OwnerOnly() {
  return (
    <Card className="flex max-w-lg flex-col items-start gap-3">
      <Lock className="text-muted" size={22} aria-hidden />
      <div>
        <h2 className="font-semibold">{COPY.health.ownerOnly}</h2>
        <p className="text-sm text-muted">
          I dati personali vivono in un’area separata. Chi collabora con l’azienda vede solo la parte business.
        </p>
      </div>
      <Link href="/oggi" className={buttonClass('secondary', 'sm')}>
        Torna a Oggi
      </Link>
    </Card>
  );
}
