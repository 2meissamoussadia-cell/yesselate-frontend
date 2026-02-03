'use client';

import { useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { isValidRoute, normalizeRoute, DEFAULT_DG_HOME } from '../utils/routeValidation';
import { getDashboardRedirectPath } from '../utils/dashboardRedirectMap';
import { parseDashboardPath, buildDashboardPathUrl, isDashboardPathUrl } from '../utils/dashboardPathUrl';
import { useLogger } from '@/lib/utils/logger';

/** Path canonique Cockpit DG (default DG home). */
export const DG_COCKPIT_PATH = '/dg/cockpit';

/** Path maître-ouvrage Cockpit (équivalent DG home). */
export const MAITRE_OUVRAGE_COCKPIT_PATH = '/maitre-ouvrage/cockpit';

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

  // Préférer les segments de path (routing moderne) aux query params
  const pathParsed = useMemo(() => parseDashboardPath(pathname), [pathname]);
  const urlMain = pathParsed ? pathParsed.main : params.get('main');
  const urlSub = pathParsed ? pathParsed.sub : params.get('sub');
  const urlLeaf = pathParsed ? pathParsed.leaf : params.get('leaf');

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

  // 0) Redirection dashboard → modules (anciennes URLs déplacées)
  useEffect(() => {
    if (!pathname?.includes('dashboard')) return;
    const target = getDashboardRedirectPath(urlMain, urlSub, urlLeaf);
    if (!target) return;
    log.debug('Redirection dashboard → module', { from: { urlMain, urlSub, urlLeaf }, to: target });
    router.replace(target);
  }, [pathname, urlMain, urlSub, urlLeaf, router, log]);

  // 0b) Canoniser URL query → path : /maitre-ouvrage/dashboard?main=... → /maitre-ouvrage/dashboard/r/main/sub/leaf
  useEffect(() => {
    if (pathname !== '/maitre-ouvrage/dashboard') return;
    if (!urlMain || isDashboardPathUrl(pathname)) return;
    const normalized = normalizeRoute(urlMain, urlSub, urlLeaf);
    if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) return;
    const pathUrl = buildDashboardPathUrl(normalized.main, normalized.sub, normalized.leaf);
    log.debug('Canonisation URL query → path', { from: pathname, to: pathUrl });
    router.replace(pathUrl);
  }, [pathname, urlMain, urlSub, urlLeaf, router, log]);

  // 1) URL -> Store (incl. /dg/cockpit et /maitre-ouvrage/cockpit → DEFAULT_DG_HOME)
  useEffect(() => {
    const isCockpitPath =
      pathname === DG_COCKPIT_PATH || pathname === MAITRE_OUVRAGE_COCKPIT_PATH;

    if (isCockpitPath) {
      const sameAsStore =
        main === DEFAULT_DG_HOME.main &&
        (sub ?? null) === DEFAULT_DG_HOME.sub &&
        (leaf ?? null) === DEFAULT_DG_HOME.leaf;
      if (!sameAsStore) {
        isApplyingUrlToStoreRef.current = true;
        try {
          navigate(
            DEFAULT_DG_HOME.main as any,
            DEFAULT_DG_HOME.sub,
            DEFAULT_DG_HOME.leaf
          );
        } finally {
          queueMicrotask(() => {
            isApplyingUrlToStoreRef.current = false;
          });
        }
      }
      lastUrlKeyRef.current = `${DEFAULT_DG_HOME.main}|${DEFAULT_DG_HOME.sub ?? ''}|${DEFAULT_DG_HOME.leaf ?? ''}`;
      return;
    }

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
  }, [pathname, urlMain, urlSub, urlLeaf]); // `navigate` est stable (Zustand)

  // 2) Store -> URL : path moderne (/maitre-ouvrage/dashboard/main/sub/leaf) ou query en fallback
  useEffect(() => {
    if (isApplyingUrlToStoreRef.current) return;
    if (!pathname) return;

    const normalized = normalizeRoute(main, sub, leaf);
    if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) return;

    const nextPathUrl = buildDashboardPathUrl(normalized.main, normalized.sub, normalized.leaf);
    const currentPathUrl = isDashboardPathUrl(pathname)
      ? pathname
      : `${pathname}?main=${urlMain ?? ''}&sub=${urlSub ?? ''}&leaf=${urlLeaf ?? ''}`;

    if (nextPathUrl === currentPathUrl) return;
    if (nextPathUrl === lastPushedQueryRef.current) return;

    lastPushedQueryRef.current = nextPathUrl;
    justPushedRef.current = true;
    router.push(nextPathUrl);
    const t = setTimeout(() => {
      justPushedRef.current = false;
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main, sub, leaf, pathname, urlMain, urlSub, urlLeaf]); // router est stable (Next)
}

