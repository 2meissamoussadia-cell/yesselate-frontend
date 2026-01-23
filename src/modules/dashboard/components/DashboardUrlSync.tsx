/**
 * Composant pour synchroniser l'URL avec le store de navigation
 * ⚠️ DEPRECATED: Utilisez plutôt le hook useDashboardNavigationSync
 * Ce composant est conservé pour compatibilité mais utilise maintenant le hook en interne
 * 
 * Stratégie unidirectionnelle contrôlée : Store = source de vérité
 * URL est dérivée du store, et à l'initialisation on hydrate le store depuis l'URL une seule fois
 */

'use client';

import { useDashboardNavigationSync } from '../hooks/useDashboardNavigationSync';

/**
 * Composant invisible qui synchronise l'URL avec le store de navigation
 * 
 * ⚠️ NOTE: Ce composant utilise maintenant le hook useDashboardNavigationSync en interne
 * pour éviter la duplication de code. Le hook est la source de vérité.
 * 
 * Stratégie de synchronisation :
 * 1. Au montage : URL → Store (hydratation initiale, une seule fois)
 * 2. Ensuite : Store → URL (source de vérité = store)
 * 
 * Protections contre les boucles :
 * - Vérifie que les valeurs diffèrent avant de mettre à jour
 * - Utilise des refs pour éviter les mises à jour simultanées
 * - Un seul sens de synchronisation à la fois
 * - Validation des routes avant synchronisation
 * - Debounce pour éviter les mises à jour trop fréquentes
 */
export function DashboardUrlSync() {
  // ✅ Utiliser le hook optimisé au lieu de dupliquer la logique
  useDashboardNavigationSync();
  
  // Composant invisible
  return null;
}
