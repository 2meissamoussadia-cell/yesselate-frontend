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

export { EmptyState } from './EmptyState';

export { DashboardLoadingFallback } from './DashboardLoadingFallback';
export { DashboardErrorBoundary } from './DashboardErrorBoundary';

export { getTrendIcon, getTrendColor } from './getTrendIcon';
export type { TrendType } from './getTrendIcon';

export {
  Skeleton,
  KPICardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  DashboardPageSkeleton,
} from './DashboardSkeleton';

export { LastUpdateDisplay } from './LastUpdateDisplay';
export type { LastUpdateDisplayProps } from './LastUpdateDisplay';

export { MockDataIndicator, withMockDataIndicator } from './MockDataIndicator';
export type { MockDataIndicatorProps } from './MockDataIndicator';

export { DashboardDataTable } from './DashboardDataTable';
export { CardList } from './CardList';
export type { DashboardDataTableProps } from './DashboardDataTable';
export type { CardListProps } from './CardList';

export { ExportPDFButton } from './ExportPDFButton';
export type { ExportPDFButtonProps } from './ExportPDFButton';

export { BeforeAfterSlider } from './BeforeAfterSlider';
export type { BeforeAfterSliderProps } from './BeforeAfterSlider';

export { FinancesGlobalesWidget } from './FinancesGlobalesWidget';
export type { FinancesGlobalesWidgetProps } from './FinancesGlobalesWidget';

export { CashflowChart } from './CashflowChart';
export type { CashflowChartProps } from './CashflowChart';

export { TresoreriePrevisionnelleWidget } from './TresoreriePrevisionnelleWidget';
export type { TresoreriePrevisionnelleWidgetProps } from './TresoreriePrevisionnelleWidget';

export { AlertesIntelligentesWidget } from './AlertesIntelligentesWidget';
export type { AlertesIntelligentesWidgetProps } from './AlertesIntelligentesWidget';

export { HSEConformiteWidget } from './HSEConformiteWidget';
export type { HSEConformiteWidgetProps, DocConformite } from './HSEConformiteWidget';

export { CustomizableDashboard } from './CustomizableDashboard';
export type { CustomizableDashboardProps, WidgetDefinition } from './CustomizableDashboard';
