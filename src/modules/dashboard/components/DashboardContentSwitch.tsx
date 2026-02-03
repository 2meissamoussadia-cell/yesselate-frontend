'use client';

import { useEffect, useMemo, useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLoadingFallback } from './shared/DashboardLoadingFallback';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardRegistry, navToKey, type NavKey } from '../registry';
import type { DashboardViewData } from '../types/dashboardDataTypes';
import type { LoaderResult } from '../types/dashboard';
import { createLogger } from '../utils/logger';
import { storeNavToNavKey } from '../utils/navAdapter';

const logger = createLogger('DashboardContentSwitch');

type LoaderResultType = LoaderResult<DashboardViewData>;

function isLoaderResult(value: unknown): value is LoaderResultType {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return 'data' in v && 'fetchedAt' in v && typeof v.fetchedAt === 'number';
}

function resolveViewKey(nav: NavKey) {
  // fallback intelligent si un niveau manque (aligné sur le registry et DEFAULT_DG_HOME)
  const main = nav.main;
  const sub = nav.sub ?? 'summary';
  const leaf =
    nav.leaf ??
    (main === 'pilotage' && sub === 'dashboard' ? 'default' : 'dashboard');
  return `${main}::${sub}::${leaf}`;
}

export const DashboardContentSwitch = memo(function DashboardContentSwitch() {
  const navState = useDashboardCommandCenterStore((s) => s.navigation);
  // Ne pas lire cache directement pour éviter les re-renders - on le lira dans le useEffect avec getState()

  const nav: NavKey = useMemo(
    () => storeNavToNavKey(navState),
    [navState]
  );

  const viewKey = useMemo(() => resolveViewKey(nav), [nav]);
  const view = dashboardRegistry[viewKey];
  const viewDataRefreshTrigger = useDashboardCommandCenterStore((s) => s.viewDataRefreshTrigger);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardViewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  /** Message annoncé aux lecteurs d'écran à la fin du chargement (WCAG aria-live). */
  const [liveStatusMessage, setLiveStatusMessage] = useState<string | null>(null);
  const maxRetries = 3;

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const run = async (retryAttempt = 0) => {
      setError(null);
      setIsTransitioning(true);
      setLiveStatusMessage(null);

      if (!view) {
        setData(null);
        setIsTransitioning(false);
        return;
      }

      // si pas de loader, vue statique
      if (!view.loader) {
        setData(null);
        useDashboardCommandCenterStore.getState().setLastDataUpdate(new Date().toISOString());
        setIsTransitioning(false);
        setLiveStatusMessage(view.title ?? 'Vue chargée');
        return;
      }

      const key = navToKey(nav);
      const ttl = view.ttl ?? 30_000;
      // Lire le cache directement depuis le store pour éviter les dépendances
      const currentCache = useDashboardCommandCenterStore.getState().cache;
      const cached = currentCache[key];

      const isFresh =
        cached && Date.now() - cached.fetchedAt < (cached.ttl ?? ttl);

      if (isFresh) {
        setData(cached.data);
        const setLastDataUpdate = useDashboardCommandCenterStore.getState().setLastDataUpdate;
        setLastDataUpdate(new Date(cached.fetchedAt).toISOString());
        setIsTransitioning(false);
        setLiveStatusMessage(view.title ?? 'Vue chargée');
        return;
      }

      setLoading(true);
      try {
        // Timeout de 15 secondes
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Timeout: Le chargement a pris trop de temps'));
          }, 15000);
        });

        const loadPromise = view.loader(nav);
        const resUnknown = await Promise.race([loadPromise, timeoutPromise]);
        
        if (cancelled) return;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        if (!isLoaderResult(resUnknown)) {
          throw new Error('Réponse loader invalide');
        }

        setData(resUnknown.data);
        // Utiliser setCache depuis le store directement
        const setCacheFn = useDashboardCommandCenterStore.getState().setCache;
        setCacheFn(key, { data: resUnknown.data, fetchedAt: resUnknown.fetchedAt, ttl });
        // Phase 2 #8: mettre à jour lastUpdate pour le footer (● LIVE + timestamp)
        const setLastDataUpdate = useDashboardCommandCenterStore.getState().setLastDataUpdate;
        setLastDataUpdate(new Date(resUnknown.fetchedAt).toISOString());
        setRetryCount(0);
        setIsTransitioning(false);
        setLoading(false);
        setLiveStatusMessage(view.title ?? 'Vue chargée');
      } catch (e: unknown) {
        if (cancelled) return;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Retry automatique avec exponential backoff
        if (retryAttempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 10000);
          setRetryCount(retryAttempt + 1);
          
          // Le retry est géré automatiquement, pas besoin de log ici pour éviter les boucles
          
          setTimeout(() => {
            if (!cancelled) run(retryAttempt + 1);
          }, delay);
          return;
        }

        const error = e instanceof Error ? e : new Error(String(e));
        logger.error('Failed to load view', { key: viewKey, nav, retryAttempt, action: 'loadData' }, error);
        setError(error.message);
        setRetryCount(0);
        setIsTransitioning(false);
        if (retryAttempt >= maxRetries) {
          setLoading(false);
          toast.error('Erreur de chargement', { description: error.message });
        }
      } finally {
        if (!cancelled && retryAttempt >= maxRetries) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey, view, nav.main, nav.sub, nav.leaf, viewDataRefreshTrigger, maxRetries]); // viewDataRefreshTrigger déclenche un rechargement après invalidateAllViews()

  const handleRetry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    // Le useEffect se déclenchera automatiquement car viewKey change ou on force un refresh
    // Pas besoin de forcer un re-render du store
  }, []);

  if (!view) {
    return (
      <div className="p-6 text-sm text-slate-300 animate-fadeIn">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <div>
            <div className="font-medium text-amber-300 mb-1">Vue introuvable</div>
            <div className="text-xs text-slate-400">
              Clé: <span className="font-mono text-slate-300">{viewKey}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showSkeleton = loading || (isTransitioning && !!view?.loader);

  return (
    <div className="relative min-h-[300px] min-w-0 max-w-full" aria-busy={showSkeleton} aria-live="polite">
      {/* Annonce lecteurs d'écran à la fin du chargement (WCAG) */}
      {liveStatusMessage && (
        <div className="sr-only" role="status" aria-live="polite">
          {liveStatusMessage}
        </div>
      )}
      {/* Loading overlay : squelettes animés + progress bar (Procore-style) — affiché dès la transition si la vue a un loader */}
      {showSkeleton && (
        <div className="absolute inset-0 z-10 animate-fadeIn overflow-auto">
          <div className="min-h-full bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6">
            <DashboardLoadingFallback
              showProgress
              kpiCount={4}
              chartCount={2}
              showTable={false}
              message={retryCount > 0 ? `Tentative ${retryCount}/${maxRetries}…` : undefined}
            />
          </div>
        </div>
      )}

      {/* Error display amélioré avec retry */}
      {error && !loading && (
        <div
          className={cn(
            "p-6 m-4 rounded-xl border animate-fadeIn",
            "bg-red-500/10 border-red-500/30 backdrop-blur-sm"
          )}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-400" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-red-300 mb-1">Erreur de chargement</div>
              <div className="text-sm text-red-200/80 mb-4">{error}</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 focus-visible:ring-sky-500/60"
                      aria-label="Réessayer le chargement de la vue"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Réessayer le chargement de la vue</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* Content avec transition framer-motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          className="min-w-0 max-w-full"
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{
            type: 'tween',
            ease: [0.4, 0, 0.2, 1],
            duration: 0.3,
          }}
        >
          {view.render({ nav, data })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

