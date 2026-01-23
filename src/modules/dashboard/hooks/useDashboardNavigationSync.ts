/**
 * Hook pour synchroniser l'URL avec le store de navigation
 * ✅ OPTIMISÉ : Stratégie unidirectionnelle contrôlée pour éviter les boucles
 * 
 * Stratégie :
 * - Store = source de vérité
 * - URL → Store : uniquement à l'initialisation (hydratation)
 * - Store → URL : synchronisation continue mais contrôlée
 * 
 * Protections :
 * - Refs pour éviter les mises à jour simultanées
 * - Vérifications avant chaque mise à jour
 * - Un seul sens de synchronisation à la fois
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';
import { normalizeRoute } from '../utils/routeValidation';

export function useDashboardNavigationSync() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Utiliser des sélecteurs individuels pour éviter les re-renders
  const main = useDashboardNavigationStore((state) => state.main);
  const sub = useDashboardNavigationStore((state) => state.sub);
  const leaf = useDashboardNavigationStore((state) => state.leaf);
  const setMain = useDashboardNavigationStore((state) => state.setMain);
  const setSub = useDashboardNavigationStore((state) => state.setSub);
  const setLeaf = useDashboardNavigationStore((state) => state.setLeaf);

  // ✅ Refs pour éviter les boucles
  const isInitializedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const lastStoreStateRef = useRef({ main, sub, leaf });
  const lastUrlStateRef = useRef<string>('');

  // ✅ 1. Hydratation initiale : URL → Store (une seule fois)
  useEffect(() => {
    // Ne faire l'hydratation qu'une seule fois
    if (isInitializedRef.current) return;

    const urlMain = params.get('main') || 'overview';
    const urlSub = params.get('sub');
    const urlLeaf = params.get('leaf');

    // ✅ Normaliser la route depuis l'URL
    const normalized = normalizeRoute(urlMain, urlSub, urlLeaf);

    // ✅ Vérifier si la route normalisée diffère du store actuel
    const storeMain = main;
    const storeSub = sub;
    const storeLeaf = leaf;

    const needsUpdate =
      normalized.main !== storeMain ||
      normalized.sub !== (storeSub || null) ||
      normalized.leaf !== (storeLeaf || null);

    if (needsUpdate && !isUpdatingRef.current) {
      isUpdatingRef.current = true;

      // Mettre à jour le store avec la route normalisée
      setMain(normalized.main);
      if (normalized.sub) {
        setSub(normalized.sub);
      } else {
        setSub(null);
      }
      if (normalized.leaf) {
        setLeaf(normalized.leaf);
      } else {
        setLeaf(null);
      }

      // Réinitialiser le flag après un microtask
      queueMicrotask(() => {
        isUpdatingRef.current = false;
      });
    }

    // Marquer comme initialisé après la première hydratation
    isInitializedRef.current = true;
    lastStoreStateRef.current = {
      main: normalized.main,
      sub: normalized.sub,
      leaf: normalized.leaf,
    };
    lastUrlStateRef.current = params.toString();
  }, [params, main, sub, leaf, setMain, setSub, setLeaf]);

  // ✅ 2. Synchronisation continue : Store → URL (source de vérité = store)
  useEffect(() => {
    // Ne pas synchroniser pendant l'hydratation initiale
    if (!isInitializedRef.current || isUpdatingRef.current) return;

    // Vérifier si le store a changé
    const storeChanged =
      main !== lastStoreStateRef.current.main ||
      (sub || null) !== lastStoreStateRef.current.sub ||
      (leaf || null) !== lastStoreStateRef.current.leaf;

    if (!storeChanged) return;

    // Mettre à jour la référence
    lastStoreStateRef.current = { main, sub, leaf };

    // Lire l'URL actuelle
    const currentUrl = params.toString();

    // ✅ Construire la nouvelle URL
    const query = new URLSearchParams();
    query.set('main', main);
    if (sub) query.set('sub', sub);
    if (leaf) query.set('leaf', leaf);

    const newUrl = query.toString();

    // ✅ Vérifier que l'URL est différente avant de naviguer
    if (newUrl !== currentUrl && newUrl !== lastUrlStateRef.current) {
      lastUrlStateRef.current = newUrl;
      const currentPath = pathname || '/maitre-ouvrage/dashboard';
      router.replace(`${currentPath}?${newUrl}`);
    }
  }, [main, sub, leaf, router, pathname, params]);

  // Ce hook ne retourne rien (synchronisation automatique)
  return null;
}

