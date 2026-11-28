import { Lock } from 'lucide-react';
import { COPY } from '@/config/copy';
import { Badge } from '@/components/ui/badge';

/** Segnala i dati personali: li vede solo il titolare. */
export function PrivateBadge({ className }: { className?: string }) {
  return (
    <Badge tone="vital" className={className}>
      <Lock size={11} aria-hidden />
      {COPY.privateBadge}
    </Badge>
  );
}
