import { cn } from '@/lib/utils';

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode; // azioni o badge a destra
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: Props) {
  return (
    <header className={cn('mb-5 flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h1 className="font-serif text-2xl leading-tight font-semibold">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}
