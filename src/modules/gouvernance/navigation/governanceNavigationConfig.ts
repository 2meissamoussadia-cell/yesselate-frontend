/**
 * Configuration de navigation à 3 niveaux pour le module Gouvernance
 */

import type { GovernanceMainCategory, GovernanceNavItem } from '../types/governanceNavigationTypes';
import {
  BarChart3,
  AlertTriangle,
  Scale,
  Users,
  CheckCircle2,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const governanceNavigationConfig: Record<GovernanceMainCategory, NavNode> = {
  strategic: {
    id: 'strategic',
    label: 'Vue stratégique',
    icon: BarChart3,
    children: [
      {
        id: 'overview',
        label: 'Tableau de bord',
        children: [
          { id: 'dashboard', label: 'Dashboard exécutif' },
          { id: 'widgets', label: 'Vue widgets' },
          { id: 'summary', label: 'Synthèse' },
          { id: 'highlights', label: 'Points clés', badge: 0, badgeType: 'warning' },
        ],
      },
      {
        id: 'tendances',
        label: 'Tendances',
        children: [
          { id: 'all', label: 'Toutes' },
          { id: 'mensuelles', label: 'Mensuelles' },
          { id: 'trimestrielles', label: 'Trimestrielles' },
        ],
      },
      {
        id: 'synthese',
        label: 'Synthèse',
        children: [
          {
            id: 'projets',
            label: 'Projets',
            badge: 0,
            badgeType: 'warning',
            children: [
              { id: 'actifs', label: 'Actifs' },
              { id: 'at-risk', label: 'À risque' },
              { id: 'en-retard', label: 'En retard' },
            ],
          },
          {
            id: 'budget',
            label: 'Budget',
            badge: 0,
            badgeType: 'warning',
            children: [
              { id: 'consommation', label: 'Consommation' },
              { id: 'depassements', label: 'Dépassements' },
              { id: 'restant', label: 'Restant' },
            ],
          },
          {
            id: 'jalons',
            label: 'Jalons',
            badge: 0,
            badgeType: 'critical',
            children: [
              { id: 'respectes', label: 'Respectés' },
              { id: 'en-retard', label: 'En retard' },
              { id: 'a-venir', label: 'À venir' },
            ],
          },
          {
            id: 'risques',
            label: 'Risques',
            badge: 0,
            badgeType: 'critical',
            children: [
              { id: 'critiques', label: 'Critiques' },
              { id: 'moyens', label: 'Moyens' },
              { id: 'faibles', label: 'Faibles' },
            ],
          },
          {
            id: 'validations',
            label: 'Validations',
            badge: 0,
            badgeType: 'warning',
            children: [
              { id: 'en-attente', label: 'En attente' },
              { id: 'validees', label: 'Validées' },
              { id: 'rejetees', label: 'Rejetées' },
            ],
          },
        ],
      },
    ],
  },
  attention: {
    id: 'attention',
    label: 'Points d\'attention',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    children: [
      {
        id: 'depassements',
        label: 'Dépassements budgétaires',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critiques', label: 'Critiques' },
          { id: 'moyens', label: 'Moyens' },
          { id: 'tous', label: 'Tous' },
        ],
      },
      {
        id: 'retards',
        label: 'Retards critiques',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'sla', label: 'SLA' },
          { id: 'interne', label: 'Interne' },
          { id: 'tous', label: 'Tous' },
        ],
      },
      {
        id: 'ressources',
        label: 'Ressources indisponibles',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'actuelles', label: 'Actuelles' },
          { id: 'a-venir', label: 'À venir' },
          { id: 'toutes', label: 'Toutes' },
        ],
      },
      {
        id: 'escalades',
        label: 'Escalades en cours',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'actives', label: 'Actives' },
          { id: 'resolues', label: 'Résolues' },
          { id: 'toutes', label: 'Toutes' },
        ],
      },
    ],
  },
  arbitrages: {
    id: 'arbitrages',
    label: 'Arbitrages & décisions',
    icon: Scale,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'decisions',
        label: 'Décisions validées',
        children: [
          { id: 'recentes', label: 'Récentes' },
          { id: 'par-type', label: 'Par type' },
          { id: 'toutes', label: 'Toutes' },
        ],
      },
      {
        id: 'en-attente',
        label: 'Arbitrages en attente',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'urgents', label: 'Urgents' },
          { id: 'normaux', label: 'Normaux' },
          { id: 'tous', label: 'Tous' },
        ],
      },
      {
        id: 'historique',
        label: 'Historique des décisions',
        children: [
          { id: 'recent', label: 'Récent' },
          { id: 'par-annee', label: 'Par année' },
          { id: 'tout', label: 'Tout' },
        ],
      },
    ],
  },
  instances: {
    id: 'instances',
    label: 'Instances de coordination',
    icon: Users,
    children: [
      {
        id: 'reunions',
        label: 'Réunions',
        children: [
          {
            id: 'dg',
            label: 'Réunions DG',
            badge: 0,
            badgeType: 'warning',
            children: [
              { id: 'programmees', label: 'Programmées' },
              { id: 'terminees', label: 'Terminées' },
              { id: 'toutes', label: 'Toutes' },
            ],
          },
          {
            id: 'moa-moe',
            label: 'Réunions MOA/MOE',
            badge: 0,
            badgeType: 'warning',
            children: [
              { id: 'programmees', label: 'Programmées' },
              { id: 'terminees', label: 'Terminées' },
              { id: 'toutes', label: 'Toutes' },
            ],
          },
          {
            id: 'transverses',
            label: 'Réunions transverses',
            badge: 0,
            badgeType: 'warning',
            children: [
              { id: 'programmees', label: 'Programmées' },
              { id: 'terminees', label: 'Terminées' },
              { id: 'toutes', label: 'Toutes' },
            ],
          },
        ],
      },
    ],
  },
  compliance: {
    id: 'compliance',
    label: 'Conformité & performance',
    icon: CheckCircle2,
    children: [
      {
        id: 'indicateurs',
        label: 'Indicateurs conformité',
        children: [
          { id: 'sla', label: 'SLA' },
          { id: 'contrats', label: 'Contrats' },
          { id: 'tous', label: 'Tous' },
        ],
      },
      {
        id: 'audit',
        label: 'Audit gouvernance',
        children: [
          { id: 'en-cours', label: 'En cours' },
          { id: 'termines', label: 'Terminés' },
          { id: 'tous', label: 'Tous' },
        ],
      },
      {
        id: 'engagements',
        label: 'Suivi des engagements',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'en-cours', label: 'En cours' },
          { id: 'respectes', label: 'Respectés' },
          { id: 'non-respectes', label: 'Non respectés' },
        ],
      },
    ],
  },
};

// Helper functions
export function findNavNodeById(
  mainCategory: GovernanceMainCategory,
  subCategory?: string,
  subSubCategory?: string
): NavNode | undefined {
  const mainNode = governanceNavigationConfig[mainCategory];
  if (!mainNode) return undefined;

  if (!subCategory) return mainNode;

  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;

  if (!subSubCategory) return subNode;

  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(
  mainCategory: GovernanceMainCategory
): NavNode[] {
  const mainNode = governanceNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(
  mainCategory: GovernanceMainCategory,
  subCategory: string
): NavNode[] {
  const mainNode = governanceNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

