import {
  Award,
  CalendarDays,
  HeartPulse,
  Landmark,
  Mail,
  MessagesSquare,
  ShieldAlert,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { Tone } from '@/components/ui/badge';
import type { Domain, Severity } from '@/types/domain';

export const DOMAIN_META: Record<Domain, { label: string; icon: LucideIcon }> = {
  finance: { label: 'Finanza', icon: Landmark },
  sales: { label: 'Incassi', icon: TrendingUp },
  mail: { label: 'Mail', icon: Mail },
  agenda: { label: 'Agenda', icon: CalendarDays },
  meetings: { label: 'Riunioni', icon: MessagesSquare },
  grants: { label: 'Bandi', icon: Award },
  risk: { label: 'Rischi', icon: ShieldAlert },
  health: { label: 'Per te', icon: HeartPulse },
};

export const SEVERITY_META: Record<Severity, { label: string; tone: Tone }> = {
  high: { label: 'Priorità alta', tone: 'alert' },
  medium: { label: 'Priorità media', tone: 'warn' },
  low: { label: 'Priorità bassa', tone: 'neutral' },
};
