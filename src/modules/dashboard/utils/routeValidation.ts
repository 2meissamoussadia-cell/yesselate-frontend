/**
 * Utilitaires de validation des routes du dashboard
 * Centralise la logique de validation et de résolution des routes
 */

import config from '../navigation/navigation.config.json';

// ✅ Type pour la configuration de navigation (local pour éviter les dépendances circulaires)
interface NavigationConfig {
  [key: string]: {
    label: string;
    sub?: {
      [key: string]: {
        label: string;
        leaf?: {
          [key: string]: {
            label: string;
            component: string;
          };
        };
      };
    };
  };
}

// ✅ Type pour la configuration de navigation
interface RouteConfig {
  main: string;
  sub: string | null;
  leaf: string | null;
}

// ✅ Config mémorisée au niveau module
const NAVIGATION_CONFIG = (config as NavigationConfig) || {};

/**
 * Obtient la configuration de navigation avec fallback
 */
export function getNavigationConfig(): NavigationConfig {
  if (
    !NAVIGATION_CONFIG ||
    typeof NAVIGATION_CONFIG !== 'object' ||
    Object.keys(NAVIGATION_CONFIG).length === 0
  ) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[routeValidation] Config invalide, utilisation du fallback');
    }
    return {
      overview: {
        label: "Vue d'ensemble",
        sub: {
          summary: {
            label: 'Synthèse',
            leaf: {
              dashboard: {
                label: 'Dashboard principal',
                component: 'SummaryDashboardPage',
              },
            },
          },
        },
      },
    };
  }
  return NAVIGATION_CONFIG;
}

/**
 * Vérifie si une route est valide dans la configuration
 */
export function isValidRoute(
  main: string,
  sub: string | null,
  leaf: string | null
): boolean {
  const navConfig = getNavigationConfig();

  // Vérifier main
  if (!navConfig[main]) {
    return false;
  }

  // Si pas de sub, la route est valide (main seul)
  if (!sub) {
    return true;
  }

  // Vérifier sub
  if (!navConfig[main]?.sub?.[sub]) {
    return false;
  }

  // Si pas de leaf, la route est valide (main + sub)
  if (!leaf) {
    return true;
  }

  // Vérifier leaf
  return !!navConfig[main]?.sub?.[sub]?.leaf?.[leaf];
}

/**
 * Obtient le composant associé à une route
 */
export function getRouteComponent(
  main: string,
  sub: string | null,
  leaf: string | null
): string | null {
  const navConfig = getNavigationConfig();

  // Cas 1: main + sub + leaf
  if (main && sub && leaf) {
    return navConfig[main]?.sub?.[sub]?.leaf?.[leaf]?.component || null;
  }

  // Cas 2: main + sub (sans leaf) - utiliser leaf par défaut
  if (main && sub && !leaf) {
    const defaultLeaf = getDefaultLeafForSub(main, sub);
    if (defaultLeaf) {
      return navConfig[main]?.sub?.[sub]?.leaf?.[defaultLeaf]?.component || null;
    }
  }

  // Cas 3: main seul - utiliser route par défaut
  if (main && !sub && !leaf) {
    return (
      navConfig[main]?.sub?.summary?.leaf?.dashboard?.component ||
      navConfig[main]?.sub?.summary?.leaf?.[
        Object.keys(navConfig[main]?.sub?.summary?.leaf || {})[0]
      ]?.component ||
      null
    );
  }

  // Cas 4: main + leaf (sans sub) - chercher dans summary ou kpis
  if (main && !sub && leaf) {
    return (
      navConfig[main]?.sub?.summary?.leaf?.[leaf]?.component ||
      navConfig[main]?.sub?.kpis?.leaf?.[leaf]?.component ||
      null
    );
  }

  return null;
}

/**
 * Obtient le leaf par défaut pour une sub donnée
 */
export function getDefaultLeafForSub(main: string, sub: string): string | null {
  const navConfig = getNavigationConfig();
  const subConfig = navConfig[main]?.sub?.[sub];
  if (!subConfig?.leaf) return null;

  const leaves = Object.keys(subConfig.leaf);
  if (leaves.length === 0) return null;

  // Prioriser 'dashboard' ou 'highlights', sinon premier disponible
  if (leaves.includes('dashboard')) return 'dashboard';
  if (leaves.includes('highlights')) return 'highlights';
  return leaves[0];
}

/**
 * Obtient la route par défaut
 */
export function getDefaultRoute(): RouteConfig {
  return {
    main: 'overview',
    sub: 'summary',
    leaf: 'dashboard',
  };
}

/**
 * Normalise une route (ajoute les valeurs par défaut si manquantes)
 */
export function normalizeRoute(
  main?: string | null,
  sub?: string | null,
  leaf?: string | null
): RouteConfig {
  const defaultRoute = getDefaultRoute();

  const normalized: RouteConfig = {
    main: main || defaultRoute.main,
    sub: sub || defaultRoute.sub,
    leaf: leaf || defaultRoute.leaf,
  };

  // Si la route normalisée n'est pas valide, utiliser la route par défaut
  if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[routeValidation] Route invalide, utilisation de la route par défaut:',
        { main, sub, leaf }
      );
    }
    return defaultRoute;
  }

  return normalized;
}

/**
 * Obtient toutes les routes disponibles pour un main donné
 */
export function getAvailableRoutes(main: string): {
  subs: string[];
  leaves: Record<string, string[]>;
} {
  const navConfig = getNavigationConfig();
  const mainConfig = navConfig[main];

  if (!mainConfig?.sub) {
    return { subs: [], leaves: {} };
  }

  const subs = Object.keys(mainConfig.sub);
  const leaves: Record<string, string[]> = {};

  subs.forEach((sub) => {
    const subConfig = mainConfig.sub?.[sub];
    if (subConfig?.leaf) {
      leaves[sub] = Object.keys(subConfig.leaf);
    }
  });

  return { subs, leaves };
}
