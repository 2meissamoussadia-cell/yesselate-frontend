/**
 * Configuration de navigation à 3 niveaux pour le module Dashboard
 * Types NavNode / NavRequires : voir types/dashboardNavigationTypes.ts
 */

import type { DashboardMainCategory, NavNode, NavRequires } from '../types/dashboardNavigationTypes';
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  AlertTriangle,
  Scale,
  Activity,
  Home,
  Settings,
} from 'lucide-react';

/** Ré-export pour compatibilité des imports existants */
export type { NavNode, NavRequires } from '../types/dashboardNavigationTypes';

const base = '/maitre-ouvrage';

/**
 * Navigation dashboard : contenu strictement interne au tableau de bord.
 * Les modules (Centre d'alertes, Gouvernance, Validation, Demandes, etc.)
 * sont accessibles uniquement depuis la barre principale (portail) pour éviter
 * saturation et doublons.
 */
export const dashboardNavigationConfig: Record<DashboardMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Accueil',
    icon: Home,
    requires: { perm: 'dashboard:read' },
    children: [
      {
        id: 'summary',
        label: 'Vue d\'ensemble',
        children: [
          { id: 'cockpit', label: 'Centrale de commandement' },
          { id: 'cockpit-v2', label: 'Centrale V2 (IA)' },
          { id: 'rapport-dg', label: 'Rapport DG' },
        ],
      },
      {
        id: 'kpis',
        label: 'KPIs clés',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'highlights', label: 'Synthèse' },
          { id: 'projets', label: 'Projets' },
          { id: 'demandes', label: 'Demandes' },
          { id: 'budget', label: 'Budget' },
          { id: 'finances', label: 'Finances' },
        ],
      },
    ],
  },
  performance: {
    id: 'performance',
    i18nKey: 'nav.performance',
    icon: TrendingUp,
    requires: { perm: 'dashboard:read' },
    children: [
      {
        id: 'indicators',
        label: 'Indicateurs',
        children: [
          { id: 'synthese', label: 'Synthèse' },
          { id: 'projets', label: 'Projets' },
          { id: 'demandes', label: 'Demandes' },
          { id: 'budget', label: 'Budget' },
        ],
      },
      {
        id: 'bureaux',
        label: 'Bureaux',
        children: [
          { id: 'all', label: 'Tous' },
          { id: 'bmo', label: 'BMO' },
          { id: 'bf', label: 'BF' },
          { id: 'bj', label: 'BJ' },
          { id: 'bct', label: 'BCT' },
          { id: 'bop', label: 'BOP' },
          { id: 'bcg', label: 'BCG' },
          { id: 'bja', label: 'BJA' },
          { id: 'brc', label: 'BRC' },
          { id: 'bpl', label: 'BPL' },
          { id: 'bex', label: 'BEX' },
          { id: 'comparaison', label: 'Comparaison' },
        ],
      },
      {
        id: 'trends',
        label: 'Tendances',
        children: [
          { id: 'mensuelles', label: 'Mensuelles' },
          { id: 'trimestrielles', label: 'Trimestrielles' },
          { id: 'annuelles', label: 'Annuelles' },
        ],
      },
    ],
  },
  actions: {
    id: 'actions',
    label: 'Actions & Tâches',
    icon: Zap,
    requires: { perm: 'dashboard:read' },
    children: [],
  },
  risks: {
    id: 'risks',
    label: 'Risques',
    icon: AlertTriangle,
    requires: { perm: 'dashboard:read' },
    children: [],
  },
  decisions: {
    id: 'decisions',
    label: 'Décisions',
    icon: Scale,
    requires: { perm: 'dashboard:read' },
    children: [],
  },
  realtime: {
    id: 'realtime',
    label: 'Temps réel',
    icon: Activity,
    requires: { perm: 'dashboard:read' },
    children: [],
  },
  administration: {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    children: [],
  },
};

// Helper functions
export function findNavNodeById(
  mainCategory: DashboardMainCategory,
  subCategory?: string,
  subSubCategory?: string
): NavNode | undefined {
  const mainNode = dashboardNavigationConfig[mainCategory];
  if (!mainNode) return undefined;

  if (!subCategory) return mainNode;

  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;

  if (!subSubCategory) return subNode;

  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(
  mainCategory: DashboardMainCategory
): NavNode[] {
  const key = (mainCategory && typeof mainCategory === 'string' ? mainCategory.toLowerCase() : 'overview') as DashboardMainCategory;
  const mainNode = dashboardNavigationConfig[key];
  return mainNode?.children ?? [];
}

export function getSubSubCategories(
  mainCategory: DashboardMainCategory,
  subCategory: string
): NavNode[] {
  const key = (mainCategory && typeof mainCategory === 'string' ? mainCategory.toLowerCase() : 'overview') as DashboardMainCategory;
  const mainNode = dashboardNavigationConfig[key];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children ?? [];
}

