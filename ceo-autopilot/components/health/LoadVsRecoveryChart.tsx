'use client';

import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { READINESS } from '@/config/thresholds';
import type { HealthView } from '@/lib/data/api';
import { dayShort, hours } from '@/lib/format';

/**
 * Il grafico simbolo del prodotto: carico di lavoro (ore di riunioni) contro recupero, ultimi 28 giorni.
 * Doppio asse: barre oro per il carico, linea teal per il recupero.
 */
export function LoadVsRecoveryChart({ data }: { data: HealthView['chart'] }) {
  const rows = data.map((d) => ({ ...d, label: dayShort(d.date).replace(/^\S+\s/, '') }));
  return (
    <div className="h-64 w-full sm:h-80" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 12, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
          <YAxis yAxisId="load" width={34} tickLine={false} axisLine={false} domain={[0, 10]} tickFormatter={(v) => `${v} h`} />
          <YAxis yAxisId="rec" orientation="right" width={30} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            formatter={(v, name) => (name === 'meetingHours' ? [hours(Number(v)), 'Riunioni'] : [`${v}/100`, 'Recupero'])}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--fg)' }}
            itemStyle={{ color: 'var(--fg)' }}
          />
          <Bar yAxisId="load" dataKey="meetingHours" fill="var(--gold)" fillOpacity={0.55} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <ReferenceLine yAxisId="rec" y={READINESS.bands.inRange} stroke="var(--vital-fg)" strokeOpacity={0.5} strokeDasharray="3 3" />
          <Line yAxisId="rec" type="monotone" dataKey="score" stroke="var(--vital-fg)" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
