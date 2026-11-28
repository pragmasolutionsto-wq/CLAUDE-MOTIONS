'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronsLeft, ChevronsRight, Lock, Menu, Moon, Sun } from 'lucide-react';
import { COPY } from '@/config/copy';
import { PLANS } from '@/config/pricing';
import { ActionDrawer } from '@/components/shared/ActionDrawer';
import { SourceDrawer } from '@/components/shared/SourceDrawer';
import { Sheet } from '@/components/ui/sheet';
import { useHydrated } from '@/lib/data/useData';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { company } from '@/mocks/company';
import { DemoPanel } from './DemoPanel';
import { NAV, type NavItem } from './nav';

function useNav() {
  const role = useApp((s) => s.role);
  const plan = useApp((s) => s.plan);
  const items = NAV.filter((i) => !(i.personal && role !== 'owner'));
  return { items, locked: (i: NavItem) => !!i.personal && plan !== 'health', role, plan };
}

function ThemeToggle({ withLabel }: { withLabel?: boolean }) {
  const theme = useApp((s) => s.settings.theme);
  const setSettings = useApp((s) => s.setSettings);
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setSettings({ theme: next })}
      className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg px-2 text-sm text-muted hover:bg-fg/5 hover:text-fg"
      aria-label={`Passa al tema ${next === 'dark' ? 'scuro' : 'chiaro'}`}
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
      {withLabel ? <span>Tema {next === 'dark' ? 'scuro' : 'chiaro'}</span> : null}
    </button>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/oggi" className="flex items-center gap-2.5" aria-label={`${COPY.brand}, vai a Oggi`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold font-serif text-lg font-bold text-on-gold" aria-hidden>
        C
      </span>
      {collapsed ? null : (
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-[0.14em]">{COPY.brand}</span>
          <span className="block text-xs text-muted">{COPY.by}</span>
        </span>
      )}
    </Link>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { items, locked, role, plan } = useNav();
  const collapsed = useApp((s) => s.sidebarCollapsed);
  const set = useApp((s) => s.set);
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface py-4 transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[68px] px-2' : 'w-60 px-3',
      )}
    >
      <div className={cn('mb-5 flex items-center', collapsed ? 'justify-center' : 'px-1')}>
        <Brand collapsed={collapsed} />
      </div>
      <nav aria-label="Navigazione principale" className="flex-1 overflow-y-auto">
        <ul className="space-y-0.5">
          {items.map((i) => {
            const active = pathname === i.href || pathname.startsWith(`${i.href}/`);
            const Icon = i.icon;
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={collapsed ? i.label : undefined}
                  title={collapsed ? i.label : undefined}
                  className={cn(
                    'flex h-10 items-center gap-3 rounded-lg text-sm transition-colors',
                    collapsed ? 'justify-center' : 'px-3',
                    active ? 'bg-fg/10 font-semibold text-fg' : 'text-muted hover:bg-fg/5 hover:text-fg',
                    active && i.personal && 'text-vital-fg',
                  )}
                >
                  <Icon size={18} aria-hidden className={i.personal ? 'text-vital-fg' : undefined} />
                  {collapsed ? null : <span className="flex-1">{i.label}</span>}
                  {!collapsed && locked(i) ? <Lock size={13} aria-label="Solo piano Business + Health" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={cn('mt-3 border-t border-line pt-3', collapsed && 'flex flex-col items-center')}>
        {collapsed ? null : (
          <div className="mb-2 px-1 text-sm">
            <p className="font-semibold">{role === 'owner' ? `${company.owner.firstName} ${company.owner.lastName}` : 'Laura Bianchi'}</p>
            <p className="text-xs text-muted">
              {role === 'owner' ? 'Titolare' : 'Assistente'} · {PLANS[plan].name}
            </p>
          </div>
        )}
        <div className={cn('flex items-center', collapsed ? 'flex-col' : 'justify-between')}>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => set({ sidebarCollapsed: !collapsed })}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-fg/5 hover:text-fg"
            aria-label={collapsed ? 'Espandi il menu' : 'Riduci il menu'}
          >
            {collapsed ? <ChevronsRight size={18} aria-hidden /> : <ChevronsLeft size={18} aria-hidden />}
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileBars() {
  const pathname = usePathname();
  const { items, locked } = useNav();
  const [more, setMore] = useState(false);
  const primary = items.filter((i) => i.mobile);
  const rest = items.filter((i) => !i.mobile);
  const restActive = rest.some((i) => pathname.startsWith(i.href));
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <Brand />
        <ThemeToggle />
      </header>
      <nav
        aria-label="Navigazione principale"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="flex">
          {primary.map((i) => {
            const active = pathname === i.href || pathname.startsWith(`${i.href}/`);
            const Icon = i.icon;
            return (
              <li key={i.href} className="flex-1">
                <Link
                  href={i.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-16 flex-col items-center justify-center gap-1 text-xs',
                    active ? (i.personal ? 'font-semibold text-vital-fg' : 'font-semibold text-gold-fg') : 'text-muted',
                  )}
                >
                  <Icon size={20} aria-hidden />
                  {i.label}
                  {locked(i) ? <Lock size={10} className="absolute top-2.5 right-[22%]" aria-label="Solo piano Business + Health" /> : null}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMore(true)}
              className={cn('flex h-16 w-full flex-col items-center justify-center gap-1 text-xs', restActive ? 'font-semibold text-gold-fg' : 'text-muted')}
              aria-haspopup="dialog"
            >
              <Menu size={20} aria-hidden />
              Altro
            </button>
          </li>
        </ul>
      </nav>
      <Sheet open={more} onOpenChange={setMore} title="Altro">
        <ul className="space-y-1">
          {rest.map((i) => {
            const Icon = i.icon;
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  onClick={() => setMore(false)}
                  className="flex h-12 items-center gap-3 rounded-lg px-3 hover:bg-fg/5"
                >
                  <Icon size={18} aria-hidden className={i.personal ? 'text-vital-fg' : 'text-muted'} />
                  <span className="flex-1">{i.label}</span>
                  {locked(i) ? <Lock size={13} className="text-muted" aria-label="Solo piano Business + Health" /> : null}
                </Link>
              </li>
            );
          })}
          <li>
            <Link href="/piani" onClick={() => setMore(false)} className="flex h-12 items-center gap-3 rounded-lg px-3 text-gold-fg hover:bg-fg/5">
              Piani e prezzi
            </Link>
          </li>
        </ul>
      </Sheet>
    </>
  );
}

/** Shell dell'app: sidebar su desktop, barra in basso su mobile, pannelli contestuali. */
export function AppShell({ children }: { children: React.ReactNode }) {
  useHydrated();
  return (
    <div className="flex min-h-dvh">
      <a href="#contenuto" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:text-on-gold">
        Vai al contenuto
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileBars />
        <main id="contenuto" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
          {children}
        </main>
      </div>
      <SourceDrawer />
      <ActionDrawer />
      <DemoPanel />
    </div>
  );
}
