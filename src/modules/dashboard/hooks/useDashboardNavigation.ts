'use client';

import { useCallback, useMemo } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory as MainDashboardCategory } from '@/lib/stores/dashboardCommandCenterStore';

// Petit helper (labels lisibles même si NAV_MAP n'est pas dispo ici)
const pretty = (v?: string | null) =>
  (v ?? '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

// Note: le store expose `mainCategory`, `subCategory`, `subSubCategory`.
// Ici on normalise l'API en `main/sub/leaf` pour la compat.
export type { MainDashboardCategory };
export type SubDashboardCategory = string;

export function useDashboardNavigation() {
  const navigation = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const main = (navigation?.mainCategory ?? 'overview') as MainDashboardCategory;
  const sub = (navigation?.subCategory ?? undefined) as unknown as SubDashboardCategory | undefined;
  const leaf = (navigation?.subSubCategory ?? undefined) as string | undefined;

  const setMain = useCallback(
    (m: MainDashboardCategory) => navigate(m, null, null),
    [navigate]
  );

  const setSub = useCallback(
    (s: SubDashboardCategory) => navigate(main, s, null),
    [navigate, main]
  );

  const setLeaf = useCallback(
    (l: string) => navigate(main, sub ?? null, l),
    [navigate, main, sub]
  );

  const navigateTo = useCallback(
    (m: MainDashboardCategory, s?: SubDashboardCategory, l?: string) => navigate(m, s ?? null, l ?? null),
    [navigate]
  );

  const back = useCallback(() => {
    if (typeof window !== 'undefined') window.history.back();
  }, []);

  const canGoBack = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.history.length > 1;
  }, []);

  const getNavigationLabel = useCallback((key: string) => pretty(key), []);

  return {
    main,
    sub,
    leaf,
    setMain,
    setSub,
    setLeaf,
    navigate,
    back,
    canGoBack,
    getNavigationLabel,
  };
}

// Conserver l'export pour compat (si utilisé ailleurs)
export { useDashboardNavigationSync } from './useDashboardNavigationSync';

