/**
 * Hook personnalisé pour la navigation du dashboard avec URL
 * Combine le store de navigation et la navigation Next.js
 */

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores/navigationStore';
import { useCallback } from 'react';

/**
 * Hook pour naviguer dans le dashboard avec synchronisation URL
 * Met à jour à la fois le store et l'URL
 */
export function useDashboardNavigationWithUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setMain, setSub, setLeaf, navigate: storeNavigate } = useNavigationStore();

  /**
   * Naviguer vers une route spécifique
   * Met à jour le store et l'URL
   */
  const navigate = useCallback(
    (main: string, sub?: string | null, leaf?: string | null) => {
      // Mettre à jour le store
      storeNavigate(main, sub, leaf);

      // Mettre à jour l'URL
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
    [router, pathname, searchParams, storeNavigate]
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
    setMain,
    setSub,
    setLeaf,
  };
}

