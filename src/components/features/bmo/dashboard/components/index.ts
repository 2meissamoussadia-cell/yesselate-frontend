/**
 * Export des composants réutilisables du Dashboard
 */

export { KPICard } from './KPICard';
export type { KPICardData } from './KPICard';

export { SectionTitle } from './SectionTitle';

export { TrendIndicator } from './TrendIndicator';
export type { TrendType } from './TrendIndicator';

export { DataCard } from './DataCard';

export { RiskScoreCard } from './RiskScoreCard';
export type { RiskScoreCardData, RiskImpact, RiskProbability } from './RiskScoreCard';

export { AgendaItem } from './AgendaItem';
export type { AgendaItemData, AgendaEventType, AgendaPriority } from './AgendaItem';

export { ActionItem } from './ActionItem';
export type { ActionItemData, ActionType, ActionPriority } from './ActionItem';

export { CircuitValidation } from './CircuitValidation';
export type { WorkflowStage } from './CircuitValidation';

export { KpiStatCard } from './KpiStatCard';
export type { KpiStatCardProps, KpiTrendDirection } from './KpiStatCard';
