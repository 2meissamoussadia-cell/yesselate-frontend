/**
 * Convention de liens Dashboard → Modules BMO
 *
 * Centralise le mapping entre les signaux du pilotage et les pages/modules cibles.
 * Utilisé par PilotageHome, DashboardHome et tout composant qui doit lier vers un module.
 *
 * @see docs/dashboard/AUDIT_DASHBOARD_MODULES_INTERLIEN.md
 */

export type ModuleLinkTarget =
  | { type: 'route'; href: string }
  | { type: 'dashboard'; main: string; sub: string; leaf?: string };

export interface ModuleLink {
  id: string;
  label: string;
  description?: string;
  target: ModuleLinkTarget;
}

/** Chemins de base des modules (alignés sur bmoSitemap.json) */
const ROUTES = {
  dashboard: '/maitre-ouvrage/dashboard',
  alerts: '/maitre-ouvrage/alerts',
  governance: '/maitre-ouvrage/governance',
  calendrier: '/maitre-ouvrage/calendrier',
  preProjet: '/maitre-ouvrage/pre-projet',
  programmation: '/maitre-ouvrage/programmation',
  autorisations: '/maitre-ouvrage/autorisations',
  chantiers: '/maitre-ouvrage/chantiers',
  engagements: '/maitre-ouvrage/engagements',
  finances: '/maitre-ouvrage/finances',
  recouvrements: '/maitre-ouvrage/recouvrements',
  validationBc: '/maitre-ouvrage/validation-bc',
  validationPaiements: '/maitre-ouvrage/validation-paiements',
  conformite: '/maitre-ouvrage/conformite',
  blocked: '/maitre-ouvrage/blocked',
  demandesRh: '/maitre-ouvrage/demandes-rh',
  fournisseurs: '/maitre-ouvrage/fournisseurs',
  decisions: '/maitre-ouvrage/decisions',
  execution: '/maitre-ouvrage/execution',
  performance: '/maitre-ouvrage/performance',
  qualite: '/maitre-ouvrage/qualite',
  exploitationMaintenance: '/maitre-ouvrage/exploitation-maintenance',
} as const;

/**
 * Cartes d'accueil Pilotage (6 entrées principales)
 * Chaque carte mène vers le module ou la vue concernée.
 */
export const PILOTAGE_CARDS: ModuleLink[] = [
  {
    id: 'vue-dg',
    label: 'Vue DG',
    description: 'Synthèse exécutive, KPIs clés, santé portefeuille',
    target: { type: 'dashboard', main: 'pilotage', sub: 'dashboard', leaf: 'cockpit-detail' },
  },
  {
    id: 'tresorerie',
    label: 'Trésorerie & budget',
    description: 'Prévisionnel, créances, dettes, tensions',
    target: { type: 'route', href: ROUTES.engagements },
  },
  {
    id: 'risques',
    label: 'Risques & alertes',
    description: 'Risques délais/budget, alertes prédictives',
    target: { type: 'route', href: ROUTES.alerts },
  },
  {
    id: 'hse',
    label: 'HSE & conformité',
    description: 'Accidents, documents à renouveler, non-conformités',
    target: { type: 'route', href: ROUTES.conformite },
  },
  {
    id: 'chantiers',
    label: 'Portefeuille chantiers',
    description: 'Chantiers critiques, vue d\'ensemble, analyse',
    target: { type: 'route', href: ROUTES.chantiers },
  },
  {
    id: 'activite',
    label: 'Activité & décisions',
    description: 'Activité récente, décisions en attente',
    target: { type: 'route', href: ROUTES.governance },
  },
];

/**
 * Signaux de veille (pastilles cliquables)
 * Affichés sur la page d'accueil pour attirer l'attention.
 */
export const VEILLE_SIGNALS: Array<{
  id: string;
  label: string;
  target: ModuleLinkTarget;
  /** Couleur pour pastille : ok | warn | crit */
  tone?: 'ok' | 'warn' | 'crit';
}> = [
  { id: 'sante-portefeuille', label: 'Santé portefeuille', target: { type: 'route', href: ROUTES.chantiers }, tone: 'ok' },
  { id: 'alertes', label: 'Alertes', target: { type: 'route', href: ROUTES.alerts }, tone: 'warn' },
  { id: 'decisions', label: 'Décisions', target: { type: 'route', href: ROUTES.governance }, tone: 'warn' },
  { id: 'tresorerie', label: 'Trésorerie', target: { type: 'route', href: ROUTES.engagements }, tone: 'ok' },
];

/** Path canonique dashboard (routing moderne #1) */
const DASHBOARD_PATH_BASE = '/maitre-ouvrage/dashboard/r';

/**
 * Résout la cible d'un lien en href (pour Link ou router.push)
 * Utilise le format path moderne /r/main/sub/leaf pour SEO et partage.
 */
export function getModuleHref(target: ModuleLinkTarget): string {
  if (target.type === 'route') return target.href;
  const { main, sub, leaf } = target;
  const s = sub || 'default';
  const l = leaf || 'default';
  return `${DASHBOARD_PATH_BASE}/${main}/${s}/${l}`;
}

/**
 * Récupère le lien d'un module par id (bmoSitemap)
 */
export function getModulePath(moduleId: string): string | undefined {
  const routeMap: Record<string, string> = {
    cockpit: ROUTES.dashboard,
    alerts: ROUTES.alerts,
    governance: ROUTES.governance,
    'pre-projet': ROUTES.preProjet,
    programmation: ROUTES.programmation,
    autorisations: ROUTES.autorisations,
    chantiers: ROUTES.chantiers,
    engagements: ROUTES.engagements,
    finances: ROUTES.finances,
    recouvrements: ROUTES.recouvrements,
    conformite: ROUTES.conformite,
    blocked: ROUTES.blocked,
    'demandes-rh': ROUTES.demandesRh,
    fournisseurs: ROUTES.fournisseurs,
    'validation-bc': ROUTES.validationBc,
    'validation-paiements': ROUTES.validationPaiements,
    execution: ROUTES.execution,
    performance: ROUTES.performance,
    qualite: ROUTES.qualite,
    quality: ROUTES.qualite,
    'exploitation-maintenance': ROUTES.exploitationMaintenance,
  };
  return routeMap[moduleId];
}
