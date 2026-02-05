/**
 * Hook React pour gérer les notifications temps réel dans Analytics
 */

'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  analyticsRealtimeService,
  RealtimeEvent,
  RealtimeEventType,
} from '@/lib/services/analyticsRealtime';
import { useAnalyticsToast } from '../workspace/AnalyticsToast';
import { logger } from '@/lib/utils/logger';

interface UseRealtimeAnalyticsOptions {
  /** Active la connexion automatique au montage */
  autoConnect?: boolean;
  /** Types d'événements à écouter */
  eventTypes?: RealtimeEventType[];
  /** Filtres pour les événements */
  filters?: {
    bureauId?: string;
    userId?: string;
    priority?: RealtimeEvent['priority'][];
  };
  /** Afficher les toasts pour les événements */
  showToasts?: boolean;
  /** Invalider automatiquement les queries React Query */
  autoInvalidateQueries?: boolean;
  /** URL du service (optionnel) */
  serviceUrl?: string;
}

export function useRealtimeAnalytics(options: UseRealtimeAnalyticsOptions = {}) {
  const {
    autoConnect = true,
    eventTypes = [
      'kpi_update',
      'alert_new',
      'alert_resolved',
      'report_completed',
      'export_ready',
      'data_refresh',
    ],
    filters,
    showToasts = true,
    autoInvalidateQueries = true,
    serviceUrl,
  } = options;

  const queryClient = useQueryClient();
  const toast = useAnalyticsToast();
  const subscriptionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Connexion au service avec gestion d'erreur
    try {
      analyticsRealtimeService.connect(serviceUrl);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to connect to realtime service', error instanceof Error ? error : undefined, { component: 'useRealtimeAnalytics' });
      }
      return;
    }

    // Abonnement aux événements
    const handleEvent = (event: RealtimeEvent) => {
      logger.debug('Realtime event received', { component: 'useRealtimeAnalytics', eventType: event.type, event });

      // Afficher les toasts si activé
      if (showToasts) {
        handleToastNotification(event, toast);
      }

      // Invalider les queries si activé
      if (autoInvalidateQueries) {
        handleQueryInvalidation(event, queryClient);
      }
    };

    subscriptionIdRef.current = analyticsRealtimeService.subscribe(
      eventTypes,
      handleEvent,
      filters
    );

    // Nettoyage
    return () => {
      if (subscriptionIdRef.current) {
        analyticsRealtimeService.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
      analyticsRealtimeService.disconnect();
    };
  }, [autoConnect, serviceUrl, eventTypes, filters, showToasts, autoInvalidateQueries, toast, queryClient]);

  return {
    isConnected: analyticsRealtimeService.getConnectionStatus(),
    subscriptionsCount: analyticsRealtimeService.getSubscriptionsCount(),
  };
}

/**
 * Gère l'affichage des toasts pour les événements
 */
function handleToastNotification(
  event: RealtimeEvent,
  toast: ReturnType<typeof useAnalyticsToast>
) {
  switch (event.type) {
    case 'alert_new': {
      const severity = event.data?.severity || 'warning';
      const title = event.data?.title || 'Nouvelle alerte';
      const message = event.data?.message || 'Une nouvelle alerte nécessite votre attention';
      
      if (severity === 'critical' || severity === 'error') {
        toast.error(title, message);
      } else if (severity === 'warning') {
        toast.warning(title, message);
      } else {
        toast.info(title, message);
      }
      break;
    }

    case 'alert_resolved':
      toast.success(
        event.data?.message || 'Alerte résolue',
        'L\'alerte a été traitée avec succès'
      );
      break;

    case 'export_ready': {
      const fileName = event.data?.fileName || 'export.xlsx';
      const format = fileName.split('.').pop()?.toUpperCase() || 'XLSX';
      toast.exportSuccess(format);
      break;
    }

    case 'report_completed':
      toast.success(
        'Rapport généré',
        event.data?.message || 'Votre rapport est prêt à être consulté'
      );
      break;

    case 'kpi_update':
      if (event.priority === 'high' || event.priority === 'critical') {
        toast.info(
          'KPI mis à jour',
          event.data?.message || 'Les indicateurs ont été actualisés'
        );
      }
      break;

    case 'data_refresh':
      toast.info('Données actualisées', 'Les données ont été mises à jour');
      break;

    case 'system_notification':
      if (event.priority === 'critical') {
        toast.error(
          event.data?.title || 'Notification système',
          event.data?.message || 'Notification système critique'
        );
      } else if (event.priority === 'high') {
        toast.warning(
          event.data?.title || 'Notification système',
          event.data?.message || 'Notification système importante'
        );
      } else {
        toast.info(
          event.data?.title || 'Notification système',
          event.data?.message || 'Notification système'
        );
      }
      break;
  }
}

/**
 * Gère l'invalidation des queries React Query
 */
function handleQueryInvalidation(
  event: RealtimeEvent,
  queryClient: ReturnType<typeof useQueryClient>
) {
  switch (event.type) {
    case 'kpi_update':
      queryClient.invalidateQueries({ queryKey: ['analytics', 'kpis'] });
      break;

    case 'alert_new':
    case 'alert_resolved':
      queryClient.invalidateQueries({ queryKey: ['analytics', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'kpis'] });
      break;

    case 'report_completed':
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reports'] });
      break;

    case 'data_refresh':
      // Invalider toutes les queries analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      break;

    case 'user_action':
      if (event.data?.action === 'bureau_created' || event.data?.action === 'bureau_updated') {
        queryClient.invalidateQueries({ queryKey: ['analytics', 'bureaux'] });
      }
      break;
  }
}

