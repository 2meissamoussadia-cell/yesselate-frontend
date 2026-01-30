/**
 * Configuration des applications métier (6 blocs DG)
 *
 * Chaque "app" = bloc métier avec modèles associés.
 * Mapping : Menu → App → Model → View
 */

import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';

/** Modèles métier exposés par le dashboard */
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

export type DashboardViewType = 'kpi' | 'list' | 'form' | 'graph' | 'pivot' | 'timeline';

export interface DashboardAction {
  type: 'open_view';
  model: DashboardModel;
  viewType: DashboardViewType;
  context?: Record<string, string | number | boolean>;
}

export interface DashboardApp {
  id: DashboardMainCategory;
  name: string;
  i18nKey?: string;
  models: DashboardModel[];
  permission?: string;
}

/**
 * Registre des 6 blocs métier du dashboard.
 */
export const dashboardApps: Record<DashboardMainCategory, DashboardApp> = {
  pilotage: {
    id: 'pilotage',
    name: 'Pilotage',
    i18nKey: 'nav.pilotage',
    models: ['projet', 'alerte', 'reporting', 'decision'],
    permission: 'dashboard:read',
  },
  chantiers: {
    id: 'chantiers',
    name: 'Chantiers & Marchés',
    i18nKey: 'nav.chantiers',
    models: ['projet', 'demande', 'action'],
    permission: 'dashboard:read',
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    i18nKey: 'nav.finance',
    models: ['budget', 'validation'],
    permission: 'dashboard:read',
  },
  clients: {
    id: 'clients',
    name: 'Clients & Commercial',
    i18nKey: 'nav.clients',
    models: ['projet', 'demande'],
    permission: 'dashboard:read',
  },
  rh: {
    id: 'rh',
    name: 'RH & Ressources',
    i18nKey: 'nav.rh',
    models: ['action'],
    permission: 'dashboard:read',
  },
  systeme: {
    id: 'systeme',
    name: 'Communication & Système',
    i18nKey: 'nav.systeme',
    models: [],
    permission: 'dashboard:read',
  },
};

export function getAppForCategory(mainCategory: DashboardMainCategory): DashboardApp {
  return dashboardApps[mainCategory];
}

export function appHasModel(mainCategory: DashboardMainCategory, model: DashboardModel): boolean {
  return dashboardApps[mainCategory]?.models.includes(model) ?? false;
}
