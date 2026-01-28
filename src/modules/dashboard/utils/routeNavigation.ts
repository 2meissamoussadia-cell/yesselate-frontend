/**
 * Utilitaires pour la navigation entre routes (swipe gestures, navigation séquentielle)
 */

import type { NavNode } from '../navigation/dashboardNavigationConfig';

export interface Route {
  main: string;
  sub: string | null;
  leaf: string | null;
}

/**
 * Obtient toutes les routes accessibles dans l'ordre de navigation
 * Retourne un tableau plat de routes triées
 */
export function getAllAccessibleRoutes(
  filteredNav: Record<string, NavNode>
): Route[] {
  const routes: Route[] = [];

  for (const [mainKey, mainNode] of Object.entries(filteredNav)) {
    // Route principale sans sous-sections
    if (!mainNode.children || mainNode.children.length === 0) {
      routes.push({ main: mainKey, sub: null, leaf: null });
      continue;
    }

    // Parcourir les sous-sections
    for (const subNode of mainNode.children) {
      // Route avec sub mais sans leaf
      if (!subNode.children || subNode.children.length === 0) {
        routes.push({ main: mainKey, sub: subNode.id, leaf: null });
        continue;
      }

      // Routes avec leaf
      for (const leafNode of subNode.children) {
        routes.push({ main: mainKey, sub: subNode.id, leaf: leafNode.id });
      }
    }
  }

  return routes;
}

/**
 * Trouve l'index d'une route dans la liste des routes accessibles
 */
function findRouteIndex(routes: Route[], currentRoute: Route): number {
  return routes.findIndex(
    (r) =>
      r.main === currentRoute.main &&
      r.sub === currentRoute.sub &&
      r.leaf === currentRoute.leaf
  );
}

/**
 * Obtient la route suivante dans la navigation filtrée
 * Utilisé pour swipe left (navigation vers la droite)
 */
export function getNextCategoryRoute(
  currentRoute: Route,
  filteredNav: Record<string, NavNode>
): Route | null {
  const routes = getAllAccessibleRoutes(filteredNav);
  if (routes.length === 0) return null;

  const currentIndex = findRouteIndex(routes, currentRoute);
  
  // Si route actuelle non trouvée ou dernière route, retourner null
  if (currentIndex === -1 || currentIndex === routes.length - 1) {
    return null;
  }

  // Retourner la route suivante
  return routes[currentIndex + 1];
}

/**
 * Obtient la route précédente dans la navigation filtrée
 * Utilisé pour swipe right (navigation vers la gauche)
 */
export function getPreviousCategoryRoute(
  currentRoute: Route,
  filteredNav: Record<string, NavNode>
): Route | null {
  const routes = getAllAccessibleRoutes(filteredNav);
  if (routes.length === 0) return null;

  const currentIndex = findRouteIndex(routes, currentRoute);
  
  // Si route actuelle non trouvée ou première route, retourner null
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  // Retourner la route précédente
  return routes[currentIndex - 1];
}
