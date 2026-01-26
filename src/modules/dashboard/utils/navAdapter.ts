/**
 * Adapter pour convertir entre les formats de navigation
 * Le store utilise subSubCategory, NavKey utilise leaf
 * 
 * DESIGN SYSTEM DATA - Unification des formats de navigation
 */

import type { NavKey } from '../types/dashboard';
import type { DashboardNavigation } from '@/lib/stores/dashboardCommandCenterStore';

/**
 * Convertit DashboardNavigation (store) vers NavKey (registry)
 */
export function storeNavToNavKey(storeNav: DashboardNavigation): NavKey {
  return {
    main: storeNav.mainCategory,
    sub: storeNav.subCategory,
    leaf: storeNav.subSubCategory, // subSubCategory → leaf
  };
}

/**
 * Convertit NavKey (registry) vers DashboardNavigation (store)
 */
export function navKeyToStoreNav(navKey: NavKey): DashboardNavigation {
  return {
    mainCategory: navKey.main,
    subCategory: navKey.sub,
    subSubCategory: navKey.leaf, // leaf → subSubCategory
  };
}

/**
 * Helper pour obtenir NavKey depuis le store directement
 */
export function getNavKeyFromStore(): NavKey | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const store = require('@/lib/stores/dashboardCommandCenterStore');
    const navigation = store.useDashboardCommandCenterStore.getState().navigation;
    return storeNavToNavKey(navigation);
  } catch {
    return null;
  }
}
