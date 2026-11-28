import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'vital' | 'danger';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-gold text-on-gold hover:brightness-110 font-semibold',
  secondary: 'border border-line bg-surface text-fg hover:border-muted',
  ghost: 'text-muted hover:text-fg hover:bg-fg/5',
  vital: 'bg-vital text-on-gold hover:brightness-110 font-semibold',
  danger: 'border border-alert/60 text-alert-fg hover:bg-alert/10',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const buttonClass = (variant: Variant = 'secondary', size: Size = 'md', className?: string) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none',
    variants[variant],
    sizes[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />;
});
