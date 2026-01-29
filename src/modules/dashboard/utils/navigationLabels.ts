/**
 * Résolution des labels de navigation (source unique : config TS, fallback JSON)
 * Utilisé par Breadcrumbs et tout affichage de libellé pour cohérence avec la Sidebar.
 */

import { findNavNodeById } from '../navigation/dashboardNavigationConfig';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';
import { getNavigationConfig } from './routeValidation';

const labelCache = new Map<string, string | null>();

function cacheKey(main: string, sub?: string | null, leaf?: string | null): string {
  return `${main}|${sub ?? ''}|${leaf ?? ''}`;
}

/**
 * Retourne le label d'un nœud depuis l'arbre dashboardNavigationConfig (TS).
 * Priorité : config TS (cohérence Sidebar), pas de traduction i18n ici (à faire au niveau composant si besoin).
 */
export function getNavigationLabelFromTree(
  main: string,
  sub?: string | null,
  leaf?: string | null
): string | null {
  const key = cacheKey(main, sub, leaf);
  if (labelCache.has(key)) return labelCache.get(key)!;

  const mainCat = main as DashboardMainCategory;
  const node = findNavNodeById(mainCat, sub ?? undefined, leaf ?? undefined);
  // label ou i18nKey (le composant appellera t() pour traduire)
  const value = node?.label ?? node?.i18nKey ?? null;
  labelCache.set(key, value);
  return value;
}

/**
 * Retourne les labels pour le fil d'Ariane : { mainLabel, subLabel?, leafLabel? }
 * Source prioritaire : config TS ; fallback : navigation.config.json
 */
export function getBreadcrumbLabels(
  main: string,
  sub: string | null,
  leaf: string | null
): { mainLabel: string; subLabel: string | null; leafLabel: string | null } {
  const json = getNavigationConfig();
  const mainConf = json[main];
  const formatFallback = (s: string) =>
    s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const mainLabel =
    getNavigationLabelFromTree(main) ??
    mainConf?.label ??
    formatFallback(main);
  const subLabel =
    (sub && getNavigationLabelFromTree(main, sub)) ??
    (sub && mainConf?.sub?.[sub]?.label) ??
    null;
  const leafLabel =
    (leaf && sub && getNavigationLabelFromTree(main, sub, leaf)) ??
    (leaf && sub && mainConf?.sub?.[sub]?.leaf?.[leaf]?.label) ??
    null;

  return { mainLabel, subLabel, leafLabel };
}
