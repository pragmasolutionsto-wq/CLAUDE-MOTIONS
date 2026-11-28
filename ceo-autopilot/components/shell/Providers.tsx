'use client';

import { useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/misc';
import { useApp } from '@/lib/store';
import { useUi } from '@/lib/ui-store';

/** Provider globali: tooltip, tema, stato salvato, pannello demo, service worker. */
export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useApp((s) => s.settings.theme);

  useEffect(() => {
    void useApp.persist.rehydrate();
    // Pannello demo: si attiva con ?demo=1 oppure con Ctrl+Shift+D.
    if (new URLSearchParams(window.location.search).get('demo') === '1') {
      useApp.getState().set({ demoEnabled: true });
      useUi.getState().setDemoOpen(true);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        useApp.getState().set({ demoEnabled: true });
        useUi.getState().setDemoOpen(!useUi.getState().demoOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      void navigator.serviceWorker.register('/sw.js');
    }
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0B1426' : '#FAF8F3');
  }, [theme]);

  return <TooltipProvider>{children}</TooltipProvider>;
}
