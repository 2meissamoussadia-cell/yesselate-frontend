'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';
import { applyRedirect } from '../utils/navigationRedirects';

export function useDashboardNavigationSync() {
  const params = useSearchParams();
  const router = useRouter();

  const { main, sub, leaf, setMain, setSub, setLeaf } =
    useDashboardNavigationStore();

  // ✅ Extraire et stabiliser les valeurs de l'URL avec useMemo
  const urlValues = useMemo(() => {
    const mainParam = params.get('main') || 'overview';
    const subParam = params.get('sub');
    const leafParam = params.get('leaf');
    
    // ✅ Appliquer les redirections automatiques
    const redirected = applyRedirect(mainParam, subParam, leafParam);
    
    return {
      main: redirected.main,
      sub: redirected.sub,
      leaf: redirected.leaf,
      wasRedirected: redirected.redirected,
    };
  }, [params]);

  // Ref pour éviter les mises à jour simultanées
  const isUpdatingRef = useRef(false);
  const lastUrlRef = useRef<string>('');

  // URL → Store (avec redirections)
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
      // ✅ Si une redirection a été appliquée, mettre à jour l'URL
      if (urlValues.wasRedirected) {
        const query = new URLSearchParams();
        query.set('main', urlValues.main);
        if (urlValues.sub) query.set('sub', urlValues.sub);
        if (urlValues.leaf) query.set('leaf', urlValues.leaf);
        
        router.replace(`/maitre-ouvrage/dashboard?${query.toString()}`, { scroll: false });
      }
      
      setMain(urlValues.main);
      setSub(urlValues.sub);
      setLeaf(urlValues.leaf);
    } finally {
      // Utiliser un microtask pour réinitialiser le flag
      queueMicrotask(() => {
        isUpdatingRef.current = false;
      });
    }
  }, [urlValues.main, urlValues.sub, urlValues.leaf, urlValues.wasRedirected, setMain, setSub, setLeaf, router]);

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

