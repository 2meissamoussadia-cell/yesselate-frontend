import { fetchJson } from './http';

// ============================================
// TYPES
// ============================================

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'escalated' | 'closed';
export type AlertQueue = 'critical' | 'warning' | 'sla' | 'blocked' | 'acknowledged' | 'resolved' | 'info';

export interface AlertItem {
  id: string;
  type: AlertSeverity;
  title: string;
  description?: string;
  source?: string;
  createdAt: string;
  updatedAt?: string;
  status: AlertStatus;
  priority?: number;
  assignedTo?: string;
  queue?: AlertQueue;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  success: number;
  acknowledged: number;
  resolved: number;
  escalated: number;
  blocked: number;
  avgResponseTime: number; // en minutes
  avgResolutionTime: number; // en heures
  slaCompliance: number; // pourcentage
  byQueue: Record<AlertQueue, number>;
  byStatus: Record<AlertStatus, number>;
}

export interface AlertFilters {
  status?: AlertStatus | AlertStatus[];
  severity?: AlertSeverity | AlertSeverity[];
  queue?: AlertQueue;
  assignedTo?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'status' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface AlertsResponse {
  alerts: AlertItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TimelineEntry {
  id: string;
  alertId: string;
  type: 'created' | 'acknowledged' | 'resolved' | 'escalated' | 'assigned' | 'updated' | 'commented';
  userId: string;
  userName?: string;
  timestamp: string;
  data?: Record<string, any>;
  note?: string;
}

export interface BulkActionRequest {
  ids: string[];
  action: 'acknowledge' | 'resolve' | 'escalate' | 'delete' | 'assign';
  data?: Record<string, any>;
}

export interface ExportRequest {
  filters?: AlertFilters;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeTimeline?: boolean;
}

// ============================================
// API CLIENT
// ============================================

export const alertsAPI = {
  // ===== LECTURE =====
  
  /**
   * Récupérer la liste des alertes avec filtres et pagination
   */
  getAlerts: (filters?: AlertFilters) =>
    fetchJson<AlertsResponse>('/api/alerts', {
      method: 'GET',
      params: filters as Record<string, string | string[] | undefined>,
    }),

  /**
   * Récupérer une alerte par ID
   */
  getAlertById: (id: string) =>
    fetchJson<{ alert: AlertItem }>(`/api/alerts/${encodeURIComponent(id)}`),

  /**
   * Récupérer les statistiques globales des alertes
   */
  getStats: (filters?: Omit<AlertFilters, 'page' | 'limit'>) =>
    fetchJson<{ stats: AlertStats }>('/api/alerts/stats', {
      method: 'GET',
      params: filters as Record<string, string | string[] | undefined>,
    }),

  /**
   * Récupérer les alertes d'une file spécifique
   */
  getAlertsByQueue: (queue: AlertQueue, filters?: AlertFilters) =>
    fetchJson<AlertsResponse>(`/api/alerts/queue/${queue}`, {
      method: 'GET',
      params: filters as Record<string, string | string[] | undefined>,
    }),

  /**
   * Recherche full-text dans les alertes
   */
  searchAlerts: (query: string, filters?: AlertFilters) =>
    fetchJson<AlertsResponse>('/api/alerts/search', {
      method: 'GET',
      params: { q: query, ...filters } as unknown as Record<string, string | string[] | undefined>,
    }),

  /**
   * Récupérer la timeline d'une alerte
   */
  getTimeline: (params?: { days?: number; severity?: 'critical' | 'warning' | 'all' }) => {
    const sp = new URLSearchParams();
    if (typeof params?.days === 'number') sp.set('days', String(params.days));
    if (params?.severity) sp.set('severity', params.severity);
    const qs = sp.toString();
    return fetchJson<{ entries: TimelineEntry[] }>(`/api/alerts/timeline${qs ? `?${qs}` : ''}`);
  },

  /**
   * Récupérer la timeline d'une alerte spécifique
   */
  getAlertTimeline: (alertId: string) =>
    fetchJson<{ timeline: TimelineEntry[] }>(`/api/alerts/${encodeURIComponent(alertId)}/timeline`),

  // ===== ACTIONS INDIVIDUELLES =====

  /**
   * Acquitter une alerte
   */
  acknowledge: (id: string, payload: { note?: string; userId?: string }) =>
    fetchJson<{ success: boolean; alert: AlertItem; message?: string }>(
      `/api/alerts/${encodeURIComponent(id)}/acknowledge`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  /**
   * Résoudre une alerte
   */
  resolve: (
    id: string,
    payload: { resolutionType: string; note: string; proof?: string; userId?: string }
  ) =>
    fetchJson<{ success: boolean; alert: AlertItem; message?: string }>(
      `/api/alerts/${encodeURIComponent(id)}/resolve`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  /**
   * Escalader une alerte
   */
  escalate: (
    id: string,
    payload: { escalateTo: string; reason: string; priority?: string; userId?: string }
  ) =>
    fetchJson<{ success: boolean; alert: AlertItem; notification?: any; message?: string }>(
      `/api/alerts/${encodeURIComponent(id)}/escalate`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  /**
   * Assigner une alerte à un utilisateur
   */
  assignAlert: (id: string, payload: { userId: string; note?: string }) =>
    fetchJson<{ success: boolean; alert: AlertItem }>(
      `/api/alerts/${encodeURIComponent(id)}/assign`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  /**
   * Mettre à jour une alerte
   */
  updateAlert: (id: string, data: Partial<AlertItem>) =>
    fetchJson<{ success: boolean; alert: AlertItem }>(
      `/api/alerts/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  /**
   * Supprimer une alerte (soft delete)
   */
  deleteAlert: (id: string) =>
    fetchJson<{ success: boolean }>(
      `/api/alerts/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    ),

  /**
   * Ajouter un commentaire à une alerte
   */
  addComment: (id: string, payload: { comment: string; userId: string }) =>
    fetchJson<{ success: boolean; comment: any }>(
      `/api/alerts/${encodeURIComponent(id)}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  // ===== ACTIONS EN MASSE =====

  /**
   * Effectuer une action sur plusieurs alertes
   */
  bulkAction: (request: BulkActionRequest) =>
    fetchJson<{ success: boolean; processed: number; errors?: any[] }>(
      '/api/alerts/bulk',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    ),

  /**
   * Acquitter plusieurs alertes en masse
   */
  bulkAcknowledge: (ids: string[], note?: string, userId?: string) =>
    alertsAPI.bulkAction({
      ids,
      action: 'acknowledge',
      data: { note, userId },
    }),

  /**
   * Résoudre plusieurs alertes en masse
   */
  bulkResolve: (ids: string[], resolutionType: string, note: string, userId?: string) =>
    alertsAPI.bulkAction({
      ids,
      action: 'resolve',
      data: { resolutionType, note, userId },
    }),

  /**
   * Assigner plusieurs alertes en masse
   */
  bulkAssign: (ids: string[], userId: string) =>
    alertsAPI.bulkAction({
      ids,
      action: 'assign',
      data: { userId },
    }),

  // ===== EXPORTS =====

  /**
   * Exporter les alertes dans différents formats
   */
  exportAlerts: (request: ExportRequest) =>
    fetchJson<{ url: string; filename: string; expiresAt: string }>(
      '/api/alerts/export',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    ),

  // ===== WATCHLIST =====

  /**
   * Ajouter une alerte à la watchlist
   */
  addToWatchlist: (alertId: string, userId: string) =>
    fetchJson<{ success: boolean }>(
      `/api/alerts/${encodeURIComponent(alertId)}/watch`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    ),

  /**
   * Retirer une alerte de la watchlist
   */
  removeFromWatchlist: (alertId: string, userId: string) =>
    fetchJson<{ success: boolean }>(
      `/api/alerts/${encodeURIComponent(alertId)}/watch`,
      {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      }
    ),

  /**
   * Récupérer les alertes watchées par un utilisateur
   */
  getWatchlist: (userId: string) =>
    fetchJson<{ alerts: AlertItem[] }>(
      `/api/alerts/watchlist/${encodeURIComponent(userId)}`
    ),

  // ===== ANALYTICS =====

  /**
   * Récupérer les tendances des alertes
   */
  getTrends: (period: 'day' | 'week' | 'month' = 'week') =>
    fetchJson<{
      trends: Array<{
        date: string;
        critical: number;
        warning: number;
        info: number;
        resolved: number;
      }>;
    }>('/api/alerts/trends', {
      method: 'GET',
      params: { period },
    }),

  /**
   * Récupérer les alertes critiques en temps réel
   */
  getCriticalAlerts: () =>
    fetchJson<{ alerts: AlertItem[] }>('/api/alerts/critical'),

  /**
   * Récupérer les alertes avec SLA dépassé
   */
  getSLAViolations: () =>
    fetchJson<{ alerts: AlertItem[]; violations: number }>('/api/alerts/sla'),

  /**
   * Récupérer les alertes bloquées
   */
  getBlockedAlerts: () =>
    fetchJson<{ alerts: AlertItem[]; reasons: Record<string, number> }>('/api/alerts/blocked'),
};
