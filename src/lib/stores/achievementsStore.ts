/**
 * Phase 4 — Gamification : badges / succès
 * Store des achievements débloqués (localStorage + Zustand)
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AchievementId =
  | 'first_login'
  | 'exporter_5'
  | 'focus_mode'
  | 'voice_command'
  | 'dashboard_custom'
  | 'ia_suggestions';

export interface Achievement {
  id: AchievementId;
  label: string;
  description: string;
  icon: string; // emoji or icon name
  unlockedAt: string | null;
}

const ACHIEVEMENTS_DEF: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
  first_login: { id: 'first_login', label: 'Première connexion', description: 'Vous vous êtes connecté pour la première fois', icon: '🎯' },
  exporter_5: { id: 'exporter_5', label: 'Exporteur', description: '5 exports réalisés', icon: '📤' },
  focus_mode: { id: 'focus_mode', label: 'Mode Focus', description: 'Mode Focus utilisé', icon: '🎯' },
  voice_command: { id: 'voice_command', label: 'Commande vocale', description: 'Une commande vocale exécutée', icon: '🎤' },
  dashboard_custom: { id: 'dashboard_custom', label: 'Dashboard personnalisé', description: 'Widgets réorganisés par glisser-déposer', icon: '📊' },
  ia_suggestions: { id: 'ia_suggestions', label: 'Suggestions IA', description: 'Panel Suggestions IA consulté', icon: '🤖' },
};

interface AchievementsState {
  unlocked: Partial<Record<AchievementId, string>>; // id -> ISO date
  exportCount: number;
  unlock: (id: AchievementId) => void;
  incrementExportCount: () => void;
  getAchievements: () => Achievement[];
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      exportCount: 0,

      unlock: (id) => {
        set((state) => {
          if (state.unlocked[id]) return state;
          return {
            unlocked: { ...state.unlocked, [id]: new Date().toISOString() },
          };
        });
      },

      incrementExportCount: () => {
        set((state) => {
          const next = state.exportCount + 1;
          const newState = { ...state, exportCount: next };
          if (next >= 5 && !state.unlocked.exporter_5) {
            newState.unlocked = { ...state.unlocked, exporter_5: new Date().toISOString() };
          }
          return newState;
        });
      },

      getAchievements: () => {
        const { unlocked } = get();
        return (Object.keys(ACHIEVEMENTS_DEF) as AchievementId[]).map((id) => ({
          ...ACHIEVEMENTS_DEF[id],
          unlockedAt: unlocked[id] ?? null,
        }));
      },
    }),
    { name: 'yesselate-achievements-v1' }
  )
);
