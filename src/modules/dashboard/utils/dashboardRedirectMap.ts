/**
 * Redirections dashboard → modules maître-ouvrage
 *
 * Lorsqu'une section du dashboard a été déplacée vers un module dédié,
 * les anciennes URLs (?main=...&sub=...&leaf=...) sont redirigées côté client
 * vers la route du module. Utilisé par useDashboardCommandCenterUrlSync.
 */

const BASE = '/maitre-ouvrage';

/**
 * Retourne l'URL de redirection si (main, sub, leaf) correspond à une section
 * déplacée vers un module, sinon null.
 */
export function getDashboardRedirectPath(
  main: string | null,
  sub: string | null,
  leaf: string | null
): string | null {
  if (!main) return null;

  const m = main.toLowerCase();
  const s = (sub ?? '').toLowerCase();
  const l = (leaf ?? '').toLowerCase();

  // Overview > Alertes → Centre d'alertes
  if (m === 'overview' && (s === 'alerts' || s === 'alertes')) return `${BASE}/alerts`;

  // Performance > Validations → Validation BC
  if (m === 'performance' && (s === 'validation' || s === 'validations')) return `${BASE}/validation-bc`;

  // Performance > Retards → Alertes > Projets > Retards
  if (m === 'performance' && (s === 'delays' || s === 'retards')) return `${BASE}/alerts/projets/retards`;

  // Performance > Budget → Finances
  if (m === 'performance' && (s === 'budget')) return `${BASE}/finances`;

  // Performance > Comparaison / Bureaux → Gouvernance
  if (m === 'performance' && (s === 'comparison' || s === 'bureaux')) return `${BASE}/governance`;

  // Performance > Tendances → Gouvernance > Tendances
  if (m === 'performance' && s === 'trends') return `${BASE}/governance/tendances`;

  // Actions > Bloquées → Arbitrages vivants
  if (m === 'actions' && (s === 'blocked' || s === 'blocages')) return `${BASE}/arbitrages-vivants`;

  // Actions > Par type → modules de validation
  if (m === 'actions' && s === 'type') {
    if (l === 'contrats') return `${BASE}/validation-contrats`;
    if (l === 'paiements') return `${BASE}/validation-paiements`;
    if (l === 'bc') return `${BASE}/validation-bc`;
    return `${BASE}/demandes`;
  }

  // Actions (inbox, assigned, history, priority) → Demandes
  if (m === 'actions' && ['inbox', 'assigned', 'history', 'priority'].includes(s)) {
    return `${BASE}/demandes`;
  }

  // Risques → Centre d'alertes
  if (m === 'risks' || m === 'risques') return `${BASE}/alerts`;

  // Décisions → Module Décisions
  if (m === 'decisions') return `${BASE}/decisions`;

  // Temps réel → Centre d'alertes
  if (m === 'realtime') return `${BASE}/alerts`;

  // Administration
  if (m === 'administration' || m === 'admin') {
    if (s === 'logs' || s === 'journal') return `${BASE}/logs`;
    if (s === 'system' || s === 'systeme') return `${BASE}/system-logs`;
    return `${BASE}/parametres`;
  }

  // Sections retirées de la nav dashboard (plus de contenu interne) : rediriger toute la section
  if (m === 'actions') return `${BASE}/demandes`;
  if (m === 'risks' || m === 'risques') return `${BASE}/alerts`;
  if (m === 'decisions') return `${BASE}/decisions`;
  if (m === 'realtime') return `${BASE}/alerts`;
  if (m === 'administration') return `${BASE}/parametres`;

  return null;
}
