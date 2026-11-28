'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** 'side' = pannello laterale su desktop e dal basso su mobile; 'center' = finestra di conferma. */
  variant?: 'side' | 'center';
  className?: string;
}

/** Pannello contestuale: drawer a destra su desktop, foglio dal basso su mobile. */
export function Sheet({ open, onOpenChange, title, description, children, variant = 'side', className }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="anim-fade fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          aria-describedby={description ? undefined : undefined}
          className={cn(
            'fixed z-50 flex flex-col border-line bg-surface text-fg shadow-2xl outline-none',
            variant === 'side'
              ? 'anim-sheet inset-x-0 bottom-0 max-h-[90dvh] rounded-t-2xl border-t sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[440px] sm:rounded-none sm:border-t-0 sm:border-l'
              : 'anim-fade top-1/2 left-1/2 max-h-[90dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-0.5 text-sm text-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-fg/5 hover:text-fg"
              aria-label="Chiudi"
            >
              <X size={18} aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
