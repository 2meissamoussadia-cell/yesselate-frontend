/**
 * Routeur de vues du Dashboard avec chargement dynamique
 * Utilise la configuration JSON et charge les composants à la demande
 * 
 * @example
 * // Utilisation simple (lit automatiquement le contexte de navigation)
 * <DashboardViewRouter />
 */

'use client';

import { Suspense, useEffect, useState, useMemo, memo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ShieldX } from 'lucide-react';
import { EmptyState } from './views/EmptyState';
import { loadComponent } from '../utils/loadComponent';
import {
  getRouteComponent,
  isValidRoute,
  getAvailableRoutes,
  normalizeRoute,
  getFallbackComponent,
} from '../utils/routeValidation';
import { useLogger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardRegistry } from '../registry';
import { navToKey, type NavKey } from '../types/dashboard';
import { hasViewAccess } from '../utils/securityGuards';
import { useAuthOptional } from '../hooks/useAuthOptional';
import { useDashboardPermissions } from '../hooks/useDashboardPermissions';
import { filterNavigationConfig, findFirstAuthorizedRoute } from '../utils/navigationFilter';
import { dashboardNavigationConfig } from '../navigation/dashboardNavigationConfig';
import { nodeAllowed } from '../navigation/permissions';
import { useDashboardPermissionsStore } from '@/lib/stores/dashboardPermissionsStore';
import { useTrackView } from '../telemetry/useTrack';
import { getAuthHeaders } from '../utils/getAuthHeaders';
import { getNextCategoryRoute, getPreviousCategoryRoute } from '../utils/routeNavigation';

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
  
  // ✅ Auth pour les guards de sécurité (optionnel)
  const authContext = useAuthOptional();
  const user = authContext?.user || null;

  // Phase P10: Charger les permissions depuis le store Zustand
  useDashboardPermissions(); // Charge les permissions si nécessaire
  const permissions = useDashboardPermissionsStore((state) => state.permissions);

  // ✅ Source de vérité: Command Center store (évite "je clique et rien")
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const normalized = useMemo(() => {
    return normalizeRoute(nav.mainCategory, nav.subCategory, nav.subSubCategory);
  }, [nav.mainCategory, nav.subCategory, nav.subSubCategory]);

  const main = normalized.main;
  const sub = normalized.sub;
  const leaf = normalized.leaf;
  
  // ✅ Convertir en NavKey pour le registry
  const navKey: NavKey = useMemo(() => ({
    main: main as NavKey['main'],
    sub: sub || null,
    leaf: leaf || null,
  }), [main, sub, leaf]);
  
  // Phase P14: Télémetrie - tracker l'ouverture de la vue
  const routeKey = `${main}::${sub || ''}::${leaf || ''}`;
  useTrackView(routeKey);
  
  // ✅ Vérifier l'accès via le registry (vérification locale)
  const registryKey = navToKey(navKey);
  const registryEntry = useMemo(() => dashboardRegistry[registryKey], [registryKey]);
  
  // Note: Le User de lib/contexts/AuthContext utilise déjà le type User de lib/types
  // qui a nom, prenom (pas firstName, lastName), donc pas de conversion nécessaire
  const hasAccessLocal = useMemo(() => {
    return hasViewAccess(registryEntry, user);
  }, [registryEntry, user]);

  // Phase P10: Navigation filtrée pour trouver la première route autorisée
  const filteredNav = useMemo(
    () => filterNavigationConfig(
      dashboardNavigationConfig,
      permissions.permissions,
      permissions.roles,
      permissions.featureFlags
    ),
    [permissions.permissions, permissions.roles, permissions.featureFlags]
  );

  // Phase P10: Vérifier l'accès via /api/me/policy (check asynchrone)
  const [hasAccessPolicy, setHasAccessPolicy] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    
    async function checkPolicy() {
      try {
        const authHeaders = getAuthHeaders(user);
        const res = await fetch('/api/me/policy', {
          headers: authHeaders,
        });
        if (cancelled) return;
        
        if (!res.ok) {
          setHasAccessPolicy(false);
          return;
        }
        
        const policy = await res.json();
        const { perms, flags } = policy;
        
        // Vérifier si la route actuelle est autorisée selon la policy avec nodeAllowed
        const mainNode = filteredNav[main];
        if (!mainNode) {
          setHasAccessPolicy(false);
          return;
        }
        
        // Contexte utilisateur pour nodeAllowed
        const userContext = {
          perms,
          flags,
          roles: permissions.roles,
        };
        
        // Vérifier l'accès au nœud principal avec nodeAllowed
        const mainAllowed = nodeAllowed(userContext, mainNode.requires);
        if (!mainAllowed) {
          setHasAccessPolicy(false);
          return;
        }
        
        // Si sub, vérifier l'accès au sous-nœud avec nodeAllowed
        if (sub) {
          const subNode = mainNode.children?.find((c) => c.id === sub);
          if (subNode) {
            const subAllowed = nodeAllowed(userContext, subNode.requires);
            if (!subAllowed) {
              setHasAccessPolicy(false);
              return;
            }
          }
        }
        
        setHasAccessPolicy(true);
      } catch (error) {
        console.warn('[DashboardViewRouter] Failed to check policy', error);
        setHasAccessPolicy(null); // Indéterminé, on garde l'accès local
      }
    }
    
    checkPolicy();
    return () => { cancelled = true; };
  }, [main, sub, leaf, filteredNav, navigate, log]);

  // Phase P10: Rediriger vers la première route autorisée si la route actuelle est interdite
  // Ne rediriger qu'une seule fois quand l'accès passe à "refusé" pour éviter une boucle
  // (navigate() change main/sub/leaf, ce qui re-déclenchait l'effet → Maximum update depth)
  const prevHasAccessPolicyRef = useRef<boolean | null>(null);
  useEffect(() => {
    const justBecameFalse = prevHasAccessPolicyRef.current !== false && hasAccessPolicy === false;
    prevHasAccessPolicyRef.current = hasAccessPolicy;

    if (!justBecameFalse) return;

    const firstRoute = findFirstAuthorizedRoute(filteredNav);
    if (firstRoute) {
      log.debug('Route interdite (policy), redirection vers première route autorisée', {
        from: { main, sub, leaf },
        to: firstRoute,
      });
      navigate(firstRoute.main as any, firstRoute.sub, firstRoute.leaf);
    }
  }, [hasAccessPolicy, filteredNav, main, sub, leaf, navigate, log]);

  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Touch gestures pour navigation mobile (swipe left/right)
  const containerRef = useTouchGestures(
    {
      onSwipeLeft: () => {
        // Navigation vers la prochaine catégorie
        const currentRoute = { main, sub: sub || null, leaf: leaf || null };
        const nextRoute = getNextCategoryRoute(currentRoute, filteredNav);
        if (nextRoute) {
          log.debug('Swipe left: navigation vers route suivante', { from: currentRoute, to: nextRoute });
          navigate(nextRoute.main as any, nextRoute.sub, nextRoute.leaf);
        } else {
          log.debug('Swipe left: aucune route suivante disponible');
        }
      },
      onSwipeRight: () => {
        // Navigation vers la catégorie précédente
        const currentRoute = { main, sub: sub || null, leaf: leaf || null };
        const prevRoute = getPreviousCategoryRoute(currentRoute, filteredNav);
        if (prevRoute) {
          log.debug('Swipe right: navigation vers route précédente', { from: currentRoute, to: prevRoute });
          navigate(prevRoute.main as any, prevRoute.sub, prevRoute.leaf);
        } else {
          log.debug('Swipe right: aucune route précédente disponible');
        }
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

        // Phase 1 : Fallback automatique simplifié vers route sûre
        // Si la triplette n'est pas configurée, viser "dashboard" du main
        if (!componentName) {
          const fallback = getRouteComponent(routeMain, null, 'dashboard');
          
          if (fallback) {
            log.debug('Fallback automatique activé', {
              main: routeMain,
              sub: routeSub,
              leaf: routeLeaf,
              fallbackComponent: fallback,
              strategy: 'main->null->dashboard',
            });
            
            const Loaded = await loadComponent(fallback);
            if (cancelled) return;
            
            componentCache.set(routeKey, Loaded);
            setComponent(() => Loaded);
            setIsLoading(false);
            return;
          }
          
          // Si le fallback n'a pas fonctionné, afficher erreur
          const routeString = `${routeMain}/${routeSub || ''}/${routeLeaf || ''}`;
          
          // ✅ Ne logger un warning qu'une seule fois par route unique pour éviter le spam
          // Utiliser un Set statique pour tracker les routes déjà loggées
          if (!warnedRoutes.has(routeKey)) {
            warnedRoutes.add(routeKey);
            log.warn(`Route non trouvée et fallback échoué: ${routeString}`, {
              main: routeMain,
              sub: routeSub,
              leaf: routeLeaf,
              routeKey,
              fallbackAttempted: true,
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
  }, [currentRoute, hasAccessLocal, registryEntry, navKey]); // ✅ Ajouter hasAccessLocal et registryEntry dans les dépendances

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

  // Composant fallback pour Suspense (doit être un composant, pas une fonction)
  const LoadingFallback = () => (
    <div className="p-4 sm:p-6 text-gray-400 flex items-center justify-center min-h-[200px] min-w-0">
      <div className="animate-pulse">Chargement…</div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
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

