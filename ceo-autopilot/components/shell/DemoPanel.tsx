'use client';

import { FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { useApp } from '@/lib/store';
import { useUi } from '@/lib/ui-store';
import { cn } from '@/lib/utils';

function Group<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-10 rounded-lg border px-3 text-sm transition-colors',
              value === o.value ? 'border-gold bg-gold/15 font-semibold text-fg' : 'border-line text-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Pannello demo: cambia al volo piano, utente, giornata, connettori e baseline. Serve nelle presentazioni. */
export function DemoPanel() {
  const open = useUi((s) => s.demoOpen);
  const setOpen = useUi((s) => s.setDemoOpen);
  const s = useApp();
  if (!s.demoEnabled) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-3 bottom-20 z-40 flex h-11 items-center gap-2 rounded-full border border-gold/60 bg-surface px-4 text-sm font-semibold text-gold-fg shadow-lg lg:bottom-4"
        aria-label="Apri il pannello demo"
      >
        <FlaskConical size={16} aria-hidden /> Demo
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Pannello demo" description="Cambia lo scenario per mostrare il prodotto. Ctrl+Shift+D per aprirlo.">
        <Group
          label="Piano"
          value={s.plan}
          onChange={(plan) => s.set({ plan })}
          options={[
            { value: 'health', label: 'Business + Health' },
            { value: 'business', label: 'Business' },
          ]}
        />
        <Group
          label="Utente"
          value={s.role}
          onChange={(role) => s.set({ role })}
          options={[
            { value: 'owner', label: 'Titolare' },
            { value: 'assistant', label: 'Assistente' },
          ]}
        />
        <Group
          label="Giornata"
          value={s.dayType}
          onChange={(dayType) => s.set({ dayType })}
          options={[
            { value: 'heavy', label: 'Pesante' },
            { value: 'normal', label: 'Normale' },
            { value: 'quiet', label: 'Tranquilla' },
          ]}
        />
        <Group
          label="Connettori"
          value={s.connectorScenario}
          onChange={(connectorScenario) => s.set({ connectorScenario, connectorOverrides: {} })}
          options={[
            { value: 'all', label: 'Tutti collegati' },
            { value: 'none', label: 'Nessuno' },
            { value: 'bank_error', label: 'Banca in errore' },
          ]}
        />
        <Group
          label="Baseline salute"
          value={s.baseline}
          onChange={(baseline) => s.set({ baseline })}
          options={[
            { value: 'complete', label: 'Completa' },
            { value: 'learning', label: 'In apprendimento' },
          ]}
        />
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <Button onClick={s.resetDemo}>Riporta tutto all’inizio</Button>
          <Button
            variant="ghost"
            onClick={() => {
              s.set({ demoEnabled: false });
              setOpen(false);
            }}
          >
            Nascondi il pannello
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted">
          Tutti i dati sono simulati: Meccanica Ferraris S.r.l. non esiste. La data del prototipo è fissa a martedì 1 dicembre 2026.
        </p>
      </Sheet>
    </>
  );
}
