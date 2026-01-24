/**
 * Composant pour synchroniser l'URL avec la navigation du dashboard.
 *
 * Objectif: éviter le "ça ne réagit pas" quand la navigation est splittée.
 * Source de vérité: `dashboardCommandCenterStore`
 * - URL -> store (deep-link / back-forward)
 * - store -> URL (navigation interne)
 */

'use client';

import { useDashboardCommandCenterUrlSync } from '../hooks/useDashboardCommandCenterUrlSync';

/**
 * Composant invisible qui synchronise l'URL avec le store de navigation
 */
export function DashboardUrlSync() {
  useDashboardCommandCenterUrlSync();
  
  // Composant invisible
  return null;
}
