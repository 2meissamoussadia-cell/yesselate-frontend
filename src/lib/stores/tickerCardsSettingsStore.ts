/**
 * Store des réglages des cartes à défiler (TickerBar) du dashboard.
 * Permet de choisir les KPIs affichés, le mode (barre / wallet / popup) et l'ancrage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TickerDisplaySetting = 'bar' | 'wallet' | 'pop';
export type TickerAnchorSetting = 'bottom-left' | 'bottom-right' | 'bottom-center' | 'top-right';

export interface TickerCardsSettingsState {
  /** Labels des KPIs à afficher. Vide = comportement par défaut */
  enabledLabels: string[];
  setEnabledLabels: (labels: string[]) => void;
  toggleLabel: (label: string) => void;
  resetToDefault: () => void;
  /** Mode d'affichage : barre pleine largeur, wallet compact, ou popup */
  display: TickerDisplaySetting;
  setDisplay: (display: TickerDisplaySetting) => void;
  /** Ancrage du ticker (coin/côté) */
  anchor: TickerAnchorSetting;
  setAnchor: (anchor: TickerAnchorSetting) => void;
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
      display: 'wallet',
      setDisplay: (display) => set({ display }),
      anchor: 'bottom-right',
      setAnchor: (anchor) => set({ anchor }),
    }),
    { name: 'bmo-ticker-cards-settings' }
  )
);
