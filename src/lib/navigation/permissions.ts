/**
 * RBAC pour la navigation
 * Filtrage des items selon les rôles / permissions utilisateur
 */

import type { NavigationItem, RoutePermission, NavigationSection } from './types';
import { isNavigationSection, isNavigationDivider } from './types';

/** Rôles utilisateur (à aligner avec l'auth du projet) */
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

const PERMISSION_HIERARCHY: Record<RoutePermission, number> = {
  public: 0,
  authenticated: 1,
  user: 2,
  manager: 3,
  admin: 4,
  'dashboard:read': 2,
};

/**
 * Vérifie si l'utilisateur a la permission requise pour un item
 */
export function hasPermission(
  item: NavigationItem,
  userRoles: UserRole[] = [],
  isAuthenticated = true
): boolean {
  const perms = item.permissions;
  if (!perms || perms.length === 0) return true;
  if (perms.includes('public')) return true;
  if (perms.includes('authenticated') && isAuthenticated) return true;
  const hasAdmin = userRoles.includes('admin');
  if (hasAdmin) return true;
  for (const p of perms) {
    const level = PERMISSION_HIERARCHY[p] ?? 0;
    if (p === 'dashboard:read' && (userRoles.includes('user') || userRoles.includes('manager'))) return true;
    if (p === 'manager' && userRoles.includes('manager')) return true;
    if (p === 'admin' && userRoles.includes('admin')) return true;
  }
  return false;
}

/**
 * Filtre récursivement les items selon les permissions (retourne de nouveaux objets)
 */
export function filterByPermission(
  items: NavigationItem[],
  userRoles: UserRole[] = [],
  isAuthenticated = true
): NavigationItem[] {
  const out: NavigationItem[] = [];
  for (const item of items) {
    if (isNavigationDivider(item)) {
      out.push(item);
      continue;
    }
    if (!hasPermission(item, userRoles, isAuthenticated)) continue;
    if (isNavigationSection(item) && item.children?.length) {
      const filtered = filterByPermission(item.children, userRoles, isAuthenticated);
      if (filtered.length > 0) {
        out.push({ ...item, children: filtered });
      }
    } else {
      out.push(item);
    }
  }
  return out;
}
