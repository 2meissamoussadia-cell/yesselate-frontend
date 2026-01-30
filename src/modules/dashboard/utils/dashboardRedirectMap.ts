/**
 * Redirections dashboard → 6 blocs métier (maître-ouvrage)
 *
 * Anciennes URLs (overview, performance, actions, ...) sont redirigées côté client
 * vers les nouveaux blocs (pilotage, chantiers, finance, ...).
 * Utilisé par useDashboardCommandCenterUrlSync.
 */

const BASE = '/maitre-ouvrage';

/**
 * Retourne l'URL de redirection si (main, sub, leaf) correspond à une section
 * déplacée, sinon null.
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

  // Legacy overview → pilotage
  if (m === 'overview') {
    if (s === 'summary' && (l === 'cockpit' || l === 'cockpit-v2' || l === 'dashboard' || l === 'highlights')) return null; // même layout, pas de redirect URL
    if (s === 'kpis' && l === 'highlights') return null;
    if (s === 'alerts' || s === 'alertes') return null;
    return null; // rester sur maitre-ouvrage avec nav normalisée
  }

  // Legacy performance → finance / pilotage
  if (m === 'performance') {
    if (s === 'validation' || s === 'validations') return null;
    if (s === 'budget') return null;
    return null;
  }

  // Legacy actions → chantiers (demandes) / finance (validation)
  if (m === 'actions') return null;

  // Legacy risks, decisions, realtime → pilotage (alertes)
  if (m === 'risks' || m === 'risques' || m === 'decisions' || m === 'realtime') return null;

  // Legacy administration → systeme (parametres)
  if (m === 'administration' || m === 'admin') return null;

  return null;
}
