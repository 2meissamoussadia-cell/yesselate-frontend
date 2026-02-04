// ============================================
// Export centralisé des stores Zustand
// ============================================

// === Stores génériques (factories) ===
export { createGenericWorkspaceStore } from './createGenericWorkspaceStore';
export type {
  GenericTab,
  GenericFilter,
  WorkspaceStoreConfig,
  GenericWorkspaceState,
} from './createGenericWorkspaceStore';

export { createGenericCommandCenterStore } from './createGenericCommandCenterStore';
export type {
  NavigationState,
  ModalState,
  KPIConfig,
  SavedFilter,
  CommandCenterStoreConfig,
  GenericCommandCenterState,
} from './createGenericCommandCenterStore';

// === Stores applicatifs ===
export { useAppStore } from './app-store';
export { useBMOStore } from './bmo-store';
export { usePageMetaStore } from './navigation-store';
// Alias pour compatibilité avec les anciens imports
export { usePageMetaStore as useNavigationStore } from './navigation-store';
export { useWorkspaceStore } from './workspaceStore';
export type { WorkspaceTab, WorkspaceTabType } from './workspaceStore';
export { useValidationBCWorkspaceStore } from './validationBCWorkspaceStore';
export type { ValidationTab, ValidationTabType } from './validationBCWorkspaceStore';
export { useBlockedWorkspaceStore } from './blockedWorkspaceStore';
export type { BlockedTab, BlockedTabType, BlockedUIState, BlockedStats, BlockedDecisionEntry } from './blockedWorkspaceStore';
export { useDashboardPermissionsStore } from './dashboardPermissionsStore';
export type { UserPermissions } from './dashboardPermissionsStore';
export { useCockpitWsStore } from './cockpitWsStore';
export type { CockpitWsMessage } from './cockpitWsStore';
export { useSearchGlobalStore, useRecentSearches } from './searchGlobalStore';
export type { RecentSearchEntry } from './searchGlobalStore';