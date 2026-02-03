/**
 * API centralisée - Point d'entrée unique pour toutes les API
 */

export * from './demands-api';

// Ici vous pourrez ajouter d'autres modules API :
// export * from './decisions-api';
// export * from './bureaux-api';
// export * from './employees-api';
// etc.

// Pilotage (BMO)
export * from './pilotage/dashboardClient';
export * from './pilotage/alertsClient';
export * from './pilotage/calendarClient';
export {
  analyticsAPI,
  type AnalyticsKpi,
  type AnalyticsReport,
  type AnalyticsAlert,
  type AnalyticsTrend,
  type BureauPerformance,
  type AnalyticsStats,
  type AnalyticsFilters,
  type ExportFormat,
  type ExportRequest as AnalyticsExportRequest,
} from './pilotage/analyticsClient';

