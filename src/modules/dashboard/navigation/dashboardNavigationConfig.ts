/**
 * Configuration de navigation à 3 niveaux pour le module Dashboard
 */

import type { DashboardMainCategory, DashboardNavItem } from '../types/dashboardNavigationTypes';
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  AlertTriangle,
  Scale,
  Activity,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const dashboardNavigationConfig: Record<DashboardMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [
      {
        id: 'summary',
        label: 'Synthèse',
        children: [
          { id: 'dashboard', label: 'Dashboard principal' },
          { id: 'highlights', label: 'Points clés', badge: 0, badgeType: 'warning' },
        ],
      },
      {
        id: 'kpis',
        label: 'KPIs Vue d\'ensemble',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'strategique', label: 'Synthèse stratégique' },
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
        ],
      },
      {
        id: 'trends',
        label: 'Tendances',
        children: [
          { id: 'mensuelles', label: 'Mensuelles' },
          { id: 'trimestrielles', label: 'Trimestrielles' },
        ],
      },
    ],
  },
  performance: {
    id: 'performance',
    label: 'Performance opérationnelle',
    icon: TrendingUp,
    children: [
      {
        id: 'validation',
        label: 'Validations',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'en-attente', label: 'En attente' },
          { id: 'validees', label: 'Validées' },
          { id: 'rejetees', label: 'Rejetées' },
          { id: 'workflow', label: 'Workflow' },
        ],
      },
      {
        id: 'budget',
        label: 'Budget opérationnel',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'consommation', label: 'Consommation' },
          { id: 'restant', label: 'Restant' },
          { id: 'previsionnel', label: 'Prévisionnel' },
        ],
      },
      {
        id: 'delays',
        label: 'Retards',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critiques', label: 'Critiques' },
          { id: 'moyens', label: 'Moyens' },
        ],
      },
      {
        id: 'comparison',
        label: 'Comparaisons',
        children: [
          { id: 'bureaux', label: 'Par bureaux' },
          { id: 'projets', label: 'Par projets' },
          { id: 'periodes', label: 'Par périodes' },
        ],
      },
    ],
  },
  actions: {
    id: 'actions',
    label: 'Actions prioritaires',
    icon: Zap,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'critiques', label: 'Critiques' },
          { id: 'urgentes', label: 'Urgentes' },
          { id: 'importantes', label: 'Importantes' },
          { id: 'normales', label: 'Normales' },
        ],
      },
      {
        id: 'blocked',
        label: 'Bloquées',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'actifs', label: 'Actifs' },
          { id: 'escalades', label: 'Escalades' },
          { id: 'resolus', label: 'Résolus' },
        ],
      },
      {
        id: 'pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'urgentes', label: 'Urgentes' },
          { id: 'normales', label: 'Normales' },
        ],
      },
      {
        id: 'completed',
        label: 'Terminées',
        children: [
          { id: 'recentes', label: 'Récentes' },
          { id: 'anciennes', label: 'Anciennes' },
        ],
      },
    ],
  },
  risks: {
    id: 'risks',
    label: 'Risques & Santé',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    children: [
      {
        id: 'critical',
        label: 'Critiques',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'risques', label: 'Risques' },
          { id: 'alertes', label: 'Alertes' },
        ],
      },
      {
        id: 'warnings',
        label: 'Avertissements',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'moyens', label: 'Moyens' },
          { id: 'faibles', label: 'Faibles' },
        ],
      },
      {
        id: 'payments',
        label: 'Paiements',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'en-retard', label: 'En retard' },
          { id: 'a-venir', label: 'À venir' },
        ],
      },
      {
        id: 'contracts',
        label: 'Contrats',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'a-renouveler', label: 'À renouveler' },
          { id: 'en-cours', label: 'En cours' },
        ],
      },
    ],
  },
  decisions: {
    id: 'decisions',
    label: 'Décisions & Timeline',
    icon: Scale,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'urgentes', label: 'Urgentes' },
          { id: 'normales', label: 'Normales' },
        ],
      },
      {
        id: 'executed',
        label: 'Exécutées',
        children: [
          { id: 'recentes', label: 'Récentes' },
          { id: 'anciennes', label: 'Anciennes' },
        ],
      },
      {
        id: 'timeline',
        label: 'Timeline',
        children: [
          { id: 'chronologique', label: 'Chronologique' },
          { id: 'par-type', label: 'Par type' },
        ],
      },
      {
        id: 'audit',
        label: 'Audit',
        children: [
          { id: 'traces', label: 'Traces' },
          { id: 'rapports', label: 'Rapports' },
        ],
      },
    ],
  },
  realtime: {
    id: 'realtime',
    label: 'Temps réel',
    icon: Activity,
    children: [
      {
        id: 'live',
        label: 'Live',
        children: [
          { id: 'monitoring', label: 'Monitoring' },
          { id: 'metriques', label: 'Métriques' },
        ],
      },
      {
        id: 'alerts',
        label: 'Alertes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'actives', label: 'Actives' },
          { id: 'resolues', label: 'Résolues' },
        ],
      },
      {
        id: 'notifications',
        label: 'Notifications',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'non-lues', label: 'Non lues' },
          { id: 'toutes', label: 'Toutes' },
        ],
      },
      {
        id: 'sync',
        label: 'Synchronisation',
        children: [
          { id: 'etat', label: 'État' },
          { id: 'historique', label: 'Historique' },
        ],
      },
    ],
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
  const mainNode = dashboardNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(
  mainCategory: DashboardMainCategory,
  subCategory: string
): NavNode[] {
  const mainNode = dashboardNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

