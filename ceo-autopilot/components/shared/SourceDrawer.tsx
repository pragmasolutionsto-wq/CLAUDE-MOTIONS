'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DEMO_NOW } from '@/config/demo';
import { buttonClass } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/misc';
import { Sheet } from '@/components/ui/sheet';
import { getSourceRecord, type SourceRecord } from '@/lib/data/sourceRecord';
import { useScenario } from '@/lib/data/useData';
import { stamp } from '@/lib/format';
import { useUi } from '@/lib/ui-store';

/** Il dato originale dietro un numero: fonte, orario, periodo e record. */
export function SourceDrawer() {
  const source = useUi((s) => s.source);
  const close = useUi((s) => s.close);
  const sc = useScenario();
  const [loaded, setLoaded] = useState<{ source: unknown; record: SourceRecord } | null>(null);

  useEffect(() => {
    if (!source) return;
    let alive = true;
    getSourceRecord(sc, source).then((record) => alive && setLoaded({ source, record }));
    return () => {
      alive = false;
    };
  }, [source, sc]);
  const record = loaded && loaded.source === source ? loaded.record : null;

  if (!source) return null;
  return (
    <Sheet open onOpenChange={(o) => !o && close()} title="Da dove viene questo dato" description={`${source.label} · aggiornato ${stamp(source.updatedAt, DEMO_NOW)}`}>
      {source.period ? <p className="mb-3 text-sm text-muted">Periodo: {source.period}</p> : null}
      {!record ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <>
          <h3 className="font-semibold">{record.title}</h3>
          <dl className="mt-3 divide-y divide-line text-sm">
            {record.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="shrink-0 text-muted">{k}</dt>
                <dd className="num text-right break-words">{v}</dd>
              </div>
            ))}
          </dl>
          {record.note ? <p className="mt-3 text-xs text-muted">{record.note}</p> : null}
          {record.href ? (
            <Link href={record.href} onClick={close} className={buttonClass('secondary', 'sm', 'mt-4')}>
              {record.hrefLabel}
            </Link>
          ) : null}
        </>
      )}
    </Sheet>
  );
}
