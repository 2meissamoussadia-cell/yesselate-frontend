/**
 * Hook pour synchroniser l'URL avec le store de navigation
 * ✅ OPTIMISÉ : Stratégie unidirectionnelle contrôlée pour éviter les boucles
 * ✅ Amélioré avec validation des routes et meilleure gestion d'erreurs
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
 * - Validation des routes avant synchronisation
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';
import { normalizeRoute, isValidRoute } from '../utils/routeValidation';
import { useLogger } from '@/lib/utils/logger';

export function useDashboardNavigationSync() {
  const log = useLogger('useDashboardNavigationSync');
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Extraire les valeurs de params pour éviter les re-exécutions inutiles
  // params est un nouvel objet à chaque render, donc on extrait les valeurs
  const urlMain = params.get('main');
  const urlSub = params.get('sub');
  const urlLeaf = params.get('leaf');

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
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ 1. Hydratation initiale : URL → Store (une seule fois)
  useEffect(() => {
    // Ne faire l'hydratation qu'une seule fois
    if (isInitializedRef.current) return;

    const normalizedMain = urlMain || 'overview';

    // ✅ Normaliser la route depuis l'URL
    const normalized = normalizeRoute(normalizedMain, urlSub, urlLeaf);

    // ✅ Valider la route normalisée
    if (!isValidRoute(normalized.main, normalized.sub, normalized.leaf)) {
      log.warn('Route invalide dans l\'URL, utilisation de la route par défaut', {
        urlMain,
        urlSub,
        urlLeaf,
        normalized,
      });
      // Utiliser la route par défaut
      const defaultRoute = normalizeRoute('overview', null, null);
      normalized.main = defaultRoute.main;
      normalized.sub = defaultRoute.sub;
      normalized.leaf = defaultRoute.leaf;
    }

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

      try {
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
      } catch (error) {
        log.error('Erreur lors de l\'hydratation du store', error instanceof Error ? error : new Error(String(error)), {
          normalized,
        });
      } finally {
        // Réinitialiser le flag après un microtask
        queueMicrotask(() => {
          isUpdatingRef.current = false;
        });
      }
    }

    // Marquer comme initialisé après la première hydratation
    isInitializedRef.current = true;
    lastStoreStateRef.current = {
      main: normalized.main,
      sub: normalized.sub,
      leaf: normalized.leaf,
    };
    lastUrlStateRef.current = params.toString();
    // ✅ OPTIMISÉ: Utiliser les valeurs extraites de params et retirer les fonctions stables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlMain, urlSub, urlLeaf, main, sub, leaf, log]); // setMain, setSub, setLeaf sont stables (Zustand)

  // ✅ 2. Synchronisation continue : Store → URL (source de vérité = store)
  useEffect(() => {
    // Ne pas synchroniser pendant l'hydratation initiale
    if (!isInitializedRef.current || isUpdatingRef.current) return;

    // ✅ Valider la route avant de synchroniser
    if (!isValidRoute(main, sub, leaf)) {
      log.warn('Route invalide dans le store, normalisation avant synchronisation', {
        main,
        sub,
        leaf,
      });
      // Normaliser la route
      const normalized = normalizeRoute(main, sub, leaf);
      // Mettre à jour le store avec la route normalisée
      if (normalized.main !== main) setMain(normalized.main);
      if (normalized.sub !== (sub || null)) {
        if (normalized.sub) setSub(normalized.sub);
        else setSub(null);
      }
      if (normalized.leaf !== (leaf || null)) {
        if (normalized.leaf) setLeaf(normalized.leaf);
        else setLeaf(null);
      }
      return; // Ne pas synchroniser l'URL maintenant, attendre la prochaine mise à jour
    }

    // Vérifier si le store a changé
    const storeChanged =
      main !== lastStoreStateRef.current.main ||
      (sub || null) !== lastStoreStateRef.current.sub ||
      (leaf || null) !== lastStoreStateRef.current.leaf;

    if (!storeChanged) return;

    // Mettre à jour la référence AVANT de construire l'URL pour éviter les boucles
    lastStoreStateRef.current = { main, sub, leaf };

    // ✅ Nettoyer le timeout précédent s'il existe
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    // ✅ Debounce la synchronisation pour éviter les mises à jour trop fréquentes
    syncTimeoutRef.current = setTimeout(() => {
      try {
        // ✅ Construire la nouvelle URL
        const query = new URLSearchParams();
        query.set('main', main);
        if (sub) query.set('sub', sub);
        if (leaf) query.set('leaf', leaf);

        const newUrl = query.toString();
        const currentPath = pathname || '/maitre-ouvrage/dashboard';
        
        // ✅ Lire l'URL actuelle depuis params (sans la mettre dans les dépendances)
        // Utiliser une ref pour éviter les re-renders
        const currentUrlFromParams = params.toString();
        const currentUrl = `${currentPath}?${currentUrlFromParams}`;
        const newFullUrl = `${currentPath}?${newUrl}`;

        // ✅ Vérifier que l'URL est différente avant de naviguer
        // Double vérification : URL complète ET query string
        if (newFullUrl !== currentUrl && newUrl !== lastUrlStateRef.current) {
          lastUrlStateRef.current = newUrl;
          // ✅ Utiliser replace pour éviter d'ajouter une entrée dans l'historique
          router.replace(newFullUrl);
        }
      } catch (error) {
        log.error('Erreur lors de la synchronisation URL', error instanceof Error ? error : new Error(String(error)), {
          main,
          sub,
          leaf,
        });
      } finally {
        syncTimeoutRef.current = null;
      }
    }, 50); // Debounce de 50ms pour éviter les mises à jour trop fréquentes

    // ✅ Cleanup du timeout
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
    // ✅ OPTIMISÉ: params est utilisé uniquement pour toString() dans le corps,
    // mais on ne le met pas dans les dépendances pour éviter les re-renders
    // router et pathname sont stables (Next.js)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main, sub, leaf, router, pathname, log]);

  // Ce hook ne retourne rien (synchronisation automatique)
  return null;
}

