/**
 * Barrel des vues du Dashboard
 *
 * @module dashboard/components/views
 * @description Centralise tous les exports des pages/vues du module dashboard.
 * Utilisé par le registry (dashboardRegistry.tsx) pour le chargement dynamique
 * et par les routeurs pour le rendu des écrans.
 *
 * Organisation : regroupement par domaine métier, ordre alphabétique dans chaque section.
 * Pour ajouter une vue : créer le fichier *Page.tsx puis ajouter l’export dans la section adaptée.
 */

// ─── Core & accueil ────────────────────────────────────────────────────────
export { DashboardAccueil3P } from './DashboardAccueil3P';
export { CockpitDGPage } from './CockpitDGPage';
export { DashboardDGLayout } from './DashboardDGLayout';
export { DashboardHome } from './DashboardHome';
export { AccessDeniedView } from './AccessDeniedView';
export { EmptyState } from './EmptyState';
export { KpiOverviewPage } from './KpiOverviewPage';
export { OverviewPage } from './OverviewPage';
export { SummaryPage } from './SummaryPage';
export { SummaryDashboardPage } from './SummaryDashboardPage';
export { SummaryPointsPage } from './SummaryPointsPage';

// ─── Achats ─────────────────────────────────────────────────────────────────
export { AchatsFournisseursPage } from './AchatsFournisseursPage';
export { AchatsKpiPage } from './AchatsKpiPage';
export { AchatsOpenOrdersPage } from './AchatsOpenOrdersPage';
export { AchatsOverviewPage } from './AchatsOverviewPage';

// ─── Actions ────────────────────────────────────────────────────────────────
export { ActionsAssignedEquipePage } from './ActionsAssignedEquipePage';
export { ActionsAssignedMoiPage } from './ActionsAssignedMoiPage';
export { ActionsAssignedNonAssigneesPage } from './ActionsAssignedNonAssigneesPage';
export { ActionsBlockedAnalysePage } from './ActionsBlockedAnalysePage';
export { ActionsBlockedBlocagesPage } from './ActionsBlockedBlocagesPage';
export { ActionsBlockedEscaladesPage } from './ActionsBlockedEscaladesPage';
export { ActionsHistoryAnciennesPage } from './ActionsHistoryAnciennesPage';
export { ActionsHistoryArchiveesPage } from './ActionsHistoryArchiveesPage';
export { ActionsHistoryRecentPage } from './ActionsHistoryRecentPage';
export { ActionsInboxAujourdhuiPage } from './ActionsInboxAujourdhuiPage';
export { ActionsInboxPersonnaliseesPage } from './ActionsInboxPersonnaliseesPage';
export { ActionsInboxSemainePage } from './ActionsInboxSemainePage';
export { ActionsInboxUrgentesPage } from './ActionsInboxUrgentesPage';
export { ActionsPriorityCritiquePage } from './ActionsPriorityCritiquePage';
export { ActionsPriorityHautePage } from './ActionsPriorityHautePage';
export { ActionsPriorityMoyennePage } from './ActionsPriorityMoyennePage';
export { ActionsTypeArbitragesPage } from './ActionsTypeArbitragesPage';
export { ActionsTypeAutresPage } from './ActionsTypeAutresPage';
export { ActionsTypeBcPage } from './ActionsTypeBcPage';
export { ActionsTypeContratsPage } from './ActionsTypeContratsPage';
export { ActionsTypePaiementsPage } from './ActionsTypePaiementsPage';

// ─── Activity ───────────────────────────────────────────────────────────────
export { ActivityNotificationsPage } from './ActivityNotificationsPage';
export { ActivityTimelinePage } from './ActivityTimelinePage';
export { ConversationsHistoryPage } from './ConversationsHistoryPage';

// ─── Admin ──────────────────────────────────────────────────────────────────
export { AdminLogsActivitePage } from './AdminLogsActivitePage';
export { AdminLogsSystemePage } from './AdminLogsSystemePage';
export { AdminPermissionsAccesPage } from './AdminPermissionsAccesPage';
export { AdminPermissionsRolesPage } from './AdminPermissionsRolesPage';
export { AdminSettingsDashboardPage } from './AdminSettingsDashboardPage';
export { AdminSettingsKpisPage } from './AdminSettingsKpisPage';
export { AdminSettingsNotificationsPage } from './AdminSettingsNotificationsPage';
export { AdminUsersListePage } from './AdminUsersListePage';
export { AdminUsersPermissionsPage } from './AdminUsersPermissionsPage';

// ─── Alerts ───────────────────────────────────────────────────────────────
export { AlertsActivesPage } from './AlertsActivesPage';
export { AlertsUrgentesPage } from './AlertsUrgentesPage';

// ─── Budget ────────────────────────────────────────────────────────────────
export { BudgetAnalysePage } from './BudgetAnalysePage';
export { BudgetConsommationPage } from './BudgetConsommationPage';
export { BudgetKpiPage } from './BudgetKpiPage';
export { FinancesOverviewPage } from './FinancesOverviewPage';
export { BudgetPrevisionsPage } from './BudgetPrevisionsPage';
export { BudgetRestantPage } from './BudgetRestantPage';

// ─── Bureaux & conducteur ────────────────────────────────────────────────────
export { BureauxPage } from './BureauxPage';
export { ConducteurTravauxPage } from './ConducteurTravauxPage';
export { DirecteurTravauxPage } from './DirecteurTravauxPage';

// ─── Chantiers (portefeuille DG) ─────────────────────────────────────────────
export { PortefeuilleChantiersPage } from './PortefeuilleChantiersPage';

// ─── Comparison ──────────────────────────────────────────────────────────────
export { ComparisonBenchmarkingPage } from './ComparisonBenchmarkingPage';
export { ComparisonBureauxPage } from './ComparisonBureauxPage';
export { ComparisonPeriodePage } from './ComparisonPeriodePage';
export { ComparisonProjetsPage } from './ComparisonProjetsPage';

// ─── Compliance ──────────────────────────────────────────────────────────────
export { ComplianceBacklogPage } from './ComplianceBacklogPage';
export { ComplianceDashboardPage } from './ComplianceDashboardPage';
export { ComplianceDocumentsPage } from './ComplianceDocumentsPage';
export { ComplianceLotsPage } from './ComplianceLotsPage';

// ─── Decisions ───────────────────────────────────────────────────────────────
export { DecisionsAuditConformitePage } from './DecisionsAuditConformitePage';
export { DecisionsAuditRapportsPage } from './DecisionsAuditRapportsPage';
export { DecisionsAuditTracesPage } from './DecisionsAuditTracesPage';
export { DecisionsExecutedAnciennesPage } from './DecisionsExecutedAnciennesPage';
export { DecisionsExecutedParTypePage } from './DecisionsExecutedParTypePage';
export { DecisionsExecutedRecentesPage } from './DecisionsExecutedRecentesPage';
export { DecisionsModelesArbitragePage } from './DecisionsModelesArbitragePage';
export { DecisionsModelesDelegationPage } from './DecisionsModelesDelegationPage';
export { DecisionsModelesSubstitutionPage } from './DecisionsModelesSubstitutionPage';
export { DecisionsPendingNormalesPage } from './DecisionsPendingNormalesPage';
export { DecisionsPendingPlanifieesPage } from './DecisionsPendingPlanifieesPage';
export { DecisionsPendingUrgentesPage } from './DecisionsPendingUrgentesPage';
export { DecisionsTimelineChronologiquePage } from './DecisionsTimelineChronologiquePage';
export { DecisionsTimelineParAuteurPage } from './DecisionsTimelineParAuteurPage';
export { DecisionsTimelineParTypePage } from './DecisionsTimelineParTypePage';

// ─── Delays ─────────────────────────────────────────────────────────────────
export { DelaysAnalyseCausesPage } from './DelaysAnalyseCausesPage';
export { DelaysCritiquesPage } from './DelaysCritiquesPage';
export { DelaysMoyensPage } from './DelaysMoyensPage';

// ─── Demandes & KPI ───────────────────────────────────────────────────────
export { DemandesKpiPage } from './DemandesKpiPage';
export { HighlightsKpiPage } from './HighlightsKpiPage';
export { ProjetKpiPage } from './ProjetKpiPage';

// ─── Materiel ───────────────────────────────────────────────────────────────
export { MaterielKpiPage } from './MaterielKpiPage';
export { MaterielOverviewPage } from './MaterielOverviewPage';

// ─── Performance ────────────────────────────────────────────────────────────
export { PerformanceBudgetPage } from './PerformanceBudgetPage';
export { PerformanceBureauxAllPage } from './PerformanceBureauxAllPage';
export { PerformanceBureauxBcgPage } from './PerformanceBureauxBcgPage';
export { PerformanceBureauxBctPage } from './PerformanceBureauxBctPage';
export { PerformanceBureauxBexPage } from './PerformanceBureauxBexPage';
export { PerformanceBureauxBfPage } from './PerformanceBureauxBfPage';
export { PerformanceBureauxBjaPage } from './PerformanceBureauxBjaPage';
export { PerformanceBureauxBjPage } from './PerformanceBureauxBjPage';
export { PerformanceBureauxBmoPage } from './PerformanceBureauxBmoPage';
export { PerformanceBureauxBopPage } from './PerformanceBureauxBopPage';
export { PerformanceBureauxBplPage } from './PerformanceBureauxBplPage';
export { PerformanceBureauxBrcPage } from './PerformanceBureauxBrcPage';
export { PerformanceBureauxComparaisonPage } from './PerformanceBureauxComparaisonPage';
export { PerformanceDemandesPage } from './PerformanceDemandesPage';
export { PerformanceProjetsPage } from './PerformanceProjetsPage';
export { PerformanceSynthesePage } from './PerformanceSynthesePage';

// ─── Realtime ───────────────────────────────────────────────────────────────
export { RealtimeAlertsActivesPage } from './RealtimeAlertsActivesPage';
export { RealtimeAlertsHistoriquePage } from './RealtimeAlertsHistoriquePage';
export { RealtimeAlertsResoluesPage } from './RealtimeAlertsResoluesPage';
export { RealtimeMonitoringMetriquesPage } from './RealtimeMonitoringMetriquesPage';
export { RealtimeMonitoringPerformancePage } from './RealtimeMonitoringPerformancePage';
export { RealtimeMonitoringVueGlobalePage } from './RealtimeMonitoringVueGlobalePage';
export { RealtimeNotificationsNonLuesPage } from './RealtimeNotificationsNonLuesPage';
export { RealtimeNotificationsPreferencesPage } from './RealtimeNotificationsPreferencesPage';
export { RealtimeNotificationsToutesPage } from './RealtimeNotificationsToutesPage';
export { RealtimeSyncConfigurationPage } from './RealtimeSyncConfigurationPage';
export { RealtimeSyncEtatPage } from './RealtimeSyncEtatPage';
export { RealtimeSyncHistoriquePage } from './RealtimeSyncHistoriquePage';

// ─── Risks ─────────────────────────────────────────────────────────────────
export { RisksActionsCorrectivesEnCoursPage } from './RisksActionsCorrectivesEnCoursPage';
export { RisksActionsCorrectivesPlanifieesPage } from './RisksActionsCorrectivesPlanifieesPage';
export { RisksAnalyseCausesRacinesPage } from './RisksAnalyseCausesRacinesPage';
export { RisksAnalysePrevisionsPage } from './RisksAnalysePrevisionsPage';
export { RisksAnalyseTendancesPage } from './RisksAnalyseTendancesPage';
export { RisksCriticalAlertesPage } from './RisksCriticalAlertesPage';
export { RisksCriticalRisquesPage } from './RisksCriticalRisquesPage';
export { RisksTypeAlertesSystemePage } from './RisksTypeAlertesSystemePage';
export { RisksTypeBlocagesPage } from './RisksTypeBlocagesPage';
export { RisksTypeContratsExpiresPage } from './RisksTypeContratsExpiresPage';
export { RisksTypePaiementsRetardPage } from './RisksTypePaiementsRetardPage';
export { RisksWarningsFaiblesPage } from './RisksWarningsFaiblesPage';
export { RisksWarningsMoyensPage } from './RisksWarningsMoyensPage';

// ─── Stocks ────────────────────────────────────────────────────────────────
export { StocksKpiPage } from './StocksKpiPage';
export { StocksOverviewPage } from './StocksOverviewPage';
export { StocksTrendsPage } from './StocksTrendsPage';

// ─── Tendances & trends ──────────────────────────────────────────────────────
export { TendancesPage } from './TendancesPage';
export { TrendsAnnuellesPage } from './TrendsAnnuellesPage';
export { TrendsMensuellesPage } from './TrendsMensuellesPage';
export { TrendsTrimestriellesPage } from './TrendsTrimestriellesPage';

// ─── Validations ────────────────────────────────────────────────────────────
export { ValidationsCircuitPage } from './ValidationsCircuitPage';
export { ValidationsEnAttentePage } from './ValidationsEnAttentePage';
export { ValidationsGlobalPage } from './ValidationsGlobalPage';
export { ValidationsRejeteesPage } from './ValidationsRejeteesPage';
export { ValidationsValideesPage } from './ValidationsValideesPage';
export { ValidationPaiementsPage } from './ValidationPaiementsPage';
