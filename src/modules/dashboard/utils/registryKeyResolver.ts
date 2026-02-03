/**
 * Résolution des clés de navigation (store) vers les clés du registry.
 * Le store utilise les 6 blocs métier (pilotage, chantiers, finance…),
 * le registry utilise overview/performance pour les vues avec loaders.
 * Ce mapping évite le contenu vide quand une entrée registry existe sous un autre nom.
 */

import { navToKey, type NavKey } from '../types/dashboard';

/** Alias store → registry (main::sub::leaf) pour les vues avec loaders */
const NAV_TO_REGISTRY_ALIAS: Record<string, string> = {
  'pilotage::dashboard::default': 'overview::summary::dashboard',
  'pilotage::dashboard::': 'overview::summary::dashboard',
  'pilotage::analytics::projets': 'overview::kpis::projets',
  'pilotage::analytics::demandes': 'overview::kpis::demandes',
  'pilotage::analytics::': 'overview::kpis::projets',
};

/**
 * Retourne la clé du registry à utiliser pour une NavKey donnée.
 * Si un alias existe (store → registry), le retourne ; sinon retourne navToKey(nav).
 */
export function getRegistryKey(nav: NavKey): string {
  const direct = navToKey(nav);
  const alias = NAV_TO_REGISTRY_ALIAS[direct];
  if (alias) return alias;
  const withoutLeaf = `${nav.main}::${nav.sub ?? ''}::`;
  const aliasNoLeaf = NAV_TO_REGISTRY_ALIAS[withoutLeaf];
  if (aliasNoLeaf) return aliasNoLeaf;
  return direct;
}
