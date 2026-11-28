import { cn } from '@/lib/utils';

export type Tone = 'neutral' | 'ok' | 'warn' | 'alert' | 'info' | 'gold' | 'vital';

const tones: Record<Tone, string> = {
  neutral: 'border-line text-muted',
  ok: 'border-ok/50 bg-ok/10 text-ok-fg',
  warn: 'border-warn/50 bg-warn/10 text-warn-fg',
  alert: 'border-alert/50 bg-alert/10 text-alert-fg',
  info: 'border-info/50 bg-info/10 text-info-fg',
  gold: 'border-gold/50 bg-gold/10 text-gold-fg',
  vital: 'border-vital/50 bg-vital/10 text-vital-fg',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
