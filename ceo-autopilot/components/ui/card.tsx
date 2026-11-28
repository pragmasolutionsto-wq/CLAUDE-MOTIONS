import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-line bg-card p-4 sm:p-5', className)} {...props} />;
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-base font-semibold text-fg', className)} {...props}>
      {children}
    </h2>
  );
}

/** Titolo di sezione dentro una pagina. */
export function SectionTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-xs font-semibold uppercase tracking-wider text-muted', className)} {...props}>
      {children}
    </h2>
  );
}
