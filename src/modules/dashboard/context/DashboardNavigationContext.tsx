/**
 * Contexte de navigation pour le Dashboard
 * Fournit un accès au store Zustand via React Context
 */

'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { 
  useDashboardNavigationStore,
  useDashboardNavigationState,
} from '@/lib/stores/dashboardNavigationStore';

type DashboardNavigationStore = ReturnType<typeof useDashboardNavigationStore>;

export const DashboardNavigationContext = createContext<DashboardNavigationStore | null>(null);

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  // ✅ Utiliser shallow comparison pour éviter re-renders
  const { main, sub, leaf } = useDashboardNavigationState();
  
  // ✅ Récupérer les actions une seule fois (elles sont stables avec Zustand)
  // Les actions Zustand sont créées une seule fois et ne changent jamais
  const setMain = useDashboardNavigationStore((state) => state.setMain);
  const setSub = useDashboardNavigationStore((state) => state.setSub);
  const setLeaf = useDashboardNavigationStore((state) => state.setLeaf);

  // ✅ Mémoriser avec shallow comparison - seulement les valeurs changent
  // Les fonctions setMain, setSub, setLeaf sont stables (créées une seule fois par Zustand)
  const contextValue = useMemo(
    () => ({
      main,
      sub,
      leaf,
      setMain,
      setSub,
      setLeaf,
    }),
    [main, sub, leaf, setMain, setSub, setLeaf]
  );

  return (
    <DashboardNavigationContext.Provider value={contextValue}>
      {children}
    </DashboardNavigationContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte de navigation du Dashboard
 * 
 * @throws {Error} Si utilisé en dehors de DashboardNavigationProvider
 * @returns {DashboardNavigationStore} Le contexte de navigation
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { main, sub, leaf, setMain, setSub, setLeaf } = useDashboardNavigation();
 *   // ...
 * }
 * ```
 */
export function useDashboardNavigation() {
  const ctx = useContext(DashboardNavigationContext);
  
  // Guard amélioré avec message d'aide
  if (!ctx) {
    // En développement, fournir plus d'informations
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '[useDashboardNavigation] Hook utilisé en dehors du provider.\n' +
        'Assurez-vous que le composant est enveloppé dans <DashboardNavigationProvider>.\n' +
        'Le provider doit être dans le layout ou un parent proche.'
      );
    }
    
    // En production, utiliser un fallback silencieux pour éviter les crashes
    // Retourner un objet avec des valeurs par défaut
    if (process.env.NODE_ENV === 'production') {
      console.warn('[useDashboardNavigation] Provider manquant, utilisation de valeurs par défaut');
      return {
        main: 'overview',
        sub: null,
        leaf: null,
        setMain: () => {},
        setSub: () => {},
        setLeaf: () => {},
      };
    }
    
    throw new Error('useDashboardNavigation must be used inside DashboardNavigationProvider');
  }
  
  return ctx;
}
