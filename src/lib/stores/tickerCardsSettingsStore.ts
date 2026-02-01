/**
 * Store des réglages des cartes à défiler (TickerBar) du dashboard.
 * Permet à l'utilisateur de choisir quels critères KPI afficher dans le diaporama.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TickerCardsSettingsState {
  /** Labels des KPIs à afficher. Vide = comportement par défaut (tous, triés crit > warn > rest) */
  enabledLabels: string[];
  setEnabledLabels: (labels: string[]) => void;
  toggleLabel: (label: string) => void;
  resetToDefault: () => void;
}

export const useTickerCardsSettingsStore = create<TickerCardsSettingsState>()(
  persist(
    (set) => ({
      enabledLabels: [],
      setEnabledLabels: (labels) => set({ enabledLabels: labels }),
      toggleLabel: (label) =>
        set((s) => {
          const has = s.enabledLabels.includes(label);
          const next = has
            ? s.enabledLabels.filter((l) => l !== label)
            : [...s.enabledLabels, label];
          return { enabledLabels: next };
        }),
      resetToDefault: () => set({ enabledLabels: [] }),
    }),
    { name: 'bmo-ticker-cards-settings' }
  )
);
