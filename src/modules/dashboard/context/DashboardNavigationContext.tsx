/**
 * Contexte de navigation pour le Dashboard
 * Fournit un accès au store Zustand via React Context
 */

'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';

type DashboardNavigationStore = ReturnType<typeof useDashboardNavigationStore>;

export const DashboardNavigationContext = createContext<DashboardNavigationStore | null>(null);

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  // PATCH: Utiliser un sélecteur pour ne s'abonner qu'aux valeurs de navigation
  // Les fonctions setMain, setSub, setLeaf sont stables avec Zustand (créées une seule fois)
  // On ne les inclut pas dans useMemo car elles ne changent jamais
  const main = useDashboardNavigationStore((state) => state.main);
  const sub = useDashboardNavigationStore((state) => state.sub);
  const leaf = useDashboardNavigationStore((state) => state.leaf);
  
  // Récupérer les fonctions une seule fois (elles sont stables)
  const setMain = useDashboardNavigationStore.getState().setMain;
  const setSub = useDashboardNavigationStore.getState().setSub;
  const setLeaf = useDashboardNavigationStore.getState().setLeaf;

  // Mémoriser seulement les valeurs qui changent (main, sub, leaf)
  // Les fonctions sont stables et n'ont pas besoin d'être dans les dépendances
  const contextValue = useMemo(
    () => ({
      main,
      sub,
      leaf,
      setMain,
      setSub,
      setLeaf,
    }),
    [main, sub, leaf] // Seulement les valeurs, pas les fonctions
  );

  return (
    <DashboardNavigationContext.Provider value={contextValue}>
      {children}
    </DashboardNavigationContext.Provider>
  );
}

export function useDashboardNavigation() {
  const ctx = useContext(DashboardNavigationContext);
  if (!ctx) {
    throw new Error('useDashboardNavigation must be used inside DashboardNavigationProvider');
  }
  return ctx;
}
