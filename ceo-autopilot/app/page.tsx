'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** La radice porta al briefing del giorno (conservando ?demo=1). */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/oggi${window.location.search}`);
  }, [router]);
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <p className="text-sm text-muted">Apro il tuo briefing…</p>
    </main>
  );
}
