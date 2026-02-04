/**
 * Composants BMO — Point d'entrée principal
 * 
 * Usage:
 * import { OutlookLikeLayout, ModuleSubSidebar, ItemList } from '@/components/bmo';
 */

// ============================================
// LAYOUTS
// ============================================
export * from './layout';

// ============================================
// NAVIGATION
// ============================================
export { BmoSidebar } from './navigation/BmoSidebar';
export type { BmoSidebarProps } from './navigation/BmoSidebar';
export { BmoTopbar } from './navigation/BmoTopbar';
export type { BmoTopbarProps } from './navigation/BmoTopbar';

// ============================================
// UI COMPONENTS
// ============================================
export * from './ui';

// ============================================
// CORE COMPONENTS
// ============================================

// ItemList — Liste générique avec virtualisation
export { ItemList } from './ItemList';
export type { ItemListProps, EmptyStateConfig } from './ItemList';

// DetailPanel — Panneau de détail générique
export { DetailPanel } from './DetailPanel';
export type { DetailPanelProps } from './DetailPanel';

// ModuleSubSidebar — Sidebar dossiers/catégories type Outlook
export { ModuleSubSidebar } from './ModuleSubSidebar';
export type { ModuleSubSidebarProps } from './ModuleSubSidebar';

// BmoModulePage — Page module complète avec OutlookLikeLayout
export { BmoModulePage } from './BmoModulePage';
export type { BmoModulePageProps } from './BmoModulePage';

// ============================================
// DASHBOARD WIDGETS
// ============================================
export {
  KPICard,
  AlertesWidget,
  PlanningWidget,
  BudgetChart,
  ChantiersMap,
  ActivitesRecentes,
  TachesEnCours,
  PerformanceGauge,
  NCQualiteWidget,
  ValidationEnAttente,
} from './dashboard';

// ============================================
// INTERACTIONS
// ============================================
export { SelectionProvider, useSelection } from './interactions/SelectionManager';
export { CommandPalette } from './interactions/CommandPalette';
export { HoverCard } from './interactions/HoverCard';

// ============================================
// MODULE-SPECIFIC COMPONENTS
// ============================================

// Alerts
export { AlertListRow } from './alerts/AlertListRow';
export { AlertDetailPanel } from './alerts/AlertDetailPanel';
export { CreateAlertDialog } from './alerts/CreateAlertDialog';

// Demandes
export { DemandeListRow } from './demandes/DemandeListRow';
export { DemandeDetailPanel } from './demandes/DemandeDetailPanel';
export { CreateDemandeDialog } from './demandes/CreateDemandeDialog';

// Messages
export { MessageListRow } from './messages/MessageListRow';
export { MessageDetailPanel } from './messages/MessageDetailPanel';
export { ComposeMessageDialog } from './messages/ComposeMessageDialog';
