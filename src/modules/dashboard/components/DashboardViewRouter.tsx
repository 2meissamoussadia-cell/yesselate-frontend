/**
 * Routeur de vues du Dashboard avec chargement dynamique
 * Utilise la configuration JSON et charge les composants à la demande
 * 
 * @example
 * // Utilisation simple (lit automatiquement le contexte de navigation)
 * <DashboardViewRouter />
 */

'use client';

import { Suspense, useEffect, useState, useMemo, memo } from 'react';
import React from 'react';
import { loadComponent } from '../utils/loadComponent';
import { useDashboardNavigation } from '../context/DashboardNavigationContext';
import {
  getNavigationConfig,
  getRouteComponent,
  isValidRoute,
  getAvailableRoutes,
} from '../utils/routeValidation';
import { useLogger } from '@/lib/utils/logger';
import type { ComponentType } from 'react';
import { useTouchGestures } from '../hooks/useTouchGestures';

// ✅ Cache des composants chargés pour éviter les rechargements inutiles
const componentCache = new Map<string, ComponentType>();

// ✅ Set pour tracker les routes déjà loggées comme "non trouvées" (évite le spam de warnings)
const warnedRoutes = new Set<string>();

export const DashboardViewRouter = memo(function DashboardViewRouter() {
  // ✅ Initialiser le logger
  const log = useLogger('DashboardViewRouter');
  
  // ✅ Utiliser le hook directement - le guard est dans le contexte
  // Le contexte retourne déjà des valeurs par défaut en production si le provider est manquant
  const navigation = useDashboardNavigation();
  const { main, sub, leaf } = navigation;
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Touch gestures pour navigation mobile (swipe left/right)
  const containerRef = useTouchGestures(
    {
      onSwipeLeft: () => {
        // Navigation vers la prochaine catégorie (à implémenter selon la logique métier)
        log.debug('Swipe left détecté');
      },
      onSwipeRight: () => {
        // Navigation vers la catégorie précédente
        log.debug('Swipe right détecté');
      },
    },
    { enabled: true, preventDefault: false } // Ne pas bloquer le scroll
  );

  // ✅ Mémoriser currentRoute pour éviter les re-créations et optimiser les dépendances
  // Note: navigationConfig n'est plus nécessaire dans les dépendances car getNavigationConfig()
  // est appelé directement dans le useEffect et est stable (fonction pure)
  const currentRoute = useMemo(
    () => ({
      main,
      sub: sub || null,
      leaf: leaf || null,
      routeKey: `${main}|${sub || ''}|${leaf || ''}`,
    }),
    [main, sub, leaf]
  );

  useEffect(() => {
    let cancelled = false;
    
    // ✅ Extraire les valeurs de currentRoute une seule fois
    const { main: routeMain, sub: routeSub, leaf: routeLeaf } = currentRoute;
    
    async function resolve() {
      // Créer une clé unique pour cette route
      const routeKey = `${routeMain}|${routeSub || ''}|${routeLeaf || ''}`;
      
      // ✅ Log pour debug (uniquement en développement)
      log.debug('Résolution route', { 
        main: routeMain, 
        sub: routeSub, 
        leaf: routeLeaf, 
        routeKey 
      });
      
      // Vérifier le cache
      const cached = componentCache.get(routeKey);
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DashboardViewRouter] Composant trouvé dans le cache');
        }
        if (cancelled) return;
        setComponent(() => cached);
        setIsLoading(false);
        return;
      }

      if (cancelled) return;
      setIsLoading(true);
      setError(null);

      try {
        // ✅ Utiliser routeValidation pour résoudre le composant (centralisé)
        const componentName = getRouteComponent(routeMain, routeSub, routeLeaf);
        
        // ✅ Log pour debug (uniquement en développement)
        log.debug('Recherche composant', {
          main: routeMain,
          sub: routeSub,
          leaf: routeLeaf,
          componentName,
          isValid: isValidRoute(routeMain, routeSub, routeLeaf),
        });

        // Si toujours pas de componentName, utiliser fallback
        if (!componentName) {
          // Aucune route valide trouvée - afficher erreur
          const routeString = `${routeMain}/${routeSub || ''}/${routeLeaf || ''}`;
          
          // ✅ Ne logger un warning qu'une seule fois par route unique pour éviter le spam
          // Utiliser un Set statique pour tracker les routes déjà loggées
          if (!warnedRoutes.has(routeKey)) {
            warnedRoutes.add(routeKey);
            log.warn(`Route non trouvée: ${routeString}`, {
              main: routeMain,
              sub: routeSub,
              leaf: routeLeaf,
              routeKey,
            });
          }
          
          // ✅ Créer le composant d'erreur avec les valeurs de la route mémorisée
          const availableRoutes = getAvailableRoutes(routeMain);
          const leaves = routeSub ? availableRoutes.leaves[routeSub] || [] : [];
          
          const errorComponent = () => (
            <div className="p-4 sm:p-6 text-red-400 space-y-2 min-w-0 overflow-hidden">
              <p className="font-bold">Section inconnue ou non configurée.</p>
              <p className="text-sm text-red-300 break-words">
                Route demandée:{' '}
                <code className="bg-red-900/50 px-2 py-1 rounded break-all">
                  {routeMain}/{routeSub || ''}/{routeLeaf || ''}
                </code>
              </p>
              <p className="text-sm text-yellow-300 break-words">
                Routes disponibles pour{' '}
                <code className="bg-yellow-900/50 px-2 py-1 rounded break-all">
                  {routeMain}/{routeSub || 'N/A'}
                </code>
                :
              </p>
              <ul className="text-sm text-yellow-200 list-disc list-inside ml-4 break-words">
                {leaves.length > 0
                  ? leaves.map((key) => <li key={key} className="break-words">{key}</li>)
                  : <li>Aucune route disponible</li>}
              </ul>
            </div>
          );
          
          if (cancelled) return;
          setComponent(() => errorComponent);
          setIsLoading(false);
          return;
        }

        // Charger le composant dynamiquement
        log.debug('Chargement composant', { componentName });
        const Loaded = await loadComponent(componentName);
        
        // ✅ Vérifier si le composant n'a pas été annulé avant de mettre à jour
        if (cancelled) return;
        
        componentCache.set(routeKey, Loaded); // Mettre en cache
        log.debug('Composant chargé avec succès', { componentName, routeKey });
        setComponent(() => Loaded);
        setIsLoading(false);
      } catch (e) {
        if (cancelled) return;
        
        const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
        log.error('Router error', { error: e, errorMessage });
        setError(errorMessage);
        
        // ✅ Mémoriser le composant d'erreur
        const errorComponent = () => (
          <div className="p-4 sm:p-6 text-red-400 min-w-0 overflow-hidden break-words">
            Erreur de chargement du module: {errorMessage}
          </div>
        );
        setComponent(() => errorComponent);
        setIsLoading(false);
      }
    }

    resolve();
    
    // ✅ Cleanup pour annuler la résolution si les dépendances changent
    return () => {
      cancelled = true;
    };
  }, [currentRoute]); // ✅ Utiliser currentRoute mémorisé (navigationConfig est stable, pas besoin dans dépendances)

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 text-gray-400 flex items-center justify-center min-h-[200px] min-w-0">
        <div className="animate-pulse">Chargement…</div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="p-4 sm:p-6 text-yellow-400 min-w-0 overflow-hidden break-words">
        Aucun composant disponible pour cette route.
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-6 text-gray-400 flex items-center justify-center min-h-[200px] min-w-0">
          <div className="animate-pulse">Chargement…</div>
        </div>
      }
    >
      <Component />
    </Suspense>
  );
});

