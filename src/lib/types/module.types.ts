/**
 * Types pour la configuration des modules BMO (architecture Outlook-like)
 * Utilisés par ModuleSubSidebar, QuickActionsBar, FilterBar, etc.
 */

export type ModuleLayoutType = 'triple-pane' | 'dashboard' | 'calendar' | 'kanban' | 'two-pane';

/** Configuration globale d'un module BMO */
export interface ModuleConfig {
  id: string;
  name: string;
  layout: ModuleLayoutType;
  subSidebar?: SubSidebarConfig;
  quickActions?: QuickActionsConfig;
  filterBar?: FilterBarConfig;
}

/** Configuration de la sub-sidebar (dossiers / catégories) */
export interface SubSidebarConfig {
  sections: SubSidebarSection[];
}

export interface SubSidebarSection {
  title: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: SubSidebarItem[];
}

export interface SubSidebarItem {
  id: string;
  label: string;
  /** Nom de l'icône lucide-react (ex: 'Inbox', 'AlertCircle') */
  icon: string;
  badge?: number;
  color?: string;
  route?: string;
  children?: SubSidebarItem[];
  /** Type système pour icônes prédéfinies (inbox, sent, drafts, trash, archive) */
  systemType?: string;
}

/** Configuration de la barre d'actions rapides */
export interface QuickActionsConfig {
  primary?: QuickActionPrimaryConfig;
  secondary?: QuickActionSecondaryConfig[];
  overflow?: QuickActionOverflowItem[];
}

export interface QuickActionPrimaryConfig {
  id?: string;
  label: string;
  icon: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  /** Options du menu déroulant si présent */
  dropdown?: Array<{
    id: string;
    label: string;
    icon: string;
    description?: string;
  }>;
}

export interface QuickActionSecondaryConfig {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  disabledWithoutSelection?: boolean;
  confirmDialog?: boolean;
  /** Sous-options (ex: Export PDF/Excel/CSV) */
  dropdown?: Array<{ id: string; label: string; icon: string }>;
}

export interface QuickActionOverflowItem {
  id: string;
  label: string;
  icon: string;
  separatorAfter?: boolean;
}

/** Configuration de la barre de filtres */
export interface FilterBarConfig {
  views?: FilterViewTab[];
  quickFilters?: FilterQuickFilter[];
  sort?: FilterSortOption[];
}

export interface FilterViewTab {
  id: string;
  label: string;
  badge?: number;
  color?: 'red' | 'orange' | 'blue' | 'green' | 'gray';
}

export interface FilterQuickFilter {
  id: string;
  icon: string;
  label: string;
}

export interface FilterSortOption {
  id: string;
  label: string;
  icon?: string;
  defaultOrder?: 'asc' | 'desc';
}
