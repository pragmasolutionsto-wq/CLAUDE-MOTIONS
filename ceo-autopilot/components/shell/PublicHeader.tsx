import Link from 'next/link';
import { COPY } from '@/config/copy';
import { buttonClass } from '@/components/ui/button';

export function PublicHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
      <Link href="/piani" className="flex items-center gap-2.5" aria-label={COPY.brand}>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-serif text-lg font-bold text-on-gold" aria-hidden>
          C
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-[0.14em]">{COPY.brand}</span>
          <span className="block text-xs text-muted">{COPY.by}</span>
        </span>
      </Link>
      {cta ? (
        <Link href="/oggi?demo=1" className={buttonClass('secondary', 'sm')}>
          Apri la demo
        </Link>
      ) : null}
    </header>
  );
}
