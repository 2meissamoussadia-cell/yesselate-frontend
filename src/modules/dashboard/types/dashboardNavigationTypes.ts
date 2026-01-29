/**
 * Types pour la navigation à 3 niveaux du module Dashboard
 * Source unique pour NavNode / NavRequires (sidebar, breadcrumbs, filtres)
 */

import type React from 'react';

export type DashboardMainCategory =
  | 'overview'
  | 'performance'
  | 'actions'
  | 'risks'
  | 'decisions'
  | 'realtime'
  | 'administration';

export type DashboardSubCategory =
  | 'summary'
  | 'kpis'
  | 'bureaux'
  | 'trends'
  | 'validation'
  | 'budget'
  | 'delays'
  | 'comparison'
  | 'all'
  | 'urgent'
  | 'blocked'
  | 'pending'
  | 'completed'
  | 'critical'
  | 'warnings'
  | 'blocages'
  | 'payments'
  | 'contracts'
  | 'executed'
  | 'timeline'
  | 'audit'
  | 'live'
  | 'alerts'
  | 'notifications'
  | 'sync'
  | 'all';

export type DashboardSubSubCategory =
  | 'projets'
  | 'demandes'
  | 'budget'
  | 'validations'
  | 'retards'
  | 'blocages'
  | 'all';

/** Exigences d'accès pour un nœud (RBAC / feature flags) */
export interface NavRequires {
  perm?: string;
  flag?: string;
  roles?: string[];
}

/** Nœud de navigation (arbre à 3 niveaux : main → sub → leaf) */
export interface NavNode {
  id: string;
  label?: string;
  i18nKey?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  requires?: NavRequires;
  children?: NavNode[];
  /** Lien externe vers un module maître-ouvrage (ex: /maitre-ouvrage/alerts). Si défini, le clic ouvre cette URL au lieu de naviguer en interne. */
  externalHref?: string;
}

export interface DashboardNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: DashboardNavItem[];
}

