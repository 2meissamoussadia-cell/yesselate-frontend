/**
 * Hook pour synchroniser l'URL avec le store de navigation Arbitrages-Vivants
 * Pattern cohérent avec useDashboardNavigationSync
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useArbitragesNavigationStore } from '@/lib/stores/arbitragesNavigationStore';

export function useArbitragesNavigationSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Lire depuis le store
  const main = useArbitragesNavigationStore((state) => state.main);
  const sub = useArbitragesNavigationStore((state) => state.sub);
  const subSub = useArbitragesNavigationStore((state) => state.subSub);
  const setNavigation = useArbitragesNavigationStore((state) => state.setNavigation);

  // Guards pour éviter les boucles infinies
  const isInitializedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const lastStoreStateRef = useRef<string>('');
  const lastUrlStateRef = useRef<string>('');

  // ✅ Hydratation initiale : URL → Store (une seule fois au montage)
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const urlMain = searchParams.get('main');
    const urlSub = searchParams.get('sub');
    const urlSubSub = searchParams.get('subSub');

    // Si l'URL contient des paramètres de navigation, les utiliser
    if (urlMain || urlSub || urlSubSub) {
      isUpdatingRef.current = true;
      setNavigation({
        main: (urlMain as any) || undefined,
        sub: urlSub || null,
        subSub: urlSubSub || null,
      });
      isUpdatingRef.current = false;
      isInitializedRef.current = true;
      return;
    }

    // Sinon, initialiser avec les valeurs du store
    isInitializedRef.current = true;
  }, [searchParams, setNavigation]);

  // ✅ Synchronisation continue : Store → URL (après initialisation)
  useEffect(() => {
    // Ne pas synchroniser pendant l'hydratation initiale
    if (!isInitializedRef.current || isUpdatingRef.current) return;

    // Créer la clé de l'état actuel du store
    const currentStoreState = `${main}|${sub || ''}|${subSub || ''}`;
    
    // Si l'état n'a pas changé, ne rien faire
    if (currentStoreState === lastStoreStateRef.current) return;

    // Créer les paramètres URL
    const params = new URLSearchParams(searchParams.toString());
    
    if (main) {
      params.set('main', main);
    } else {
      params.delete('main');
    }
    
    if (sub) {
      params.set('sub', sub);
    } else {
      params.delete('sub');
    }
    
    if (subSub) {
      params.set('subSub', subSub);
    } else {
      params.delete('subSub');
    }

    const newUrlState = params.toString();
    
    // Vérifier si l'URL a vraiment changé pour éviter les navigations inutiles
    if (newUrlState === lastUrlStateRef.current) return;

    // Mettre à jour les refs avant la navigation
    lastStoreStateRef.current = currentStoreState;
    lastUrlStateRef.current = newUrlState;

    // Mettre à jour l'URL sans recharger la page
    const newUrl = `${pathname}${newUrlState ? `?${newUrlState}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [main, sub, subSub, pathname, router, searchParams]);
}
