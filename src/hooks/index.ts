/**
 * Hooks API Délégations - Exports
 * ================================
 * 
 * Point d'entrée centralisé pour tous les hooks API délégations
 */

// Hooks de lecture (queries)
export {
  useDelegations,
  useDelegationStats,
  useDelegationAlerts,
  useDelegationInsights,
} from './useDelegationAPI';

export type {
  Delegation,
  DelegationEvent,
  DelegationStats,
  DelegationAlert,
  AlertsResponse,
  DelegationInsights,
  UseDelegationsOptions,
  UseDelegationsResult,
  UseStatsResult,
  UseAlertsResult,
  UseInsightsResult,
} from './useDelegationAPI';

// Hooks de mutation (actions)
export {
  useCreateDelegation,
  useUpdateDelegation,
  useRevokeDelegation,
  useSuspendDelegation,
  useExtendDelegation,
  useBulkDelegationAction,
} from './useDelegationMutations';

export type {
  CreateDelegationData,
  UpdateDelegationData,
  UseMutationResult,
} from './useDelegationMutations';

export { useBulkOperationProgress } from './useBulkOperationProgress';
export type { BulkOperationProgress } from './useBulkOperationProgress';
