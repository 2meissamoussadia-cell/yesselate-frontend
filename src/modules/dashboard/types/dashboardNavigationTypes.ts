/**
 * Types pour la navigation à 3 niveaux du module Dashboard
 * Source unique pour NavNode / NavRequires (sidebar, breadcrumbs, filtres)
 */

import type React from 'react';

/** Arborescence métier DG : 6 blocs (référence ERP-BTP) */
export type DashboardMainCategory =
  | 'pilotage'
  | 'chantiers'
  | 'finance'
  | 'clients'
  | 'rh'
  | 'systeme';

/** Sous-catégories par bloc (ids des items sidebar) */
export type DashboardSubCategory =
  | 'dashboard'
  | 'gouvernance'
  | 'calendrier'
  | 'analytics'
  | 'alertes'
  | 'portefeuille'
  | 'demandes'
  | 'execution'
  | 'dossiers-bloques'
  | 'litiges'
  | 'budget'
  | 'validation-paiements'
  | 'gains-pertes'
  | 'tresorerie'
  | 'recouvrements'
  | 'projets'
  | 'clients'
  | 'tickets'
  | 'propositions'
  | 'employes'
  | 'missions'
  | 'evaluations'
  | 'demandes-rh'
  | 'organigramme'
  | 'echanges'
  | 'conferences'
  | 'messages'
  | 'registre-decisions'
  | 'audit'
  | 'journal-actions'
  | 'logs'
  | 'ia'
  | 'parametres'
  // Legacy (redirections)
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
  | 'sync';

export type DashboardSubSubCategory =
  | 'projets'
  | 'demandes'
  | 'budget'
  | 'validations'
  | 'retards'
  | 'blocages'
  | 'all'
  | string;

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

