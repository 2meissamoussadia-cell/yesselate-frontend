// src/modules/dashboard/hooks/useAlerts.ts
// Phase P15: Moteur d'alertes - Hook React

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'ack' | 'closed';
  firstSeen: string;
  lastSeen: string;
  count: number;
  payload: Record<string, any>;
  labels?: Record<string, any>;
  // Phase P17: Champs étendus
  evidence?: Record<string, any>; // Données sources de la décision
  ackedAt?: string;
  ackedBy?: string;
  closedAt?: string;
  closedBy?: string;
}

export interface AlertStats {
  open_count: number;
  ack_count: number;
  closed_count: number;
  critical_open: number;
  warning_open: number;
  info_open: number;
}

/** Fallback côté client quand l’API alertes renvoie 5xx ou est indisponible */
const EMPTY_STATS: AlertStats = {
  open_count: 0,
  ack_count: 0,
  closed_count: 0,
  critical_open: 0,
  warning_open: 0,
  info_open: 0,
};

const EMPTY_EVENTS_RESPONSE = { ok: true, events: [] as AlertEvent[] };
const EMPTY_STATS_RESPONSE = { ok: true, stats: EMPTY_STATS };

/**
 * Appel fetch avec fallback : en cas de 5xx ou erreur réseau, retourne des données vides
 * pour que l’UI ne casse pas (ex. backend / DB indisponible en local).
 */
async function fetchAlertsWithFallback(
  url: string,
  fallback: { ok: boolean; events: AlertEvent[] } | { ok: boolean; stats: AlertStats }
): Promise<{ ok: boolean; events?: AlertEvent[]; stats?: AlertStats }> {
  try {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status >= 500) return fallback;
    throw new Error(`Alerts API error: ${res.status}`);
  } catch {
    return fallback;
  }
}

/**
 * Hook pour récupérer les alertes actives
 * Phase P15: Moteur d'alertes
 */
export function useAlerts(routeKey?: string) {
  return useQuery<{ ok: boolean; events: AlertEvent[] }>({
    queryKey: ['alerts', 'events', routeKey],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (routeKey) params.set('routeKey', routeKey);
      return fetchAlertsWithFallback(
        `/api/alerts/events?${params.toString()}`,
        EMPTY_EVENTS_RESPONSE
      ) as Promise<{ ok: boolean; events: AlertEvent[] }>;
    },
    refetchInterval: 30000, // Refresh toutes les 30s
  });
}

/**
 * Hook pour récupérer les statistiques d'alertes
 * Phase P15: Moteur d'alertes
 */
export function useAlertStats(routeKey?: string) {
  return useQuery<{ ok: boolean; stats: AlertStats }>({
    queryKey: ['alerts', 'stats', routeKey],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (routeKey) params.set('routeKey', routeKey);
      return fetchAlertsWithFallback(
        `/api/alerts/stats?${params.toString()}`,
        EMPTY_STATS_RESPONSE
      ) as Promise<{ ok: boolean; stats: AlertStats }>;
    },
    refetchInterval: 30000,
  });
}

/**
 * Hook pour récupérer les alertes ouvertes (pour notifications)
 * Phase P15: Moteur d'alertes
 */
export function useOpenAlerts(limit = 5) {
  return useQuery<{ ok: boolean; events: AlertEvent[] }>({
    queryKey: ['alerts', 'events', 'open', limit],
    queryFn: async () =>
      fetchAlertsWithFallback(
        `/api/alerts/events?status=open&limit=${limit}`,
        EMPTY_EVENTS_RESPONSE
      ) as Promise<{ ok: boolean; events: AlertEvent[] }>,
    refetchInterval: 30000, // Refresh toutes les 30s
  });
}

/**
 * Hook pour récupérer les alertes par domaine (labels.domain)
 * Phase P17: Moteur d'alertes avancé - Badges navigation
 */
export function useAlertsByDomain(domain?: string) {
  return useQuery<{ ok: boolean; events: AlertEvent[] }>({
    queryKey: ['alerts', 'events', 'domain', domain],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('status', 'open');
      if (domain) params.set('limit', '1000');
      const data = await fetchAlertsWithFallback(
        `/api/alerts/events?${params.toString()}`,
        EMPTY_EVENTS_RESPONSE
      ) as { ok: boolean; events: AlertEvent[] };
      if (domain && data.events?.length) {
        data.events = data.events.filter((event: AlertEvent) => event.labels?.domain === domain);
      }
      return data;
    },
    refetchInterval: 30000,
    enabled: true,
  });
}

/**
 * Hook pour acknowledge une alerte
 * Phase P15: Moteur d'alertes
 */
export function useAckAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/alerts/events/${eventId}/ack`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to acknowledge alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

/**
 * Hook pour fermer une alerte
 * Phase P15: Moteur d'alertes
 */
export function useCloseAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/alerts/events/${eventId}/close`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to close alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

/**
 * Hook pour snooze (reporter) une alerte
 * Phase P17: Moteur d'alertes avancé
 */
export function useSnoozeAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, durationMinutes }: { eventId: string; durationMinutes: number }) => {
      const res = await fetch(`/api/alerts/events/${eventId}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes }),
      });
      if (!res.ok) throw new Error('Failed to snooze alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
