/**
 * Hook pour gérer le refresh des KPIs avec retry automatique
 * Extrait de DashboardContent pour améliorer la maintenabilité
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLogger } from '@/lib/utils/logger';

interface UseDashboardRefreshOptions {
  maxRetries?: number;
  onRefresh?: () => Promise<void>;
  onSuccess?: (loadTime: number) => void;
  onError?: (error: Error, retryAttempt: number) => void;
}

interface RefreshStatus {
  status: 'idle' | 'loading' | 'error' | 'paused' | 'retrying';
  refreshCount: number;
  retryCount: number;
  lastUpdate: Date | null;
  loadTime: number;
}

export function useDashboardRefresh({
  maxRetries = 3,
  onRefresh,
  onSuccess,
  onError,
}: UseDashboardRefreshOptions = {}) {
  const log = useLogger('useDashboardRefresh');
  
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus['status']>('idle');
  const [refreshCount, setRefreshCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loadTime, setLoadTime] = useState(0);
  
  const isMountedRef = useRef(true);
  const retryTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const refreshStatusRef = useRef(refreshStatus);
  
  // Synchroniser ref avec state
  useEffect(() => {
    refreshStatusRef.current = refreshStatus;
  }, [refreshStatus]);
  
  // Cleanup au démontage
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      retryTimeoutsRef.current.forEach(clearTimeout);
      retryTimeoutsRef.current = [];
    };
  }, []);
  
  const refreshInternal = useCallback(async (retryAttempt = 0): Promise<void> => {
    // Vérifier si le composant est encore monté
    if (!isMountedRef.current) {
      return;
    }
    
    // Si le refresh est en pause
    if (refreshStatusRef.current === 'paused') {
      return;
    }
    
    // Éviter les refreshes multiples simultanés
    if (refreshStatusRef.current === 'loading' || refreshStatusRef.current === 'retrying') {
      if (process.env.NODE_ENV === 'development') {
        log.warn('Refresh déjà en cours, ignoré', { retryAttempt, status: refreshStatusRef.current });
      }
      return;
    }
    
    const startTime = performance.now();
    
    try {
      // Définir le statut selon si c'est un retry ou non
      if (retryAttempt > 0) {
        setRefreshStatus('retrying');
        setRetryCount(retryAttempt);
      } else {
        setRefreshStatus('loading');
      }
      
      // Appeler la fonction de refresh
      if (onRefresh) {
        await onRefresh();
      }
      
      // Réinitialiser le compteur de retry en cas de succès
      if (retryAttempt > 0) {
        setRetryCount(0);
      }
      
      const calculatedLoadTime = performance.now() - startTime;
      setLastUpdate(new Date());
      setRefreshCount(prev => prev + 1);
      setRefreshStatus('idle');
      setLoadTime(calculatedLoadTime);
      
      // Marquer le timestamp du dernier refresh réussi
      if (typeof window !== 'undefined') {
        (window as any).__lastDashboardRefresh = Date.now();
      }
      
      if (process.env.NODE_ENV === 'development') {
        log.performance('KPIs refresh', calculatedLoadTime);
      }
      
      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess(calculatedLoadTime);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      const err = error instanceof Error ? error : new Error(errorMessage);
      
      log.error('Erreur lors du refresh des KPIs', err, { retryAttempt, maxRetries });
      
      // Retry automatique avec exponential backoff
      if (retryAttempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryAttempt), 10000); // Max 10s
        
        if (process.env.NODE_ENV === 'development') {
          log.info(`Retry ${retryAttempt + 1}/${maxRetries} dans ${delay}ms`, {
            retryAttempt: retryAttempt + 1,
            maxRetries,
            delay,
          });
        }
        
        // Planifier le retry
        if (!isMountedRef.current) {
          return;
        }
        
        const timeoutId = setTimeout(() => {
          if (isMountedRef.current) {
            refreshInternal(retryAttempt + 1);
          }
        }, delay);
        
        retryTimeoutsRef.current.push(timeoutId);
        return;
      }
      
      // Après épuisement des retries, afficher l'erreur
      setRefreshStatus('error');
      setRetryCount(0);
      
      // Appeler le callback d'erreur
      if (onError) {
        onError(err, retryAttempt);
      }
    }
  }, [maxRetries, onRefresh, onSuccess, onError, log]);
  
  // Fonction publique de refresh
  const refresh = useCallback(() => {
    refreshInternal(0);
  }, [refreshInternal]);
  
  // Fonction pour mettre en pause/reprendre
  const pause = useCallback(() => {
    setRefreshStatus('paused');
  }, []);
  
  const resume = useCallback(() => {
    if (refreshStatusRef.current === 'paused') {
      setRefreshStatus('idle');
    }
  }, []);
  
  return {
    refresh,
    pause,
    resume,
    status: refreshStatus,
    refreshCount,
    retryCount,
    lastUpdate,
    loadTime,
  };
}
