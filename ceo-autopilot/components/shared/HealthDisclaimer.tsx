import { COPY } from '@/config/copy';

/** Avvertenza fissa in fondo alle aree Salute e Clinica. */
export function HealthDisclaimer() {
  return (
    <p className="mt-8 border-t border-line pt-4 text-sm text-muted" role="note">
      {COPY.health.disclaimer}
    </p>
  );
}
