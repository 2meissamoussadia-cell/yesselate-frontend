/**
 * Hook personnalisé pour la navigation du dashboard.
 * ✅ navigate() met à jour uniquement le store ; l'URL est synchronisée par useDashboardCommandCenterUrlSync.
 */

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

/**
 * Hook pour naviguer dans le dashboard.
 * navigate() met à jour le store uniquement ; navigateToUrl() pousse l'URL sans store (cas rare).
 */
export function useDashboardNavigationWithUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigateStore = useDashboardCommandCenterStore((s) => s.navigate);

  /**
   * Naviguer : met à jour le store uniquement (URL via useDashboardCommandCenterUrlSync).
   */
  const navigate = useCallback(
    (main: string, sub?: string | null, leaf?: string | null) => {
      navigateStore(main as any, sub ?? null, leaf ?? null);
      // URL mise à jour par useDashboardCommandCenterUrlSync (évite double push)
    },
    [navigateStore]
  );

  /**
   * Naviguer vers une route spécifique sans mettre à jour le store
   * Utile pour les liens externes ou la navigation programmatique
   */
  const navigateToUrl = useCallback(
    (main: string, sub?: string | null, leaf?: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('main', main);
      if (sub) {
        params.set('sub', sub);
      } else {
        params.delete('sub');
      }
      if (leaf) {
        params.set('leaf', leaf);
      } else {
        params.delete('leaf');
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return {
    navigate,
    navigateToUrl,
  };
}

