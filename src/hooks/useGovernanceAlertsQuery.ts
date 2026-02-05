// ============================================
// Hook pour gérer les alertes avec React Query
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Alert } from '@/lib/types/alerts.types';
import { logger } from '@/lib/utils/logger';
import type { GovernanceFilters } from './useGovernanceFilters';

/**
 * Hook pour récupérer les alertes avec cache React Query
 */
export function useGovernanceAlertsQuery(filters: GovernanceFilters) {
  const queryClient = useQueryClient();

  // Query pour les alertes
  const { data: alerts, isLoading, error, refetch } = useQuery<Alert[]>({
    queryKey: ['governance', 'alerts', filters],
    queryFn: async () => {
      // Simuler un appel API (à remplacer par un vrai appel)
      // const response = await fetch(`/api/governance/alerts?${new URLSearchParams(filters as any)}`);
      // return response.json();
      
      // Pour l'instant, retourner un tableau vide (les données viennent de useGovernanceAlerts)
      return Promise.resolve([]);
    },
    staleTime: 30000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Mutation pour acquitter une alerte
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      // Simuler un appel API
      // const response = await fetch(`/api/governance/alerts/${alertId}/acknowledge`, {
      //   method: 'POST',
      // });
      // return response.json();
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      // Invalider le cache pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ['governance', 'alerts'] });
    },
    onError: (error) => {
      logger.error('Erreur lors de l\'acquittement', error instanceof Error ? error : undefined, { component: 'useGovernanceAlertsQuery' });
    },
  });

  // Mutation pour résoudre une alerte
  const resolveMutation = useMutation({
    mutationFn: async ({ alertId, note }: { alertId: string; note?: string }) => {
      // Simuler un appel API
      // const response = await fetch(`/api/governance/alerts/${alertId}/resolve`, {
      //   method: 'POST',
      //   body: JSON.stringify({ note }),
      // });
      // return response.json();
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance', 'alerts'] });
    },
    onError: (error) => {
      logger.error('Erreur lors de la résolution', error instanceof Error ? error : undefined, { component: 'useGovernanceAlertsQuery' });
    },
  });

  return {
    alerts: alerts ?? [],
    isLoading,
    error,
    refetch,
    acknowledgeAlert: acknowledgeMutation.mutate,
    isAcknowledging: acknowledgeMutation.isPending,
    resolveAlert: resolveMutation.mutate,
    isResolving: resolveMutation.isPending,
  };
}

