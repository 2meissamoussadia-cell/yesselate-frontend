/**
 * React Query hooks for Alerts API
 * Gestion du cache, mutations et refetch pour les alertes
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  alertsAPI,
  type AlertItem,
  type AlertStats,
  type AlertFilters,
  type AlertsResponse,
  type TimelineEntry,
  type BulkActionRequest,
  type ExportRequest,
  type AlertQueue,
} from '../pilotage/alertsClient';

// ============================================
// QUERY KEYS
// ============================================

export const alertsKeys = {
  all: ['alerts'] as const,
  
  // Lists
  lists: () => [...alertsKeys.all, 'list'] as const,
  list: (filters?: AlertFilters) => [...alertsKeys.lists(), filters] as const,
  
  // Individual
  details: () => [...alertsKeys.all, 'detail'] as const,
  detail: (id: string) => [...alertsKeys.details(), id] as const,
  
  // Stats
  stats: () => [...alertsKeys.all, 'stats'] as const,
  statsFiltered: (filters?: AlertFilters) => [...alertsKeys.stats(), filters] as const,
  
  // Queues
  queues: () => [...alertsKeys.all, 'queue'] as const,
  queue: (queue: AlertQueue, filters?: AlertFilters) => [...alertsKeys.queues(), queue, filters] as const,
  
  // Search
  search: (query: string, filters?: AlertFilters) => [...alertsKeys.all, 'search', query, filters] as const,
  
  // Timeline
  timelines: () => [...alertsKeys.all, 'timeline'] as const,
  timeline: (params?: any) => [...alertsKeys.timelines(), params] as const,
  alertTimeline: (alertId: string) => [...alertsKeys.timelines(), alertId] as const,
  
  // Watchlist
  watchlists: () => [...alertsKeys.all, 'watchlist'] as const,
  watchlist: (userId: string) => [...alertsKeys.watchlists(), userId] as const,
  
  // Analytics
  trends: (period?: string) => [...alertsKeys.all, 'trends', period] as const,
  critical: () => [...alertsKeys.all, 'critical'] as const,
  sla: () => [...alertsKeys.all, 'sla'] as const,
  blocked: () => [...alertsKeys.all, 'blocked'] as const,
};

// ============================================
// HOOKS - QUERIES
// ============================================

/**
 * Récupérer la liste des alertes avec filtres
 */
export function useAlerts(filters?: AlertFilters, options?: Omit<UseQueryOptions<AlertsResponse>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: alertsKeys.list(filters),
    queryFn: () => alertsAPI.getAlerts(filters),
    staleTime: 30_000, // 30 secondes
    refetchInterval: 60_000, // Auto-refresh toutes les 60 secondes
    ...options,
  });
}

/**
 * Récupérer une alerte par ID
 */
export function useAlert(id: string, options?: Omit<UseQueryOptions<{ alert: AlertItem }>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: alertsKeys.detail(id),
    queryFn: () => alertsAPI.getAlertById(id),
    staleTime: 30_000,
    enabled: !!id,
    ...options,
  });
}

/**
 * Récupérer les statistiques des alertes
 */
export function useAlertStats(filters?: Omit<AlertFilters, 'page' | 'limit'>, options?: any) {
  return useQuery<{ stats: AlertStats }>({
    queryKey: alertsKeys.statsFiltered(filters),
    queryFn: () => alertsAPI.getStats(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

/**
 * Récupérer les alertes d'une file spécifique
 */
export function useAlertQueue(queue: AlertQueue, filters?: AlertFilters, options?: any) {
  return useQuery({
    queryKey: alertsKeys.queue(queue, filters),
    queryFn: () => alertsAPI.getAlertsByQueue(queue, filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

/**
 * Rechercher des alertes
 */
export function useSearchAlerts(query: string, filters?: AlertFilters, options?: any) {
  return useQuery({
    queryKey: alertsKeys.search(query, filters),
    queryFn: () => alertsAPI.searchAlerts(query, filters),
    staleTime: 30_000,
    enabled: query.length > 0,
    ...options,
  });
}

/**
 * Récupérer la timeline globale des alertes
 */
export function useAlertTimeline(params?: { days?: number; severity?: 'critical' | 'warning' | 'all' }, options?: any) {
  return useQuery({
    queryKey: alertsKeys.timeline(params),
    queryFn: () => alertsAPI.getTimeline(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

/**
 * Récupérer la timeline d'une alerte spécifique
 */
export function useAlertTimelineById(alertId: string, options?: any) {
  return useQuery({
    queryKey: alertsKeys.alertTimeline(alertId),
    queryFn: () => alertsAPI.getAlertTimeline(alertId),
    staleTime: 30_000,
    enabled: !!alertId,
    ...options,
  });
}

/**
 * Récupérer la watchlist d'un utilisateur
 */
export function useWatchlist(userId: string, options?: any) {
  return useQuery({
    queryKey: alertsKeys.watchlist(userId),
    queryFn: () => alertsAPI.getWatchlist(userId),
    staleTime: 60_000,
    enabled: !!userId,
    ...options,
  });
}

/**
 * Récupérer les tendances des alertes
 */
export function useAlertTrends(period: 'day' | 'week' | 'month' = 'week', options?: any) {
  return useQuery<{ trends: Record<string, { critical: number; warning: number; info: number; resolved: number }> }>({
    queryKey: alertsKeys.trends(period),
    queryFn: () => alertsAPI.getTrends(period),
    staleTime: 300_000, // 5 minutes
    ...options,
  });
}

/**
 * Récupérer les alertes critiques
 */
export function useCriticalAlerts(options?: any) {
  return useQuery<{ alerts: AlertItem[] }>({
    queryKey: alertsKeys.critical(),
    queryFn: () => alertsAPI.getCriticalAlerts(),
    staleTime: 15_000, // 15 secondes pour les critiques
    refetchInterval: 30_000, // Auto-refresh toutes les 30 secondes
    ...options,
  });
}

/**
 * Récupérer les alertes avec SLA dépassé
 */
export function useSLAViolations(options?: any) {
  return useQuery<{ alerts: AlertItem[]; violations?: number }>({
    queryKey: alertsKeys.sla(),
    queryFn: () => alertsAPI.getSLAViolations(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

/**
 * Récupérer les alertes bloquées
 */
export function useBlockedAlerts(options?: any) {
  return useQuery({
    queryKey: alertsKeys.blocked(),
    queryFn: () => alertsAPI.getBlockedAlerts(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    ...options,
  });
}

// ============================================
// HOOKS - MUTATIONS
// ============================================

/**
 * Acquitter une alerte
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note, userId }: { id: string; note?: string; userId?: string }) =>
      alertsAPI.acknowledge(id, { note, userId }),
    onSuccess: (data, variables) => {
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.queues() });
      
      // Mettre à jour le cache de l'alerte individuelle
      queryClient.setQueryData(
        alertsKeys.detail(variables.id),
        { alert: data.alert }
      );
      
      // Invalider la timeline
      queryClient.invalidateQueries({ queryKey: alertsKeys.timelines() });
    },
  });
}

/**
 * Résoudre une alerte
 */
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      resolutionType,
      note,
      proof,
      userId,
    }: {
      id: string;
      resolutionType: string;
      note: string;
      proof?: string;
      userId?: string;
    }) => alertsAPI.resolve(id, { resolutionType, note, proof, userId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.queues() });
      queryClient.setQueryData(alertsKeys.detail(variables.id), { alert: data.alert });
      queryClient.invalidateQueries({ queryKey: alertsKeys.timelines() });
    },
  });
}

/**
 * Escalader une alerte
 */
export function useEscalateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      escalateTo,
      reason,
      priority,
      userId,
    }: {
      id: string;
      escalateTo: string;
      reason: string;
      priority?: string;
      userId?: string;
    }) => alertsAPI.escalate(id, { escalateTo, reason, priority, userId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.queues() });
      queryClient.setQueryData(alertsKeys.detail(variables.id), { alert: data.alert });
      queryClient.invalidateQueries({ queryKey: alertsKeys.timelines() });
    },
  });
}

/**
 * Assigner une alerte
 */
export function useAssignAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, note }: { id: string; userId: string; note?: string }) =>
      alertsAPI.assignAlert(id, { userId, note }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.queues() });
      queryClient.setQueryData(alertsKeys.detail(variables.id), { alert: data.alert });
    },
  });
}

/**
 * Mettre à jour une alerte
 */
export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlertItem> }) =>
      alertsAPI.updateAlert(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.setQueryData(alertsKeys.detail(variables.id), { alert: response.alert });
    },
  });
}

/**
 * Supprimer une alerte
 */
export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsAPI.deleteAlert(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.queues() });
      queryClient.removeQueries({ queryKey: alertsKeys.detail(id) });
    },
  });
}

/**
 * Ajouter un commentaire
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment, userId }: { id: string; comment: string; userId: string }) =>
      alertsAPI.addComment(id, { comment, userId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: alertsKeys.alertTimeline(variables.id) });
    },
  });
}

/**
 * Actions en masse
 */
export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkActionRequest) => alertsAPI.bulkAction(request),
    onSuccess: () => {
      // Invalider toutes les listes et stats
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.queues() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.timelines() });
    },
  });
}

/**
 * Exporter des alertes
 */
export function useExportAlerts() {
  return useMutation({
    mutationFn: (request: ExportRequest) => alertsAPI.exportAlerts(request),
  });
}

/**
 * Ajouter à la watchlist
 */
export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, userId }: { alertId: string; userId: string }) =>
      alertsAPI.addToWatchlist(alertId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.watchlist(variables.userId) });
      queryClient.invalidateQueries({ queryKey: alertsKeys.detail(variables.alertId) });
    },
  });
}

/**
 * Retirer de la watchlist
 */
export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, userId }: { alertId: string; userId: string }) =>
      alertsAPI.removeFromWatchlist(alertId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: alertsKeys.watchlist(variables.userId) });
      queryClient.invalidateQueries({ queryKey: alertsKeys.detail(variables.alertId) });
    },
  });
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook combiné pour les stats + alertes critiques
 */
export function useAlertsDashboard() {
  const stats = useAlertStats();
  const critical = useCriticalAlerts();
  const sla = useSLAViolations();
  const trends = useAlertTrends('week');

  return {
    stats: stats.data?.stats,
    criticalAlerts: critical.data?.alerts,
    slaViolations: sla.data?.alerts,
    trends: trends.data?.trends,
    isLoading: stats.isLoading || critical.isLoading || sla.isLoading || trends.isLoading,
    error: stats.error || critical.error || sla.error || trends.error,
    refetch: () => {
      stats.refetch();
      critical.refetch();
      sla.refetch();
      trends.refetch();
    },
  };
}

