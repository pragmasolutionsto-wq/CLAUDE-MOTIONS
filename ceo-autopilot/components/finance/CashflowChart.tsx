'use client';

import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dayShort, euro, euroCompact } from '@/lib/format';
import type { CashflowWeek } from '@/types/domain';

interface Props {
  weeks: CashflowWeek[];
  reserve: number;
  scenario: 'both' | 'base' | 'prudent';
}

/** Liquidità a 13 settimane: area base, linea prudente, linea orizzontale della riserva. */
export function CashflowChart({ weeks, reserve, scenario }: Props) {
  const data = weeks.map((w) => ({
    label: dayShort(w.weekStart).replace(/^\S+\s/, ''),
    base: w.closingBase,
    prudent: w.closingPrudent,
    below: w.belowReserve,
  }));
  return (
    <div className="h-64 w-full sm:h-80" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
          <YAxis tickFormatter={euroCompact} tickLine={false} axisLine={false} width={62} />
          <Tooltip
            formatter={(v, name) => [euro(Number(v)), name === 'base' ? 'Scenario base' : 'Scenario prudente']}
            labelFormatter={(l) => `Settimana del ${l}`}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--fg)' }}
            itemStyle={{ color: 'var(--fg)' }}
          />
          {scenario !== 'prudent' ? (
            <Area type="monotone" dataKey="base" stroke="var(--info-fg)" strokeWidth={2} fill="var(--info)" fillOpacity={0.18} isAnimationActive={false} />
          ) : null}
          {scenario !== 'base' ? (
            <Line
              type="monotone"
              dataKey="prudent"
              stroke="var(--gold)"
              strokeWidth={2}
              strokeDasharray="6 4"
              isAnimationActive={false}
              dot={(p: { cx?: number; cy?: number; index?: number; payload?: { below: boolean } }) => (
                <circle
                  key={p.index}
                  cx={p.cx}
                  cy={p.cy}
                  r={p.payload?.below ? 5 : 2.5}
                  fill={p.payload?.below ? 'var(--alert)' : 'var(--gold)'}
                  stroke="var(--card)"
                  strokeWidth={1.5}
                />
              )}
            />
          ) : null}
          <ReferenceLine y={reserve} stroke="var(--alert-fg)" strokeDasharray="3 3" label={{ value: `Riserva ${euroCompact(reserve)}`, position: 'insideBottomRight', fill: 'var(--alert-fg)', fontSize: 12 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
