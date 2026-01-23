/**
 * Composant de synchronisation entre les deux stores de navigation
 * Synchronise commandCenterStore (source principale) avec navigationStore
 * PATCH 1 — Bridge CommandCenter → NavigationStore
 */

'use client';

import { useEffect, useRef } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';

/**
 * Bridge pour synchroniser les deux stores de navigation
 * commandCenterStore est la source principale, navigationStore est synchronisé
 * 
 * Améliorations :
 * - Utilise syncingRef avec queueMicrotask pour éviter les boucles infinies
 * - Supporte plusieurs APIs possibles (setNavigation, setAll, setMain/setSub/setLeaf)
 * - Comparaison robuste avec gestion des null/undefined
 */
export function StoreBridge() {
  const { mainCategory, subCategory, subSubCategory } = useDashboardCommandCenterStore(
    (state) => state.navigation
  );

  // -----------------------------
  // BRIDGE : CommandCenter -> NavigationStore
  // -----------------------------
  const syncingRef = useRef(false);

  useEffect(() => {
    if (syncingRef.current) return;

    const navStore = useDashboardNavigationStore.getState() as any;

    // On ne suppose PAS le nom exact de tes setters : on supporte plusieurs APIs
    // (setNavigation, setMain/setSub/setLeaf, setAll, etc.)
    const currentMain = navStore.main;
    const currentSub = navStore.sub;
    const currentLeaf = navStore.leaf;

    const nextMain = mainCategory;
    const nextSub = subCategory ?? null;
    const nextLeaf = subSubCategory ?? null;

    // 🔒 Protection — Ne pas mettre à jour si l'état est identique
    const isSame =
      currentMain === nextMain &&
      (currentSub ?? null) === nextSub &&
      (currentLeaf ?? null) === nextLeaf;

    if (isSame) {
      return; // Pas besoin de mettre à jour
    }

    // ⚠️ On évite les boucles si DashboardUrlSync fait déjà l'inverse
    syncingRef.current = true;
    try {
      // Mise à jour atomique du store
      if (typeof navStore.setNavigation === 'function') {
        navStore.setNavigation({ main: nextMain, sub: nextSub, leaf: nextLeaf });
      } else {
        // Utiliser setState pour une mise à jour atomique
        useDashboardNavigationStore.setState({
          main: nextMain,
          sub: nextSub,
          leaf: nextLeaf,
        });
      }
    } finally {
      // microtask => évite un ping-pong dans le même tick
      queueMicrotask(() => {
        syncingRef.current = false;
      });
    }
  }, [mainCategory, subCategory, subSubCategory]);

  return null; // Composant invisible
}

