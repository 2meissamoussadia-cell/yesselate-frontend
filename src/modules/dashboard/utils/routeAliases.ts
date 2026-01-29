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
 * Mapping des alias vers les routes normalisées
 * Format: "main::sub::leaf" → "main::sub::leaf"
 */
export const routeAliases: Record<string, string> = {
  // Normaliser "blocages" vers "blocked"
  'actions::blocages': 'actions::blocked',
  'risks::blocages': 'risks::blocked',
  
  // Normaliser "validation" (singulier) vers "validations" (pluriel)
  'performance::validation': 'performance::validations',
  // Alias "retards" (label) vers "delays" (id technique)
  'performance::retards': 'performance::delays',
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
    return {
      main: tMain,
      sub: tSub || null,
      leaf: leaf, // Conserver la feuille
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
