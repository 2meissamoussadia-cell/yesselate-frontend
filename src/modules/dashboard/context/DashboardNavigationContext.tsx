/**
 * Contexte de navigation pour le Dashboard (compat legacy).
 *
 * ⚠️ NOTE IMPORTANT:
 * - La navigation du dashboard est désormais unifiée via `dashboardCommandCenterStore`.
 * - Ce provider/context est conservé pour compat avec d'anciens imports,
 *   mais s'appuie maintenant sur le store unifié (et non plus sur l'ancien store de navigation).
 */

'use client';

import { createContext, useContext, ReactNode, useMemo, useRef, useEffect, useCallback } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { logger, useLogger } from '@/lib/utils/logger';
import { isValidRoute, normalizeRoute } from '../utils/routeValidation';

type DashboardNavigationStore = {
  main: string;
  sub: string | null;
  leaf: string | null;
  setMain: (main: string) => void;
  setSub: (sub: string | null) => void;
  setLeaf: (leaf: string | null) => void;
};

export const DashboardNavigationContext = createContext<DashboardNavigationStore | null>(null);

// ✅ Valeurs par défaut stables pour le fallback (mémorisées au niveau module)
const DEFAULT_CONTEXT_VALUE: DashboardNavigationStore = {
  main: 'overview',
  sub: null,
  leaf: null,
  setMain: () => {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('setMain appelé en dehors du provider', {
        component: 'DashboardNavigationContext',
        action: 'setMain',
      });
    }
  },
  setSub: () => {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('setSub appelé en dehors du provider', {
        component: 'DashboardNavigationContext',
        action: 'setSub',
      });
    }
  },
  setLeaf: () => {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('setLeaf appelé en dehors du provider', {
        component: 'DashboardNavigationContext',
        action: 'setLeaf',
      });
    }
  },
} as const;

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  const log = useLogger('DashboardNavigationProvider');
  
  const mainCategory = useDashboardCommandCenterStore((state) => state.navigation.mainCategory);
  const subCategory = useDashboardCommandCenterStore((state) => state.navigation.subCategory);
  const leafCategory = useDashboardCommandCenterStore((state) => state.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);

  const main = mainCategory;
  const sub = subCategory;
  const leaf = leafCategory;

  const setMain = useCallback(
    (m: string) => navigate(m as any, null, null),
    [navigate]
  );

  const setSub = useCallback(
    (s: string | null) => navigate(mainCategory as any, s, null),
    [navigate, mainCategory]
  );

  const setLeaf = useCallback(
    (l: string | null) => navigate(mainCategory as any, subCategory, l),
    [navigate, mainCategory, subCategory]
  );

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
        
        // Corriger automatiquement vers une route valide (route par défaut canonique)
        const normalized = normalizeRoute('overview', null, null);
        navigate(normalized.main as any, normalized.sub, normalized.leaf);
      }
    }
  }, [main, sub, leaf, navigate, log]);

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
