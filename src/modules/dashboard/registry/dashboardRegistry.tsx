/**
 * Registry centralisé pour les vues du Dashboard
 * Système de chargement de données et rendu conditionnel basé sur la navigation
 */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FileText, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardAdvancedView } from '../components/DashboardAdvancedView';
import { formatMoneyEUR } from '../utils/colorMapping';
import type {
  DashboardMainCategory,
} from '../types/dashboardNavigationTypes';
import { navToKey } from '../types/dashboard';
import type {
  NavKey,
  ViewEntry,
  Loader,
  LoaderResult,
} from '../types/dashboard';
import type {
  DashboardViewData,
  OverviewSummaryDashboardData,
  OverviewSummaryPointsData,
  OverviewKpisHighlightsData,
  KpisProjetsData,
  KpisDemandesData,
  KpisBudgetData,
  KpisAchatsData,
  ReportingOverviewData,
  ReportingTrendsMonthlyData,
  ReportingByBureauData,
  ReportingByChantierData,
} from '../types/dashboardDataTypes';
import type { DashboardRegistry } from '../types/dashboardRegistryTypes';

// Import des loaders API (Phase 2)
import {
  loadOverviewSummaryDashboardApi,
  loadOverviewSummaryPointsApi,
  loadOverviewKpisHighlightsApi,
  loadKpisProjetsApi,
  loadKpisDemandesApi,
  loadKpisBudgetApi,
  loadAlertsActivesApi,
  loadAlertsUrgentesApi,
  loadActionsInboxUrgentesApi,
  loadActionsInboxAujourdhuiApi,
  loadActionsInboxSemaineApi,
  loadActionsInboxPersonnaliseesApi,
  loadValidationsEnAttenteApi,
  loadValidationsValideesApi,
  loadValidationsRejeteesApi,
  loadValidationsCircuitApi,
  loadBudgetConsommationApi,
  loadBudgetRestantApi,
  loadBudgetPrevisionsApi,
  loadBudgetAnalyseApi,
  loadDelaysCritiquesApi,
  loadDelaysMoyensApi,
  loadDelaysAnalyseCausesApi,
  loadPerformanceSyntheseApi,
  loadPerformanceProjetsApi,
  loadPerformanceDemandesApi,
  loadPerformanceBudgetApi,
  loadTrendsMensuellesApi,
  loadTrendsTrimestriellesApi,
  loadTrendsAnnuellesApi,
  loadComparisonBureauxApi,
  loadComparisonProjetsApi,
  loadComparisonPeriodeApi,
  loadComparisonBenchmarkingApi,
  loadStocksOverviewApi,
  loadStocksTrendsApi,
  loadComplianceDashboardApi,
  loadComplianceDocumentsApi,
  loadComplianceBacklogApi,
  loadComplianceLotsApi,
  loadRisksCriticalRisquesApi,
  loadRisksCriticalAlertesApi,
  loadRisksWarningsMoyensApi,
  loadRisksWarningsFaiblesApi,
  loadRisksTypePaiementsRetardApi,
  loadRisksTypeContratsExpiresApi,
  loadRisksTypeBlocagesApi,
  loadRisksTypeAlertesSystemeApi,
  loadRisksAnalyseTendancesApi,
  loadRisksAnalyseCausesRacinesApi,
  loadRisksAnalysePrevisionsApi,
  loadRisksActionsCorrectivesEnCoursApi,
  loadRisksActionsCorrectivesPlanifieesApi,
  loadDecisionsPendingUrgentesApi,
  loadDecisionsPendingNormalesApi,
  loadDecisionsPendingPlanifieesApi,
  loadDecisionsExecutedRecentesApi,
  loadDecisionsExecutedAnciennesApi,
  loadDecisionsExecutedParTypeApi,
  loadDecisionsTimelineChronologiqueApi,
  loadDecisionsTimelineParTypeApi,
  loadDecisionsTimelineParAuteurApi,
  loadDecisionsAuditTracesApi,
  loadDecisionsAuditRapportsApi,
  loadDecisionsAuditConformiteApi,
  loadDecisionsModelesSubstitutionApi,
  loadDecisionsModelesDelegationApi,
  loadDecisionsModelesArbitrageApi,
  loadRealtimeMonitoringVueGlobaleApi,
  loadRealtimeMonitoringMetriquesApi,
  loadRealtimeMonitoringPerformanceApi,
  loadRealtimeAlertsActivesApi,
  loadRealtimeAlertsResoluesApi,
  loadRealtimeAlertsHistoriqueApi,
  loadRealtimeNotificationsNonLuesApi,
  loadRealtimeNotificationsToutesApi,
  loadRealtimeNotificationsPreferencesApi,
  loadRealtimeSyncEtatApi,
  loadRealtimeSyncHistoriqueApi,
  loadRealtimeSyncConfigurationApi,
  loadOverviewActivityTimelineApi,
  loadOverviewActivityNotificationsApi,
  loadActionsTypeContratsApi,
  loadActionsTypeArbitragesApi,
  loadActionsTypePaiementsApi,
  loadActionsTypeBcApi,
  loadActionsTypeAutresApi,
  loadActionsPriorityCritiqueApi,
  loadActionsPriorityHauteApi,
  loadActionsPriorityMoyenneApi,
  loadActionsBlockedBlocagesApi,
  loadActionsBlockedEscaladesApi,
  loadActionsBlockedAnalyseApi,
  loadActionsAssignedMoiApi,
  loadActionsAssignedEquipeApi,
  loadActionsAssignedNonAssigneesApi,
  loadActionsHistoryRecentesApi,
  loadActionsHistoryAnciennesApi,
  loadActionsHistoryArchiveesApi,
  createDynamicApiLoader,
} from '../api/loaders';

// Ré-export pour compatibilité ascendante
export type { ViewEntry, Loader, LoaderResult, DashboardRegistry };
export type DataResult<T extends DashboardViewData = DashboardViewData> = LoaderResult<T>;
export type LoaderFn = Loader<DashboardViewData>;
export type TypedLoaderFn<T extends DashboardViewData = DashboardViewData> = Loader<T>;

// Ré-export pour compatibilité
export { navToKey } from '../types/dashboard';

// Dynamic imports pour les composants Achats (Phase P5)
const AchatsOverviewPage = dynamic(
  () => import('../components/views/AchatsOverviewPage').then(m => ({ default: m.AchatsOverviewPage })),
  { ssr: false }
);

const AchatsFournisseursPage = dynamic(
  () => import('../components/views/AchatsFournisseursPage').then(m => ({ default: m.AchatsFournisseursPage })),
  { ssr: false }
);

const AchatsOpenOrdersPage = dynamic(
  () => import('../components/views/AchatsOpenOrdersPage').then(m => ({ default: m.AchatsOpenOrdersPage })),
  { ssr: false }
);

const TendancesPage = dynamic(
  () => import('../components/views/TendancesPage').then(m => ({ default: m.TendancesPage })),
  { ssr: false }
);

// Dynamic imports pour les composants Reporting (Phase P7)
const ReportingOverviewPage = dynamic(
  () => import('../components/reporting/ReportingOverviewPage').then(m => ({ default: m.ReportingOverviewPage })),
  { ssr: false }
);
const ReportingTrendsPage = dynamic(
  () => import('../components/reporting/ReportingTrendsPage').then(m => ({ default: m.ReportingTrendsPage })),
  { ssr: false }
);
const ReportingByBureauPage = dynamic(
  () => import('../components/reporting/ReportingByBureauPage').then(m => ({ default: m.ReportingByBureauPage })),
  { ssr: false }
);
const ReportingByChantierPage = dynamic(
  () => import('../components/reporting/ReportingByChantierPage').then(m => ({ default: m.ReportingByChantierPage })),
  { ssr: false }
);
export type { NavKey } from '../types/dashboard';

// Helper pour créer une vue par défaut (fallback)
const createDefaultView = (title: string, description?: string): ViewEntry => ({
  id: `default-${title.toLowerCase().replace(/\s+/g, '-')}`,
  title,
  render: ({ nav }) => (
    <div className="p-6 space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        {description && (
          <p className="text-slate-400 text-sm">{description}</p>
        )}
      </div>
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6 text-center">
        <p className="text-slate-300 mb-2">Vue en cours de développement</p>
        <p className="text-sm text-slate-500">
          Navigation: {nav.main} → {nav.sub || 'N/A'} → {nav.leaf || 'N/A'}
        </p>
      </div>
    </div>
  ),
});

// --------------------------
// Loaders typés - Utilisation des loaders API réels
// ✅ PHASE 3 - REMPLACEMENT DES MOCKS PAR APPELS API RÉELS
// --------------------------
// Les loaders API sont importés depuis '../api/loaders' et utilisés directement
// Fallback sur mocks si l'API échoue (géré dans api/loaders.ts)

// Alias pour compatibilité : utiliser les loaders API
const loadOverviewSummaryDashboard = loadOverviewSummaryDashboardApi;

// Alias pour compatibilité : utiliser les loaders API
const loadOverviewSummaryHighlights = loadOverviewSummaryPointsApi;

// Alias pour compatibilité : utiliser les loaders API
const loadOverviewKpisProjets = loadKpisProjetsApi;

// Alias pour compatibilité : utiliser les loaders API
const loadOverviewKpisDemandes = loadKpisDemandesApi;

// Alias pour compatibilité : utiliser les loaders API
const loadOverviewKpisBudget = loadKpisBudgetApi;

// Alias pour compatibilité : utiliser les loaders API
const loadOverviewKpisHighlights = loadOverviewKpisHighlightsApi;

// Loader pour le Reporting Direction (Phase P7)
// Le backend retourne des structures différentes selon la leaf
const loadReporting: Loader<ReportingOverviewData | ReportingTrendsMonthlyData[] | ReportingByBureauData[] | ReportingByChantierData[]> = async (nav) => {
  const { createLogger } = await import('../utils/logger');
  const logger = createLogger('RegistryLoaders');
  const key = navToKey(nav);
  
  // ✅ Phase P7: Appel API réel via /api/dashboard/performance/reporting/*
  const url = `/api/dashboard/${nav.main}/${nav.sub ?? ''}/${nav.leaf ?? ''}`;
  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (res.ok) {
      const apiData = await res.json();
      logger.dataLoad(key, true, { action: 'apiLoad', nav });
      return {
        key,
        fetchedAt: Date.now(),
        data: apiData,
      };
    }
    
    throw new Error(`API returned ${res.status}`);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn(`API load failed, using mock data for ${key}`, { 
      key, 
      action: 'apiLoadFallback',
      error: err.message 
    });
  }
  
  // Fallback mock selon leaf
  await new Promise((r) => setTimeout(r, 150));
  switch (nav.leaf) {
    case 'tendances':
    case 'trends':
      return {
        key,
        fetchedAt: Date.now(),
        data: [] as ReportingTrendsMonthlyData[],
      };
    case 'bureaux':
      return {
        key,
        fetchedAt: Date.now(),
        data: [] as ReportingByBureauData[],
      };
    case 'chantiers':
      return {
        key,
        fetchedAt: Date.now(),
        data: [] as ReportingByChantierData[],
      };
    default:
      return {
        key,
        fetchedAt: Date.now(),
        data: {
          monthly: [],
          dso: [],
        } as ReportingOverviewData,
      };
  }
};

// Loader pour les KPIs Achats/Contrats (Phase P5)
// Le backend retourne des structures différentes selon la leaf, on les transforme en KpisAchatsData
const loadKpisAchats: Loader<KpisAchatsData> = async (nav) => {
  const { createLogger } = await import('../utils/logger');
  const logger = createLogger('RegistryLoaders');
  const key = navToKey(nav);
  
  // ✅ Phase P5: Appel API réel via /api/dashboard/performance/achats/*
  // Récupérer les headers d'authentification
  const { getAuthHeadersSync } = await import('../api/loaders');
  const authHeaders = getAuthHeadersSync();
  
  const url = `/api/dashboard/${nav.main}/${nav.sub ?? ''}/${nav.leaf ?? ''}`;
  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });
    
    if (res.ok) {
      const apiData = await res.json();
      
      // Transformer les données selon la leaf pour correspondre à KpisAchatsData
      let data: KpisAchatsData;
      
      switch (nav.leaf) {
        case 'trends':
          // API retourne AchatsTrendsData[]
          data = {
            leadTimeJours: 0,
            conformiteRatio: 0,
            priceVarianceRatio: 0,
            spend30dHt: 0,
            trends: (apiData as Array<{ date: string; bc_emis: number; bl_recus: number; spend_ht: number }>).map(t => ({
              date: t.date,
              bcEmis: t.bc_emis,
              blRecus: t.bl_recus,
              spendHt: t.spend_ht,
            })),
            topFournisseurs: [],
            commandesOuvertes: [],
          };
          break;
          
        case 'fournisseurs':
          // API retourne AchatsFournisseurKPI[]
          data = {
            leadTimeJours: 0,
            conformiteRatio: 0,
            priceVarianceRatio: 0,
            spend30dHt: 0,
            trends: [],
            topFournisseurs: (apiData as Array<{ fournisseur_code: string; fournisseur_nom: string; nb_bl: number; otif_ratio: number; price_var_ratio: number }>).map(f => ({
              id: f.fournisseur_code,
              code: f.fournisseur_code,
              nom: f.fournisseur_nom,
              nbBl: f.nb_bl,
              otifRatio: f.otif_ratio,
              priceVarRatio: f.price_var_ratio,
            })),
            commandesOuvertes: [],
          };
          break;
          
        case 'commandes':
        case 'open-orders':
          // API retourne AchatsOpenOrder[]
          data = {
            leadTimeJours: 0,
            conformiteRatio: 0,
            priceVarianceRatio: 0,
            spend30dHt: 0,
            trends: [],
            topFournisseurs: [],
            commandesOuvertes: (apiData as Array<{ bc_ref: string; emis_le: string; fournisseur_code: string; qte_commande: number; qte_recue: number; qte_restante: number; statut: string }>).map(o => ({
              id: o.bc_ref,
              ref: o.bc_ref,
              dateEmission: o.emis_le ? new Date(o.emis_le).toISOString().split('T')[0] : '',
              delaiJours: 0,
              fournisseurCode: o.fournisseur_code,
              fournisseurNom: '',
              bureauCode: undefined,
              chantierCode: undefined,
              qteCommande: o.qte_commande,
              qteRecue: o.qte_recue,
              qteRestante: o.qte_restante,
              montantHtCommande: 0,
            })),
          };
          break;
          
        case 'dashboard':
        case 'overview':
        default:
          // API retourne AchatsOverviewData
          const overview = apiData as { lead_time_j: number | null; conformite_ratio: number; price_variance_ratio: number; spend_30d_ht: number };
          data = {
            leadTimeJours: overview.lead_time_j ?? 0,
            conformiteRatio: overview.conformite_ratio,
            priceVarianceRatio: overview.price_variance_ratio,
            spend30dHt: overview.spend_30d_ht,
            trends: [],
            topFournisseurs: [],
            commandesOuvertes: [],
          };
          break;
      }
      
      logger.dataLoad(key, true, { action: 'apiLoad', nav });
      return {
        key,
        fetchedAt: Date.now(),
        data,
      };
    }
    
    throw new Error(`API returned ${res.status}`);
  } catch (error) {
    // Fallback sur mock si API échoue
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn(`API load failed, using mock data for ${key}`, { 
      key, 
      action: 'apiLoadFallback',
      error: err.message 
    });
  }
  
  // Fallback mock
  await new Promise((r) => setTimeout(r, 150));
  return {
    key,
    fetchedAt: Date.now(),
    data: {
      leadTimeJours: 7.5,
      conformiteRatio: 0.92,
      priceVarianceRatio: 0.03,
      spend30dHt: 1250000,
      trends: [],
      topFournisseurs: [],
      commandesOuvertes: [],
    },
  };
};

// --------------------------
// Registry typé
// --------------------------
export const dashboardRegistry: DashboardRegistry = {
  // overview/summary/dashboard
  'overview::summary::dashboard': {
    id: 'overview-summary-dashboard',
    title: 'Dashboard principal',
    ttl: 60_000,
    // ✅ Phase 2: Loader API avec fetch direct
    loader: loadOverviewSummaryDashboard,
    render: ({ data }) => {
      const dashboardData = data as OverviewSummaryDashboardData | null;
      return <DashboardAdvancedView data={dashboardData || {}} />;
    },
  },

  // overview/summary/highlights
  'overview::summary::highlights': {
    id: 'overview-summary-highlights',
    title: 'Points clés',
    ttl: 60_000,
    loader: loadOverviewSummaryHighlights,
    render: ({ data }) => {
      const pointsData = data as OverviewSummaryPointsData;
      return (
        <div className="p-4">
          <h2 className="text-slate-100 font-semibold">Points clés</h2>
          <ul className="mt-3 space-y-2">
            {pointsData.points?.map((p) => (
            <li
              key={p.id}
              className="text-sm text-slate-200 bg-slate-800/40 border border-slate-700/40 rounded-xl p-3"
            >
              <span className="text-slate-400">{p.label} :</span>{' '}
              <span className="font-semibold">{p.value}</span>
            </li>
            ))}
          </ul>
        </div>
      );
    },
  },

  // overview/kpis/highlights
  'overview::kpis::highlights': {
    id: 'overview-kpis-highlights',
    title: 'Synthèse stratégique',
    ttl: 60_000,
    loader: loadOverviewKpisHighlights as TypedLoaderFn<OverviewKpisHighlightsData>,
    render: ({ data }) => {
      const highlightsData = data as OverviewKpisHighlightsData;
      // Utiliser directement le composant HighlightsKpiPage
      const HighlightsKpiPage = React.lazy(() => import('../components/views/HighlightsKpiPage'));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <HighlightsKpiPage />
        </React.Suspense>
      );
    },
  },

  // overview/kpis/projets
  'overview::kpis::projets': {
    id: 'overview-kpis-projets',
    title: 'KPIs Projets',
    ttl: 60_000,
    loader: loadOverviewKpisProjets,
    render: ({ data }) => {
      // ✅ v20: Utiliser le composant ProjetKpiPage au lieu du render inline
      const ProjetKpiPage = React.lazy(() => import('../components/views/ProjetKpiPage').then(m => ({ default: m.ProjetKpiPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ProjetKpiPage data={data as KpisProjetsData} />
        </React.Suspense>
      );
    },
  },

  // overview/kpis/demandes
  'overview::kpis::demandes': {
    id: 'overview-kpis-demandes',
    title: 'KPIs Demandes',
    ttl: 60_000,
    loader: loadOverviewKpisDemandes,
    render: ({ data }) => {
      // ✅ v20: Utiliser le composant DemandesKpiPage au lieu du render inline
      const DemandesKpiPage = React.lazy(() => import('../components/views/DemandesKpiPage').then(m => ({ default: m.DemandesKpiPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DemandesKpiPage data={data as KpisDemandesData} />
        </React.Suspense>
      );
    },
  },

  // overview/kpis/budget — utilise BudgetKpiPage (barre KPI, filtres, BudgetDetailModal, export)
  'overview::kpis::budget': {
    id: 'overview-kpis-budget',
    title: 'KPIs Budget',
    ttl: 60_000,
    loader: loadOverviewKpisBudget,
    render: ({ data }) => {
      const BudgetKpiPage = React.lazy(() => import('../components/views/BudgetKpiPage').then(m => ({ default: m.BudgetKpiPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <BudgetKpiPage />
        </React.Suspense>
      );
    },
  },

  // Phase P5: performance/achats/* (Achats/Contrats)
  'performance::achats::dashboard': {
    id: 'performance-achats-dashboard',
    title: 'Vue d\'ensemble Achats',
    ttl: 60_000,
    loader: loadKpisAchats,
    render: ({ data }) => <AchatsOverviewPage data={data as KpisAchatsData} />,
  },

  'performance::achats::trends': {
    id: 'performance-achats-trends',
    title: 'Tendances Achats',
    ttl: 60_000,
    loader: loadKpisAchats,
    render: ({ data }) => <TendancesPage />,
  },

  'performance::achats::fournisseurs': {
    id: 'performance-achats-fournisseurs',
    title: 'Fournisseurs',
    ttl: 60_000,
    loader: loadKpisAchats,
    render: ({ data }) => <AchatsFournisseursPage data={data as KpisAchatsData} />,
  },

  'performance::achats::open-orders': {
    id: 'performance-achats-open-orders',
    title: 'Commandes ouvertes',
    ttl: 60_000,
    loader: loadKpisAchats,
    render: ({ data }) => <AchatsOpenOrdersPage data={data as KpisAchatsData} />,
  },

  // Phase P7: performance::reporting/* (Reporting Direction)
  'performance::reporting::dashboard': {
    id: 'performance-reporting-dashboard',
    title: 'Vue synthèse Direction',
    ttl: 60_000,
    loader: loadReporting,
    render: ({ data }) => <ReportingOverviewPage data={data as ReportingOverviewData} />,
  },

  'performance::reporting::tendances': {
    id: 'performance-reporting-trends',
    title: 'Tendances mensuelles',
    ttl: 60_000,
    loader: loadReporting,
    render: ({ data }) => <ReportingTrendsPage data={data as ReportingTrendsMonthlyData[]} />,
  },

  'performance::reporting::bureaux': {
    id: 'performance-reporting-bureaux',
    title: 'Consolidation par Bureau',
    ttl: 60_000,
    loader: loadReporting,
    render: ({ data }) => <ReportingByBureauPage data={data as ReportingByBureauData[]} />,
  },

  'performance::reporting::chantiers': {
    id: 'performance-reporting-chantiers',
    title: 'Consolidation par Chantier',
    ttl: 60_000,
    loader: loadReporting,
    render: ({ data }) => <ReportingByChantierPage data={data as ReportingByChantierData[]} />,
  },

  // Overview - Alerts
  'overview::alerts::actives': {
    id: 'overview-alerts-actives',
    title: 'Alertes Actives',
    ttl: 30_000,
    loader: loadAlertsActivesApi,
    render: () => {
      const AlertsActivesPage = React.lazy(() => import('../components/views/AlertsActivesPage').then(m => ({ default: m.AlertsActivesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AlertsActivesPage />
        </React.Suspense>
      );
    },
  },

  'overview::alerts::urgentes': {
    id: 'overview-alerts-urgentes',
    title: 'Alertes Urgentes',
    ttl: 30_000,
    loader: loadAlertsUrgentesApi,
    render: () => {
      const AlertsUrgentesPage = React.lazy(() => import('../components/views/AlertsUrgentesPage').then(m => ({ default: m.AlertsUrgentesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AlertsUrgentesPage />
        </React.Suspense>
      );
    },
  },

  // Overview - Activity
  'overview::activity::timeline': {
    id: 'overview-activity-timeline',
    title: "Timeline d'Activité",
    ttl: 30_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'overview', sub: 'activity', leaf: 'timeline' }),
    render: () => {
      const ActivityTimelinePage = React.lazy(() => import('../components/views/ActivityTimelinePage').then(m => ({ default: m.ActivityTimelinePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActivityTimelinePage />
        </React.Suspense>
      );
    },
  },

  'overview::activity::notifications': {
    id: 'overview-activity-notifications',
    title: 'Notifications',
    ttl: 30_000,
    loader: loadOverviewActivityNotificationsApi,
    render: () => {
      const ActivityNotificationsPage = React.lazy(() => import('../components/views/ActivityNotificationsPage').then(m => ({ default: m.ActivityNotificationsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActivityNotificationsPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Validation
  'performance::validation::en-attente': {
    id: 'performance-validation-en-attente',
    title: 'Validations En Attente',
    ttl: 60_000,
    loader: loadValidationsEnAttenteApi,
    render: () => {
      const ValidationsEnAttentePage = React.lazy(() => import('../components/views/ValidationsEnAttentePage').then(m => ({ default: m.ValidationsEnAttentePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ValidationsEnAttentePage />
        </React.Suspense>
      );
    },
  },

  'performance::validation::validees': {
    id: 'performance-validation-validees',
    title: 'Validations Validées',
    ttl: 60_000,
    loader: loadValidationsValideesApi,
    render: () => {
      const ValidationsValideesPage = React.lazy(() => import('../components/views/ValidationsValideesPage').then(m => ({ default: m.ValidationsValideesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ValidationsValideesPage />
        </React.Suspense>
      );
    },
  },

  'performance::validation::rejetees': {
    id: 'performance-validation-rejetees',
    title: 'Validations Rejetées',
    ttl: 60_000,
    loader: loadValidationsRejeteesApi,
    render: () => {
      const ValidationsRejeteesPage = React.lazy(() => import('../components/views/ValidationsRejeteesPage').then(m => ({ default: m.ValidationsRejeteesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ValidationsRejeteesPage />
        </React.Suspense>
      );
    },
  },

  'performance::validation::circuit': {
    id: 'performance-validation-circuit',
    title: 'Circuit de Validation',
    ttl: 60_000,
    loader: loadValidationsCircuitApi,
    render: () => {
      const ValidationsCircuitPage = React.lazy(() => import('../components/views/ValidationsCircuitPage').then(m => ({ default: m.ValidationsCircuitPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ValidationsCircuitPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Budget détaillé
  'performance::budget::consommation': {
    id: 'performance-budget-consommation',
    title: 'Budget Consommation',
    ttl: 60_000,
    loader: loadBudgetConsommationApi,
    render: () => {
      const BudgetConsommationPage = React.lazy(() => import('../components/views/BudgetConsommationPage').then(m => ({ default: m.BudgetConsommationPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <BudgetConsommationPage />
        </React.Suspense>
      );
    },
  },

  'performance::budget::restant': {
    id: 'performance-budget-restant',
    title: 'Budget Restant',
    ttl: 60_000,
    loader: loadBudgetRestantApi,
    render: () => {
      const BudgetRestantPage = React.lazy(() => import('../components/views/BudgetRestantPage').then(m => ({ default: m.BudgetRestantPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <BudgetRestantPage />
        </React.Suspense>
      );
    },
  },

  'performance::budget::previsions': {
    id: 'performance-budget-previsions',
    title: 'Budget Prévisions',
    ttl: 60_000,
    loader: loadBudgetPrevisionsApi,
    render: () => {
      const BudgetPrevisionsPage = React.lazy(() => import('../components/views/BudgetPrevisionsPage').then(m => ({ default: m.BudgetPrevisionsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <BudgetPrevisionsPage />
        </React.Suspense>
      );
    },
  },

  'performance::budget::analyse': {
    id: 'performance-budget-analyse',
    title: 'Budget Analyse',
    ttl: 60_000,
    loader: loadBudgetAnalyseApi,
    render: () => {
      const BudgetAnalysePage = React.lazy(() => import('../components/views/BudgetAnalysePage').then(m => ({ default: m.BudgetAnalysePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <BudgetAnalysePage />
        </React.Suspense>
      );
    },
  },

  // Actions - Inbox
  'actions::inbox::urgentes': {
    id: 'actions-inbox-urgentes',
    title: 'Actions Urgentes',
    ttl: 30_000,
    loader: loadActionsInboxUrgentesApi,
    render: () => {
      const ActionsInboxUrgentesPage = React.lazy(() => import('../components/views/ActionsInboxUrgentesPage').then(m => ({ default: m.ActionsInboxUrgentesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsInboxUrgentesPage />
        </React.Suspense>
      );
    },
  },

  'actions::inbox::aujourdhui': {
    id: 'actions-inbox-aujourdhui',
    title: 'Actions Aujourd\'hui',
    ttl: 30_000,
    loader: loadActionsInboxAujourdhuiApi,
    render: () => {
      const ActionsInboxAujourdhuiPage = React.lazy(() => import('../components/views/ActionsInboxAujourdhuiPage').then(m => ({ default: m.ActionsInboxAujourdhuiPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsInboxAujourdhuiPage />
        </React.Suspense>
      );
    },
  },

  'actions::inbox::semaine': {
    id: 'actions-inbox-semaine',
    title: 'Actions Cette Semaine',
    ttl: 60_000,
    loader: loadActionsInboxSemaineApi,
    render: () => {
      const ActionsInboxSemainePage = React.lazy(() => import('../components/views/ActionsInboxSemainePage').then(m => ({ default: m.ActionsInboxSemainePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsInboxSemainePage />
        </React.Suspense>
      );
    },
  },

  'actions::inbox::personnalisees': {
    id: 'actions-inbox-personnalisees',
    title: 'Actions Personnalisées',
    ttl: 60_000,
    loader: loadActionsInboxPersonnaliseesApi,
    render: () => {
      const ActionsInboxPersonnaliseesPage = React.lazy(() => import('../components/views/ActionsInboxPersonnaliseesPage').then(m => ({ default: m.ActionsInboxPersonnaliseesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsInboxPersonnaliseesPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Delays
  'performance::delays::critiques': {
    id: 'performance-delays-critiques',
    title: 'Retards Critiques',
    ttl: 30_000,
    loader: loadDelaysCritiquesApi,
    render: () => {
      const DelaysCritiquesPage = React.lazy(() => import('../components/views/DelaysCritiquesPage').then(m => ({ default: m.DelaysCritiquesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DelaysCritiquesPage />
        </React.Suspense>
      );
    },
  },

  'performance::delays::moyens': {
    id: 'performance-delays-moyens',
    title: 'Retards Moyens',
    ttl: 60_000,
    loader: loadDelaysMoyensApi,
    render: () => {
      const DelaysMoyensPage = React.lazy(() => import('../components/views/DelaysMoyensPage').then(m => ({ default: m.DelaysMoyensPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DelaysMoyensPage />
        </React.Suspense>
      );
    },
  },

  'performance::delays::analyse-causes': {
    id: 'performance-delays-analyse-causes',
    title: 'Analyse des Causes de Retards',
    ttl: 60_000,
    loader: loadDelaysAnalyseCausesApi,
    render: () => {
      const DelaysAnalyseCausesPage = React.lazy(() => import('../components/views/DelaysAnalyseCausesPage').then(m => ({ default: m.DelaysAnalyseCausesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DelaysAnalyseCausesPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Stocks
  'performance::stocks::overview': {
    id: 'performance-stocks-overview',
    title: 'Stocks Vue d\'Ensemble',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'stocks', leaf: 'overview' }),
    render: () => {
      const StocksOverviewPage = React.lazy(() => import('../components/views/StocksOverviewPage').then(m => ({ default: m.StocksOverviewPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <StocksOverviewPage />
        </React.Suspense>
      );
    },
  },

  'performance::stocks::trends': {
    id: 'performance-stocks-trends',
    title: 'Stocks Tendances',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'stocks', leaf: 'trends' }),
    render: () => {
      const StocksTrendsPage = React.lazy(() => import('../components/views/StocksTrendsPage').then(m => ({ default: m.StocksTrendsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <StocksTrendsPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Materiel
  'performance::materiel::overview': {
    id: 'performance-materiel-overview',
    title: 'Parc Matériel',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'materiel', leaf: 'overview' }),
    render: () => {
      const MaterielOverviewPage = React.lazy(() => import('../components/views/MaterielOverviewPage').then(m => ({ default: m.MaterielOverviewPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <MaterielOverviewPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Comparison
  'performance::comparison::bureaux': {
    id: 'performance-comparison-bureaux',
    title: 'Comparaison par Bureaux',
    ttl: 60_000,
    loader: loadComparisonBureauxApi,
    render: () => {
      const ComparisonBureauxPage = React.lazy(() => import('../components/views/ComparisonBureauxPage').then(m => ({ default: m.ComparisonBureauxPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ComparisonBureauxPage />
        </React.Suspense>
      );
    },
  },

  'performance::comparison::projets': {
    id: 'performance-comparison-projets',
    title: 'Comparaison par Projets',
    ttl: 60_000,
    loader: loadComparisonProjetsApi,
    render: () => {
      const ComparisonProjetsPage = React.lazy(() => import('../components/views/ComparisonProjetsPage').then(m => ({ default: m.ComparisonProjetsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ComparisonProjetsPage />
        </React.Suspense>
      );
    },
  },

  'performance::comparison::periode': {
    id: 'performance-comparison-periode',
    title: 'Comparaison par Période',
    ttl: 60_000,
    loader: loadComparisonPeriodeApi,
    render: () => {
      const ComparisonPeriodePage = React.lazy(() => import('../components/views/ComparisonPeriodePage').then(m => ({ default: m.ComparisonPeriodePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ComparisonPeriodePage />
        </React.Suspense>
      );
    },
  },

  'performance::comparison::benchmarking': {
    id: 'performance-comparison-benchmarking',
    title: 'Benchmarking',
    ttl: 60_000,
    loader: loadComparisonBenchmarkingApi,
    render: () => {
      const ComparisonBenchmarkingPage = React.lazy(() => import('../components/views/ComparisonBenchmarkingPage').then(m => ({ default: m.ComparisonBenchmarkingPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ComparisonBenchmarkingPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Compliance
  'performance::compliance::dashboard': {
    id: 'performance-compliance-dashboard',
    title: 'Compliance Synthèse',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'compliance', leaf: 'dashboard' }),
    render: () => {
      const ComplianceDashboardPage = React.lazy(() => import('../components/views/ComplianceDashboardPage').then(m => ({ default: m.ComplianceDashboardPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ComplianceDashboardPage />
        </React.Suspense>
      );
    },
  },

  'performance::compliance::documents': {
    id: 'performance-compliance-documents',
    title: 'Pièces Manquantes',
    ttl: 60_000,
    loader: loadComplianceDocumentsApi,
    render: () => {
      const ComplianceDocumentsPage = React.lazy(() => import('../components/views/ComplianceDocumentsPage').then(m => ({ default: m.ComplianceDocumentsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ComplianceDocumentsPage />
        </React.Suspense>
      );
    },
  },

  'performance::compliance::backlog': {
    id: 'performance-compliance-backlog',
    title: 'Backlog de Visas',
    ttl: 60_000,
    loader: loadComplianceBacklogApi,
    render: () => {
      const ComplianceBacklogPage = React.lazy(() => import('../components/views/ComplianceBacklogPage').then(m => ({ default: m.ComplianceBacklogPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ComplianceBacklogPage />
        </React.Suspense>
      );
    },
  },

  'performance::compliance::lots': {
    id: 'performance-compliance-lots',
    title: 'Lots Non Attribués',
    ttl: 60_000,
    loader: loadComplianceLotsApi,
    render: () => {
      const ComplianceLotsPage = React.lazy(() => import('../components/views/ComplianceLotsPage').then(m => ({ default: m.ComplianceLotsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ComplianceLotsPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Indicators
  'performance::indicators::synthese': {
    id: 'performance-indicators-synthese',
    title: 'Performance Synthèse',
    ttl: 60_000,
    loader: loadPerformanceSyntheseApi,
    render: () => {
      const PerformanceSynthesePage = React.lazy(() => import('../components/views/PerformanceSynthesePage').then(m => ({ default: m.PerformanceSynthesePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceSynthesePage />
        </React.Suspense>
      );
    },
  },

  'performance::indicators::projets': {
    id: 'performance-indicators-projets',
    title: 'Performance Projets',
    ttl: 60_000,
    loader: loadPerformanceProjetsApi,
    render: () => {
      const PerformanceProjetsPage = React.lazy(() => import('../components/views/PerformanceProjetsPage').then(m => ({ default: m.PerformanceProjetsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceProjetsPage />
        </React.Suspense>
      );
    },
  },

  'performance::indicators::demandes': {
    id: 'performance-indicators-demandes',
    title: 'Performance Demandes',
    ttl: 60_000,
    loader: loadPerformanceDemandesApi,
    render: () => {
      const PerformanceDemandesPage = React.lazy(() => import('../components/views/PerformanceDemandesPage').then(m => ({ default: m.PerformanceDemandesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceDemandesPage />
        </React.Suspense>
      );
    },
  },

  'performance::indicators::budget': {
    id: 'performance-indicators-budget',
    title: 'Performance Budget',
    ttl: 60_000,
    loader: loadPerformanceBudgetApi,
    render: () => {
      const PerformanceBudgetPage = React.lazy(() => import('../components/views/PerformanceBudgetPage').then(m => ({ default: m.PerformanceBudgetPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBudgetPage />
        </React.Suspense>
      );
    },
  },

  // Performance - Trends
  'performance::trends::mensuelles': {
    id: 'performance-trends-mensuelles',
    title: 'Tendances Mensuelles',
    ttl: 60_000,
    loader: loadTrendsMensuellesApi,
    render: () => {
      const TrendsMensuellesPage = React.lazy(() => import('../components/views/TrendsMensuellesPage').then(m => ({ default: m.TrendsMensuellesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <TrendsMensuellesPage />
        </React.Suspense>
      );
    },
  },

  'performance::trends::trimestrielles': {
    id: 'performance-trends-trimestrielles',
    title: 'Tendances Trimestrielles',
    ttl: 60_000,
    loader: loadTrendsTrimestriellesApi,
    render: () => {
      const TrendsTrimestriellesPage = React.lazy(() => import('../components/views/TrendsTrimestriellesPage').then(m => ({ default: m.TrendsTrimestriellesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <TrendsTrimestriellesPage />
        </React.Suspense>
      );
    },
  },

  'performance::trends::annuelles': {
    id: 'performance-trends-annuelles',
    title: 'Tendances Annuelles',
    ttl: 60_000,
    loader: loadTrendsAnnuellesApi,
    render: () => {
      const TrendsAnnuellesPage = React.lazy(() => import('../components/views/TrendsAnnuellesPage').then(m => ({ default: m.TrendsAnnuellesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <TrendsAnnuellesPage />
        </React.Suspense>
      );
    },
  },

  // Actions - Type
  'actions::type::contrats': {
    id: 'actions-type-contrats',
    title: 'Actions Contrats',
    ttl: 60_000,
    loader: loadActionsTypeContratsApi,
    render: () => {
      const ActionsTypeContratsPage = React.lazy(() => import('../components/views/ActionsTypeContratsPage').then(m => ({ default: m.ActionsTypeContratsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsTypeContratsPage />
        </React.Suspense>
      );
    },
  },

  'actions::type::arbitrages': {
    id: 'actions-type-arbitrages',
    title: 'Actions Arbitrages',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'type', leaf: 'arbitrages' }),
    render: () => {
      const ActionsTypeArbitragesPage = React.lazy(() => import('../components/views/ActionsTypeArbitragesPage').then(m => ({ default: m.ActionsTypeArbitragesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsTypeArbitragesPage />
        </React.Suspense>
      );
    },
  },

  'actions::type::paiements': {
    id: 'actions-type-paiements',
    title: 'Actions Paiements',
    ttl: 60_000,
    loader: loadActionsTypePaiementsApi,
    render: () => {
      const ActionsTypePaiementsPage = React.lazy(() => import('../components/views/ActionsTypePaiementsPage').then(m => ({ default: m.ActionsTypePaiementsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsTypePaiementsPage />
        </React.Suspense>
      );
    },
  },

  'actions::type::bc': {
    id: 'actions-type-bc',
    title: 'Actions BC',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'type', leaf: 'bc' }),
    render: () => {
      const ActionsTypeBcPage = React.lazy(() => import('../components/views/ActionsTypeBcPage').then(m => ({ default: m.ActionsTypeBcPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsTypeBcPage />
        </React.Suspense>
      );
    },
  },

  'actions::type::autres': {
    id: 'actions-type-autres',
    title: 'Actions Autres',
    ttl: 60_000,
    loader: loadActionsTypeAutresApi,
    render: () => {
      const ActionsTypeAutresPage = React.lazy(() => import('../components/views/ActionsTypeAutresPage').then(m => ({ default: m.ActionsTypeAutresPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsTypeAutresPage />
        </React.Suspense>
      );
    },
  },

  'actions::priority::critique': {
    id: 'actions-priority-critique',
    title: 'Actions Priorité Critique',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'priority', leaf: 'critique' }),
    render: () => {
      const ActionsPriorityCritiquePage = React.lazy(() => import('../components/views/ActionsPriorityCritiquePage').then(m => ({ default: m.ActionsPriorityCritiquePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsPriorityCritiquePage />
        </React.Suspense>
      );
    },
  },

  'actions::priority::haute': {
    id: 'actions-priority-haute',
    title: 'Actions Priorité Haute',
    ttl: 60_000,
    loader: loadActionsPriorityHauteApi,
    render: () => {
      const ActionsPriorityHautePage = React.lazy(() => import('../components/views/ActionsPriorityHautePage').then(m => ({ default: m.ActionsPriorityHautePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsPriorityHautePage />
        </React.Suspense>
      );
    },
  },

  'actions::priority::moyenne': {
    id: 'actions-priority-moyenne',
    title: 'Actions Priorité Moyenne',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'priority', leaf: 'moyenne' }),
    render: () => {
      const ActionsPriorityMoyennePage = React.lazy(() => import('../components/views/ActionsPriorityMoyennePage').then(m => ({ default: m.ActionsPriorityMoyennePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsPriorityMoyennePage />
        </React.Suspense>
      );
    },
  },

  'actions::blocked::blocages': {
    id: 'actions-blocked-blocages',
    title: 'Actions Blocages',
    ttl: 60_000,
    loader: loadActionsBlockedBlocagesApi,
    render: () => {
      const ActionsBlockedBlocagesPage = React.lazy(() => import('../components/views/ActionsBlockedBlocagesPage').then(m => ({ default: m.ActionsBlockedBlocagesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsBlockedBlocagesPage />
        </React.Suspense>
      );
    },
  },

  'actions::blocked::escalades': {
    id: 'actions-blocked-escalades',
    title: 'Actions Escalades',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'blocked', leaf: 'escalades' }),
    render: () => {
      const ActionsBlockedEscaladesPage = React.lazy(() => import('../components/views/ActionsBlockedEscaladesPage').then(m => ({ default: m.ActionsBlockedEscaladesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsBlockedEscaladesPage />
        </React.Suspense>
      );
    },
  },

  'actions::blocked::analyse': {
    id: 'actions-blocked-analyse',
    title: 'Analyse des Blocages',
    ttl: 60_000,
    loader: loadActionsBlockedAnalyseApi,
    render: () => {
      const ActionsBlockedAnalysePage = React.lazy(() => import('../components/views/ActionsBlockedAnalysePage').then(m => ({ default: m.ActionsBlockedAnalysePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsBlockedAnalysePage />
        </React.Suspense>
      );
    },
  },

  'actions::assigned::moi': {
    id: 'actions-assigned-moi',
    title: 'Actions À Moi',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'assigned', leaf: 'moi' }),
    render: () => {
      const ActionsAssignedMoiPage = React.lazy(() => import('../components/views/ActionsAssignedMoiPage').then(m => ({ default: m.ActionsAssignedMoiPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsAssignedMoiPage />
        </React.Suspense>
      );
    },
  },

  'actions::assigned::equipe': {
    id: 'actions-assigned-equipe',
    title: 'Actions À Mon Équipe',
    ttl: 60_000,
    loader: loadActionsAssignedEquipeApi,
    render: () => {
      const ActionsAssignedEquipePage = React.lazy(() => import('../components/views/ActionsAssignedEquipePage').then(m => ({ default: m.ActionsAssignedEquipePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsAssignedEquipePage />
        </React.Suspense>
      );
    },
  },

  'actions::assigned::non-assignees': {
    id: 'actions-assigned-non-assignees',
    title: 'Actions Non Assignées',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'assigned', leaf: 'non-assignees' }),
    render: () => {
      const ActionsAssignedNonAssigneesPage = React.lazy(() => import('../components/views/ActionsAssignedNonAssigneesPage').then(m => ({ default: m.ActionsAssignedNonAssigneesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsAssignedNonAssigneesPage />
        </React.Suspense>
      );
    },
  },

  'actions::history::recentes': {
    id: 'actions-history-recentes',
    title: 'Actions Récentes',
    ttl: 60_000,
    loader: loadActionsHistoryRecentesApi,
    render: () => {
      const ActionsHistoryRecentPage = React.lazy(() => import('../components/views/ActionsHistoryRecentPage').then(m => ({ default: m.ActionsHistoryRecentPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsHistoryRecentPage />
        </React.Suspense>
      );
    },
  },

  'actions::history::anciennes': {
    id: 'actions-history-anciennes',
    title: 'Actions Anciennes',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'history', leaf: 'anciennes' }),
    render: () => {
      const ActionsHistoryAnciennesPage = React.lazy(() => import('../components/views/ActionsHistoryAnciennesPage').then(m => ({ default: m.ActionsHistoryAnciennesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsHistoryAnciennesPage />
        </React.Suspense>
      );
    },
  },

  'actions::history::archivees': {
    id: 'actions-history-archivees',
    title: 'Actions Archivées',
    ttl: 60_000,
    loader: loadActionsHistoryArchiveesApi,
    render: () => {
      const ActionsHistoryArchiveesPage = React.lazy(() => import('../components/views/ActionsHistoryArchiveesPage').then(m => ({ default: m.ActionsHistoryArchiveesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <ActionsHistoryArchiveesPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::all': {
    id: 'performance-bureaux-all',
    title: 'Tous les Bureaux',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'all' }),
    render: () => {
      const PerformanceBureauxAllPage = React.lazy(() => import('../components/views/PerformanceBureauxAllPage').then(m => ({ default: m.PerformanceBureauxAllPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxAllPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bmo': {
    id: 'performance-bureaux-bmo',
    title: 'BMO',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bmo' }),
    render: () => {
      const PerformanceBureauxBmoPage = React.lazy(() => import('../components/views/PerformanceBureauxBmoPage').then(m => ({ default: m.PerformanceBureauxBmoPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBmoPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bf': {
    id: 'performance-bureaux-bf',
    title: 'BF',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bf' }),
    render: () => {
      const PerformanceBureauxBfPage = React.lazy(() => import('../components/views/PerformanceBureauxBfPage').then(m => ({ default: m.PerformanceBureauxBfPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBfPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bj': {
    id: 'performance-bureaux-bj',
    title: 'BJ',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bj' }),
    render: () => {
      const PerformanceBureauxBjPage = React.lazy(() => import('../components/views/PerformanceBureauxBjPage').then(m => ({ default: m.PerformanceBureauxBjPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBjPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bct': {
    id: 'performance-bureaux-bct',
    title: 'BCT',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bct' }),
    render: () => {
      const PerformanceBureauxBctPage = React.lazy(() => import('../components/views/PerformanceBureauxBctPage').then(m => ({ default: m.PerformanceBureauxBctPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBctPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bop': {
    id: 'performance-bureaux-bop',
    title: 'BOP',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bop' }),
    render: () => {
      const PerformanceBureauxBopPage = React.lazy(() => import('../components/views/PerformanceBureauxBopPage').then(m => ({ default: m.PerformanceBureauxBopPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBopPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bcg': {
    id: 'performance-bureaux-bcg',
    title: 'BCG',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bcg' }),
    render: () => {
      const PerformanceBureauxBcgPage = React.lazy(() => import('../components/views/PerformanceBureauxBcgPage').then(m => ({ default: m.PerformanceBureauxBcgPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBcgPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bja': {
    id: 'performance-bureaux-bja',
    title: 'BJA',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bja' }),
    render: () => {
      const PerformanceBureauxBjaPage = React.lazy(() => import('../components/views/PerformanceBureauxBjaPage').then(m => ({ default: m.PerformanceBureauxBjaPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBjaPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::brc': {
    id: 'performance-bureaux-brc',
    title: 'BRC',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'brc' }),
    render: () => {
      const PerformanceBureauxBrcPage = React.lazy(() => import('../components/views/PerformanceBureauxBrcPage').then(m => ({ default: m.PerformanceBureauxBrcPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBrcPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bpl': {
    id: 'performance-bureaux-bpl',
    title: 'BPL',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bpl' }),
    render: () => {
      const PerformanceBureauxBplPage = React.lazy(() => import('../components/views/PerformanceBureauxBplPage').then(m => ({ default: m.PerformanceBureauxBplPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBplPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::bex': {
    id: 'performance-bureaux-bex',
    title: 'BEX',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bex' }),
    render: () => {
      const PerformanceBureauxBexPage = React.lazy(() => import('../components/views/PerformanceBureauxBexPage').then(m => ({ default: m.PerformanceBureauxBexPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxBexPage />
        </React.Suspense>
      );
    },
  },

  'performance::bureaux::comparaison': {
    id: 'performance-bureaux-comparaison',
    title: 'Comparaison Bureaux',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'comparaison' }),
    render: () => {
      const PerformanceBureauxComparaisonPage = React.lazy(() => import('../components/views/PerformanceBureauxComparaisonPage').then(m => ({ default: m.PerformanceBureauxComparaisonPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <PerformanceBureauxComparaisonPage />
        </React.Suspense>
      );
    },
  },

  'risks::critical::risques': {
    id: 'risks-critical-risques',
    title: 'Risques Critiques',
    ttl: 60_000,
    loader: loadRisksCriticalRisquesApi,
    render: () => {
      const RisksCriticalRisquesPage = React.lazy(() => import('../components/views/RisksCriticalRisquesPage').then(m => ({ default: m.RisksCriticalRisquesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksCriticalRisquesPage />
        </React.Suspense>
      );
    },
  },

  'risks::critical::alertes': {
    id: 'risks-critical-alertes',
    title: 'Alertes Critiques',
    ttl: 60_000,
    loader: loadRisksCriticalAlertesApi,
    render: () => {
      const RisksCriticalAlertesPage = React.lazy(() => import('../components/views/RisksCriticalAlertesPage').then(m => ({ default: m.RisksCriticalAlertesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksCriticalAlertesPage />
        </React.Suspense>
      );
    },
  },

  'risks::warnings::moyens': {
    id: 'risks-warnings-moyens',
    title: 'Risques Moyens',
    ttl: 60_000,
    loader: loadRisksWarningsMoyensApi,
    render: () => {
      const RisksWarningsMoyensPage = React.lazy(() => import('../components/views/RisksWarningsMoyensPage').then(m => ({ default: m.RisksWarningsMoyensPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksWarningsMoyensPage />
        </React.Suspense>
      );
    },
  },

  'risks::warnings::faibles': {
    id: 'risks-warnings-faibles',
    title: 'Risques Faibles',
    ttl: 60_000,
    loader: loadRisksWarningsFaiblesApi,
    render: () => {
      const RisksWarningsFaiblesPage = React.lazy(() => import('../components/views/RisksWarningsFaiblesPage').then(m => ({ default: m.RisksWarningsFaiblesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksWarningsFaiblesPage />
        </React.Suspense>
      );
    },
  },

  'risks::type::paiements-retard': {
    id: 'risks-type-paiements-retard',
    title: 'Paiements en Retard',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'risks', sub: 'type', leaf: 'paiements-retard' }),
    render: () => {
      const RisksTypePaiementsRetardPage = React.lazy(() => import('../components/views/RisksTypePaiementsRetardPage').then(m => ({ default: m.RisksTypePaiementsRetardPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksTypePaiementsRetardPage />
        </React.Suspense>
      );
    },
  },

  'risks::type::contrats-expires': {
    id: 'risks-type-contrats-expires',
    title: 'Contrats Expirés',
    ttl: 60_000,
    loader: loadRisksTypeContratsExpiresApi,
    render: () => {
      const RisksTypeContratsExpiresPage = React.lazy(() => import('../components/views/RisksTypeContratsExpiresPage').then(m => ({ default: m.RisksTypeContratsExpiresPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksTypeContratsExpiresPage />
        </React.Suspense>
      );
    },
  },

  'risks::type::blocages': {
    id: 'risks-type-blocages',
    title: 'Blocages',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'risks', sub: 'type', leaf: 'blocages' }),
    render: () => {
      const RisksTypeBlocagesPage = React.lazy(() => import('../components/views/RisksTypeBlocagesPage').then(m => ({ default: m.RisksTypeBlocagesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksTypeBlocagesPage />
        </React.Suspense>
      );
    },
  },

  'risks::type::alertes-systeme': {
    id: 'risks-type-alertes-systeme',
    title: 'Alertes Système',
    ttl: 60_000,
    loader: loadRisksTypeAlertesSystemeApi,
    render: () => {
      const RisksTypeAlertesSystemePage = React.lazy(() => import('../components/views/RisksTypeAlertesSystemePage').then(m => ({ default: m.RisksTypeAlertesSystemePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksTypeAlertesSystemePage />
        </React.Suspense>
      );
    },
  },

  'risks::analyse::tendances': {
    id: 'risks-analyse-tendances',
    title: 'Tendances des Risques',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'risks', sub: 'analyse', leaf: 'tendances' }),
    render: () => {
      const RisksAnalyseTendancesPage = React.lazy(() => import('../components/views/RisksAnalyseTendancesPage').then(m => ({ default: m.RisksAnalyseTendancesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksAnalyseTendancesPage />
        </React.Suspense>
      );
    },
  },

  'risks::analyse::causes-racines': {
    id: 'risks-analyse-causes-racines',
    title: 'Causes Racines',
    ttl: 60_000,
    loader: loadRisksAnalyseCausesRacinesApi,
    render: () => {
      const RisksAnalyseCausesRacinesPage = React.lazy(() => import('../components/views/RisksAnalyseCausesRacinesPage').then(m => ({ default: m.RisksAnalyseCausesRacinesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksAnalyseCausesRacinesPage />
        </React.Suspense>
      );
    },
  },

  'risks::analyse::previsions': {
    id: 'risks-analyse-previsions',
    title: 'Prévisions des Risques',
    ttl: 60_000,
    loader: loadRisksAnalysePrevisionsApi,
    render: () => {
      const RisksAnalysePrevisionsPage = React.lazy(() => import('../components/views/RisksAnalysePrevisionsPage').then(m => ({ default: m.RisksAnalysePrevisionsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksAnalysePrevisionsPage />
        </React.Suspense>
      );
    },
  },

  'risks::actions-correctives::en-cours': {
    id: 'risks-actions-correctives-en-cours',
    title: 'Actions Correctives En Cours',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'risks', sub: 'actions-correctives', leaf: 'en-cours' }),
    render: () => {
      const RisksActionsCorrectivesEnCoursPage = React.lazy(() => import('../components/views/RisksActionsCorrectivesEnCoursPage').then(m => ({ default: m.RisksActionsCorrectivesEnCoursPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksActionsCorrectivesEnCoursPage />
        </React.Suspense>
      );
    },
  },

  'risks::actions-correctives::planifiees': {
    id: 'risks-actions-correctives-planifiees',
    title: 'Actions Correctives Planifiées',
    ttl: 60_000,
    loader: loadRisksActionsCorrectivesPlanifieesApi,
    render: () => {
      const RisksActionsCorrectivesPlanifieesPage = React.lazy(() => import('../components/views/RisksActionsCorrectivesPlanifieesPage').then(m => ({ default: m.RisksActionsCorrectivesPlanifieesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RisksActionsCorrectivesPlanifieesPage />
        </React.Suspense>
      );
    },
  },

  'decisions::pending::urgentes': {
    id: 'decisions-pending-urgentes',
    title: 'Décisions Urgentes',
    ttl: 60_000,
    loader: loadDecisionsPendingUrgentesApi,
    render: () => {
      const DecisionsPendingUrgentesPage = React.lazy(() => import('../components/views/DecisionsPendingUrgentesPage').then(m => ({ default: m.DecisionsPendingUrgentesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsPendingUrgentesPage />
        </React.Suspense>
      );
    },
  },

  'decisions::pending::normales': {
    id: 'decisions-pending-normales',
    title: 'Décisions Normales',
    ttl: 60_000,
    loader: loadDecisionsPendingNormalesApi,
    render: () => {
      const DecisionsPendingNormalesPage = React.lazy(() => import('../components/views/DecisionsPendingNormalesPage').then(m => ({ default: m.DecisionsPendingNormalesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsPendingNormalesPage />
        </React.Suspense>
      );
    },
  },

  'decisions::pending::planifiees': {
    id: 'decisions-pending-planifiees',
    title: 'Décisions Planifiées',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'pending', leaf: 'planifiees' }),
    render: () => {
      const DecisionsPendingPlanifieesPage = React.lazy(() => import('../components/views/DecisionsPendingPlanifieesPage').then(m => ({ default: m.DecisionsPendingPlanifieesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsPendingPlanifieesPage />
        </React.Suspense>
      );
    },
  },

  'decisions::executed::recentes': {
    id: 'decisions-executed-recentes',
    title: 'Décisions Récentes',
    ttl: 60_000,
    loader: loadDecisionsExecutedRecentesApi,
    render: () => {
      const DecisionsExecutedRecentesPage = React.lazy(() => import('../components/views/DecisionsExecutedRecentesPage').then(m => ({ default: m.DecisionsExecutedRecentesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsExecutedRecentesPage />
        </React.Suspense>
      );
    },
  },

  'decisions::executed::anciennes': {
    id: 'decisions-executed-anciennes',
    title: 'Décisions Anciennes',
    ttl: 60_000,
    loader: loadDecisionsExecutedAnciennesApi,
    render: () => {
      const DecisionsExecutedAnciennesPage = React.lazy(() => import('../components/views/DecisionsExecutedAnciennesPage').then(m => ({ default: m.DecisionsExecutedAnciennesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsExecutedAnciennesPage />
        </React.Suspense>
      );
    },
  },

  'decisions::executed::par-type': {
    id: 'decisions-executed-par-type',
    title: 'Décisions Par Type',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'executed', leaf: 'par-type' }),
    render: () => {
      const DecisionsExecutedParTypePage = React.lazy(() => import('../components/views/DecisionsExecutedParTypePage').then(m => ({ default: m.DecisionsExecutedParTypePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsExecutedParTypePage />
        </React.Suspense>
      );
    },
  },

  'decisions::timeline::chronologique': {
    id: 'decisions-timeline-chronologique',
    title: 'Timeline Chronologique',
    ttl: 60_000,
    loader: loadDecisionsTimelineChronologiqueApi,
    render: () => {
      const DecisionsTimelineChronologiquePage = React.lazy(() => import('../components/views/DecisionsTimelineChronologiquePage').then(m => ({ default: m.DecisionsTimelineChronologiquePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsTimelineChronologiquePage />
        </React.Suspense>
      );
    },
  },

  'decisions::timeline::par-type': {
    id: 'decisions-timeline-par-type',
    title: 'Timeline Par Type',
    ttl: 60_000,
    loader: loadDecisionsTimelineParTypeApi,
    render: () => {
      const DecisionsTimelineParTypePage = React.lazy(() => import('../components/views/DecisionsTimelineParTypePage').then(m => ({ default: m.DecisionsTimelineParTypePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsTimelineParTypePage />
        </React.Suspense>
      );
    },
  },

  'decisions::timeline::par-auteur': {
    id: 'decisions-timeline-par-auteur',
    title: 'Timeline Par Auteur',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'timeline', leaf: 'par-auteur' }),
    render: () => {
      const DecisionsTimelineParAuteurPage = React.lazy(() => import('../components/views/DecisionsTimelineParAuteurPage').then(m => ({ default: m.DecisionsTimelineParAuteurPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsTimelineParAuteurPage />
        </React.Suspense>
      );
    },
  },

  'decisions::audit::traces': {
    id: 'decisions-audit-traces',
    title: "Traces d'Audit",
    ttl: 60_000,
    loader: loadDecisionsAuditTracesApi,
    render: () => {
      const DecisionsAuditTracesPage = React.lazy(() => import('../components/views/DecisionsAuditTracesPage').then(m => ({ default: m.DecisionsAuditTracesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsAuditTracesPage />
        </React.Suspense>
      );
    },
  },

  'decisions::audit::rapports': {
    id: 'decisions-audit-rapports',
    title: "Rapports d'Audit",
    ttl: 60_000,
    loader: loadDecisionsAuditRapportsApi,
    render: () => {
      const DecisionsAuditRapportsPage = React.lazy(() => import('../components/views/DecisionsAuditRapportsPage').then(m => ({ default: m.DecisionsAuditRapportsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsAuditRapportsPage />
        </React.Suspense>
      );
    },
  },

  'decisions::audit::conformite': {
    id: 'decisions-audit-conformite',
    title: 'Conformité',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'audit', leaf: 'conformite' }),
    render: () => {
      const DecisionsAuditConformitePage = React.lazy(() => import('../components/views/DecisionsAuditConformitePage').then(m => ({ default: m.DecisionsAuditConformitePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsAuditConformitePage />
        </React.Suspense>
      );
    },
  },

  'decisions::modeles::substitution': {
    id: 'decisions-modeles-substitution',
    title: 'Modèles de Substitution',
    ttl: 60_000,
    loader: loadDecisionsModelesSubstitutionApi,
    render: () => {
      const DecisionsModelesSubstitutionPage = React.lazy(() => import('../components/views/DecisionsModelesSubstitutionPage').then(m => ({ default: m.DecisionsModelesSubstitutionPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsModelesSubstitutionPage />
        </React.Suspense>
      );
    },
  },

  'decisions::modeles::delegation': {
    id: 'decisions-modeles-delegation',
    title: 'Modèles de Délégation',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'modeles', leaf: 'delegation' }),
    render: () => {
      const DecisionsModelesDelegationPage = React.lazy(() => import('../components/views/DecisionsModelesDelegationPage').then(m => ({ default: m.DecisionsModelesDelegationPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsModelesDelegationPage />
        </React.Suspense>
      );
    },
  },

  'decisions::modeles::arbitrage': {
    id: 'decisions-modeles-arbitrage',
    title: "Modèles d'Arbitrage",
    ttl: 60_000,
    loader: loadDecisionsModelesArbitrageApi,
    render: () => {
      const DecisionsModelesArbitragePage = React.lazy(() => import('../components/views/DecisionsModelesArbitragePage').then(m => ({ default: m.DecisionsModelesArbitragePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <DecisionsModelesArbitragePage />
        </React.Suspense>
      );
    },
  },

  'realtime::monitoring::vue-globale': {
    id: 'realtime-monitoring-vue-globale',
    title: 'Vue Globale',
    ttl: 60_000,
    loader: loadRealtimeMonitoringVueGlobaleApi,
    render: () => {
      const RealtimeMonitoringVueGlobalePage = React.lazy(() => import('../components/views/RealtimeMonitoringVueGlobalePage').then(m => ({ default: m.RealtimeMonitoringVueGlobalePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeMonitoringVueGlobalePage />
        </React.Suspense>
      );
    },
  },

  'realtime::monitoring::metriques': {
    id: 'realtime-monitoring-metriques',
    title: 'Métriques',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'realtime', sub: 'monitoring', leaf: 'metriques' }),
    render: () => {
      const RealtimeMonitoringMetriquesPage = React.lazy(() => import('../components/views/RealtimeMonitoringMetriquesPage').then(m => ({ default: m.RealtimeMonitoringMetriquesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeMonitoringMetriquesPage />
        </React.Suspense>
      );
    },
  },

  'realtime::monitoring::performance': {
    id: 'realtime-monitoring-performance',
    title: 'Performance',
    ttl: 60_000,
    loader: loadRealtimeMonitoringPerformanceApi,
    render: () => {
      const RealtimeMonitoringPerformancePage = React.lazy(() => import('../components/views/RealtimeMonitoringPerformancePage').then(m => ({ default: m.RealtimeMonitoringPerformancePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeMonitoringPerformancePage />
        </React.Suspense>
      );
    },
  },

  'realtime::alerts::actives': {
    id: 'realtime-alerts-actives',
    title: 'Alertes Actives',
    ttl: 60_000,
    loader: loadRealtimeAlertsActivesApi,
    render: () => {
      const RealtimeAlertsActivesPage = React.lazy(() => import('../components/views/RealtimeAlertsActivesPage').then(m => ({ default: m.RealtimeAlertsActivesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeAlertsActivesPage />
        </React.Suspense>
      );
    },
  },

  'realtime::alerts::resolues': {
    id: 'realtime-alerts-resolues',
    title: 'Alertes Résolues',
    ttl: 60_000,
    loader: loadRealtimeAlertsResoluesApi,
    render: () => {
      const RealtimeAlertsResoluesPage = React.lazy(() => import('../components/views/RealtimeAlertsResoluesPage').then(m => ({ default: m.RealtimeAlertsResoluesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeAlertsResoluesPage />
        </React.Suspense>
      );
    },
  },

  'realtime::alerts::historique': {
    id: 'realtime-alerts-historique',
    title: 'Historique des Alertes',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'realtime', sub: 'alerts', leaf: 'historique' }),
    render: () => {
      const RealtimeAlertsHistoriquePage = React.lazy(() => import('../components/views/RealtimeAlertsHistoriquePage').then(m => ({ default: m.RealtimeAlertsHistoriquePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeAlertsHistoriquePage />
        </React.Suspense>
      );
    },
  },

  'realtime::notifications::non-lues': {
    id: 'realtime-notifications-non-lues',
    title: 'Notifications Non Lues',
    ttl: 60_000,
    loader: loadRealtimeNotificationsNonLuesApi,
    render: () => {
      const RealtimeNotificationsNonLuesPage = React.lazy(() => import('../components/views/RealtimeNotificationsNonLuesPage').then(m => ({ default: m.RealtimeNotificationsNonLuesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeNotificationsNonLuesPage />
        </React.Suspense>
      );
    },
  },

  'realtime::notifications::toutes': {
    id: 'realtime-notifications-toutes',
    title: 'Toutes les Notifications',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'realtime', sub: 'notifications', leaf: 'toutes' }),
    render: () => {
      const RealtimeNotificationsToutesPage = React.lazy(() => import('../components/views/RealtimeNotificationsToutesPage').then(m => ({ default: m.RealtimeNotificationsToutesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeNotificationsToutesPage />
        </React.Suspense>
      );
    },
  },

  'realtime::notifications::preferences': {
    id: 'realtime-notifications-preferences',
    title: 'Préférences Notifications',
    ttl: 60_000,
    loader: loadRealtimeNotificationsPreferencesApi,
    render: () => {
      const RealtimeNotificationsPreferencesPage = React.lazy(() => import('../components/views/RealtimeNotificationsPreferencesPage').then(m => ({ default: m.RealtimeNotificationsPreferencesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeNotificationsPreferencesPage />
        </React.Suspense>
      );
    },
  },

  'realtime::sync::etat': {
    id: 'realtime-sync-etat',
    title: 'État de Synchronisation',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'realtime', sub: 'sync', leaf: 'etat' }),
    render: () => {
      const RealtimeSyncEtatPage = React.lazy(() => import('../components/views/RealtimeSyncEtatPage').then(m => ({ default: m.RealtimeSyncEtatPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeSyncEtatPage />
        </React.Suspense>
      );
    },
  },

  'realtime::sync::historique': {
    id: 'realtime-sync-historique',
    title: 'Historique de Synchronisation',
    ttl: 60_000,
    loader: loadRealtimeSyncHistoriqueApi,
    render: () => {
      const RealtimeSyncHistoriquePage = React.lazy(() => import('../components/views/RealtimeSyncHistoriquePage').then(m => ({ default: m.RealtimeSyncHistoriquePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeSyncHistoriquePage />
        </React.Suspense>
      );
    },
  },

  'realtime::sync::configuration': {
    id: 'realtime-sync-configuration',
    title: 'Configuration Synchronisation',
    ttl: 60_000,
    loader: loadRealtimeSyncConfigurationApi,
    render: () => {
      const RealtimeSyncConfigurationPage = React.lazy(() => import('../components/views/RealtimeSyncConfigurationPage').then(m => ({ default: m.RealtimeSyncConfigurationPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <RealtimeSyncConfigurationPage />
        </React.Suspense>
      );
    },
  },

  'administration::settings::dashboard': {
    id: 'administration-settings-dashboard',
    title: 'Paramètres Dashboard',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'settings', leaf: 'dashboard' }),
    render: () => {
      const AdministrationSettingsDashboardPage = React.lazy(() => import('../components/views/AdministrationSettingsDashboardPage').then(m => ({ default: m.AdministrationSettingsDashboardPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationSettingsDashboardPage />
        </React.Suspense>
      );
    },
  },

  'administration::settings::kpis': {
    id: 'administration-settings-kpis',
    title: 'Paramètres KPIs',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'settings', leaf: 'kpis' }),
    render: () => {
      const AdministrationSettingsKpisPage = React.lazy(() => import('../components/views/AdministrationSettingsKpisPage').then(m => ({ default: m.AdministrationSettingsKpisPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationSettingsKpisPage />
        </React.Suspense>
      );
    },
  },

  'administration::settings::notifications': {
    id: 'administration-settings-notifications',
    title: 'Paramètres Notifications',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'settings', leaf: 'notifications' }),
    render: () => {
      const AdministrationSettingsNotificationsPage = React.lazy(() => import('../components/views/AdministrationSettingsNotificationsPage').then(m => ({ default: m.AdministrationSettingsNotificationsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationSettingsNotificationsPage />
        </React.Suspense>
      );
    },
  },

  'administration::users::liste': {
    id: 'administration-users-liste',
    title: 'Liste des Utilisateurs',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'users', leaf: 'liste' }),
    render: () => {
      const AdministrationUsersListePage = React.lazy(() => import('../components/views/AdministrationUsersListePage').then(m => ({ default: m.AdministrationUsersListePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationUsersListePage />
        </React.Suspense>
      );
    },
  },

  'administration::users::permissions': {
    id: 'administration-users-permissions',
    title: 'Permissions Utilisateurs',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'users', leaf: 'permissions' }),
    render: () => {
      const AdministrationUsersPermissionsPage = React.lazy(() => import('../components/views/AdministrationUsersPermissionsPage').then(m => ({ default: m.AdministrationUsersPermissionsPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationUsersPermissionsPage />
        </React.Suspense>
      );
    },
  },

  'administration::permissions::roles': {
    id: 'administration-permissions-roles',
    title: 'Rôles',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'permissions', leaf: 'roles' }),
    render: () => {
      const AdministrationPermissionsRolesPage = React.lazy(() => import('../components/views/AdministrationPermissionsRolesPage').then(m => ({ default: m.AdministrationPermissionsRolesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationPermissionsRolesPage />
        </React.Suspense>
      );
    },
  },

  'administration::permissions::acces': {
    id: 'administration-permissions-acces',
    title: 'Accès',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'permissions', leaf: 'acces' }),
    render: () => {
      const AdministrationPermissionsAccesPage = React.lazy(() => import('../components/views/AdministrationPermissionsAccesPage').then(m => ({ default: m.AdministrationPermissionsAccesPage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationPermissionsAccesPage />
        </React.Suspense>
      );
    },
  },

  'administration::logs::activite': {
    id: 'administration-logs-activite',
    title: "Logs d'Activité",
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'logs', leaf: 'activite' }),
    render: () => {
      const AdministrationLogsActivitePage = React.lazy(() => import('../components/views/AdministrationLogsActivitePage').then(m => ({ default: m.AdministrationLogsActivitePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationLogsActivitePage />
        </React.Suspense>
      );
    },
  },

  'administration::logs::systeme': {
    id: 'administration-logs-systeme',
    title: 'Logs Système',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'logs', leaf: 'systeme' }),
    render: () => {
      const AdministrationLogsSystemePage = React.lazy(() => import('../components/views/AdministrationLogsSystemePage').then(m => ({ default: m.AdministrationLogsSystemePage })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <AdministrationLogsSystemePage />
        </React.Suspense>
      );
    },
  },
};

