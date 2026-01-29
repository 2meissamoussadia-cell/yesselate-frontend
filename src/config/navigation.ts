/**
 * Configuration de navigation YESSALATE BMO
 * 7 sections, 60+ routes, 3 niveaux, badges temps réel
 */

import type { NavigationConfig } from '../types/navigation';

const base = '/maitre-ouvrage';

function b(path: string): string {
  return `${base}${path}`;
}

/** Sections et routes complètes (3 niveaux) */
export const navigationConfig: NavigationConfig = [
  // ─── 1. PILOTAGE ─────────────────────────────────────────────────────
  {
    id: 'pilotage',
    title: 'PILOTAGE',
    ariaLabel: 'Section Pilotage',
    items: [
      {
        id: 'dashboard',
        label: 'Tableau de bord',
        path: b('/dashboard'),
        icon: '📊',
        ariaLabel: 'Tableau de bord',
        children: [
          { id: 'dashboard-cockpit', label: 'Cockpit DG', path: b('/dashboard'), ariaLabel: 'Cockpit direction générale' },
          { id: 'dashboard-kpis', label: 'KPIs', path: b('/dashboard/kpis'), ariaLabel: 'Indicateurs clés' },
          { id: 'dashboard-rapports', label: 'Rapports', path: b('/dashboard/rapports'), ariaLabel: 'Rapports' },
        ],
      },
      {
        id: 'governance',
        label: 'Gouvernance',
        path: b('/governance'),
        icon: '🏛️',
        badge: { count: 7, variant: 'warning', live: true },
        ariaLabel: 'Gouvernance',
        children: [
          { id: 'governance-raci', label: 'RACI', path: b('/governance/raci'), ariaLabel: 'Matrice RACI' },
          { id: 'governance-alertes', label: 'Alertes', path: b('/governance/alertes'), badge: { count: 5, variant: 'urgent' }, ariaLabel: 'Alertes gouvernance' },
          { id: 'governance-decisions', label: 'Décisions', path: b('/governance/decisions'), ariaLabel: 'Décisions' },
          { id: 'governance-budget', label: 'Budget', path: b('/governance/budget'), ariaLabel: 'Budget' },
          { id: 'governance-risques', label: 'Risques', path: b('/governance/risques'), ariaLabel: 'Risques' },
          { id: 'governance-projets', label: 'Projets', path: b('/governance/projets'), ariaLabel: 'Projets' },
        ],
      },
      {
        id: 'calendrier',
        label: 'Calendrier',
        path: b('/calendrier'),
        icon: '📅',
        ariaLabel: 'Calendrier',
        children: [
          { id: 'calendrier-agenda', label: 'Agenda', path: b('/calendrier'), ariaLabel: 'Agenda' },
          { id: 'calendrier-planning', label: 'Planning', path: b('/calendrier/planning'), ariaLabel: 'Planning' },
        ],
      },
      {
        id: 'analytics',
        label: 'Analytics & Rapports',
        path: b('/analytics'),
        icon: '📈',
        ariaLabel: 'Analytics et rapports',
      },
      {
        id: 'alerts',
        label: 'Centre d\'alertes',
        path: b('/alerts'),
        icon: '🔔',
        badge: { count: 5, variant: 'urgent', live: true },
        ariaLabel: 'Centre d\'alertes',
      },
    ],
  },
  // ─── 2. EXÉCUTION ───────────────────────────────────────────────────
  {
    id: 'execution',
    title: 'EXÉCUTION',
    ariaLabel: 'Section Exécution',
    items: [
      {
        id: 'demandes',
        label: 'Demandes',
        path: b('/demandes'),
        icon: '📋',
        badge: { count: 14, variant: 'urgent', live: true },
        ariaLabel: 'Demandes',
      },
      {
        id: 'validation',
        label: 'Validation',
        path: b('/validation-bc'),
        icon: '✅',
        badge: { count: 21, variant: 'gray', live: true },
        ariaLabel: 'Validation',
        children: [
          { id: 'validation-bc', label: 'BC / Factures', path: b('/validation-bc'), badge: { count: 13 }, ariaLabel: 'Validation bons de commande et factures' },
          { id: 'validation-contrats', label: 'Contrats', path: b('/validation-contrats'), badge: { count: 3 }, ariaLabel: 'Validation contrats' },
          { id: 'validation-paiements', label: 'Paiements', path: b('/validation-paiements'), badge: { count: 5 }, ariaLabel: 'Validation paiements' },
        ],
      },
      {
        id: 'blocked',
        label: 'Dossiers bloqués',
        path: b('/blocked'),
        icon: '🚨',
        badge: { count: 4, variant: 'urgent', live: true },
        ariaLabel: 'Dossiers bloqués',
      },
      {
        id: 'substitution',
        label: 'Substitution',
        path: b('/substitution'),
        icon: '🔄',
        badge: { count: 4, variant: 'warning', live: true },
        ariaLabel: 'Substitution',
      },
      {
        id: 'arbitrages-vivants',
        label: 'Arbitrages & Goulots',
        path: b('/arbitrages-vivants'),
        icon: '⚖️',
        badge: { count: 3, variant: 'warning' },
        ariaLabel: 'Arbitrages et goulots',
      },
    ],
  },
  // ─── 3. PROJETS & CLIENTS ───────────────────────────────────────────
  {
    id: 'projets-clients',
    title: 'PROJETS & CLIENTS',
    ariaLabel: 'Section Projets et Clients',
    items: [
      {
        id: 'projets-en-cours',
        label: 'Projets en cours',
        path: b('/projets-en-cours'),
        icon: '🏗️',
        badge: { count: 8, variant: 'gray' },
        ariaLabel: 'Projets en cours',
        children: [
          { id: 'projets-en-cours-list', label: 'En cours', path: b('/projets-en-cours'), ariaLabel: 'Projets en cours' },
          { id: 'projets-archives', label: 'Archivés', path: b('/projets-en-cours/archives'), ariaLabel: 'Projets archivés' },
        ],
      },
      {
        id: 'clients',
        label: 'Clients',
        path: b('/clients'),
        icon: '👥',
        ariaLabel: 'Clients',
      },
      {
        id: 'tickets-clients',
        label: 'Tickets clients',
        path: b('/tickets-clients'),
        icon: '🎫',
        badge: { count: 0, variant: 'gray' },
        ariaLabel: 'Tickets clients',
      },
    ],
  },
  // ─── 4. FINANCE & CONTENTIEUX ────────────────────────────────────────
  {
    id: 'finance-contentieux',
    title: 'FINANCE & CONTENTIEUX',
    ariaLabel: 'Section Finance et Contentieux',
    items: [
      {
        id: 'finances',
        label: 'Gains et Pertes',
        path: b('/finances'),
        icon: '💰',
        ariaLabel: 'Gains et pertes',
      },
      {
        id: 'recouvrements',
        label: 'Recouvrements',
        path: b('/recouvrements'),
        icon: '📜',
        badge: { count: 4, variant: 'gray', live: true },
        ariaLabel: 'Recouvrements',
      },
      {
        id: 'litiges',
        label: 'Litiges',
        path: b('/litiges'),
        icon: '⚖️',
        badge: { count: 3, variant: 'gray' },
        ariaLabel: 'Litiges',
      },
      {
        id: 'tresorerie',
        label: 'Trésorerie',
        path: b('/finances/tresorerie'),
        icon: '🏦',
        ariaLabel: 'Trésorerie',
      },
    ],
  },
  // ─── 5. RH & RESSOURCES ─────────────────────────────────────────────
  {
    id: 'rh-ressources',
    title: 'RH & RESSOURCES',
    ariaLabel: 'Section RH et Ressources',
    items: [
      {
        id: 'employes',
        label: 'Employés & Agents',
        path: b('/employes'),
        icon: '👤',
        badge: { count: 8, variant: 'gray' },
        ariaLabel: 'Employés et agents',
        children: [
          { id: 'employes-liste', label: 'Liste', path: b('/employes'), ariaLabel: 'Liste des employés' },
          { id: 'employes-organigramme', label: 'Organigramme', path: b('/employes/organigramme'), ariaLabel: 'Organigramme' },
        ],
      },
      {
        id: 'missions',
        label: 'Missions',
        path: b('/missions'),
        icon: '🎯',
        badge: { count: 2, variant: 'warning' },
        ariaLabel: 'Missions',
      },
      {
        id: 'evaluations',
        label: 'Évaluations',
        path: b('/evaluations'),
        icon: '📊',
        badge: { count: 2, variant: 'info' },
        ariaLabel: 'Évaluations',
      },
      {
        id: 'demandes-rh',
        label: 'Demandes RH',
        path: b('/demandes-rh'),
        icon: '📝',
        badge: { count: 14, variant: 'warning', live: true },
        ariaLabel: 'Demandes ressources humaines',
      },
      {
        id: 'delegations',
        label: 'Délégations',
        path: b('/delegations'),
        icon: '🔑',
        ariaLabel: 'Délégations',
      },
      {
        id: 'organigramme',
        label: 'Organigramme',
        path: b('/organigramme'),
        icon: '📐',
        ariaLabel: 'Organigramme',
      },
    ],
  },
  // ─── 6. COMMUNICATION ───────────────────────────────────────────────
  {
    id: 'communication',
    title: 'COMMUNICATION',
    ariaLabel: 'Section Communication',
    items: [
      {
        id: 'echanges-structures',
        label: 'Échanges Structures',
        path: b('/echanges-structures'),
        icon: '🏛️',
        ariaLabel: 'Échanges entre structures',
      },
      {
        id: 'conferences',
        label: 'Conférences Décisionnelles',
        path: b('/conferences'),
        icon: '📹',
        ariaLabel: 'Conférences décisionnelles',
      },
      {
        id: 'messages-externes',
        label: 'Messages Externes',
        path: b('/messages-externes'),
        icon: '📨',
        ariaLabel: 'Messages externes',
      },
    ],
  },
  // ─── 7. SYSTÈME ─────────────────────────────────────────────────────
  {
    id: 'systeme',
    title: 'SYSTÈME',
    ariaLabel: 'Section Système',
    items: [
      {
        id: 'decisions',
        label: 'Registre Décisions',
        path: b('/decisions'),
        icon: '📋',
        ariaLabel: 'Registre des décisions',
        children: [
          { id: 'decisions-pending', label: 'En attente', path: b('/decisions'), ariaLabel: 'Décisions en attente' },
          { id: 'decisions-executed', label: 'Exécutées', path: b('/decisions/executed'), ariaLabel: 'Décisions exécutées' },
        ],
      },
      {
        id: 'audit',
        label: 'Audit & Conformité',
        path: b('/audit'),
        icon: '🔍',
        ariaLabel: 'Audit et conformité',
        children: [
          { id: 'audit-conformite', label: 'Conformité', path: b('/audit'), ariaLabel: 'Conformité' },
          { id: 'audit-traces', label: 'Traces', path: b('/audit/traces'), ariaLabel: 'Traces d\'audit' },
        ],
      },
      {
        id: 'logs',
        label: 'Journal des Actions',
        path: b('/logs'),
        icon: '📜',
        ariaLabel: 'Journal des actions',
        children: [
          { id: 'logs-activite', label: 'Activité', path: b('/logs'), ariaLabel: 'Journal d\'activité' },
          { id: 'logs-systeme', label: 'Système', path: b('/logs/systeme'), ariaLabel: 'Logs système' },
        ],
      },
      {
        id: 'system-logs',
        label: 'Logs Système',
        path: b('/system-logs'),
        icon: '🖥️',
        ariaLabel: 'Logs système',
      },
      {
        id: 'ia',
        label: 'IA & Assistants',
        path: b('/ia'),
        icon: '🤖',
        ariaLabel: 'Intelligence artificielle et assistants',
      },
      {
        id: 'parametres',
        label: 'Paramètres',
        path: b('/parametres'),
        icon: '⚙️',
        ariaLabel: 'Paramètres',
        children: [
          { id: 'parametres-profil', label: 'Profil', path: b('/parametres'), ariaLabel: 'Profil utilisateur' },
          { id: 'parametres-notifications', label: 'Notifications', path: b('/parametres/notifications'), ariaLabel: 'Notifications' },
          { id: 'parametres-securite', label: 'Sécurité', path: b('/parametres/securite'), ariaLabel: 'Sécurité' },
        ],
      },
    ],
  },
];

/** Compte total des routes (niveau 1 + 2 + 3) pour validation 60+ */
export function getTotalRouteCount(): number {
  let count = 0;
  for (const section of navigationConfig) {
    for (const item of section.items) {
      count += 1;
      if (item.children?.length) {
        for (const sub of item.children) {
          count += 1;
          if (sub.children?.length) count += sub.children.length;
          else if (sub.path) count += 0; // déjà compté comme 1
        }
      }
    }
  }
  return count;
}

/** Toutes les routes plates (path → id) pour highlight actif */
export const allPaths: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const section of navigationConfig) {
    for (const item of section.items) {
      out[item.path] = item.id;
      if (item.children) {
        for (const sub of item.children) {
          if (sub.path) out[sub.path] = sub.id;
          if (sub.children) {
            for (const leaf of sub.children) {
              out[leaf.path] = leaf.id;
            }
          }
        }
      }
    }
  }
  return out;
})();

/** Résoudre le comptage badge par id (override temps réel) */
export function resolveBadgeCount(
  itemId: string,
  badgeCounts?: Record<string, number>
): number | undefined {
  if (badgeCounts && itemId in badgeCounts) return badgeCounts[itemId];
  const section = navigationConfig.find((s) =>
    s.items.some((i) => i.id === itemId || i.children?.some((c) => c.id === itemId))
  );
  if (!section) return undefined;
  for (const item of section.items) {
    if (item.id === itemId && item.badge) return item.badge.count;
    for (const sub of item.children ?? []) {
      if (sub.id === itemId && sub.badge) return sub.badge.count;
    }
  }
  return undefined;
}
