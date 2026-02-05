/**
 * Configuration de navigation à 3 niveaux pour le module Alerts
 */

import {
  LayoutDashboard,
  AlertTriangle,
  Clock,
  Users,
  FolderKanban,
  PieChart,
  Tag,
  Building2,
} from 'lucide-react';
import type { AlertsMainCategory, AlertsNavItem } from '../types/alertsNavigationTypes';

export interface NavNode {
  id: string;
  label: string;
  icon?: any;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const alertsNavigationConfig: Record<AlertsMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    children: [
      {
        id: 'indicateurs',
        label: 'Indicateurs',
        icon: PieChart,
        children: [
          { id: 'summary', label: 'Synthèse' },
          { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' },
        ],
      },
      {
        id: 'typologie',
        label: 'Par typologie',
        icon: Tag,
        children: [
          { id: 'all', label: 'Toutes' },
          { id: 'critical', label: 'Critiques' },
        ],
      },
      {
        id: 'bureau',
        label: 'Par bureau',
        icon: Building2,
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
    ],
  },
  critiques: {
    id: 'critiques',
    label: 'Critiques',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    children: [
      {
        id: 'validations',
        label: 'Validations bloquées',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all', label: 'Toutes' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'paiements',
        label: 'Paiements bloqués',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'justificatifs',
        label: 'Justificatifs manquants',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'financiers',
        label: 'Risques financiers',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
    ],
  },
  sla: {
    id: 'sla',
    label: 'SLA',
    icon: Clock,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'depasse',
        label: 'Dépassés',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'attente',
        label: 'En attente',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'risque',
        label: 'À risque',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
    ],
  },
  rh: {
    id: 'rh',
    label: 'RH',
    icon: Users,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'absences',
        label: 'Absences bloquantes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all', label: 'Toutes' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'surallocation',
        label: 'Surallocation',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all', label: 'Toutes' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'retards',
        label: 'Retards RH',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
    ],
  },
  projets: {
    id: 'projets',
    label: 'Projets',
    icon: FolderKanban,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'retards-detected',
        label: 'Retards détectés',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'jalons',
        label: 'Jalons non tenus',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
      {
        id: 'blocages',
        label: 'Blocages MOA/MOE',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'recent', label: 'Récents' },
        ],
      },
    ],
  },
};

// Helper functions
export function findNavNodeById(
  mainCategory: AlertsMainCategory,
  subCategory?: string,
  subSubCategory?: string
): NavNode | undefined {
  const main = alertsNavigationConfig[mainCategory];
  if (!main) return undefined;
  
  if (!subCategory) return main;
  
  const sub = main.children?.find((c) => c.id === subCategory);
  if (!sub) return undefined;
  
  if (!subSubCategory) return sub;
  
  return sub.children?.find((c) => c.id === subSubCategory);
}

export function getSubCategories(mainCategory: AlertsMainCategory): NavNode[] {
  return alertsNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(
  mainCategory: AlertsMainCategory,
  subCategory: string
): NavNode[] {
  const sub = alertsNavigationConfig[mainCategory]?.children?.find(
    (c) => c.id === subCategory
  );
  return sub?.children || [];
}

