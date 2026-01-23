/**
 * Contexte de navigation pour le Dashboard
 * Fournit un accès au store Zustand via React Context
 * ✅ Amélioré avec meilleure gestion SSR, validation et fallbacks
 */

'use client';

import { createContext, useContext, ReactNode, useMemo, useRef, useEffect } from 'react';
import { 
  useDashboardNavigationStore,
} from '@/lib/stores/dashboardNavigationStore';
import { useLogger } from '@/lib/utils/logger';
import { isValidRoute } from '../utils/routeValidation';

type DashboardNavigationStore = ReturnType<typeof useDashboardNavigationStore>;

export const DashboardNavigationContext = createContext<DashboardNavigationStore | null>(null);

// ✅ Valeurs par défaut stables pour le fallback (mémorisées au niveau module)
const DEFAULT_CONTEXT_VALUE: DashboardNavigationStore = {
  main: 'overview',
  sub: null,
  leaf: null,
  setMain: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DashboardNavigationContext] setMain appelé en dehors du provider');
    }
  },
  setSub: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DashboardNavigationContext] setSub appelé en dehors du provider');
    }
  },
  setLeaf: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DashboardNavigationContext] setLeaf appelé en dehors du provider');
    }
  },
} as const;

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  const log = useLogger('DashboardNavigationProvider');
  
  // ✅ Utiliser des sélecteurs individuels directement pour éviter les problèmes avec getServerSnapshot
  // Ne pas utiliser useDashboardNavigationState qui retourne un objet (peut causer des problèmes SSR)
  const main = useDashboardNavigationStore((state) => state.main);
  const sub = useDashboardNavigationStore((state) => state.sub);
  const leaf = useDashboardNavigationStore((state) => state.leaf);
  
  // ✅ Récupérer les actions une seule fois (elles sont stables avec Zustand)
  // Les actions Zustand sont créées une seule fois et ne changent jamais
  const setMain = useDashboardNavigationStore((state) => state.setMain);
  const setSub = useDashboardNavigationStore((state) => state.setSub);
  const setLeaf = useDashboardNavigationStore((state) => state.setLeaf);

  // ✅ Validation de la route actuelle et correction si nécessaire
  const previousRouteRef = useRef({ main, sub, leaf });
  useEffect(() => {
    // Valider la route uniquement si elle a changé
    if (
      main !== previousRouteRef.current.main ||
      sub !== previousRouteRef.current.sub ||
      leaf !== previousRouteRef.current.leaf
    ) {
      previousRouteRef.current = { main, sub, leaf };
      
      // Valider la route
      if (!isValidRoute(main, sub, leaf)) {
        log.warn('Route invalide détectée, correction automatique', {
          main,
          sub,
          leaf,
        });
        
        // Corriger automatiquement vers une route valide
        setMain('overview');
        setSub(null);
        setLeaf(null);
      }
    }
  }, [main, sub, leaf, setMain, setSub, setLeaf, log]);

  // ✅ Mémoriser avec shallow comparison - seulement les valeurs changent
  // Les fonctions setMain, setSub, setLeaf sont stables (créées une seule fois par Zustand)
  // ✅ OPTIMISÉ: Retirer les fonctions stables des dépendances pour éviter les re-créations inutiles
  const contextValue = useMemo(
    () => ({
      main,
      sub,
      leaf,
      setMain,
      setSub,
      setLeaf,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [main, sub, leaf] // setMain, setSub, setLeaf sont stables (Zustand)
  );

  return (
    <DashboardNavigationContext.Provider value={contextValue}>
      {children}
    </DashboardNavigationContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte de navigation du Dashboard
 * ✅ Amélioré avec meilleure gestion d'erreurs et fallback robuste
 * 
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
export function useDashboardNavigation(): DashboardNavigationStore {
  const log = useLogger('useDashboardNavigation');
  const ctx = useContext(DashboardNavigationContext);
  
  // ✅ Guard amélioré avec message d'aide et fallback robuste
  if (!ctx) {
    // En développement, fournir plus d'informations
    const errorMessage = 'Hook utilisé en dehors du provider. Assurez-vous que le composant est enveloppé dans <DashboardNavigationProvider>. Le provider doit être dans le layout ou un parent proche.';
    
    if (process.env.NODE_ENV === 'development') {
      log.error(
        errorMessage,
        new Error(errorMessage),
        { action: 'guard-check' }
      );
    } else {
      // En production, logger uniquement un warning pour éviter le bruit
      log.warn('Provider manquant, utilisation de valeurs par défaut', { action: 'fallback' });
    }
    
    // ✅ Retourner les valeurs par défaut stables (mémorisées au niveau module)
    // Cela évite de créer un nouvel objet à chaque appel
    return DEFAULT_CONTEXT_VALUE;
  }
  
  return ctx;
}
