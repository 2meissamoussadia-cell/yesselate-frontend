/**
 * Alias de routes pour compatibilité ascendante
 * Permet de normaliser les routes sans casser l'existant
 * 
 * @example
 * // "blocages" est automatiquement résolu vers "blocked"
 * normalizeRouteWithAliases('actions', 'blocages', 'dashboard')
 * // → { main: 'actions', sub: 'blocked', leaf: 'dashboard' }
 */

/**
 * Mapping des alias vers les routes normalisées (6 blocs métier)
 * Legacy overview/performance/actions → pilotage/chantiers/finance/...
 */
export const routeAliases: Record<string, string> = {
  // Legacy overview → pilotage (Tableau de bord DG)
  'overview::summary': 'pilotage::dashboard',
  'overview::kpis': 'pilotage::analytics',
  'overview::alerts': 'pilotage::alertes',
  'overview::alertes': 'pilotage::alertes',
  // Legacy performance → finance / pilotage
  'performance::validation': 'finance::validation-paiements',
  'performance::validations': 'finance::validation-paiements',
  'performance::budget': 'finance::budget',
  'performance::indicators': 'pilotage::analytics',
  // Legacy actions → chantiers
  'actions::blocages': 'chantiers::dossiers-bloques',
  'actions::blocked': 'chantiers::dossiers-bloques',
  'actions::inbox': 'chantiers::demandes',
  // Legacy risks/decisions/realtime → pilotage (alertes)
  'risks::critical': 'pilotage::alertes',
  'risks::blocages': 'chantiers::dossiers-bloques',
  'decisions::pending': 'pilotage::gouvernance',
  'realtime::alerts': 'pilotage::alertes',
  // Legacy administration → systeme
  'administration::': 'systeme::parametres',
};

/**
 * Normalise une route en résolvant les alias
 * 
 * @param main - Catégorie principale
 * @param sub - Sous-catégorie (optionnelle)
 * @param leaf - Feuille (optionnelle)
 * @returns Route normalisée
 */
export function normalizeRouteWithAliases(
  main: string,
  sub: string | null,
  leaf: string | null
): { main: string; sub: string | null; leaf: string | null } {
  // Construire la clé de route
  const routeKey = `${main}::${sub || ''}::${leaf || ''}`;
  
  // Chercher un alias exact (sans wildcard pour l'instant)
  const aliasKey = `${main}::${sub || ''}`;
  const target = routeAliases[aliasKey];
  
  if (target) {
    const [tMain, tSub] = target.split('::');
    // Pour les 6 blocs métier, chaque écran = main::sub::default
    return {
      main: tMain,
      sub: tSub || null,
      leaf: 'default',
    };
  }
  
  // Pas d'alias trouvé, retourner la route originale
  return { main, sub, leaf };
}

/**
 * Vérifie si une route utilise un alias déprécié
 */
export function isDeprecatedRoute(
  main: string,
  sub: string | null
): boolean {
  const aliasKey = `${main}::${sub || ''}`;
  return aliasKey in routeAliases;
}
