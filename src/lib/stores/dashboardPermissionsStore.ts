// src/lib/stores/dashboardPermissionsStore.ts
// Phase P10: Store Zustand pour stocker les permissions utilisateur
// Utilisé par les helpers de filtrage de navigation et les composants

'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export interface UserPermissions {
  roles: string[];
  permissions: string[];
  scopes: {
    bureaux: string[];
    chantiers: string[];
  };
  featureFlags: Record<string, boolean>;
}

interface DashboardPermissionsStore {
  permissions: UserPermissions;
  isLoading: boolean;
  lastFetched: number | null;
  
  // Actions
  setPermissions: (permissions: UserPermissions) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// ============================================
// STORE
// ============================================

const defaultPermissions: UserPermissions = {
  roles: [],
  permissions: [],
  scopes: {
    bureaux: [],
    chantiers: [],
  },
  featureFlags: {},
};

export const useDashboardPermissionsStore = create<DashboardPermissionsStore>()(
  devtools(
    (set) => ({
      permissions: defaultPermissions,
      isLoading: false,
      lastFetched: null,

      setPermissions: (permissions) =>
        set({
          permissions,
          lastFetched: Date.now(),
          isLoading: false,
        }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      reset: () =>
        set({
          permissions: defaultPermissions,
          isLoading: false,
          lastFetched: null,
        }),
    }),
    {
      name: 'dashboard-permissions-store',
    }
  )
);
