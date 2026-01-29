/**
 * Configuration des applications métier (logique type Odoo)
 *
 * Chaque "app" = module métier avec :
 * - id, name, modèles métier (demande, validation, budget, projet, ...)
 * - Les menus (dashboardNavigationConfig) pointent vers une app + une action (open_view)
 * - Les vues (registry) utilisent les services du domaine correspondant
 *
 * Mapping : Menu → App → Model → Action (open_view) → View (liste / KPI / formulaire)
 */

import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';

/** Modèles métier exposés par le dashboard (alignés sur src/domain) */
export type DashboardModel =
  | 'demande'
  | 'validation'
  | 'budget'
  | 'projet'
  | 'jalon'
  | 'risque'
  | 'alerte'
  | 'action'
  | 'decision'
  | 'reporting';

/** Type de vue (Odoo-like: list, form, kanban, graph, pivot) */
export type DashboardViewType = 'kpi' | 'list' | 'form' | 'graph' | 'pivot' | 'timeline';

/** Action déclenchée par un menu (open_view = ouvrir une vue sur un modèle) */
export interface DashboardAction {
  type: 'open_view';
  model: DashboardModel;
  viewType: DashboardViewType;
  /** Filtres par défaut (ex: statut=pending) */
  context?: Record<string, string | number | boolean>;
}

export interface DashboardApp {
  id: DashboardMainCategory;
  /** Nom affiché (fallback si pas i18n) */
  name: string;
  i18nKey?: string;
  /** Modèles métier gérés par cette app (utilisés pour charger les services domaine) */
  models: DashboardModel[];
  /** Permission requise pour accéder à l'app */
  permission?: string;
}

/**
 * Registre des applications métier du dashboard.
 * Source de vérité pour "quelle logique métier pilote quelle section".
 */
export const dashboardApps: Record<DashboardMainCategory, DashboardApp> = {
  overview: {
    id: 'overview',
    name: 'Accueil',
    i18nKey: 'nav.overview',
    models: ['demande', 'validation', 'budget', 'projet', 'alerte'],
    permission: 'dashboard:read',
  },
  performance: {
    id: 'performance',
    name: 'Performance',
    i18nKey: 'nav.performance',
    models: ['demande', 'validation', 'budget', 'projet', 'reporting'],
    permission: 'dashboard:read',
  },
  actions: {
    id: 'actions',
    name: 'Actions',
    i18nKey: 'nav.actions',
    models: ['action', 'demande', 'validation'],
    permission: 'dashboard:read',
  },
  risks: {
    id: 'risks',
    name: 'Risques',
    i18nKey: 'nav.risks',
    models: ['risque', 'alerte', 'projet'],
    permission: 'dashboard:read',
  },
  decisions: {
    id: 'decisions',
    name: 'Décisions',
    i18nKey: 'nav.decisions',
    models: ['decision', 'validation'],
    permission: 'dashboard:read',
  },
  realtime: {
    id: 'realtime',
    name: 'Temps réel',
    i18nKey: 'nav.realtime',
    models: ['alerte', 'action', 'demande'],
    permission: 'dashboard:read',
  },
};

/**
 * Retourne l'app métier pour une catégorie de navigation.
 */
export function getAppForCategory(mainCategory: DashboardMainCategory): DashboardApp {
  return dashboardApps[mainCategory];
}

/**
 * Indique si une app gère un modèle donné (pour brancher le bon service domaine).
 */
export function appHasModel(mainCategory: DashboardMainCategory, model: DashboardModel): boolean {
  return dashboardApps[mainCategory]?.models.includes(model) ?? false;
}
