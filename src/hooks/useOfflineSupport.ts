// ============================================
// Hook pour le support mode hors ligne
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

interface OfflineSupportOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  enableCache?: boolean;
}

/**
 * Hook pour gérer le mode hors ligne et la synchronisation
 */
export function useOfflineSupport(options: OfflineSupportOptions = {}) {
  const { onOnline, onOffline, enableCache = true } = options;
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState<Array<{
    id: string;
    action: string;
    data: unknown;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onOnline?.();
    };

    const handleOffline = () => {
      setIsOnline(false);
      onOffline?.();
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline]);

  const queueAction = useCallback((action: string, data: unknown) => {
    const actionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAction = {
      id: actionId,
      action,
      data,
      timestamp: Date.now(),
    };

    setPendingActions((prev) => [...prev, newAction]);

    // Sauvegarder dans localStorage
    if (enableCache) {
      try {
        const stored = localStorage.getItem('governance_pending_actions');
        const actions = stored ? JSON.parse(stored) : [];
        actions.push(newAction);
        localStorage.setItem('governance_pending_actions', JSON.stringify(actions));
      } catch (error) {
        logger.error('Erreur lors de la sauvegarde des actions', error instanceof Error ? error : undefined, { component: 'useOfflineSupport' });
      }
    }

    return actionId;
  }, [enableCache]);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    const actionsToSync = [...pendingActions];
    setPendingActions([]);

    // Ici, vous pouvez synchroniser avec votre API
    // Pour l'instant, on simule juste
    for (const action of actionsToSync) {
      try {
        // await syncAction(action);
        logger.info('Action synchronisée', { component: 'useOfflineSupport', action: action.action });
      } catch (error) {
        // Remettre dans la queue en cas d'erreur
        setPendingActions((prev) => [...prev, action]);
      }
    }

    // Nettoyer localStorage
    if (enableCache) {
      localStorage.removeItem('governance_pending_actions');
    }
  }, [isOnline, pendingActions, enableCache]);

  // Charger les actions en attente au montage
  useEffect(() => {
    if (enableCache) {
      try {
        const stored = localStorage.getItem('governance_pending_actions');
        if (stored) {
          const actions = JSON.parse(stored);
          setPendingActions(actions);
        }
      } catch (error) {
        logger.error('Erreur lors du chargement des actions', error instanceof Error ? error : undefined, { component: 'useOfflineSupport' });
      }
    }
  }, [enableCache]);

  // Synchroniser automatiquement quand on revient en ligne
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline, pendingActions.length, syncPendingActions]);

  return {
    isOnline,
    pendingActionsCount: pendingActions.length,
    queueAction,
    syncPendingActions,
  };
}

