import { create } from 'zustand';

export type DashboardView = '360' | 'chantiers' | 'workflow' | 'analytics';

export interface DashboardFilters {
  segment: string[];
  phase: number[];
  statut: string[];
}

interface DashboardStore {
  selectedView: DashboardView;
  setSelectedView: (view: DashboardView) => void;

  selectedChantier: string | null;
  setSelectedChantier: (id: string | null) => void;

  filters: DashboardFilters;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: DashboardFilters = {
  segment: [],
  phase: [],
  statut: [],
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedView: '360',
  setSelectedView: (view) => set({ selectedView: view }),

  selectedChantier: null,
  setSelectedChantier: (id) => set({ selectedChantier: id }),

  filters: defaultFilters,
  updateFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
