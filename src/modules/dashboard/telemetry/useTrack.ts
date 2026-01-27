// src/modules/dashboard/telemetry/useTrack.ts
// Phase P14: Observabilité produit - Hooks React pour autocapture

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { track } from '@lib-root/telemetry/client';

/**
 * Hook pour tracker automatiquement l'ouverture d'une vue
 * Phase P14: Observabilité produit
 * 
 * @param routeKey - Clé de route (ex: 'overview::summary::dashboard')
 */
export function useTrackView(routeKey: string): void {
  const sent = useRef(false);
  
  useEffect(() => {
    if (!routeKey || sent.current) return;
    
    track({
      event: 'view_opened',
      routeKey,
    });
    
    sent.current = true;
  }, [routeKey]);
}

/**
 * Hook pour tracker des actions utilisateur
 * Phase P14: Observabilité produit
 * 
 * @returns Fonction pour tracker une action
 * 
 * @example
 * const trackAction = useTrackAction();
 * trackAction('kpi_click', { kpiId: 'prod', value: 1000 });
 * trackAction('export_triggered', { format: 'xlsx', routeKey: 'performance::reporting' });
 */
export function useTrackAction(): (event: string, props?: Record<string, any>) => void {
  return useCallback((event: string, props?: Record<string, any>) => {
    track({
      event,
      props,
    });
  }, []);
}

/**
 * Hook pour tracker les erreurs
 * Phase P14: Observabilité produit
 * 
 * @returns Fonction pour tracker une erreur
 */
export function useTrackError(): (error: Error, context?: Record<string, any>) => void {
  return useCallback((error: Error, context?: Record<string, any>) => {
    track({
      event: 'error',
      props: {
        error: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }, []);
}

/**
 * Hook pour tracker les performances
 * Phase P14: Observabilité produit
 * 
 * @returns Fonction pour tracker une métrique de performance
 */
export function useTrackPerf(): (metric: string, value: number, props?: Record<string, any>) => void {
  return useCallback((metric: string, value: number, props?: Record<string, any>) => {
    track({
      event: 'perf',
      props: {
        metric,
        value,
        ...props,
      },
    });
  }, []);
}
