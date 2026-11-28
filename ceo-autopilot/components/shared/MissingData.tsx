import Link from 'next/link';
import { CircleSlash } from 'lucide-react';
import { COPY } from '@/config/copy';
import { buttonClass } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  reason: string;
  cta?: string;
  href?: string;
  explain?: string;
  compact?: boolean;
  className?: string;
}

/** Dato mancante: mai uno zero finto. Dice perché manca e come risolvere. */
export function MissingData({ reason, cta, href = '/connettori', explain, compact, className }: Props) {
  if (compact) {
    return (
      <div className={cn('text-sm', className)}>
        <p className="font-semibold text-fg">{COPY.notAvailable}</p>
        <p className="text-muted">{reason}</p>
        {cta ? (
          <Link href={href} className="mt-1 inline-block text-sm font-medium text-gold-fg underline underline-offset-4">
            {cta}
          </Link>
        ) : null}
      </div>
    );
  }
  return (
    <div className={cn('flex flex-col items-start gap-3 rounded-xl border border-dashed border-line p-5', className)}>
      <CircleSlash className="text-muted" size={22} aria-hidden />
      <div>
        <p className="font-semibold">{COPY.notAvailable}</p>
        <p className="text-sm text-muted">{reason}</p>
        {explain ? <p className="mt-2 max-w-prose text-sm text-muted">{explain}</p> : null}
      </div>
      {cta ? (
        <Link href={href} className={buttonClass('primary', 'sm')}>
          {cta}
        </Link>
      ) : null}
    </div>
  );
}
