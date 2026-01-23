/**
 * Routeur de vues du Dashboard avec chargement dynamique
 * Utilise la configuration JSON et charge les composants à la demande
 * 
 * @example
 * // Utilisation simple (lit automatiquement le contexte de navigation)
 * <DashboardViewRouter />
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import config from '../navigation/navigation.config.json';
import { loadComponent } from '../utils/loadComponent';
import { useDashboardNavigation } from '../context/DashboardNavigationContext';
import type { ComponentType } from 'react';

interface NavigationConfig {
  [key: string]: {
    label: string;
    sub?: {
      [key: string]: {
        label: string;
        leaf?: {
          [key: string]: {
            label: string;
            component: string;
          };
        };
      };
    };
  };
}

// Cache des composants chargés pour éviter les rechargements inutiles
const componentCache = new Map<string, ComponentType>();

export function DashboardViewRouter() {
  const { main, sub, leaf } = useDashboardNavigation();
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolve() {
      // Créer une clé unique pour cette route
      const routeKey = `${main}|${sub || ''}|${leaf || ''}`;
      
      // ✅ Log pour debug
      console.log('[DashboardViewRouter] Résolution route:', { main, sub, leaf, routeKey });
      
      // Vérifier le cache
      const cached = componentCache.get(routeKey);
      if (cached) {
        console.log('[DashboardViewRouter] Composant trouvé dans le cache');
        setComponent(() => cached);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const navigationConfig = config as NavigationConfig;
        const componentName = navigationConfig?.[main]?.sub?.[sub || '']?.leaf?.[leaf || '']?.component;
        
        // ✅ Log pour debug
        console.log('[DashboardViewRouter] Recherche composant:', {
          main,
          sub,
          leaf,
          hasMain: !!navigationConfig?.[main],
          hasSub: !!navigationConfig?.[main]?.sub?.[sub || ''],
          hasLeaf: !!navigationConfig?.[main]?.sub?.[sub || '']?.leaf?.[leaf || ''],
          componentName,
        });

        // Si pas de componentName, vérifier si on a une route valide mais sans leaf
        if (!componentName) {
          // Cas 1: main seul (pas de sub ni leaf) - afficher la page overview
          if (!sub && !leaf) {
            const cacheKey = `${main}|summary|dashboard`;
            const cached = componentCache.get(cacheKey);
            if (cached) {
              setComponent(() => cached);
              setIsLoading(false);
              return;
            }
            const Loaded = await loadComponent('OverviewPage');
            componentCache.set(cacheKey, Loaded);
            setComponent(() => Loaded);
            setIsLoading(false);
            return;
          }

          // ✅ Cas 1.5: main + leaf mais pas de sub - essayer de trouver dans summary ou kpis
          if (!sub && leaf) {
            console.log('[DashboardViewRouter] Route sans sub, recherche dans summary et kpis:', { main, leaf });
            
            // Essayer d'abord dans summary
            const summaryComponent = navigationConfig?.[main]?.sub?.summary?.leaf?.[leaf]?.component;
            if (summaryComponent) {
              console.log('[DashboardViewRouter] Composant trouvé dans summary:', summaryComponent);
              const cacheKey = `${main}|summary|${leaf}`;
              const cached = componentCache.get(cacheKey);
              if (cached) {
                setComponent(() => cached);
                setIsLoading(false);
                return;
              }
              const Loaded = await loadComponent(summaryComponent);
              componentCache.set(cacheKey, Loaded);
              setComponent(() => Loaded);
              setIsLoading(false);
              return;
            }
            
            // Essayer dans kpis
            const kpisComponent = navigationConfig?.[main]?.sub?.kpis?.leaf?.[leaf]?.component;
            if (kpisComponent) {
              console.log('[DashboardViewRouter] Composant trouvé dans kpis:', kpisComponent);
              const cacheKey = `${main}|kpis|${leaf}`;
              const cached = componentCache.get(cacheKey);
              if (cached) {
                setComponent(() => cached);
                setIsLoading(false);
                return;
              }
              const Loaded = await loadComponent(kpisComponent);
              componentCache.set(cacheKey, Loaded);
              setComponent(() => Loaded);
              setIsLoading(false);
              return;
            }
            
            // Si leaf est "dashboard", utiliser SummaryDashboardPage par défaut
            if (leaf === 'dashboard') {
              console.log('[DashboardViewRouter] Leaf est "dashboard", utilisation de SummaryDashboardPage par défaut');
              const cacheKey = `${main}|summary|dashboard`;
              const cached = componentCache.get(cacheKey);
              if (cached) {
                setComponent(() => cached);
                setIsLoading(false);
                return;
              }
              const Loaded = await loadComponent('SummaryDashboardPage');
              componentCache.set(cacheKey, Loaded);
              setComponent(() => Loaded);
              setIsLoading(false);
              return;
            }
          }

          // Cas 2: main + sub mais pas de leaf - afficher la page sub
          if (sub && !leaf) {
            const subConfig = navigationConfig?.[main]?.sub?.[sub];
            if (subConfig) {
              // Essayer de charger une page par défaut pour cette sub
              // Par exemple, pour "summary" -> SummaryPage, pour "kpis" -> KpiOverviewPage
              let defaultComponent: string | null = null;
              
              if (sub === 'summary') {
                defaultComponent = 'SummaryPage';
              } else if (sub === 'kpis') {
                defaultComponent = 'KpiOverviewPage';
              }

              if (defaultComponent) {
                const cacheKey = `${main}|${sub}|${defaultComponent}`;
                const cached = componentCache.get(cacheKey);
                if (cached) {
                  setComponent(() => cached);
                  setIsLoading(false);
                  return;
                }
                const Loaded = await loadComponent(defaultComponent);
                componentCache.set(cacheKey, Loaded);
                setComponent(() => Loaded);
                setIsLoading(false);
                return;
              }
            }
          }

          // Aucune route valide trouvée
          console.warn('[DashboardViewRouter] Route non trouvée:', { main, sub, leaf });
          console.log('[DashboardViewRouter] Routes disponibles:', {
            overview: {
              summary: Object.keys(navigationConfig?.overview?.sub?.summary?.leaf || {}),
              kpis: Object.keys(navigationConfig?.overview?.sub?.kpis?.leaf || {}),
            },
          });
          
          const errorComponent = () => (
            <div className="p-6 text-red-400 space-y-2">
              <p className="font-bold">Section inconnue ou non configurée.</p>
              <p className="text-sm text-red-300">
                Route demandée: <code className="bg-red-900/50 px-2 py-1 rounded">{main}/{sub}/{leaf}</code>
              </p>
              <p className="text-sm text-yellow-300">
                Routes disponibles pour <code className="bg-yellow-900/50 px-2 py-1 rounded">{main}/{sub}</code>:
              </p>
              <ul className="text-sm text-yellow-200 list-disc list-inside ml-4">
                {navigationConfig?.[main]?.sub?.[sub || '']?.leaf 
                  ? Object.keys(navigationConfig[main].sub[sub || ''].leaf || {}).map(key => (
                      <li key={key}>{key}</li>
                    ))
                  : <li>Aucune route disponible</li>
                }
              </ul>
            </div>
          );
          setComponent(() => errorComponent);
          setIsLoading(false);
          return;
        }

        // Charger le composant dynamiquement
        console.log('[DashboardViewRouter] Chargement composant:', componentName);
        const Loaded = await loadComponent(componentName);
        componentCache.set(routeKey, Loaded); // Mettre en cache
        console.log('[DashboardViewRouter] Composant chargé avec succès');
        setComponent(() => Loaded);
        setIsLoading(false);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
        console.error('Router error:', e);
        setError(errorMessage);
        setComponent(() => () => (
          <div className="p-6 text-red-400">
            Erreur de chargement du module: {errorMessage}
          </div>
        ));
        setIsLoading(false);
      }
    }

    resolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main, sub, leaf]);

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
