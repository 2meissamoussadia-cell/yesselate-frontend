/**
 * UI BMO — CommandBar, QuickActionsBar, FilterBar, SidebarFolders, StatusBadge (layout type Outlook).
 */

export { CommandBar } from './CommandBar';
export type { CommandBarProps, CommandBarItem } from './CommandBar';
export { QuickActionsBar } from './QuickActionsBar';
export type { QuickActionsBarProps, QuickActionItem } from './QuickActionsBar';
export { FilterBar } from './FilterBar';
export type { FilterBarProps, ViewTab, QuickFilterConfig, SortOption } from './FilterBar';
export { QuickActionsBarConfig } from './QuickActionsBarConfig';
export type { QuickActionConfig, QuickActionsPrimaryConfig } from './QuickActionsBarConfig';
export { SidebarFolders } from './SidebarFolders';
export type { SidebarFoldersProps } from './SidebarFolders';
// StatusBadge — Badges WCAG 2.1 conformes
export { StatusBadge, CategoryBadge, CounterBadge, categoryBadgeVariants } from './StatusBadge';
export type { StatusBadgeProps, CategoryKey } from './StatusBadge';
// ListItem — Ligne de liste générique avec hover Outlook
export { ListItem, ListItemContent } from './ListItem';
export type { ListItemProps, ListItemContentProps, QuickAction } from './ListItem';
// TimeAgo — Affichage de dates relatives avec tooltip
export { TimeAgo, DeadlineBadge } from './TimeAgo';
export type { TimeAgoProps } from './TimeAgo';
// ReferenceNumber — Numéros de référence professionnels
export { ReferenceNumber, ModuleReference, MODULE_PREFIXES } from './ReferenceNumber';
export type { ReferenceNumberProps, ModulePrefix } from './ReferenceNumber';
// LoadingStates — Skeletons et états de chargement
export {
  Skeleton,
  ListItemSkeleton,
  ListSkeleton,
  DetailPanelSkeleton,
  SidebarSkeleton,
  InlineLoader,
  PageLoader,
  LoadingOverlay,
} from './LoadingStates';
// PriorityIndicator — Indicateurs de priorité SVG (remplace emojis)
export { 
  PriorityIndicator, 
  PriorityDot, 
  PriorityBadge,
  numericToPriority,
  stringToPriority,
} from './PriorityIndicator';
export type { PriorityIndicatorProps, PriorityLevel } from './PriorityIndicator';
// AlertItem — Composant standardisé pour alertes
export { AlertItem, AlertItemSkeleton } from './AlertItem';
export type { AlertItemProps } from './AlertItem';
// TabBadge — Badges de comptage WCAG pour onglets
export { TabBadge, TabWithBadge, TabBar } from './TabBadge';
export type { TabBadgeProps, TabWithBadgeProps, TabBarProps } from './TabBadge';
// ActionButton — Bouton standardisé avec variantes
export {
  ActionButton,
  IconButton,
  ButtonGroup,
  NewButton,
  SaveButton,
  CancelButton,
  DeleteButton,
} from './ActionButton';
export type { ActionButtonProps, IconButtonProps } from './ActionButton';
// ReadingPane — Panneau de lecture enrichi
export { ReadingPane, EmptyReadingPane, ReadingPaneSection } from './ReadingPane';
export type { ReadingPaneProps } from './ReadingPane';
// MobileNavigation — Navigation bottom bar mobile
export { MobileNavigation, MobileHeader, MobilePageLayout } from './MobileNavigation';
export type { MobileNavItem, MobileNavigationProps, MobileHeaderProps } from './MobileNavigation';
// EmptyStates — États vides enrichis
export { 
  EmptyState, 
  NoSearchResults, 
  ErrorState, 
  NoPermissionState, 
  AllDoneState,
} from './EmptyStates';
export type { EmptyStateProps, EmptyStateType } from './EmptyStates';
// TruncateWithTooltip — Texte tronqué avec tooltip automatique
export { 
  TruncateWithTooltip, 
  TruncatedTitle, 
  TruncatedText, 
  TruncatedDescription,
  useIsTruncated,
} from './TruncateWithTooltip';
export type { TruncateWithTooltipProps } from './TruncateWithTooltip';
