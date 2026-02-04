'use client';

/**
 * Hook principal navigation : route active, sections, collapsed, actions
 * Combine pathname, navigationConfig, useNavigationState, navigationStore (badges/history)
 */

import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { navigationConfig, pathToIdMap } from '@/lib/navigation/config';
import { getActiveId, buildBreadcrumbs } from '@/lib/navigation/utils';
import { resolveBadgeCountFromTree } from '@/lib/navigation/utils';
import { hasPermission } from '@/lib/navigation/permissions';
import type { NavigationItem, BreadcrumbItem } from '@/lib/navigation/types';
import { isNavigationLink, isNavigationSection } from '@/lib/navigation/types';
import { useNavigationState } from './useNavigationState';
import { usePageMetaStore } from '@/lib/stores/navigation-store';

export function useNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { pageCounts } = usePageMetaStore();
  const {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    openSectionIds,
    toggleSection,
    isSectionOpen,
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  } = useNavigationState({
    persist: navigationConfig.settings.persistState,
    defaultCollapsed: navigationConfig.settings.defaultCollapsed,
  });

  const activeId = useMemo(
    () => getActiveId(pathToIdMap, pathname ?? ''),
    [pathname]
  );

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(navigationConfig.items, pathname ?? ''),
    [pathname]
  );

  const isActive = useCallback(
    (itemId: string) => activeId === itemId,
    [activeId]
  );

  const isLinkActive = useCallback(
    (href: string, exact?: boolean) => {
      if (!pathname) return false;
      if (exact) return pathname === href;
      return pathname === href || pathname.startsWith(href + '/');
    },
    [pathname]
  );

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const checkPermission = useCallback((item: NavigationItem) => {
    return hasPermission(item, ['user', 'manager'], true);
  }, []);

  const getBadgeCount = useCallback(
    (itemId: string) =>
      resolveBadgeCountFromTree(navigationConfig.items, itemId, pageCounts),
    [pageCounts]
  );

  return {
    pathname: pathname ?? '',
    activeId,
    breadcrumbs,
    isActive,
    isLinkActive,
    navigate,
    hasPermission: checkPermission,
    getBadgeCount,
    items: navigationConfig.items,
    settings: navigationConfig.settings,
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    openSectionIds,
    toggleSection,
    isSectionOpen,
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
