/**
 * Utilitaires de validation des routes du dashboard
 * Centralise la logique de validation et de résolution des routes
 * ✅ Amélioré avec cache pour les validations fréquentes
 */

import config from '../navigation/navigation.config.json';
import { logger } from '@/lib/utils/logger';
import { normalizeRouteWithAliases } from './routeAliases';

// Logger pour ce module utilitaire (utilise l'instance singleton)
const log = {
  debug: (message: string, context?: Record<string, unknown>) => 
    logger.debug(message, { component: 'routeValidation', ...context }),
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
      log.warn('Config invalide, utilisation du fallback');
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
 * ✅ Validation avancée avec vérification de la présence du composant
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

    // Si pas de sub, la route est valide (main seul) - mais vérifier qu'il y a au moins un sub disponible
    if (!sub) {
      const hasSubs = !!(navConfig[main]?.sub && Object.keys(navConfig[main].sub).length > 0);
      routeValidationCache.set(cacheKey, hasSubs);
      return hasSubs;
    }

    // Vérifier sub
    if (!navConfig[main]?.sub?.[sub]) {
      routeValidationCache.set(cacheKey, false);
      return false;
    }

    // Si pas de leaf, la route est valide (main + sub) - mais vérifier qu'il y a au moins un leaf disponible
    if (!leaf) {
      const hasLeaves = !!(navConfig[main]?.sub?.[sub]?.leaf && Object.keys(navConfig[main].sub[sub].leaf || {}).length > 0);
      routeValidationCache.set(cacheKey, hasLeaves);
      return hasLeaves;
    }

    // Vérifier leaf et que le composant existe
    const leafConfig = navConfig[main]?.sub?.[sub]?.leaf?.[leaf];
    const isValid = !!leafConfig && !!leafConfig.component;
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
 * ✅ Validation avancée avec fallback automatique
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
      // ✅ Prioriser "dashboard" dans "summary", puis premier disponible
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
    // Prioriser 'default' (6 blocs), 'dashboard', 'global', 'all', 'highlights', sinon premier disponible
    let defaultLeaf: string | null = null;
    if (leaves.includes('default')) defaultLeaf = 'default';
    else if (leaves.includes('dashboard')) defaultLeaf = 'dashboard';
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
 * Route par défaut = Cockpit DG (default DG home). Verrouillée : /maitre-ouvrage/dashboard ou /dg/cockpit → pilotage::dashboard::default. (Cockpit DG = vue d’accueil maître-ouvrage)
 */
export const DEFAULT_DG_HOME: RouteConfig = {
  main: 'pilotage',
  sub: 'dashboard',
  leaf: 'default',
};

export function getDefaultRoute(): RouteConfig {
  return DEFAULT_DG_HOME;
}

/**
 * Normalise une route (ajoute les valeurs par défaut si manquantes)
 * Applique également les alias pour compatibilité ascendante
 */
export function normalizeRoute(
  main?: string | null,
  sub?: string | null,
  leaf?: string | null
): RouteConfig {
  const defaultRoute = getDefaultRoute();

  // Appliquer les alias AVANT la normalisation
  const withAliases = normalizeRouteWithAliases(
    main || defaultRoute.main,
    sub || defaultRoute.sub,
    leaf || defaultRoute.leaf
  );

  const normalized: RouteConfig = {
    main: withAliases.main || defaultRoute.main,
    sub: withAliases.sub || defaultRoute.sub,
    leaf: withAliases.leaf || defaultRoute.leaf,
  };

  // Si la route normalisée n'est pas valide, utiliser la route par défaut
  if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) {
    // ✅ Ne logger un warning que si la route demandée est différente de la route par défaut
    // pour éviter les warnings répétés lors de la normalisation vers la route par défaut
    const isDefaultRoute = 
      (!main || main === defaultRoute.main) &&
      (!sub || sub === defaultRoute.sub) &&
      (!leaf || leaf === defaultRoute.leaf);
    
    // ✅ Ne logger qu'en développement et seulement si ce n'est pas déjà la route par défaut
    // pour éviter les warnings répétés lors de la normalisation
    if (!isDefaultRoute && process.env.NODE_ENV === 'development') {
      // Utiliser debug au lieu de warn pour réduire le bruit dans la console
      log.debug('Route invalide normalisée vers route par défaut', { 
        requested: { main, sub, leaf },
        normalized: defaultRoute 
      });
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

/**
 * Obtient le composant de fallback pour une catégorie principale
 * Essaie plusieurs stratégies de fallback dans l'ordre :
 * 1. main -> summary -> dashboard
 * 2. main -> summary -> premier leaf disponible
 * 3. main -> premier sub -> dashboard
 * 4. main -> premier sub -> premier leaf disponible
 * 
 * @param main - Catégorie principale
 * @returns Nom du composant de fallback ou null
 */
export function getFallbackComponent(main: string): string | null {
  if (!main || typeof main !== 'string') {
    return null;
  }

  const navConfig = getNavigationConfig();
  const mainConfig = navConfig[main];

  if (!mainConfig?.sub) {
    return null;
  }

  // Stratégie 1: main -> summary -> dashboard
  const summaryDashboard = mainConfig.sub?.summary?.leaf?.dashboard?.component;
  if (summaryDashboard) {
    return summaryDashboard;
  }

  // Stratégie 2: main -> summary -> premier leaf disponible
  const summaryLeaves = mainConfig.sub?.summary?.leaf;
  if (summaryLeaves) {
    const firstSummaryLeaf = Object.keys(summaryLeaves)[0];
    if (firstSummaryLeaf && summaryLeaves[firstSummaryLeaf]?.component) {
      return summaryLeaves[firstSummaryLeaf].component;
    }
  }

  // Stratégie 3: main -> premier sub -> dashboard
  const subs = Object.keys(mainConfig.sub);
  for (const sub of subs) {
    const dashboardComponent = mainConfig.sub[sub]?.leaf?.dashboard?.component;
    if (dashboardComponent) {
      return dashboardComponent;
    }
  }

  // Stratégie 4: main -> premier sub -> premier leaf disponible
  type SubConfig = { leaf?: Record<string, { component?: string }> };
  for (const sub of subs) {
    const subConfig = mainConfig.sub[sub] as SubConfig | undefined;
    if (subConfig?.leaf) {
      const firstLeaf = Object.keys(subConfig.leaf)[0];
      if (firstLeaf && subConfig.leaf[firstLeaf]?.component) {
        return subConfig.leaf[firstLeaf].component;
      }
    }
  }

  return null;
}
