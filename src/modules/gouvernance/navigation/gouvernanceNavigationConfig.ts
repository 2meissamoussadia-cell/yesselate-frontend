/**
 * Configuration de navigation pour le module Centre de Commande – Gouvernance
 * Structure hiérarchique complète avec routes, icônes et badges
 */

import type { GouvernanceDomain, GouvernanceSection } from '../types/gouvernanceTypes';

export type GouvernanceNavItem = {
  id: GouvernanceSection;
  label: string;
  icon?: string;
  route?: string;
  badgeKey?: string; // Clé pour récupérer le badge depuis les stats
  defaultView?: 'dashboard' | 'list' | 'matrix' | 'timeline';
  children?: GouvernanceNavItem[];
};

export type GouvernanceNavDomain = {
  id: GouvernanceDomain;
  label: string;
  icon: string;
  badgeKey?: string;
  defaultOpen?: boolean;
  items: GouvernanceNavItem[];
};

export const gouvernanceNavigation: GouvernanceNavDomain[] = [
  {
    id: 'strategic',
    label: 'Vue stratégique',
    icon: 'BarChart3',
    defaultOpen: true,
    items: [
      {
        id: 'executive-dashboard',
        label: 'Tableau de bord exécutif',
        route: '/maitre-ouvrage/dashboard/r/pilotage/gouvernance/default',
        defaultView: 'dashboard',
      },
      {
        id: 'tendances',
        label: 'Tendances mensuelles',
        route: '/maitre-ouvrage/governance/tendances',
        defaultView: 'dashboard',
      },
      {
        id: 'synthese-projets',
        label: 'Synthèse projets',
        route: '/maitre-ouvrage/governance/synthese/projets',
        defaultView: 'matrix',
      },
      {
        id: 'synthese-budget',
        label: 'Synthèse budget',
        route: '/maitre-ouvrage/governance/synthese/budget',
        defaultView: 'dashboard',
      },
      {
        id: 'synthese-jalons',
        label: 'Synthèse jalons',
        route: '/maitre-ouvrage/governance/synthese/jalons',
        defaultView: 'matrix',
      },
      {
        id: 'synthese-risques',
        label: 'Synthèse risques',
        route: '/maitre-ouvrage/governance/synthese/risques',
        defaultView: 'matrix',
      },
      {
        id: 'synthese-validations',
        label: 'Synthèse validations',
        route: '/maitre-ouvrage/governance/synthese/validations',
        defaultView: 'list',
      },
    ],
  },
  {
    id: 'attention',
    label: 'Points d\'attention',
    icon: 'AlertTriangle',
    badgeKey: 'points_attention_count',
    items: [
      {
        id: 'depassements-budget',
        label: 'Dépassements budgétaires',
        route: '/maitre-ouvrage/governance/attention/depassements-budget',
        defaultView: 'list',
        badgeKey: 'depassements_budget_count',
      },
      {
        id: 'retards-critiques',
        label: 'Retards critiques',
        route: '/maitre-ouvrage/governance/attention/retards-critiques',
        defaultView: 'list',
        badgeKey: 'retards_critiques_count',
      },
      {
        id: 'ressources-indispo',
        label: 'Ressources indisponibles',
        route: '/maitre-ouvrage/governance/attention/ressources-indispo',
        defaultView: 'list',
        badgeKey: 'ressources_indispo_count',
      },
      {
        id: 'escalades',
        label: 'Escalades en cours',
        route: '/maitre-ouvrage/governance/attention/escalades',
        defaultView: 'list',
        badgeKey: 'escalades_actives',
      },
    ],
  },
  {
    id: 'arbitrages',
    label: 'Arbitrages & décisions',
    icon: 'Scale',
    badgeKey: 'decisions_en_attente',
    items: [
      {
        id: 'decisions-validees',
        label: 'Décisions validées',
        route: '/maitre-ouvrage/governance/arbitrages/decisions-validees',
        defaultView: 'list',
      },
      {
        id: 'arbitrages-en-attente',
        label: 'Arbitrages en attente',
        route: '/maitre-ouvrage/governance/arbitrages/en-attente',
        defaultView: 'list',
        badgeKey: 'arbitrages_en_attente_count',
      },
      {
        id: 'historique-decisions',
        label: 'Historique des décisions',
        route: '/maitre-ouvrage/governance/arbitrages/historique',
        defaultView: 'timeline',
      },
    ],
  },
  {
    id: 'instances',
    label: 'Instances de coordination',
    icon: 'Users',
    items: [
      {
        id: 'reunions-dg',
        label: 'Réunions DG',
        route: '/maitre-ouvrage/governance/instances/reunions-dg',
        defaultView: 'timeline',
      },
      {
        id: 'reunions-moa-moe',
        label: 'Réunions MOA/MOE',
        route: '/maitre-ouvrage/governance/instances/reunions-moa-moe',
        defaultView: 'timeline',
      },
      {
        id: 'reunions-transverses',
        label: 'Réunions transverses',
        route: '/maitre-ouvrage/governance/instances/reunions-transverses',
        defaultView: 'timeline',
      },
    ],
  },
  {
    id: 'compliance',
    label: 'Conformité & performance',
    icon: 'CheckCircle2',
    items: [
      {
        id: 'indicateurs-conformite',
        label: 'Indicateurs conformité',
        route: '/maitre-ouvrage/governance/conformite/indicateurs',
        defaultView: 'matrix',
      },
      {
        id: 'audit-gouvernance',
        label: 'Audit gouvernance',
        route: '/maitre-ouvrage/governance/conformite/audit',
        defaultView: 'list',
      },
      {
        id: 'suivi-engagements',
        label: 'Suivi des engagements',
        route: '/maitre-ouvrage/governance/conformite/engagements',
        defaultView: 'dashboard',
      },
    ],
  },
];

// Helper pour trouver un domaine par ID
export function getDomainById(id: GouvernanceDomain): GouvernanceNavDomain | undefined {
  return gouvernanceNavigation.find(d => d.id === id);
}

// Helper pour trouver une section par ID
export function getSectionById(
  domainId: GouvernanceDomain,
  sectionId: GouvernanceSection
): GouvernanceNavItem | undefined {
  const domain = getDomainById(domainId);
  if (!domain) return undefined;

  function findSection(items: GouvernanceNavItem[]): GouvernanceNavItem | undefined {
    for (const item of items) {
      if (item.id === sectionId) return item;
      if (item.children) {
        const found = findSection(item.children);
        if (found) return found;
      }
    }
    return undefined;
  }

  return findSection(domain.items);
}

// Helper pour obtenir le badge count depuis les stats
export function getBadgeCount(
  badgeKey: string | undefined,
  stats: Record<string, number> | null
): number | null {
  if (!badgeKey || !stats) return null;
  return stats[badgeKey] ?? null;
}

