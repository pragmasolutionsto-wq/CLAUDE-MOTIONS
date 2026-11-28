/** Andamento sintetico, decorativo: il valore è sempre scritto a fianco. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24 - 2}`).join(' ');
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className={className ?? 'h-7 w-20'} aria-hidden>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
