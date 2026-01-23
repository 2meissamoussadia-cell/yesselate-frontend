/**
 * Composant pour synchroniser l'URL avec le store de navigation
 * Stratégie unidirectionnelle contrôlée : Store = source de vérité
 * URL est dérivée du store, et à l'initialisation on hydrate le store depuis l'URL une seule fois
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';
import { normalizeRoute, isValidRoute } from '../utils/routeValidation';

/**
 * Composant invisible qui synchronise l'URL avec le store de navigation
 * 
 * Stratégie de synchronisation :
 * 1. Au montage : URL → Store (hydratation initiale, une seule fois)
 * 2. Ensuite : Store → URL (source de vérité = store)
 * 
 * Protections contre les boucles :
 * - Vérifie que les valeurs diffèrent avant de mettre à jour
 * - Utilise des refs pour éviter les mises à jour simultanées
 * - Un seul sens de synchronisation à la fois
 */
export function DashboardUrlSync() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Lire le store avec des sélecteurs individuels
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

  // ✅ 1. Hydratation initiale : URL → Store (une seule fois au montage)
  useEffect(() => {
    // Ne faire l'hydratation qu'une seule fois
    if (isInitializedRef.current) return;

    const urlMain = params.get('main') || 'overview';
    const urlSub = params.get('sub');
    const urlLeaf = params.get('leaf');

    // ✅ Normaliser et valider la route depuis l'URL
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
    lastStoreStateRef.current = { main: normalized.main, sub: normalized.sub, leaf: normalized.leaf };
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
    const urlMain = params.get('main') || 'overview';
    const urlSub = params.get('sub');
    const urlLeaf = params.get('leaf');

    // ✅ Vérifier si l'URL doit être mise à jour
    const needsUrlUpdate =
      main !== urlMain ||
      (sub || null) !== (urlSub || null) ||
      (leaf || null) !== (urlLeaf || null);

    if (!needsUrlUpdate) return;

    // ✅ Construire la nouvelle URL
    const query = new URLSearchParams();
    query.set('main', main);
    if (sub) query.set('sub', sub);
    if (leaf) query.set('leaf', leaf);

    // ✅ Utiliser replace pour éviter d'ajouter une entrée dans l'historique
    const currentPath = pathname || '/maitre-ouvrage/dashboard';
    const newUrl = `${currentPath}?${query.toString()}`;

    // Vérifier que l'URL est différente avant de naviguer
    const currentUrl = `${currentPath}?${params.toString()}`;
    if (newUrl !== currentUrl) {
      router.replace(newUrl);
    }
  }, [main, sub, leaf, router, pathname, params]);

  // Composant invisible
  return null;
}
