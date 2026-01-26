/**
 * Hooks React pour la télémétrie du dashboard
 * Phase P14: Télémétrie & Analytics
 * 
 * Hooks pour tracker automatiquement les vues ouvertes et les actions utilisateur
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { track } from '@/lib/telemetry/client';

/**
 * Hook pour tracker automatiquement l'ouverture d'une vue
 * 
 * @param routeKey - Clé de route (ex: 'overview::summary::dashboard')
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   useTrackView('overview::summary::dashboard');
 *   return <div>...</div>;
 * }
 * ```
 */
export function useTrackView(routeKey: string): void {
  const sent = useRef(false);

  useEffect(() => {
    if (!routeKey || sent.current) return;

    track({ 
      event: 'view_opened', 
      routeKey 
    });
    
    sent.current = true;
  }, [routeKey]);
}

/**
 * Hook pour tracker les actions utilisateur (clics, exports, etc.)
 * 
 * @returns Fonction pour tracker une action
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trackAction = useTrackAction();
 *   
 *   const handleExport = () => {
 *     trackAction('export_triggered', { format: 'xlsx', routeKey: 'overview::summary::dashboard' });
 *     // ... logique d'export
 *   };
 *   
 *   return <button onClick={handleExport}>Exporter</button>;
 * }
 * ```
 */
export function useTrackAction() {
  return useCallback((event: string, props?: Record<string, any>) => {
    track({ 
      event, 
      props 
    });
  }, []);
}

/**
 * Hook pour tracker les clics sur les KPIs
 * 
 * @returns Fonction pour tracker un clic KPI
 * 
 * @example
 * ```tsx
 * function KPIComponent({ kpiId, routeKey }) {
 *   const trackKPIClick = useTrackKPIClick();
 *   
 *   const handleClick = () => {
 *     trackKPIClick(kpiId, routeKey);
 *     // ... logique du clic
 *   };
 *   
 *   return <div onClick={handleClick}>KPI</div>;
 * }
 * ```
 */
export function useTrackKPIClick() {
  return useCallback((kpiId: string, routeKey?: string) => {
    track({ 
      event: 'kpi_click', 
      routeKey,
      props: { kpiId } 
    });
  }, []);
}

/**
 * Hook pour tracker les erreurs
 * 
 * @returns Fonction pour tracker une erreur
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trackError = useTrackError();
 *   
 *   useEffect(() => {
 *     try {
 *       // ... logique
 *     } catch (error) {
 *       trackError('error', { 
 *         message: error.message, 
 *         routeKey: 'overview::summary::dashboard' 
 *       });
 *     }
 *   }, []);
 * }
 * ```
 */
export function useTrackError() {
  return useCallback((error: Error, routeKey?: string) => {
    track({ 
      event: 'error', 
      routeKey,
      props: { 
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500), // Limiter la taille
      } 
    });
  }, []);
}

/**
 * Hook pour tracker les événements de performance
 * 
 * @returns Fonction pour tracker un événement de performance
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trackPerf = useTrackPerformance();
 *   
 *   useEffect(() => {
 *     const start = performance.now();
 *     // ... opération
 *     const duration = performance.now() - start;
 *     trackPerf('render', { duration, routeKey: 'overview::summary::dashboard' });
 *   }, []);
 * }
 * ```
 */
export function useTrackPerformance() {
  return useCallback((metric: string, props?: Record<string, any>) => {
    track({ 
      event: 'perf', 
      props: {
        metric,
        ...props,
      } 
    });
  }, []);
}
