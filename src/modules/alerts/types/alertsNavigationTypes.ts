/**
 * Types pour la navigation à 3 niveaux du module Alerts
 */

export type AlertsMainCategory =
  | 'overview'
  | 'critiques'
  | 'sla'
  | 'rh'
  | 'projets';

export type AlertsSubCategory =
  | 'all'
  | 'indicateurs'
  | 'typologie'
  | 'bureau'
  | 'validations'
  | 'paiements'
  | 'justificatifs'
  | 'financiers'
  | 'depasse'
  | 'attente'
  | 'risque'
  | 'absences'
  | 'surallocation'
  | 'retards'
  | 'retards-detected'
  | 'jalons'
  | 'blocages';

export type AlertsSubSubCategory =
  | 'summary'
  | 'recent'
  | 'today'
  | 'week'
  | 'month'
  | 'all'
  | 'critical';

export interface AlertsNavItem {
  id: string;
  label: string;
  icon?: any;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: AlertsNavItem[];
}

