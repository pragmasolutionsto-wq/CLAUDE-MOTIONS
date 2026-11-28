import { differenceInHours } from 'date-fns';
import { STALENESS_HOURS } from '@/config/thresholds';
import type { ConnectorId } from '@/types/domain';

/** Un dato è "non aggiornato" se l'ultimo sync supera la soglia del suo connettore. */
export function isStale(connector: ConnectorId, lastSync: string | undefined, now: Date): boolean {
  if (!lastSync) return true;
  return differenceInHours(now, new Date(lastSync)) > STALENESS_HOURS[connector];
}
