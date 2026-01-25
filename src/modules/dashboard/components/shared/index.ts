/**
 * Export des composants partagés du Dashboard
 */

export { DashboardPanel } from './DashboardPanel';
export type { DashboardPanelProps } from './DashboardPanel';

export { DashboardPageShell } from './DashboardPageShell';
export type { DashboardPageShellProps } from './DashboardPageShell';

export { DashboardShell } from './DashboardShell';

export { 
  DashboardPageLayout,
  DashboardSection,
  DashboardGrid,
} from './DashboardPageLayout';
export type { 
  DashboardPageLayoutProps,
  DashboardSectionProps,
  DashboardGridProps,
} from './DashboardPageLayout';

export { KPICard } from './KPICard';
export type { KPICardData, KPICardProps } from './KPICard';

export { SparklineChart } from './SparklineChart';

export { SegmentedTabs } from './SegmentedTabs';

export { getTrendIcon, getTrendColor } from './getTrendIcon';
export type { TrendType } from './getTrendIcon';
