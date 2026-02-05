/**
 * Store thème dashboard — system (préférence OS), dark, dakar (soleil chaud), light
 * Persisté en localStorage pour conserver le choix utilisateur
 * Si thème = "system", suit prefers-color-scheme (dark/light)
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DashboardTheme = 'system' | 'dark' | 'dakar' | 'light';

const STORAGE_KEY = 'dashboard-theme';

function getSystemResolved(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: DashboardTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-dakar', 'theme-light');
  const toApply = theme === 'system' ? getSystemResolved() : theme;
  root.classList.add(`theme-${toApply}`);
  root.setAttribute('data-theme', theme);
}

/** S'abonner aux changements de préférence système (quand theme === 'system') */
export function subscribeSystemTheme(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => callback();
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
}

interface DashboardThemeStore {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  cycleTheme: () => void;
}

export const useDashboardThemeStore = create<DashboardThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      cycleTheme: () => {
        const order: DashboardTheme[] = ['system', 'dark', 'dakar', 'light'];
        const current = get().theme;
        const idx = order.indexOf(current);
        const next = order[(idx + 1) % order.length];
        set({ theme: next });
        applyTheme(next);
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state: unknown) => {
        const s = state as { theme?: string } | null;
        if (s?.theme) applyTheme(s.theme);
      },
    }
  )
);
