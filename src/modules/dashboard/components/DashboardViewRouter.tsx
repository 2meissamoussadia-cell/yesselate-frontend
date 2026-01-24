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
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from './views/EmptyState';
import { loadComponent } from '../utils/loadComponent';
import {
  getRouteComponent,
  isValidRoute,
  getAvailableRoutes,
  normalizeRoute,
} from '../utils/routeValidation';
import { useLogger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

// ✅ Cache des composants chargés pour éviter les rechargements inutiles
const componentCache = new Map<string, ComponentType>();

// ✅ Set pour tracker les routes déjà loggées comme "non trouvées" (évite le spam de warnings)
const warnedRoutes = new Set<string>();

interface DashboardViewRouterProps {
  className?: string;
  debug?: boolean;
}

export const DashboardViewRouter = memo(function DashboardViewRouter({
  className,
  debug = false,
}: DashboardViewRouterProps) {
  // ✅ Initialiser le logger
  const log = useLogger('DashboardViewRouter');

  // ✅ Source de vérité: Command Center store (évite "je clique et rien")
  const nav = useDashboardCommandCenterStore((s) => s.navigation);

  const normalized = useMemo(() => {
    return normalizeRoute(nav.mainCategory, nav.subCategory, nav.subSubCategory);
  }, [nav.mainCategory, nav.subCategory, nav.subSubCategory]);

  const main = normalized.main;
  const sub = normalized.sub;
  const leaf = normalized.leaf;

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
          
          // Utiliser EmptyState pour un affichage propre
          const errorComponent = () => (
            <EmptyState
              title="Section non configurée"
              description={`La route "${routeMain}${routeSub ? `/${routeSub}` : ''}${routeLeaf ? `/${routeLeaf}` : ''}" n'est pas encore disponible.`}
              icon={BarChart3}
              actionLabel={leaves.length > 0 ? 'Voir les sections disponibles' : undefined}
              onAction={leaves.length > 0 ? () => {
                // Navigation vers la première route disponible
                const navigate = useDashboardCommandCenterStore.getState().navigate;
                navigate(routeMain, routeSub || null, leaves[0]);
              } : undefined}
            />
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
      <div className={cn('min-w-0', className)}>
        <div className="p-4 sm:p-6 text-gray-400 flex items-center justify-center min-h-[200px] min-w-0">
          <div className="animate-pulse">Chargement…</div>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className={cn('min-w-0', className)}>
        <div className="p-4 sm:p-6 text-yellow-400 min-w-0 overflow-hidden break-words">
          Aucun composant disponible pour cette route.
        </div>
      </div>
    );
  }

  // Variants pour les transitions
  const pageVariants = {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.98 },
  };

  const pageTransition = {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.3,
  };

  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-6 text-gray-400 flex items-center justify-center min-h-[200px] min-w-0">
          <div className="animate-pulse">Chargement…</div>
        </div>
      }
    >
      <div ref={containerRef} className={cn('min-w-0', className)}>
        {debug ? (
          <div className="mb-3 rounded-xl border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-xs text-slate-300">
            <div className="font-medium text-slate-200">DashboardViewRouter</div>
            <div className="mt-1 tabular-nums">
              Route: <span className="text-slate-100">{currentRoute.main}</span>
              {currentRoute.sub ? <span className="text-slate-100"> / {currentRoute.sub}</span> : null}
              {currentRoute.leaf ? <span className="text-slate-100"> / {currentRoute.leaf}</span> : null}
            </div>
            {error ? <div className="mt-1 text-rose-300">Erreur: {error}</div> : null}
          </div>
        ) : null}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute.routeKey}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="min-w-0"
          >
            <Component />
          </motion.div>
        </AnimatePresence>
      </div>
    </Suspense>
  );
});

