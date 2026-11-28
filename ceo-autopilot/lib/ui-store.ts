'use client';

import { create } from 'zustand';
import type { Insight, ProposedAction, SourceRef } from '@/types/domain';

// Stato dei pannelli contestuali (non salvato): fonte aperta, azione in revisione, pannello demo.
interface UiState {
  source: SourceRef | null;
  action: { action: ProposedAction; insight?: Insight; mode: 'review' | 'edit' } | null;
  demoOpen: boolean;
  openSource: (s: SourceRef) => void;
  openAction: (action: ProposedAction, insight?: Insight, mode?: 'review' | 'edit') => void;
  close: () => void;
  setDemoOpen: (v: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  source: null,
  action: null,
  demoOpen: false,
  openSource: (source) => set({ source }),
  openAction: (action, insight, mode = 'review') => set({ action: { action, insight, mode } }),
  close: () => set({ source: null, action: null }),
  setDemoOpen: (demoOpen) => set({ demoOpen }),
}));
