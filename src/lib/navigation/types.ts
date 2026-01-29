/**
 * Types stricts pour l'architecture de navigation V2
 * Pattern: link | section | divider, RBAC, badges, settings
 * @module lib/navigation/types
 */

export type NavigationItemType = 'link' | 'section' | 'divider';

/** Permissions par route (RBAC) */
export type RoutePermission = 'public' | 'authenticated' | 'admin' | 'manager' | 'dashboard:read';

/** Variant de badge pour compteurs temps réel */
export type NavigationBadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';

export interface NavigationBadge {
  count: number | string;
  variant?: NavigationBadgeVariant;
  /** Animation pulse pour attirer l'attention */
  pulse?: boolean;
  /** Source temps réel (API, WebSocket) */
  live?: boolean;
}

/** Icône : nom Lucide ou emoji (string) pour compat */
export interface NavigationIcon {
  /** Nom d'icône Lucide (ex: 'Home', 'FileText') */
  name?: string;
  /** Couleur quand actif (class Tailwind) */
  activeColor?: string;
  size?: number;
}

/** Base commune à tous les items */
export interface BaseNavigationItem {
  id: string;
  label: string;
  type: NavigationItemType;
  icon?: NavigationIcon | string;
  badge?: NavigationBadge;
  permissions?: RoutePermission[];
  disabled?: boolean;
  /** Lien externe (target _blank) */
  external?: boolean;
  ariaLabel?: string;
  metadata?: Record<string, unknown>;
}

/** Lien vers une page */
export interface NavigationLink extends BaseNavigationItem {
  type: 'link';
  href: string;
  /** Match exact pour état actif (sinon prefix match) */
  exact?: boolean;
}

/** Section dépliable avec enfants */
export interface NavigationSection extends BaseNavigationItem {
  type: 'section';
  /** État initial collapsed (sinon dérivé de persistState) */
  collapsed?: boolean;
  children: NavigationItem[];
}

/** Séparateur visuel */
export interface NavigationDivider extends BaseNavigationItem {
  type: 'divider';
}

export type NavigationItem = NavigationLink | NavigationSection | NavigationDivider;

/** Type guard */
export function isNavigationLink(item: NavigationItem): item is NavigationLink {
  return item.type === 'link';
}

export function isNavigationSection(item: NavigationItem): item is NavigationSection {
  return item.type === 'section';
}

export function isNavigationDivider(item: NavigationItem): item is NavigationDivider {
  return item.type === 'divider';
}

/** Configuration globale navigation */
export interface NavigationConfig {
  items: NavigationItem[];
  settings: NavigationSettings;
}

export interface NavigationSettings {
  defaultCollapsed: boolean;
  persistState: boolean;
  showBreadcrumbs: boolean;
  enableSearch: boolean;
  enableFavorites: boolean;
  maxRecentItems: number;
}

/** Élément de breadcrumb */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  id?: string;
}

/** Item aplati pour search (Cmd+K) */
export interface FlattenedNavItem {
  id: string;
  label: string;
  href: string;
  breadcrumbLabels: string[];
  permissions?: RoutePermission[];
}
