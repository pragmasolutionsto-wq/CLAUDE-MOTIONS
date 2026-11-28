'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { seeded } from '@/lib/utils';

const DURATION = 60;

/** Ascolta il briefing: player simulato (60 secondi) con il testo che verrà letto. */
export function AudioBriefing({ script }: { script: string }) {
  const [t, setT] = useState(0);
  const bars = useMemo(() => {
    const rnd = seeded(60);
    return Array.from({ length: 48 }, () => 0.25 + rnd() * 0.75);
  }, []);

  const [wantsPlay, setWantsPlay] = useState(false);
  const playing = wantsPlay && t < DURATION;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => Math.min(DURATION, v + 1)), 1000);
    return () => clearInterval(id);
  }, [playing]);

  const mmss = (s: number) => `0:${String(s).padStart(2, '0')}`;
  return (
    <Card>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => {
            if (t >= DURATION) setT(0);
            setWantsPlay(!playing);
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-on-gold"
          aria-label={playing ? 'Metti in pausa il briefing audio' : 'Ascolta il briefing audio'}
        >
          {playing ? <Pause size={20} aria-hidden /> : <Play size={20} className="ml-0.5" aria-hidden />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Ascolta il briefing</p>
          <div className="mt-2 flex h-8 items-center gap-[3px]" aria-hidden>
            {bars.map((h, i) => (
              <span
                key={i}
                className={i / bars.length < t / DURATION ? 'bg-gold' : 'bg-line'}
                style={{ height: `${h * 100}%`, width: 3, borderRadius: 2, flex: '1 1 0' }}
              />
            ))}
          </div>
          <p className="num mt-1 text-xs text-muted">
            {mmss(t)} / 1:00 · audio simulato nel prototipo
          </p>
        </div>
      </div>
      <details className="mt-3 text-sm text-muted">
        <summary className="cursor-pointer py-1 font-medium text-fg">Leggi il testo</summary>
        <p className="num mt-2">{script}</p>
      </details>
    </Card>
  );
}
