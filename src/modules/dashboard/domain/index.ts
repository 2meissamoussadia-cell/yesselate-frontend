/**
 * Intégration logique métier (domaine) → Dashboard
 *
 * Chaque module expose les règles et types du domaine correspondant
 * pour calculer KPIs, libellés et alertes dans les vues (logique type Odoo).
 */

export * from './demandes';
export * from './budget';
export * from './validations';

export { dashboardApps, getAppForCategory, appHasModel } from '../config/dashboardApps';
export type { DashboardApp, DashboardModel, DashboardViewType, DashboardAction } from '../config/dashboardApps';
