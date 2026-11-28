import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { COPY } from '@/config/copy';
import { CLINIC_PRICING, PLANS, RENEWAL } from '@/config/pricing';
import { PublicHeader } from '@/components/shell/PublicHeader';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { euro } from '@/lib/format';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Piani e prezzi' };

const FAQ: [string, string][] = [
  ['Chi vede i miei dati di salute?', 'Solo tu. Vivono in un’area separata: chi collabora con te in azienda, anche se ha un accesso, non li vede mai.'],
  ['Il sistema può mandare mail o disporre pagamenti da solo?', 'No. Lavora in sola lettura: propone bozze, solleciti e spostamenti, ma niente parte senza la tua conferma. I pagamenti non può disporli in nessun caso.'],
  ['Quali fonti posso collegare?', 'Fatture elettroniche, conti bancari, mail, calendario, riunioni registrate, wearable e il numero WhatsApp Business dell’azienda. Ogni fonte è facoltativa e revocabile in un clic. Le chat WhatsApp personali non sono accessibili.'],
  ['Il sistema fa valutazioni mediche?', 'No. Confronta sonno e recupero con i tuoi valori abituali e ti aiuta a organizzare meglio il lavoro. Per tutto il resto ci sono i medici Longevitas.'],
  ['Come funziona la disdetta?', 'Il piano è annuale e non si rinnova se disdici entro 30 giorni dalla scadenza. I tuoi dati li esporti o li cancelli quando vuoi.'],
  ['Ricevo fattura?', 'Sì, fattura elettronica intestata all’azienda. I prezzi sono IVA esclusa.'],
];

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        <section className="py-10 text-center sm:py-14">
          <h1 className="mx-auto max-w-3xl font-serif text-2xl leading-tight font-semibold sm:text-3xl">{COPY.claim}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Ogni mattina, in 60 secondi, sai cosa conta davvero oggi. E il sistema tiene conto anche di come stai tu.
          </p>
        </section>

        <section aria-label="Piani" className="grid gap-4 md:grid-cols-2">
          {[PLANS.business, PLANS.health].map((p) => (
            <article key={p.id} className={cn('flex flex-col rounded-2xl border bg-card p-6', p.recommended ? 'border-2 border-gold' : 'border-line')}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-xl font-semibold">{p.name}</h2>
                {p.recommended ? <Badge tone="gold">Consigliato</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-muted">{p.tagline}</p>
              <p className="num mt-5">
                <span className="font-serif text-3xl font-semibold">{euro(p.priceYear)}</span>
                <span className="text-muted"> /anno</span>
              </p>
              <p className="text-sm text-muted">{p.vatNote}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={16} className={cn('mt-0.5 shrink-0', p.recommended ? 'text-gold-fg' : 'text-ok-fg')} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/onboarding" className={buttonClass(p.recommended ? 'primary' : 'secondary', 'md', 'mt-6 w-full')}>
                Inizia con {p.name}
              </Link>
            </article>
          ))}
        </section>
        <p className="mt-3 text-center text-sm text-muted">{RENEWAL.guarantee}</p>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-vital/50 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold">Cosa include il check-up</h2>
            <p className="mt-2 text-sm text-muted">
              {CLINIC_PRICING.checkupsPerYear} check-up l’anno con i medici Longevitas, uno ogni sei mesi.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {['Visita con il medico', 'Prelievo con pannello esteso', 'Elettrocardiogramma a riposo', 'Composizione corporea', 'Colloquio di restituzione: i referti li commenta il medico, non il software'].map((f) => (
                <li key={f} className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-vital-fg" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-vital/50 bg-card p-6">
            <h2 className="font-serif text-xl font-semibold">Come funziona la telemedicina</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
              <li>Se sei vicino a Rivoli fai tutto in clinica, in una mattina.</li>
              <li>Altrimenti scegli un centro prelievi convenzionato vicino a casa.</li>
              <li>Il tuo medico Longevitas ti vede in video e commenta i risultati con te.</li>
              <li>
                Tra un check-up e l’altro puoi prenotare un consulto di {CLINIC_PRICING.teleconsultMinutes} minuti
                {CLINIC_PRICING.teleconsultIncluded ? ', incluso nel piano.' : ` a ${euro(CLINIC_PRICING.teleconsultPrice)}.`}
              </li>
            </ol>
          </article>
        </section>

        <section className="mt-14" aria-labelledby="faq">
          <h2 id="faq" className="font-serif text-xl font-semibold">Domande frequenti</h2>
          <div className="mt-4 divide-y divide-line rounded-2xl border border-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="px-5">
                <summary className="flex min-h-14 cursor-pointer items-center font-medium">{q}</summary>
                <p className="pb-4 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 border-t border-line pt-4 text-sm text-muted">{COPY.health.disclaimer}</p>
      </main>
    </>
  );
}
