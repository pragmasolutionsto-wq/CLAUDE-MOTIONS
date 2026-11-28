import {
  Award,
  CalendarDays,
  HeartPulse,
  Inbox,
  Landmark,
  MessagesSquare,
  Plug,
  Scale,
  Settings,
  Stethoscope,
  Sunrise,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** true = area personale: nascosta agli assistenti, bloccata sul piano Business. */
  personal?: boolean;
  mobile?: boolean; // presente nella bottom nav
}

export const NAV: NavItem[] = [
  { href: '/oggi', label: 'Oggi', icon: Sunrise, mobile: true },
  { href: '/inbox', label: 'Inbox', icon: Inbox, mobile: true },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays, mobile: true },
  { href: '/riunioni', label: 'Riunioni', icon: MessagesSquare },
  { href: '/finanza', label: 'Finanza', icon: Landmark, mobile: true },
  { href: '/opportunita', label: 'Opportunità', icon: Award },
  { href: '/decision-room', label: 'Decision Room', icon: Scale },
  { href: '/salute', label: 'Salute', icon: HeartPulse, personal: true, mobile: true },
  { href: '/clinica', label: 'Clinica', icon: Stethoscope, personal: true },
  { href: '/connettori', label: 'Connettori', icon: Plug },
  { href: '/impostazioni', label: 'Impostazioni', icon: Settings },
];
