/**
 * Utilitaires de validation des routes du dashboard
 * Centralise la logique de validation et de résolution des routes
 * ✅ Amélioré avec cache pour les validations fréquentes
 */

import config from '../navigation/navigation.config.json';
import { logger } from '@/lib/utils/logger';

// Logger pour ce module utilitaire (utilise l'instance singleton)
const log = {
  warn: (message: string, context?: Record<string, unknown>) => 
    logger.warn(message, { component: 'routeValidation', ...context }),
  error: (message: string, error?: Error, context?: Record<string, unknown>) => 
    logger.error(message, error, { component: 'routeValidation', ...context }),
};

// ✅ Type pour la configuration de navigation (exporté pour réutilisabilité)
export interface NavigationConfig {
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

// ✅ Cache pour les validations de routes (améliore les performances)
const routeValidationCache = new Map<string, boolean>();
const routeComponentCache = new Map<string, string | null>();
const defaultLeafCache = new Map<string, string | null>();

// ✅ Fonction helper pour créer une clé de cache
function createRouteKey(main: string, sub: string | null, leaf: string | null): string {
  return `${main}|${sub || ''}|${leaf || ''}`;
}

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
 * ✅ Utilise un cache pour améliorer les performances
 */
export function isValidRoute(
  main: string,
  sub: string | null,
  leaf: string | null
): boolean {
  // ✅ Validation des paramètres d'entrée
  if (!main || typeof main !== 'string') {
    return false;
  }

  // ✅ Vérifier le cache
  const cacheKey = createRouteKey(main, sub, leaf);
  if (routeValidationCache.has(cacheKey)) {
    return routeValidationCache.get(cacheKey)!;
  }

  try {
    const navConfig = getNavigationConfig();

    // Vérifier main
    if (!navConfig[main]) {
      routeValidationCache.set(cacheKey, false);
      return false;
    }

    // Si pas de sub, la route est valide (main seul)
    if (!sub) {
      routeValidationCache.set(cacheKey, true);
      return true;
    }

    // Vérifier sub
    if (!navConfig[main]?.sub?.[sub]) {
      routeValidationCache.set(cacheKey, false);
      return false;
    }

    // Si pas de leaf, la route est valide (main + sub)
    if (!leaf) {
      routeValidationCache.set(cacheKey, true);
      return true;
    }

    // Vérifier leaf
    const isValid = !!navConfig[main]?.sub?.[sub]?.leaf?.[leaf];
    routeValidationCache.set(cacheKey, isValid);
    return isValid;
  } catch (error) {
    log.error('Erreur lors de la validation de route', error instanceof Error ? error : new Error(String(error)), {
      main,
      sub,
      leaf,
    });
    routeValidationCache.set(cacheKey, false);
    return false;
  }
}

/**
 * Obtient le composant associé à une route
 * ✅ Utilise un cache pour améliorer les performances
 */
export function getRouteComponent(
  main: string,
  sub: string | null,
  leaf: string | null
): string | null {
  // ✅ Validation des paramètres d'entrée
  if (!main || typeof main !== 'string') {
    return null;
  }

  // ✅ Vérifier le cache
  const cacheKey = createRouteKey(main, sub, leaf);
  if (routeComponentCache.has(cacheKey)) {
    return routeComponentCache.get(cacheKey)!;
  }

  try {
    const navConfig = getNavigationConfig();

    let component: string | null = null;

    // Cas 1: main + sub + leaf
    if (main && sub && leaf) {
      component = navConfig[main]?.sub?.[sub]?.leaf?.[leaf]?.component || null;
    }
    // Cas 2: main + sub (sans leaf) - utiliser leaf par défaut
    else if (main && sub && !leaf) {
      const defaultLeaf = getDefaultLeafForSub(main, sub);
      if (defaultLeaf) {
        component = navConfig[main]?.sub?.[sub]?.leaf?.[defaultLeaf]?.component || null;
      }
      // ✅ Si aucun leaf par défaut trouvé, chercher dans le premier leaf disponible
      if (!component) {
        const subConfig = navConfig[main]?.sub?.[sub];
        if (subConfig?.leaf) {
          const firstLeaf = Object.keys(subConfig.leaf)[0];
          if (firstLeaf) {
            component = subConfig.leaf[firstLeaf]?.component || null;
          }
        }
      }
    }
    // Cas 3: main seul - utiliser route par défaut
    else if (main && !sub && !leaf) {
      component =
        navConfig[main]?.sub?.summary?.leaf?.dashboard?.component ||
        navConfig[main]?.sub?.summary?.leaf?.[
          Object.keys(navConfig[main]?.sub?.summary?.leaf || {})[0]
        ]?.component ||
        null;
    }
    // Cas 4: main + leaf (sans sub) - chercher dans summary ou kpis
    else if (main && !sub && leaf) {
      component =
        navConfig[main]?.sub?.summary?.leaf?.[leaf]?.component ||
        navConfig[main]?.sub?.kpis?.leaf?.[leaf]?.component ||
        null;
    }

    // ✅ Mettre en cache le résultat
    routeComponentCache.set(cacheKey, component);
    return component;
  } catch (error) {
    log.error('Erreur lors de la résolution du composant', error instanceof Error ? error : new Error(String(error)), {
      main,
      sub,
      leaf,
    });
    routeComponentCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Obtient le leaf par défaut pour une sub donnée
 * ✅ Utilise un cache pour améliorer les performances
 */
export function getDefaultLeafForSub(main: string, sub: string): string | null {
  // ✅ Validation des paramètres d'entrée
  if (!main || !sub || typeof main !== 'string' || typeof sub !== 'string') {
    return null;
  }

  // ✅ Vérifier le cache
  const cacheKey = `${main}|${sub}`;
  if (defaultLeafCache.has(cacheKey)) {
    return defaultLeafCache.get(cacheKey)!;
  }

  try {
    const navConfig = getNavigationConfig();
    const subConfig = navConfig[main]?.sub?.[sub];
    if (!subConfig?.leaf) {
      defaultLeafCache.set(cacheKey, null);
      return null;
    }

    const leaves = Object.keys(subConfig.leaf);
    if (leaves.length === 0) {
      defaultLeafCache.set(cacheKey, null);
      return null;
    }

    // ✅ Prioriser certains leafs selon le contexte
    // Prioriser 'dashboard', 'global', 'all', 'highlights', sinon premier disponible
    let defaultLeaf: string | null = null;
    if (leaves.includes('dashboard')) defaultLeaf = 'dashboard';
    else if (leaves.includes('global')) defaultLeaf = 'global';
    else if (leaves.includes('all')) defaultLeaf = 'all';
    else if (leaves.includes('highlights')) defaultLeaf = 'highlights';
    else defaultLeaf = leaves[0];

    defaultLeafCache.set(cacheKey, defaultLeaf);
    return defaultLeaf;
  } catch (error) {
    log.error('Erreur lors de la résolution du leaf par défaut', error instanceof Error ? error : new Error(String(error)), {
      main,
      sub,
    });
    defaultLeafCache.set(cacheKey, null);
    return null;
  }
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
    // ✅ Ne logger un warning que si la route demandée est différente de la route par défaut
    // pour éviter les warnings répétés lors de la normalisation vers la route par défaut
    const isDefaultRoute = 
      (!main || main === defaultRoute.main) &&
      (!sub || sub === defaultRoute.sub) &&
      (!leaf || leaf === defaultRoute.leaf);
    
    if (!isDefaultRoute && process.env.NODE_ENV === 'development') {
      log.warn('Route invalide, utilisation de la route par défaut', { main, sub, leaf });
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
