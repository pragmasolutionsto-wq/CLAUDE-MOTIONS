'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/finanza', label: 'Panoramica' },
  { href: '/finanza/liquidita', label: 'Liquidità' },
  { href: '/finanza/incassi', label: 'Incassi' },
  { href: '/finanza/fatture', label: 'Fatture' },
  { href: '/finanza/banca', label: 'Banca' },
];

export function FinanceNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sezioni di Finanza" className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              '-mb-px flex h-11 items-center border-b-2 px-3 text-sm whitespace-nowrap transition-colors',
              active ? 'border-gold font-semibold text-fg' : 'border-transparent text-muted hover:text-fg',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
