'use client';

import { dayShort } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  slots: { date: string; times: string[] }[];
  date: string | null;
  time: string | null;
  onChange: (date: string, time: string | null) => void;
}

const chip = (active: boolean) =>
  cn('h-10 shrink-0 rounded-lg border px-3 text-sm', active ? 'border-vital bg-vital/15 font-semibold' : 'border-line text-muted hover:text-fg');

/** Scelta di giorno e orario tra gli slot disponibili (simulati). */
export function SlotPicker({ slots, date, time, onChange }: Props) {
  const day = slots.find((s) => s.date === date);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium" id="slot-giorno">Giorno</p>
      <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-labelledby="slot-giorno">
        {slots.slice(0, 10).map((s) => (
          <button key={s.date} type="button" aria-pressed={date === s.date} onClick={() => onChange(s.date, null)} className={chip(date === s.date)}>
            {dayShort(s.date)}
          </button>
        ))}
      </div>
      {day ? (
        <>
          <p className="mt-2 mb-1.5 text-sm font-medium" id="slot-ora">Orario</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="slot-ora">
            {day.times.map((t) => (
              <button key={t} type="button" aria-pressed={time === t} onClick={() => onChange(day.date, t)} className={cn(chip(time === t), 'num')}>
                {t}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
