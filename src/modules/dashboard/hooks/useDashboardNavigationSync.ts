/**
 * Hook legacy conservé pour compat.
 *
 * ✅ Désormais la source de vérité est `dashboardCommandCenterStore`.
 * On délègue la synchronisation à `useDashboardCommandCenterUrlSync`.
 */

'use client';

import { useDashboardCommandCenterUrlSync } from './useDashboardCommandCenterUrlSync';

export function useDashboardNavigationSync() {
  return useDashboardCommandCenterUrlSync();
}

