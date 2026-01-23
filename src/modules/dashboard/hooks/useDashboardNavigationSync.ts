'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';

export function useDashboardNavigationSync() {
  const params = useSearchParams();
  const router = useRouter();

  const { main, sub, leaf, setMain, setSub, setLeaf } =
    useDashboardNavigationStore();

  // ✅ Extraire et stabiliser les valeurs de l'URL avec useMemo
  const urlValues = useMemo(() => ({
    main: params.get('main') || 'overview',
    sub: params.get('sub'),
    leaf: params.get('leaf'),
  }), [params]);

  // Ref pour éviter les mises à jour simultanées
  const isUpdatingRef = useRef(false);
  const lastUrlRef = useRef<string>('');

  // URL → Store
  useEffect(() => {
    if (isUpdatingRef.current) return;

    // Créer une clé unique pour cette combinaison URL
    const urlKey = `${urlValues.main}|${urlValues.sub || ''}|${urlValues.leaf || ''}`;
    
    // Si l'URL n'a pas changé, ne rien faire
    if (lastUrlRef.current === urlKey) return;
    lastUrlRef.current = urlKey;

    const current = useDashboardNavigationStore.getState();

    // 🔒 Empêche la boucle infinie - comparaison stricte
    if (
      current.main === urlValues.main &&
      current.sub === urlValues.sub &&
      current.leaf === urlValues.leaf
    ) {
      return;
    }

    isUpdatingRef.current = true;
    try {
      setMain(urlValues.main);
      setSub(urlValues.sub);
      setLeaf(urlValues.leaf);
    } finally {
      // Utiliser un microtask pour réinitialiser le flag
      queueMicrotask(() => {
        isUpdatingRef.current = false;
      });
    }
  }, [urlValues.main, urlValues.sub, urlValues.leaf, setMain, setSub, setLeaf]);

  // Store → URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isUpdatingRef.current) return;

    const query = new URLSearchParams(window.location.search);

    const currentMain = query.get('main') || 'overview';
    const currentSub = query.get('sub');
    const currentLeaf = query.get('leaf');

    // 🔒 Empêche la boucle infinie - comparaison stricte
    if (
      currentMain === main &&
      currentSub === sub &&
      currentLeaf === leaf
    ) {
      return;
    }

    isUpdatingRef.current = true;
    try {
      query.set('main', main);
      if (sub) query.set('sub', sub);
      else query.delete('sub');

      if (leaf) query.set('leaf', leaf);
      else query.delete('leaf');

      const newUrl = `/maitre-ouvrage/dashboard?${query.toString()}`;
      
      // Éviter de réécrire si l'URL est identique
      if (window.location.pathname + window.location.search === newUrl) {
        return;
      }

      router.replace(newUrl, { scroll: false });
    } finally {
      // Utiliser un microtask pour réinitialiser le flag
      queueMicrotask(() => {
        isUpdatingRef.current = false;
      });
    }
  }, [main, sub, leaf, router]);
}

