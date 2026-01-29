/**
 * Constantes navigation V2
 * Clés localStorage, valeurs par défaut, mapping icônes
 */

export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: 'navigation:sidebar-collapsed',
  OPEN_SECTIONS: 'navigation:open-sections',
  FAVORITES: 'navigation:favorites',
  RECENT_ITEMS: 'navigation:recent-items',
} as const;

export const DEFAULT_SETTINGS = {
  defaultCollapsed: false,
  persistState: true,
  showBreadcrumbs: true,
  enableSearch: true,
  enableFavorites: true,
  maxRecentItems: 5,
} as const;

export const SIDEBAR_WIDTH = {
  expanded: 288,
  collapsed: 80,
} as const;
