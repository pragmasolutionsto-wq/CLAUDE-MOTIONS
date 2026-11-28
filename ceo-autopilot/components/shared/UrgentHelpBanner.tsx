import { Phone } from 'lucide-react';
import { COPY } from '@/config/copy';

/** Banner fisso con il 112: compare se il testo scritto indica un pericolo immediato. */
export function UrgentHelpBanner() {
  return (
    <div role="alert" className="sticky top-2 z-30 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-alert bg-alert/15 p-4">
      <Phone className="shrink-0 text-alert-fg" size={22} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{COPY.health.urgentTitle}</p>
        <p className="text-sm">{COPY.health.urgentBody}</p>
      </div>
      <a href="tel:112" className="inline-flex h-11 items-center rounded-lg bg-[#b23c28] px-4 font-semibold text-white">
        Chiama il 112
      </a>
    </div>
  );
}
