// ============================================
// Export centralisé des stores Zustand
// ============================================

export { useAppStore } from './app-store';
export { useBMOStore } from './bmo-store';
export { useNavigationStore } from './navigation-store';
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