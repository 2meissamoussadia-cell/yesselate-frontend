/**
 * Types pour la navigation à 3 niveaux du module Calendrier
 */

export type CalendrierMainCategory =
  | 'overview'
  | 'agenda'
  | 'gantt'
  | 'timeline'
  | 'jalons'
  | 'absences'
  | 'evenements';

export type CalendrierSubCategory =
  | 'all'
  | 'global'
  | 'chantier'
  | 'sla-risque'
  | 'retards'
  | 'a-venir'
  | 'equipe'
  | 'internes'
  | 'reunions-projets'
  | 'reunions-decisionnelles';

export type CalendrierSubSubCategory =
  | 'summary'
  | 'recent'
  | 'today'
  | 'week'
  | 'month'
  | 'all';

export interface CalendrierNavItem {
  id: string;
  label: string;
  icon?: any;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: CalendrierNavItem[];
}

