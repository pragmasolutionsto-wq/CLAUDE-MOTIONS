'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useApp } from '@/lib/store';
import type { Scenario } from './world';

/** Scenario corrente: quello che domani sarà "utente autenticato + stato reale dei connettori". */
export function useScenario(): Scenario {
  const s = useApp(
    useShallow((st) => ({
      plan: st.plan,
      role: st.role,
      dayType: st.dayType,
      connectors: st.connectorScenario,
      baseline: st.baseline,
      overrides: st.connectorOverrides,
      reserve: st.settings.liquidityReserve,
      minReminder: st.settings.minReminderAmount,
      bridgeEnabled: st.settings.bridgeEnabled,
      consultSuggestions: st.settings.consultSuggestions,
      checkupReminders: st.settings.checkupReminders,
    })),
  );
  return useMemo(
    () => ({
      plan: s.plan,
      role: s.role,
      dayType: s.dayType,
      connectors: s.connectors,
      baseline: s.baseline,
      overrides: s.overrides,
      reserve: s.reserve,
      minReminder: s.minReminder,
      bridge: { enabled: s.bridgeEnabled, consultSuggestions: s.consultSuggestions, checkupReminders: s.checkupReminders },
    }),
    [s],
  );
}

export interface DataState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Carica dati dal livello dati rispettando lo scenario. Gestisce caricamento, errore e ricarica. */
export function useData<T>(fn: (sc: Scenario) => Promise<T>): DataState<T> {
  const sc = useScenario();
  const hydrated = useHydrated();
  const [tick, setTick] = useState(0);
  const key = `${JSON.stringify(sc)}#${tick}`;
  // Il risultato ricorda a quale richiesta appartiene: "loading" si ricava dal confronto, senza stato in più.
  const [res, setRes] = useState<{ key: string; data: T | undefined; error: string | null }>({ key: '', data: undefined, error: null });

  useEffect(() => {
    if (!hydrated) return;
    let alive = true;
    fn(sc)
      .then((data) => alive && setRes({ key, data, error: null }))
      .catch(() => alive && setRes({ key, data: undefined, error: 'Non riesco a caricare i dati. Riprova.' }));
    return () => {
      alive = false;
    };
    // fn è una funzione stabile del livello dati; sc è già dentro key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hydrated]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data: res.data, loading: res.key !== key, error: res.key === key ? res.error : null, reload };
}

/** true dopo che lo stato salvato nel browser è stato ricaricato (evita differenze tra server e client). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useApp.persist.onFinishHydration(cb),
    () => useApp.persist.hasHydrated(),
    () => false,
  );
}
