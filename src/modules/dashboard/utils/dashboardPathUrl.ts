/**
 * URL dashboard en segments de path (routing moderne #1)
 * Format : /maitre-ouvrage/dashboard/r/{main}/{sub}/{leaf}
 * Préfixe /r/ pour éviter conflit avec routes statiques (performance, performances, validation).
 * Remplace ?main=...&sub=...&leaf=... pour SEO, partage de liens, bookmarking.
 */

const DASHBOARD_PATH_BASE = '/maitre-ouvrage/dashboard/r';

/**
 * Parse le pathname pour extraire main, sub, leaf.
 * Ex. /maitre-ouvrage/dashboard/r/pilotage/dashboard/default → { main: 'pilotage', sub: 'dashboard', leaf: 'default' }
 * Retourne null si le pathname n'a pas le format path (on utilisera les query params).
 */
export function parseDashboardPath(pathname: string | null): {
  main: string;
  sub: string | null;
  leaf: string | null;
} | null {
  if (!pathname || !pathname.startsWith(DASHBOARD_PATH_BASE)) return null;
  const rest = pathname.slice(DASHBOARD_PATH_BASE.length).replace(/^\//, '');
  if (!rest) return null;
  const segments = rest.split('/').filter(Boolean);
  if (segments.length < 1) return null;
  const main = segments[0];
  const sub = segments.length >= 2 ? segments[1] : null;
  const leaf = segments.length >= 3 ? segments[2] : null;
  return { main, sub, leaf };
}

/**
 * Construit l'URL path pour une route dashboard.
 * Ex. buildDashboardPathUrl('pilotage', 'dashboard', 'default') → '/maitre-ouvrage/dashboard/r/pilotage/dashboard/default'
 */
export function buildDashboardPathUrl(
  main: string,
  sub: string | null,
  leaf: string | null
): string {
  const s = sub || 'default';
  const l = leaf || 'default';
  return `${DASHBOARD_PATH_BASE}/${main}/${s}/${l}`;
}

/**
 * Indique si le pathname utilise le format path (/dashboard/r/...).
 */
export function isDashboardPathUrl(pathname: string | null): boolean {
  if (!pathname || !pathname.startsWith(DASHBOARD_PATH_BASE)) return false;
  const rest = pathname.slice(DASHBOARD_PATH_BASE.length).replace(/^\//, '');
  return rest.length > 0;
}
