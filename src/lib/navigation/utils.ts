/**
 * Utilitaires navigation V2
 * findRouteByPath, flattenRoutes, getActiveId, buildBreadcrumbs
 */

import type {
  NavigationItem,
  NavigationLink,
  NavigationSection,
  NavigationConfig,
  BreadcrumbItem,
  FlattenedNavItem,
} from './types';
import { isNavigationLink, isNavigationSection } from './types';

/**
 * Trouve un item par path (récursif)
 */
export function findRouteByPath(
  items: NavigationItem[],
  pathname: string
): NavigationLink | null {
  for (const item of items) {
    if (isNavigationLink(item)) {
      if (item.exact ? item.href === pathname : pathname === item.href || pathname.startsWith(item.href + '/'))
        return item;
    }
    if (isNavigationSection(item) && item.children?.length) {
      const found = findRouteByPath(item.children, pathname);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Aplatit la tree en liste de liens (pour search Cmd+K)
 */
export function flattenRoutes(
  items: NavigationItem[],
  breadcrumbLabels: string[] = []
): FlattenedNavItem[] {
  const out: FlattenedNavItem[] = [];
  for (const item of items) {
    if (isNavigationLink(item)) {
      out.push({
        id: item.id,
        label: item.label,
        href: item.href,
        breadcrumbLabels: [...breadcrumbLabels, item.label],
        permissions: item.permissions,
      });
    }
    if (isNavigationSection(item) && item.children?.length) {
      out.push(
        ...flattenRoutes(item.children, [...breadcrumbLabels, item.label])
      );
    }
  }
  return out;
}

/**
 * Construit la map path → id pour highlight actif (compat structure sections)
 */
export function buildPathToIdMap(
  items: NavigationItem[]
): Record<string, string> {
  const out: Record<string, string> = {};
  function walk(nav: NavigationItem[]) {
    for (const item of nav) {
      if (isNavigationLink(item)) {
        out[item.href] = item.id;
      }
      if (isNavigationSection(item) && item.children?.length) {
        walk(item.children);
      }
    }
  }
  walk(items);
  return out;
}

/**
 * Retourne l'id de l'item actif pour un pathname (prefix match)
 */
export function getActiveId(
  pathToId: Record<string, string>,
  pathname: string
): string | null {
  if (!pathname) return null;
  const exact = pathToId[pathname];
  if (exact) return exact;
  let best: { path: string; id: string } | null = null;
  for (const [path, id] of Object.entries(pathToId)) {
    if (pathname.startsWith(path + '/') || pathname === path) {
      if (!best || path.length > best.path.length) best = { path, id };
    }
  }
  return best?.id ?? null;
}

/**
 * Construit les breadcrumbs pour un pathname
 */
export function buildBreadcrumbs(
  items: NavigationItem[],
  pathname: string,
  path: BreadcrumbItem[] = []
): BreadcrumbItem[] {
  for (const item of items) {
    if (isNavigationLink(item)) {
      const match = item.exact
        ? item.href === pathname
        : pathname === item.href || pathname.startsWith(item.href + '/');
      if (match) {
        return [...path, { label: item.label, href: item.href, id: item.id }];
      }
    }
    if (isNavigationSection(item) && item.children?.length) {
      const found = buildBreadcrumbs(item.children, pathname, [
        ...path,
        { label: item.label, id: item.id },
      ]);
      if (found.length > 0) return found;
    }
  }
  return [];
}

/**
 * Retourne le count du badge pour un itemId (walk tree)
 */
export function resolveBadgeCountFromTree(
  items: NavigationItem[],
  itemId: string,
  badgeCounts?: Record<string, number>
): number | undefined {
  if (badgeCounts && itemId in badgeCounts) return badgeCounts[itemId];
  for (const item of items) {
    if (item.id === itemId && item.badge != null) {
      const c = item.badge.count;
      return typeof c === 'number' ? c : parseInt(String(c), 10) || 0;
    }
    if (isNavigationSection(item) && item.children?.length) {
      const found = resolveBadgeCountFromTree(item.children, itemId, badgeCounts);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}
