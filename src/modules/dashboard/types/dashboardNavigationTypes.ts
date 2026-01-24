/**
 * Types pour la navigation à 3 niveaux du module Dashboard
 */

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

export interface DashboardNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: DashboardNavItem[];
}

