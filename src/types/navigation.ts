/**
 * Types pour l'architecture de navigation YESSALATE BMO
 * Navigation 3 niveaux, strict TypeScript
 */

export type NavBadgeVariant = 'urgent' | 'warning' | 'info' | 'success' | 'gray' | 'default';

export interface NavBadge {
  count: number;
  variant?: NavBadgeVariant;
  /** Temps réel: source du comptage (ex: API, WebSocket) */
  live?: boolean;
}

export interface NavRoute {
  path: string;
  /** Segment pour highlight actif (ex: /maitre-ouvrage/dashboard) */
  segment?: string;
}

/** Niveau 3 : feuille (route finale) */
export interface NavLeafItem {
  id: string;
  label: string;
  path: string;
  badge?: NavBadge;
  icon?: string;
  /** ARIA */
  ariaLabel?: string;
}

/** Niveau 2 : sous-menu dépliable (ex: Gouvernance, Validation) */
export interface NavSubItem {
  id: string;
  label: string;
  path?: string;
  /** Si défini, sous-menu dépliable avec enfants */
  children?: NavLeafItem[];
  badge?: NavBadge;
  icon?: string;
  ariaLabel?: string;
}

/** Niveau 1 : item principal sidebar */
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: NavBadge;
  /** Sous-menus (ex: Gouvernance → RACI, Alertes; Validation → BC, Contrats, Paiements) */
  children?: NavSubItem[];
  ariaLabel?: string;
}

/** Section = groupe (PILOTAGE, EXÉCUTION, etc.) */
export interface NavSectionConfig {
  id: string;
  title: string;
  ariaLabel: string;
  items: NavItem[];
}

export type NavigationConfig = NavSectionConfig[];

/** Contexte SubNavigation (tabs, filters, menu contextuel) */
export interface SubNavTab {
  id: string;
  label: string;
  path?: string;
  count?: number;
  ariaSelected?: boolean;
}

export interface SubNavFilter {
  id: string;
  label: string;
  value: string;
  active?: boolean;
}

export interface SubNavContext {
  title: string;
  tabs?: SubNavTab[];
  filters?: SubNavFilter[];
  /** Actions rapides (menu) */
  actions?: { id: string; label: string; onClick?: () => void }[];
}

/** Props Sidebar BMO v1 (overlay, open/onToggle) */
export interface SidebarProps {
  open?: boolean;
  onToggle?: () => void;
  /** Comptages temps réel pour badges (optionnel, ignoré si fourni par store) */
  badgeCounts?: Record<string, number | undefined>;
  /** User profile */
  user?: {
    name: string;
    role: string;
    initials: string;
    online?: boolean;
  };
}

/** Props SubNavigation */
export interface SubNavigationProps {
  context: SubNavContext | null;
  /** Route active pour highlight onglets */
  activePath?: string;
  className?: string;
}
