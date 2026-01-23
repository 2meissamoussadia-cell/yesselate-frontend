/**
 * Routeur de vues du Dashboard avec chargement dynamique
 * Utilise la configuration JSON et charge les composants à la demande
 * 
 * @example
 * // Utilisation simple (lit automatiquement le contexte de navigation)
 * <DashboardViewRouter />
 */

'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { loadComponent } from '../utils/loadComponent';
import { useDashboardNavigation } from '../context/DashboardNavigationContext';
import {
  getNavigationConfig,
  getRouteComponent,
  isValidRoute,
  getAvailableRoutes,
} from '../utils/routeValidation';
import type { ComponentType } from 'react';

// ✅ Cache des composants chargés pour éviter les rechargements inutiles
const componentCache = new Map<string, ComponentType>();

export function DashboardViewRouter() {
  // ✅ Utiliser le hook directement - le guard est dans le contexte
  // Le contexte retourne déjà des valeurs par défaut en production si le provider est manquant
  const navigation = useDashboardNavigation();
  const { main, sub, leaf } = navigation;
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Mémoriser navigationConfig pour éviter les re-créations à chaque render
  // Utiliser routeValidation.getNavigationConfig() pour centraliser la logique
  const navigationConfig = useMemo(() => getNavigationConfig(), []);

  // ✅ Mémoriser currentRoute pour éviter les re-créations et optimiser les dépendances
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
      if (process.env.NODE_ENV === 'development') {
        console.log('[DashboardViewRouter] Résolution route:', { 
          main: routeMain, 
          sub: routeSub, 
          leaf: routeLeaf, 
          routeKey 
        });
      }
      
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
        if (process.env.NODE_ENV === 'development') {
          console.log('[DashboardViewRouter] Recherche composant:', {
            main: routeMain,
            sub: routeSub,
            leaf: routeLeaf,
            componentName,
            isValid: isValidRoute(routeMain, routeSub, routeLeaf),
          });
        }

        // Si toujours pas de componentName, utiliser fallback
        if (!componentName) {
          // Aucune route valide trouvée - afficher erreur
          if (process.env.NODE_ENV === 'development') {
            console.warn('[DashboardViewRouter] Route non trouvée:', {
              main: routeMain,
              sub: routeSub,
              leaf: routeLeaf,
            });
          }
          
          // ✅ Créer le composant d'erreur avec les valeurs de la route mémorisée
          const availableRoutes = getAvailableRoutes(routeMain);
          const leaves = routeSub ? availableRoutes.leaves[routeSub] || [] : [];
          
          const errorComponent = () => (
            <div className="p-6 text-red-400 space-y-2">
              <p className="font-bold">Section inconnue ou non configurée.</p>
              <p className="text-sm text-red-300">
                Route demandée:{' '}
                <code className="bg-red-900/50 px-2 py-1 rounded">
                  {routeMain}/{routeSub || ''}/{routeLeaf || ''}
                </code>
              </p>
              <p className="text-sm text-yellow-300">
                Routes disponibles pour{' '}
                <code className="bg-yellow-900/50 px-2 py-1 rounded">
                  {routeMain}/{routeSub || 'N/A'}
                </code>
                :
              </p>
              <ul className="text-sm text-yellow-200 list-disc list-inside ml-4">
                {leaves.length > 0
                  ? leaves.map((key) => <li key={key}>{key}</li>)
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
        if (process.env.NODE_ENV === 'development') {
          console.log('[DashboardViewRouter] Chargement composant:', componentName);
        }
        const Loaded = await loadComponent(componentName);
        
        // ✅ Vérifier si le composant n'a pas été annulé avant de mettre à jour
        if (cancelled) return;
        
        componentCache.set(routeKey, Loaded); // Mettre en cache
        if (process.env.NODE_ENV === 'development') {
          console.log('[DashboardViewRouter] Composant chargé avec succès');
        }
        setComponent(() => Loaded);
        setIsLoading(false);
      } catch (e) {
        if (cancelled) return;
        
        const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
        if (process.env.NODE_ENV === 'development') {
          console.error('[DashboardViewRouter] Router error:', e);
        }
        setError(errorMessage);
        
        // ✅ Mémoriser le composant d'erreur
        const errorComponent = () => (
          <div className="p-6 text-red-400">
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
  }, [currentRoute, navigationConfig]); // ✅ Utiliser currentRoute mémorisé au lieu de main/sub/leaf séparés

  if (isLoading) {
    return (
      <div className="p-6 text-gray-400 flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse">Chargement…</div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="p-6 text-yellow-400">
        Aucun composant disponible pour cette route.
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="p-6 text-gray-400 flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse">Chargement…</div>
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}
