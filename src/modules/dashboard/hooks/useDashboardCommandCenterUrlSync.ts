'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { isValidRoute, normalizeRoute } from '../utils/routeValidation';
import { useLogger } from '@/lib/utils/logger';

/**
 * Synchronise l'URL du dashboard avec `dashboardCommandCenterStore`.
 *
 * Objectifs:
 * - Deep-links: URL -> store (au chargement / back-forward)
 * - Navigation unifiée: store -> URL (quand un bouton appelle `navigate`)
 *
 * Note: on canonicalise systématiquement la route via `normalizeRoute`
 * (donc main seul => ajoute sub/leaf par défaut).
 */
export function useDashboardCommandCenterUrlSync() {
  const log = useLogger('useDashboardCommandCenterUrlSync');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const urlMain = params.get('main');
  const urlSub = params.get('sub');
  const urlLeaf = params.get('leaf');

  // ✅ Sélecteurs unitaires pour limiter les re-renders
  const main = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const isApplyingUrlToStoreRef = useRef(false);
  const lastPushedQueryRef = useRef<string>('');
  // Ne synchroniser URL -> Store que quand l'URL a vraiment changé (back/forward, lien).
  const lastUrlKeyRef = useRef<string>('');
  // Après un Store -> URL push, ne pas appliquer URL -> Store tout de suite (params encore stales).
  const justPushedRef = useRef(false);

  // 1) URL -> Store
  useEffect(() => {
    const urlKey = `${urlMain ?? ''}|${urlSub ?? ''}|${urlLeaf ?? ''}`;
    if (urlKey === lastUrlKeyRef.current) return;
    if (justPushedRef.current) return;
    // Ne pas réappliquer l’URL si le store vient d’être mis à jour par un clic (évite revert après remount).
    const lastNav = useDashboardCommandCenterStore.getState().lastNavigatedAt;
    if (lastNav && Date.now() - lastNav < 1500) return;
    lastUrlKeyRef.current = urlKey;

    const normalized = normalizeRoute(urlMain, urlSub, urlLeaf);
    const nextMain = normalized.main;
    const nextSub = normalized.sub;
    const nextLeaf = normalized.leaf;

    const sameAsStore =
      main === nextMain && (sub ?? null) === nextSub && (leaf ?? null) === nextLeaf;

    if (sameAsStore) return;

    isApplyingUrlToStoreRef.current = true;
    try {
      navigate(nextMain as any, nextSub, nextLeaf);
    } catch (e) {
      log.warn('Erreur URL -> store', {
        error: e instanceof Error ? e.message : String(e),
        nextMain,
        nextSub,
        nextLeaf,
      });
    } finally {
      queueMicrotask(() => {
        isApplyingUrlToStoreRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlMain, urlSub, urlLeaf]); // `navigate` est stable (Zustand)

  // 2) Store -> URL
  useEffect(() => {
    if (isApplyingUrlToStoreRef.current) return;
    if (!pathname) return;

    const normalized = normalizeRoute(main, sub, leaf);
    if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) return;

    const next = new URLSearchParams();
    next.set('main', normalized.main);
    if (normalized.sub) next.set('sub', normalized.sub);
    if (normalized.leaf) next.set('leaf', normalized.leaf);
    const nextQuery = next.toString();

    const current = new URLSearchParams();
    if (urlMain) current.set('main', urlMain);
    if (urlSub) current.set('sub', urlSub);
    if (urlLeaf) current.set('leaf', urlLeaf);
    const currentQuery = current.toString();

    if (nextQuery === currentQuery) return;
    if (nextQuery === lastPushedQueryRef.current) return;

    lastPushedQueryRef.current = nextQuery;
    justPushedRef.current = true;
    router.push(`${pathname}?${nextQuery}`);
    const t = setTimeout(() => {
      justPushedRef.current = false;
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main, sub, leaf, pathname, urlMain, urlSub, urlLeaf]); // router est stable (Next)
}

