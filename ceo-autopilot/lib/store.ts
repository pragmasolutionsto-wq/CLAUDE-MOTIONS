'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BaselineScenario, ConnectorScenario, DayType } from '@/config/demo';
import { DEFAULT_USER_THRESHOLDS } from '@/config/thresholds';
import type { ConnectorId, ConnectorStatus, Decision, Plan, Role } from '@/types/domain';

export interface Settings {
  theme: 'dark' | 'light';
  briefingChannel: 'app' | 'email' | 'audio';
  briefingTime: string;
  quietFrom: string;
  quietTo: string;
  audioLanguage: 'it' | 'en';
  liquidityReserve: number;
  minReminderAmount: number;
  meetingHoursWarn: number;
  bridgeEnabled: boolean;
  consultSuggestions: boolean;
  checkupReminders: boolean;
  doctorProposals: boolean;
  checkupSite: 'auto' | 'clinic' | 'tele';
}

export interface Booking {
  kind: 'checkup' | 'consult';
  mode: 'clinic' | 'tele';
  date: string;
  time: string;
  center?: string;
  doctor?: string;
}

export type ActionStatus = 'approved' | 'ignored';

interface AppState {
  // Pannello demo
  plan: Plan;
  role: Role;
  dayType: DayType;
  connectorScenario: ConnectorScenario;
  baseline: BaselineScenario;
  demoEnabled: boolean;
  // Stato utente simulato
  settings: Settings;
  connectorOverrides: Partial<Record<ConnectorId, ConnectorStatus['state']>>;
  actions: Record<string, ActionStatus>;
  decisionsAdded: Decision[];
  decisionPatches: Record<string, Partial<Decision>>;
  bookings: Booking[];
  proposalStatus: Record<string, 'talk' | 'later'>;
  sidebarCollapsed: boolean;
  set: (patch: Partial<AppState>) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setAction: (id: string, status: ActionStatus | null) => void;
  setConnector: (id: ConnectorId, state: ConnectorStatus['state'] | null) => void;
  addDecision: (d: Decision) => void;
  patchDecision: (id: string, patch: Partial<Decision>) => void;
  addBooking: (b: Booking) => void;
  resetDemo: () => void;
}

export const defaultSettings: Settings = {
  theme: 'dark',
  briefingChannel: 'app',
  briefingTime: '07:00',
  quietFrom: '20:30',
  quietTo: '06:30',
  audioLanguage: 'it',
  liquidityReserve: DEFAULT_USER_THRESHOLDS.liquidityReserve,
  minReminderAmount: DEFAULT_USER_THRESHOLDS.minReminderAmount,
  meetingHoursWarn: DEFAULT_USER_THRESHOLDS.meetingHoursWarn,
  bridgeEnabled: true,
  consultSuggestions: true,
  checkupReminders: true,
  doctorProposals: true,
  checkupSite: 'auto',
};

const initial = {
  plan: 'health' as Plan,
  role: 'owner' as Role,
  dayType: 'heavy' as DayType,
  connectorScenario: 'all' as ConnectorScenario,
  baseline: 'complete' as BaselineScenario,
  demoEnabled: false,
  settings: defaultSettings,
  connectorOverrides: {},
  actions: {},
  decisionsAdded: [],
  decisionPatches: {},
  bookings: [],
  proposalStatus: {},
  sidebarCollapsed: false,
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      ...initial,
      set: (patch) => set(patch),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setAction: (id, status) =>
        set((s) => {
          const actions = { ...s.actions };
          if (status) actions[id] = status;
          else delete actions[id];
          return { actions };
        }),
      setConnector: (id, state) =>
        set((s) => {
          const connectorOverrides = { ...s.connectorOverrides };
          if (state) connectorOverrides[id] = state;
          else delete connectorOverrides[id];
          return { connectorOverrides };
        }),
      addDecision: (d) => set((s) => ({ decisionsAdded: [d, ...s.decisionsAdded] })),
      patchDecision: (id, patch) =>
        set((s) => ({ decisionPatches: { ...s.decisionPatches, [id]: { ...s.decisionPatches[id], ...patch } } })),
      addBooking: (b) => set((s) => ({ bookings: [...s.bookings.filter((x) => x.kind !== b.kind), b] })),
      resetDemo: () => set((s) => ({ ...initial, demoEnabled: s.demoEnabled, settings: { ...defaultSettings, theme: s.settings.theme } })),
    }),
    // skipHydration: lo stato salvato si ricarica dopo il primo render, così server e client coincidono.
    { name: 'ceo-autopilot-demo-v1', skipHydration: true },
  ),
);

/** true se l'utente corrente può vedere i dati personali (titolare con piano Health). */
export const canSeeHealth = (s: Pick<AppState, 'plan' | 'role'>) => s.plan === 'health' && s.role === 'owner';
