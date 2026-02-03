/**
 * API Client pour le Centre d'Alertes
 * Utilise les APIs existantes des alertes
 */

import { fetchJson } from '../pilotage/http';
import { alertsAPI } from '../pilotage/alertsClient';
import type { AlertItem, AlertFilters, AlertStats } from '../pilotage/alertsClient';

// Types spécifiques au Centre d'Alertes
export interface CentreAlertesAlert extends AlertItem {
  source: 'execution' | 'projects' | 'rh' | 'finance' | 'communication' | 'system' | 'calendar';
  modulePath?: string;
  entityId?: string;
  impact?: {
    financial?: number;
    operational?: string;
    reputation?: string;
  };
}

export interface CentreAlertesKPIs {
  critical: number;
  warnings: number;
  slaExceeded: number;
  blocked: number;
  acknowledged: number;
  resolved: number;
  avgResponseTime: number; // en heures
  avgResolutionTime: number; // en heures
}

export interface CentreAlertesFilters extends AlertFilters {
  sources?: string[];
  modules?: string[];
  assignees?: string[];
}

export interface TreatAlertPayload {
  note?: string;
  resolutionType?: string;
  userId?: string;
}

export interface EscalateAlertPayload {
  escalateTo: 'governance' | 'dg' | string;
  reason: string;
  priority?: 'high' | 'critical';
  userId?: string;
}

export interface AssignAlertPayload {
  userId: string;
  note?: string;
}

export interface AcknowledgeAlertPayload {
  note?: string;
  userId?: string;
}

// Client API
export const centreAlertesAPI = {
  /**
   * Récupérer les KPIs
   */
  getKPIs: async (filters?: CentreAlertesFilters): Promise<CentreAlertesKPIs> => {
    const response = await alertsAPI.getStats(filters);
    const stats = response?.stats ?? ({} as AlertStats);

    return {
      critical: stats.critical ?? 0,
      warnings: stats.warning ?? 0,
      slaExceeded: stats.blocked ?? 0,
      blocked: stats.blocked ?? 0,
      acknowledged: stats.acknowledged ?? 0,
      resolved: stats.resolved ?? 0,
      avgResponseTime: (stats.avgResponseTime ?? 0) / 60, // convertir minutes en heures
      avgResolutionTime: stats.avgResolutionTime ?? 0,
    };
  },

  /**
   * Récupérer les alertes avec filtres
   */
  getAlerts: async (filters?: CentreAlertesFilters) => {
    return alertsAPI.getAlerts(filters);
  },

  /**
   * Récupérer les alertes critiques
   */
  getCriticalAlerts: async (filters?: CentreAlertesFilters) => {
    return alertsAPI.getAlerts({
      ...filters,
      severity: 'critical',
      status: 'open',
    });
  },

  /**
   * Récupérer les alertes opérationnelles
   */
  getOperationalAlerts: async (filters?: CentreAlertesFilters) => {
    return alertsAPI.getAlerts({
      ...filters,
      severity: ['warning', 'info'],
    });
  },

  /**
   * Récupérer les alertes SLA
   */
  getSLAAlerts: async (filters?: CentreAlertesFilters) => {
    return alertsAPI.getAlerts({
      ...filters,
      queue: 'sla',
    });
  },

  /**
   * Récupérer les alertes financières
   */
  getFinancialAlerts: async (filters?: CentreAlertesFilters) => {
    return alertsAPI.getAlerts({
      ...filters,
      tags: ['financial', 'finance'],
    });
  },

  /**
   * Récupérer les alertes RH
   */
  getRHAlerts: async (filters?: CentreAlertesFilters) => {
    return alertsAPI.getAlerts({
      ...filters,
      tags: ['rh', 'ressources'],
    });
  },

  /**
   * Récupérer les alertes projets
   */
  getProjectsAlerts: async (filters?: CentreAlertesFilters) => {
    return alertsAPI.getAlerts({
      ...filters,
      tags: ['projet', 'chantier'],
    });
  },

  /**
   * Récupérer les alertes système
   */
  getSystemAlerts: async (filters?: CentreAlertesFilters) => {
    return alertsAPI.getAlerts({
      ...filters,
      tags: ['system', 'security', 'audit'],
    });
  },

  /**
   * Traiter une alerte
   */
  treatAlert: async (id: string, payload: TreatAlertPayload) => {
    if (payload.resolutionType) {
      return alertsAPI.resolve(id, {
        resolutionType: payload.resolutionType,
        note: payload.note || '',
        userId: payload.userId,
      });
    }
    return alertsAPI.acknowledge(id, {
      note: payload.note,
      userId: payload.userId,
    });
  },

  /**
   * Escalader une alerte
   */
  escalateAlert: async (id: string, payload: EscalateAlertPayload) => {
    return alertsAPI.escalate(id, {
      escalateTo: payload.escalateTo,
      reason: payload.reason,
      priority: payload.priority,
      userId: payload.userId,
    });
  },

  /**
   * Assigner une alerte
   */
  assignAlert: async (id: string, payload: AssignAlertPayload) => {
    return alertsAPI.assignAlert(id, payload);
  },

  /**
   * Acquitter une alerte
   */
  acknowledgeAlert: async (id: string, payload: AcknowledgeAlertPayload) => {
    return alertsAPI.acknowledge(id, payload);
  },

  /**
   * Actions en masse
   */
  bulkAction: async (ids: string[], action: string, data?: any) => {
    return fetchJson<{ success: boolean; processed: number; successful: number; failed: number }>(
      '/api/alerts/bulk',
      {
        method: 'POST',
        body: JSON.stringify({ ids, action, data }),
      }
    );
  },
};

