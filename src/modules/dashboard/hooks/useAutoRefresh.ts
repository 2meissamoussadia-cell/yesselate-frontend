/**
 * Hook pour gérer l'auto-refresh avec pause intelligente
 * Gère les intervalles, la visibilité de l'onglet, et le statut réseau
 * 
 * @example
 * const { isOnline, isTabVisible } = useAutoRefresh({
 *   enabled: autoRefreshEnabled,
 *   interval: refreshInterval,
 *   onRefresh: refreshKPIs,
 *   onStatusChange: (status) => setRefreshStatus(status),
 * });
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLogger } from '@/lib/utils/logger';

interface UseAutoRefreshOptions {
  enabled: boolean;
  interval: number; // en millisecondes
  onRefresh: () => void | Promise<void>;
  onStatusChange?: (status: 'idle' | 'paused') => void;
  minIntervalBetweenRefreshes?: number; // Minimum entre deux refreshes (défaut: 10s)
}

interface UseAutoRefreshReturn {
  isOnline: boolean;
  isTabVisible: boolean;
  pause: () => void;
  resume: () => void;
}

// Extension de Window pour le timestamp du dernier refresh
interface WindowWithRefresh extends Window {
  __lastDashboardRefresh?: number;
}

export function useAutoRefresh({
  enabled,
  interval,
  onRefresh,
  onStatusChange,
  minIntervalBetweenRefreshes = 10000, // 10 secondes par défaut
}: UseAutoRefreshOptions): UseAutoRefreshReturn {
  const log = useLogger('useAutoRefresh');
  
  // États
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  
  const [isTabVisible, setIsTabVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !document.hidden;
    }
    return true;
  });
  
  // Refs pour éviter les dépendances instables
  const enabledRef = useRef(enabled);
  const intervalRef = useRef(interval);
  const onRefreshRef = useRef(onRefresh);
  const isOnlineRef = useRef(isOnline);
  const isTabVisibleRef = useRef(isTabVisible);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  
  // Synchroniser les refs avec les états
  useEffect(() => {
    enabledRef.current = enabled;
    intervalRef.current = interval;
    onRefreshRef.current = onRefresh;
    isOnlineRef.current = isOnline;
    isTabVisibleRef.current = isTabVisible;
  }, [enabled, interval, onRefresh, isOnline, isTabVisible]);
  
  // Marquer le composant comme monté/démonté
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Gestion de la visibilité de l'onglet
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      if (isTabVisibleRef.current !== visible) {
        setIsTabVisible(visible);
        if (process.env.NODE_ENV === 'development') {
          log.debug(`Onglet ${visible ? 'visible' : 'invisible'}`);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [log]);
  
  // Gestion des événements réseau (online/offline)
  
  useEffect(() => {
    const handleOnline = () => {
      if (!isOnlineRef.current) {
        setIsOnline(true);
        if (process.env.NODE_ENV === 'development') {
          log.info('Connexion rétablie');
        }
        // Relancer le refresh si auto-refresh est activé
        if (enabledRef.current && isTabVisibleRef.current) {
          // Nettoyer le timeout précédent s'il existe
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (isMountedRef.current) {
              onRefreshRef.current();
            }
            reconnectTimeoutRef.current = null;
          }, 2000); // Attendre 2s après reconnexion
        }
      }
    };
    
    const handleOffline = () => {
      if (isOnlineRef.current) {
        setIsOnline(false);
        if (process.env.NODE_ENV === 'development') {
          log.warn('Connexion perdue');
        }
        if (onStatusChange) {
          onStatusChange('paused');
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // Nettoyer le timeout de reconnexion
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [log, onStatusChange]);
  
  // Gestion de l'intervalle de refresh automatique
  useEffect(() => {
    // Toujours nettoyer l'intervalle précédent
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Ne créer l'intervalle que si auto-refresh est activé, en ligne, et onglet visible
    if (!enabled || !isOnline || !isTabVisible) {
      if (onStatusChange && !enabled) {
        onStatusChange('paused');
      }
      return;
    }
    
    if (onStatusChange) {
      onStatusChange('idle');
    }
    
    // Créer le nouvel intervalle
    refreshIntervalRef.current = setInterval(() => {
      // Vérifier les conditions avec les refs (évite les dépendances)
      if (
        isMountedRef.current &&
        enabledRef.current &&
        isTabVisibleRef.current &&
        isOnlineRef.current
      ) {
        // Vérifier que le dernier refresh n'est pas trop récent
        const now = Date.now();
        const lastRefreshTime = (window as WindowWithRefresh).__lastDashboardRefresh || 0;
        
        if (now - lastRefreshTime > minIntervalBetweenRefreshes) {
          (window as WindowWithRefresh).__lastDashboardRefresh = now;
          onRefreshRef.current();
        }
      }
    }, interval);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [enabled, interval, isOnline, isTabVisible, minIntervalBetweenRefreshes, onStatusChange]);
  
  // Fonctions de contrôle
  const pause = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (onStatusChange) {
      onStatusChange('paused');
    }
  }, [onStatusChange]);
  
  const resume = useCallback(() => {
    if (enabled && isOnline && isTabVisible && !refreshIntervalRef.current) {
      refreshIntervalRef.current = setInterval(() => {
        if (isMountedRef.current && enabledRef.current && isTabVisibleRef.current && isOnlineRef.current) {
          const now = Date.now();
          const lastRefreshTime = (window as WindowWithRefresh).__lastDashboardRefresh || 0;
          if (now - lastRefreshTime > minIntervalBetweenRefreshes) {
            (window as WindowWithRefresh).__lastDashboardRefresh = now;
            onRefreshRef.current();
          }
        }
      }, intervalRef.current);
      if (onStatusChange) {
        onStatusChange('idle');
      }
    }
  }, [enabled, isOnline, isTabVisible, minIntervalBetweenRefreshes, onStatusChange]);
  
  return {
    isOnline,
    isTabVisible,
    pause,
    resume,
  };
}
