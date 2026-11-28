import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-serif text-2xl font-semibold">Questa pagina non esiste</h1>
      <p className="text-muted">Torna al briefing di oggi.</p>
      <Link href="/oggi" className={buttonClass('primary')}>
        Vai a Oggi
      </Link>
    </main>
  );
}
