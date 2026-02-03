/**
 * Router de contenu pour le module Dashboard
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 * 
 * @deprecated Utiliser DashboardViewRouter à la place
 * DashboardViewRouter offre :
 * - Lazy loading des composants
 * - Cache des composants chargés
 * - Transitions animées
 * - Meilleure gestion des routes via navigation.config.json
 * 
 * Migration:
 * - Remplacer <DashboardContentRouter /> par <DashboardViewRouter />
 * - DashboardViewRouter lit automatiquement la navigation depuis le store
 */

'use client';

import React, { useMemo } from 'react';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';
import {
  OverviewView,
  PerformanceView,
  ActionsView,
  RisksView,
  DecisionsView,
  RealtimeView,
} from '@/components/features/bmo/dashboard/command-center/views';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useLogger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';
import { zIndexClass } from '../utils/zIndex';

export interface DashboardContentRouterProps {
  mainCategory?: DashboardMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  fallbackView?: React.ComponentType;
}

// ============================================
// MAPPING DES ROUTES
// ============================================

type ViewComponent = React.ComponentType<Record<string, unknown>>;

const ROUTE_MAPPING: Record<DashboardMainCategory, ViewComponent> = {
  pilotage: OverviewView,
  chantiers: OverviewView,
  finance: PerformanceView,
  clients: OverviewView,
  rh: OverviewView,
  systeme: OverviewView,
  overview: OverviewView,
  performance: PerformanceView,
  actions: ActionsView,
  risks: RisksView,
  decisions: DecisionsView,
  realtime: RealtimeView,
  administration: OverviewView,
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function DashboardContentRouter({
  mainCategory: propMainCategory,
  subCategory: propSubCategory,
  subSubCategory: propSubSubCategory,
  fallbackView: FallbackView = OverviewView,
}: DashboardContentRouterProps) {
  const log = useLogger('DashboardContentRouter');
  // ============================================
  // NAVIGATION STATE
  // ============================================

  // Récupérer l'état du store
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);

  // Utiliser le store EN PRIORITÉ, fallback sur les props
  const mainCategory = navigation.mainCategory || propMainCategory || 'pilotage';
  const subCategory = navigation.subCategory || propSubCategory;
  const subSubCategory = navigation.subSubCategory || propSubSubCategory;

  // ============================================
  // LOGGING & DIAGNOSTICS
  // ============================================

  const navigationLog = useMemo(() => {
    const payload = {
      mainCategory,
      subCategory: subCategory || 'null',
      subSubCategory: subSubCategory || 'null',
      fromStore: {
        main: navigation.mainCategory,
        sub: navigation.subCategory,
        subSubCategory: navigation.subSubCategory,
      },
      fromProps: {
        main: propMainCategory,
        sub: propSubCategory,
        subSub: propSubSubCategory,
      },
    };

    log.debug('Routing', payload);

    return payload;
  }, [mainCategory, subCategory, subSubCategory, navigation, propMainCategory, propSubCategory, propSubSubCategory, log]);

  // ============================================
  // RESOLVE VIEW COMPONENT
  // ============================================

  const ViewComponent = useMemo(() => {
    // Valider que mainCategory est correct
    if (!mainCategory || !ROUTE_MAPPING[mainCategory as DashboardMainCategory]) {
      log.warn('Invalid mainCategory', { mainCategory });
      return FallbackView;
    }

    // Retourner le composant approprié basé sur mainCategory
    // Les sub-categories et sub-sub-categories sont gérées DANS le composant lui-même
    // (ex: OverviewView gère ses propres conditions pour afficher dashboard/highlights/etc.)
    const componentKey = mainCategory as DashboardMainCategory;
    const Component = ROUTE_MAPPING[componentKey];

    log.debug('Resolved view', {
      mainCategory: componentKey,
      component: Component.name || 'Unknown',
    });

    return Component;
  }, [mainCategory, FallbackView]);

  // ============================================
  // RENDER
  // ============================================

  return <ViewComponent />;
}

// ============================================
// HELPERS & HOOKS
// ============================================

/**
 * Hook pour obtenir le composant à renderer basé sur la navigation
 * Utile si tu veux décider en dehors du composant Router
 */
export function useNavigationView() {
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);

  return useMemo(() => {
    const { mainCategory } = navigation;
    if (!mainCategory || !ROUTE_MAPPING[mainCategory]) {
      return OverviewView;
    }
    return ROUTE_MAPPING[mainCategory];
  }, [navigation]);
}

/**
 * Hook pour vérifier si une vue spécifique est actuellement active
 */
export function useIsViewActive(targetMainCategory: DashboardMainCategory): boolean {
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);
  return navigation.mainCategory === targetMainCategory;
}

/**
 * Composant pour logger toute la navigation (debug)
 */
export function NavigationDebugger() {
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={cn("fixed bottom-4 left-4 p-4 bg-slate-900 border border-orange-500 rounded text-xs text-orange-300 max-w-sm", zIndexClass('notification'))}>
      <h3 className="font-bold mb-2">🔍 Navigation Debug</h3>
      <pre className="font-mono text-[10px] space-y-1">
        <div>Main: <span className="text-blue-400">{navigation.mainCategory}</span></div>
        <div>Sub: <span className="text-green-400">{navigation.subCategory || 'null'}</span></div>
        <div>SubSubCategory: <span className="text-purple-400">{navigation.subSubCategory || 'null'}</span></div>
      </pre>
    </div>
  );
}

// ============================================
// ALTERNATIVE: Avec props pour chaque view
// (Si tu veux passer des props spécifiques à chaque view)
// ============================================

interface DashboardContentRouterWithPropsProps extends DashboardContentRouterProps {
  viewProps?: Record<string, unknown>;
}

export function DashboardContentRouterWithProps({
  mainCategory: propMainCategory,
  subCategory: propSubCategory,
  subSubCategory: propSubSubCategory,
  viewProps = {},
  fallbackView: FallbackView = OverviewView,
}: DashboardContentRouterWithPropsProps) {
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);

  const mainCategory = navigation.mainCategory || propMainCategory || 'pilotage';
  const subCategory = navigation.subCategory || propSubCategory;
  const subSubCategory = navigation.subSubCategory || propSubSubCategory;

  const ViewComponent = useMemo(() => {
    if (!mainCategory || !ROUTE_MAPPING[mainCategory as DashboardMainCategory]) {
      return FallbackView;
    }
    return ROUTE_MAPPING[mainCategory as DashboardMainCategory];
  }, [mainCategory, FallbackView]);

  // Props spécifiques par view
  const propsForView = useMemo(() => {
    const baseProps = {
      mainCategory,
      subCategory,
      subSubCategory,
      ...viewProps,
    };

    // Tu peux ajouter des props spécifiques par mainCategory ici
    switch (mainCategory) {
      case 'overview':
        return {
          ...baseProps,
          // Props spécifiques pour OverviewView
        };
      case 'performance':
        return {
          ...baseProps,
          // Props spécifiques pour PerformanceView
        };
      case 'actions':
        return {
          ...baseProps,
          // Props spécifiques pour ActionsView
        };
      default:
        return baseProps;
    }
  }, [mainCategory, subCategory, subSubCategory, viewProps]);

  return <ViewComponent {...propsForView} />;
}

// ============================================
// MIGRATION GUIDE
// ============================================

/**
 * IMPORTANT: Comment utiliser ce composant
 * 
 * SIMPLE (Recommandé):
 * <DashboardContentRouter />
 * 
 * Avec fallback personnalisé:
 * <DashboardContentRouter fallbackView={CustomView} />
 * 
 * Avec props:
 * <DashboardContentRouterWithProps viewProps={{ theme: 'dark' }} />
 * 
 * NOTE: La logique des sous-catégories (niveau 2 et 3) doit être
 * implémentée DANS chaque View component (ex: OverviewView).
 * Le router ne s'occupe que du mainCategory (niveau 1).
 */
