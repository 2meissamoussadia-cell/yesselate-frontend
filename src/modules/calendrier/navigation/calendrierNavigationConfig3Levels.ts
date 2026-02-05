/**
 * Configuration de navigation à 3 niveaux pour le module Calendrier
 */

import {
  LayoutDashboard,
  CalendarRange,
  GanttChartSquare,
  History,
  Flag,
  UserMinus,
  CalendarClock,
} from 'lucide-react';
import type { CalendrierMainCategory, CalendrierNavItem } from '../types/calendrierNavigationTypes';

export interface NavNode {
  id: string;
  label: string;
  icon?: any;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const calendrierNavigationConfig3Levels: Record<CalendrierMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    children: [
      {
        id: 'global',
        label: 'Calendrier global',
        children: [
          { id: 'summary', label: 'Synthèse' },
          { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' },
        ],
      },
      {
        id: 'chantier',
        label: 'Par chantier',
        children: [
          { id: 'today', label: "Aujourd'hui" },
          { id: 'week', label: 'Cette semaine' },
        ],
      },
    ],
  },
  agenda: {
    id: 'agenda',
    label: 'Vue mois BMO',
    icon: CalendarRange,
    children: [],
  },
  gantt: {
    id: 'gantt',
    label: 'Gantt',
    icon: GanttChartSquare,
    children: [
      {
        id: 'global',
        label: 'Global',
        children: [
          { id: 'all', label: 'Tout' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'chantier',
        label: 'Par chantier',
        children: [
          { id: 'today', label: "Aujourd'hui" },
          { id: 'week', label: 'Cette semaine' },
        ],
      },
    ],
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    icon: History,
    children: [
      {
        id: 'global',
        label: 'Global',
        children: [
          { id: 'all', label: 'Tout' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'chantier',
        label: 'Par chantier',
        children: [
          { id: 'today', label: "Aujourd'hui" },
          { id: 'week', label: 'Cette semaine' },
        ],
      },
    ],
  },
  jalons: {
    id: 'jalons',
    label: 'Jalons & Contrats',
    icon: Flag,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'sla-risque',
        label: 'SLA à risque',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'critical', label: 'Critiques' },
        ],
      },
      {
        id: 'retards',
        label: 'En retard',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'a-venir',
        label: 'À venir',
        children: [
          { id: 'today', label: "Aujourd'hui" },
          { id: 'week', label: 'Cette semaine' },
        ],
      },
    ],
  },
  absences: {
    id: 'absences',
    label: 'Absences & Congés',
    icon: UserMinus,
    children: [
      {
        id: 'global',
        label: 'Vue globale',
        children: [
          { id: 'all', label: 'Toutes' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'equipe',
        label: 'Par équipe',
        children: [
          { id: 'today', label: "Aujourd'hui" },
          { id: 'week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'chantier',
        label: 'Par chantier',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
    ],
  },
  evenements: {
    id: 'evenements',
    label: 'Événements & Réunions',
    icon: CalendarClock,
    children: [
      {
        id: 'internes',
        label: 'Événements internes',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'reunions-projets',
        label: 'Réunions projets',
        children: [
          { id: 'today', label: "Aujourd'hui" },
          { id: 'week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'reunions-decisionnelles',
        label: 'Réunions décisionnelles',
        children: [
          { id: 'all', label: 'Toutes' },
          { id: 'recent', label: 'Récents' },
        ],
      },
    ],
  },
};

// Helper functions
export function findNavNodeById(
  mainCategory: CalendrierMainCategory,
  subCategory?: string,
  subSubCategory?: string
): NavNode | undefined {
  const main = calendrierNavigationConfig3Levels[mainCategory];
  if (!main) return undefined;
  
  if (!subCategory) return main;
  
  const sub = main.children?.find((c) => c.id === subCategory);
  if (!sub) return undefined;
  
  if (!subSubCategory) return sub;
  
  return sub.children?.find((c) => c.id === subSubCategory);
}

export function getSubCategories(mainCategory: CalendrierMainCategory): NavNode[] {
  return calendrierNavigationConfig3Levels[mainCategory]?.children || [];
}

export function getSubSubCategories(
  mainCategory: CalendrierMainCategory,
  subCategory: string
): NavNode[] {
  const sub = calendrierNavigationConfig3Levels[mainCategory]?.children?.find(
    (c) => c.id === subCategory
  );
  return sub?.children || [];
}

