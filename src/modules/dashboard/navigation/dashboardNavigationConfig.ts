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
  Home,
  Settings,
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
    label: 'Accueil',
    icon: Home,
    children: [
      {
        id: 'summary',
        label: 'Vue d\'ensemble',
        children: [
          { id: 'dashboard', label: 'Dashboard principal' },
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
        ],
      },
      {
        id: 'alerts',
        label: 'Alertes critiques',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'actives', label: 'Actives' },
          { id: 'urgentes', label: 'Urgentes' },
        ],
      },
      {
        id: 'activity',
        label: 'Activité récente',
        children: [
          { id: 'timeline', label: 'Timeline' },
          { id: 'notifications', label: 'Notifications' },
        ],
      },
    ],
  },
  performance: {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp,
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
        id: 'validation',
        label: 'Validations',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'en-attente', label: 'En attente' },
          { id: 'validees', label: 'Validées' },
          { id: 'rejetees', label: 'Rejetées' },
          { id: 'circuit', label: 'Circuit de validation' },
        ],
      },
      {
        id: 'budget',
        label: 'Budget',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'consommation', label: 'Consommation' },
          { id: 'restant', label: 'Restant' },
          { id: 'previsions', label: 'Prévisions' },
          { id: 'analyse', label: 'Analyse' },
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
          { id: 'analyse-causes', label: 'Analyse des causes' },
        ],
      },
      {
        id: 'comparison',
        label: 'Comparaisons',
        children: [
          { id: 'bureaux', label: 'Par bureaux' },
          { id: 'projets', label: 'Par projets' },
          { id: 'periode', label: 'Par période' },
          { id: 'benchmarking', label: 'Benchmarking' },
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
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'inbox',
        label: 'Ma boîte de réception',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'urgentes', label: 'Urgentes' },
          { id: 'aujourdhui', label: 'Aujourd\'hui' },
          { id: 'semaine', label: 'Cette semaine' },
          { id: 'personnalisees', label: 'Personnalisées' },
        ],
      },
      {
        id: 'type',
        label: 'Par type',
        children: [
          { id: 'contrats', label: 'Contrats' },
          { id: 'arbitrages', label: 'Arbitrages' },
          { id: 'paiements', label: 'Paiements' },
          { id: 'bc', label: 'BC' },
          { id: 'autres', label: 'Autres' },
        ],
      },
      {
        id: 'priority',
        label: 'Par priorité',
        children: [
          { id: 'critique', label: 'Critique' },
          { id: 'haute', label: 'Haute' },
          { id: 'moyenne', label: 'Moyenne' },
        ],
      },
      {
        id: 'blocked',
        label: 'Bloquées',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'blocages', label: 'Blocages' },
          { id: 'escalades', label: 'Escalades' },
          { id: 'analyse', label: 'Analyse' },
        ],
      },
      {
        id: 'assigned',
        label: 'Assignées',
        children: [
          { id: 'moi', label: 'À moi' },
          { id: 'equipe', label: 'À mon équipe' },
          { id: 'non-assignees', label: 'Non assignées' },
        ],
      },
      {
        id: 'history',
        label: 'Historique',
        children: [
          { id: 'recentes', label: 'Récentes' },
          { id: 'anciennes', label: 'Anciennes' },
          { id: 'archivees', label: 'Archivées' },
        ],
      },
    ],
  },
  risks: {
    id: 'risks',
    label: 'Risques',
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
        id: 'type',
        label: 'Par type',
        children: [
          { id: 'paiements-retard', label: 'Paiements en retard' },
          { id: 'contrats-expires', label: 'Contrats expirés' },
          { id: 'blocages', label: 'Blocages' },
          { id: 'alertes-systeme', label: 'Alertes système' },
        ],
      },
      {
        id: 'analyse',
        label: 'Analyse',
        children: [
          { id: 'tendances', label: 'Tendances' },
          { id: 'causes-racines', label: 'Causes racines' },
          { id: 'previsions', label: 'Prévisions' },
        ],
      },
      {
        id: 'actions-correctives',
        label: 'Actions correctives',
        children: [
          { id: 'en-cours', label: 'En cours' },
          { id: 'planifiees', label: 'Planifiées' },
        ],
      },
    ],
  },
  decisions: {
    id: 'decisions',
    label: 'Décisions',
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
          { id: 'planifiees', label: 'Planifiées' },
        ],
      },
      {
        id: 'executed',
        label: 'Exécutées',
        children: [
          { id: 'recentes', label: 'Récentes' },
          { id: 'anciennes', label: 'Anciennes' },
          { id: 'par-type', label: 'Par type' },
        ],
      },
      {
        id: 'timeline',
        label: 'Timeline',
        children: [
          { id: 'chronologique', label: 'Chronologique' },
          { id: 'par-type', label: 'Par type' },
          { id: 'par-auteur', label: 'Par auteur' },
        ],
      },
      {
        id: 'audit',
        label: 'Audit',
        children: [
          { id: 'traces', label: 'Traces' },
          { id: 'rapports', label: 'Rapports' },
          { id: 'conformite', label: 'Conformité' },
        ],
      },
      {
        id: 'modeles',
        label: 'Modèles',
        children: [
          { id: 'substitution', label: 'Substitution' },
          { id: 'delegation', label: 'Délégation' },
          { id: 'arbitrage', label: 'Arbitrage' },
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
        id: 'monitoring',
        label: 'Monitoring',
        children: [
          { id: 'vue-globale', label: 'Vue globale' },
          { id: 'metriques', label: 'Métriques' },
          { id: 'performance', label: 'Performance' },
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
          { id: 'historique', label: 'Historique' },
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
          { id: 'preferences', label: 'Préférences' },
        ],
      },
      {
        id: 'sync',
        label: 'Synchronisation',
        children: [
          { id: 'etat', label: 'État' },
          { id: 'historique', label: 'Historique' },
          { id: 'configuration', label: 'Configuration' },
        ],
      },
    ],
  },
  administration: {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    children: [
      {
        id: 'settings',
        label: 'Paramètres',
        children: [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'kpis', label: 'KPIs' },
          { id: 'notifications', label: 'Notifications' },
        ],
      },
      {
        id: 'users',
        label: 'Utilisateurs',
        children: [
          { id: 'liste', label: 'Liste' },
          { id: 'permissions', label: 'Permissions' },
        ],
      },
      {
        id: 'permissions',
        label: 'Permissions',
        children: [
          { id: 'roles', label: 'Rôles' },
          { id: 'acces', label: 'Accès' },
        ],
      },
      {
        id: 'logs',
        label: 'Logs',
        children: [
          { id: 'activite', label: 'Activité' },
          { id: 'systeme', label: 'Système' },
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

