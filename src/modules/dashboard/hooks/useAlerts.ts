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
}

export interface AlertStats {
  open_count: number;
  ack_count: number;
  closed_count: number;
  critical_open: number;
  warning_open: number;
  info_open: number;
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
      
      const res = await fetch(`/api/alerts/events?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
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
      
      const res = await fetch(`/api/alerts/stats?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch alert stats');
      return res.json();
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
    queryFn: async () => {
      const res = await fetch(`/api/alerts/events?status=open&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch open alerts');
      return res.json();
    },
    refetchInterval: 30000, // Refresh toutes les 30s
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
