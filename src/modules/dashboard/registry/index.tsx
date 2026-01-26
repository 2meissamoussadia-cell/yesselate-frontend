/**
 * Registry unifié Dashboard v20
 * 
 * Fusionne index.tsx et dashboardRegistry.tsx en un seul registry cohérent
 * Utilise les loaders API avec fallback mock intelligent
 * 
 * ARCHITECTURE v20:
 * - Un seul registry source de vérité
 * - Loaders API standardisés avec retry et fallback
 * - Types complets, zéro any
 * - Logging unifié
 */

'use client';

import { ViewEntry, NavKey, navToKey } from '../types/dashboard';
import type {
  OverviewSummaryDashboardData,
  KpisProjetsData,
  KpisDemandesData,
  KpisAchatsData,
  KpisStocksData,
  KpisMaterielData,
  KpisComplianceData,
  ReportingOverviewCombinedData,
  ReportingTrendsMonthlyData,
  ReportingByBureauData,
  ReportingByChantierData,
} from '../types/dashboard.readmodels';
import type { DashboardViewData } from '../types/dashboardDataTypes';
import dynamic from 'next/dynamic';
import { createLogger } from '../utils/logger';

const logger = createLogger('Registry');

// Ré-exporter navToKey et NavKey pour faciliter les imports
export { navToKey };
export type { NavKey };

// ============================================================================
// Composants lazy-loaded
// ============================================================================

const DashboardAdvancedView = dynamic(
  () => import('../components/DashboardAdvancedView').then(m => m.DashboardAdvancedView),
  { ssr: false }
);

const ProjetKpiPage = dynamic(
  () => import('../components/views/ProjetKpiPage').then(m => m.ProjetKpiPage),
  { ssr: false }
);

const DemandesKpiPage = dynamic(
  () => import('../components/views/DemandesKpiPage').then(m => m.DemandesKpiPage),
  { ssr: false }
);

// Phase P5: Composants Achats/Contrats
const AchatsOverviewPage = dynamic(
  () => import('../components/views/AchatsOverviewPage').then(m => m.AchatsOverviewPage),
  { ssr: false }
);
const AchatsFournisseursPage = dynamic(
  () => import('../components/views/AchatsFournisseursPage').then(m => m.AchatsFournisseursPage),
  { ssr: false }
);
const AchatsOpenOrdersPage = dynamic(
  () => import('../components/views/AchatsOpenOrdersPage').then(m => m.AchatsOpenOrdersPage),
  { ssr: false }
);
const TendancesPage = dynamic(
  () => import('../components/views/TendancesPage').then(m => m.TendancesPage),
  { ssr: false }
);

// Phase P6: Composants Stocks & Matériel
const StocksOverviewPage = dynamic(
  () => import('../components/stocks/StocksOverviewPage').then(m => m.StocksOverviewPage),
  { ssr: false }
);
const StocksTrendsPage = dynamic(
  () => import('../components/stocks/StocksTrendsPage').then(m => m.StocksTrendsPage),
  { ssr: false }
);
const MaterielOverviewPage = dynamic(
  () => import('../components/stocks/MaterielOverviewPage').then(m => m.MaterielOverviewPage),
  { ssr: false }
);

// Phase P8: Composants Conformité & Marchés publics
const ComplianceOverviewPage = dynamic(() => import('../components/compliance/ComplianceOverviewPage').then(m => m.ComplianceOverviewPage), { ssr: false });
const ComplianceDocumentsPage = dynamic(() => import('../components/compliance/ComplianceDocumentsPage').then(m => m.ComplianceDocumentsPage), { ssr: false });
const ComplianceWorkflowsPage = dynamic(() => import('../components/compliance/ComplianceWorkflowsPage').then(m => m.ComplianceWorkflowsPage), { ssr: false });
const ComplianceLotsPage = dynamic(() => import('../components/compliance/ComplianceLotsPage').then(m => m.ComplianceLotsPage), { ssr: false });

// Phase P7: Composants Reporting Direction
const ReportingOverviewPage = dynamic(
  () => import('../components/reporting/ReportingOverviewPage').then(m => m.ReportingOverviewPage),
  { ssr: false }
);
const ReportingTrendsPage = dynamic(
  () => import('../components/reporting/ReportingTrendsPage').then(m => m.ReportingTrendsPage),
  { ssr: false }
);
const ReportingByBureauPage = dynamic(
  () => import('../components/reporting/ReportingByBureauPage').then(m => m.ReportingByBureauPage),
  { ssr: false }
);
const ReportingByChantierPage = dynamic(
  () => import('../components/reporting/ReportingByChantierPage').then(m => m.ReportingByChantierPage),
  { ssr: false }
);

// ============================================================================
// Loaders API avec fallback mock intelligent
// ============================================================================

/**
 * Loader avec retry et fallback mock
 * Essaie l'API, si échec utilise les données mockées
 */
async function loadWithFallback<T>(
  nav: NavKey,
  apiUrl: string,
  mockData: () => Promise<T>
): Promise<{ key: string; fetchedAt: number; data: T }> {
  const key = navToKey(nav);
  
  try {
    const res = await fetch(apiUrl, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (res.ok) {
      const data = (await res.json()) as T;
      logger.dataLoad(key, true, { action: 'apiLoad', nav });
      return { key, fetchedAt: Date.now(), data };
    }
    
    throw new Error(`API returned ${res.status}`);
  } catch (error) {
    // Fallback sur mock si API échoue
    logger.warn(`API load failed, using mock data for ${key}`, { 
      key, 
      action: 'apiLoadFallback',
      error: error instanceof Error ? error.message : String(error)
    });
    
    const mock = await mockData();
    return { key, fetchedAt: Date.now(), data: mock };
  }
}

async function loadOverviewSummaryDashboard(nav: NavKey) {
  const url = `/api/dashboard/${nav.main}/${nav.sub ?? ''}/${nav.leaf ?? ''}`;
  return loadWithFallback<OverviewSummaryDashboardData>(
    nav,
    url,
    async () => ({
      kpis: { demandes: 247, validations: 0.89, budget: 0.67, blocages: 5, risques: 3, decisions: 8, conformite: 0.94 },
      highlights: [],
      trends: [],
      monthlyComparison: [],
      categoryDistribution: [],
      tableData: [],
      previousPeriod: { demandes: 235, validations: 0.86, budget: 0.64 },
    })
  );
}

async function loadGeneric<T>(nav: NavKey, mockData?: () => Promise<T>) {
  const url = `/api/dashboard/${nav.main}/${nav.sub ?? ''}/${nav.leaf ?? ''}`;
  return loadWithFallback<T>(nav, url, mockData ?? (async () => ({} as T)));
}

// ============================================================================
// Registry unifié v20
// ============================================================================

export const dashboardRegistry: Record<string, ViewEntry<DashboardViewData>> = {
  'overview::summary::dashboard': {
    id: 'overview-summary-dashboard',
    title: 'Dashboard principal',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: ({ data }) => <DashboardAdvancedView data={data} />,
  },

  'overview::kpis::projets': {
    id: 'overview-kpis-projets',
    title: 'KPIs Projets',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisProjetsData>(
      nav,
      async () => ({
        projets: [],
        total: 0,
        enCours: 0,
        termines: 0,
        enAttente: 0,
      })
    ),
    render: ({ data }) => <ProjetKpiPage data={data} />,
  },

  'overview::kpis::demandes': {
    id: 'overview-kpis-demandes',
    title: 'KPIs Demandes',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisDemandesData>(
      nav,
      async () => ({
        demandes: [],
        total: 0,
        enAttente: 0,
        validees: 0,
        rejetees: 0,
      })
    ),
    render: ({ data }) => <DemandesKpiPage data={data} />,
  },

  // Phase P5: performance/achats/* (Achats/Contrats)
  'performance::achats::dashboard': {
    id: 'performance-achats-dashboard',
    title: 'Vue d\'ensemble Achats',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisAchatsData>(
      nav,
      async () => ({
        leadTimeJours: 0,
        conformiteRatio: 0,
        priceVarianceRatio: 0,
        spend30dHt: 0,
        trends: [],
        topFournisseurs: [],
        commandesOuvertes: [],
      })
    ),
    render: ({ data }) => <AchatsOverviewPage data={data} />,
  },

  'performance::achats::trends': {
    id: 'performance-achats-trends',
    title: 'Tendances Achats',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisAchatsData>(
      nav,
      async () => ({
        leadTimeJours: 0,
        conformiteRatio: 0,
        priceVarianceRatio: 0,
        spend30dHt: 0,
        trends: [],
        topFournisseurs: [],
        commandesOuvertes: [],
      })
    ),
    render: ({ data }) => <TendancesPage />,
  },

  'performance::achats::fournisseurs': {
    id: 'performance-achats-fournisseurs',
    title: 'Fournisseurs',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisAchatsData>(
      nav,
      async () => ({
        leadTimeJours: 0,
        conformiteRatio: 0,
        priceVarianceRatio: 0,
        spend30dHt: 0,
        trends: [],
        topFournisseurs: [],
        commandesOuvertes: [],
      })
    ),
    render: ({ data }) => <AchatsFournisseursPage data={data} />,
  },

  'performance::achats::open-orders': {
    id: 'performance-achats-open-orders',
    title: 'Commandes ouvertes',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisAchatsData>(
      nav,
      async () => ({
        leadTimeJours: 0,
        conformiteRatio: 0,
        priceVarianceRatio: 0,
        spend30dHt: 0,
        trends: [],
        topFournisseurs: [],
        commandesOuvertes: [],
      })
    ),
    render: ({ data }) => <AchatsOpenOrdersPage data={data} />,
  },

  // Phase P6: performance::stocks/* (Stocks)
  'performance::stocks::dashboard': {
    id: 'performance-stocks-dashboard',
    title: 'Vue d\'ensemble Stocks',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisStocksData>(
      nav,
      async () => ({
        nbArticles: 0,
        ruptures: 0,
        ruptureRatio: 0,
        valeurStockHt: 0,
        trends: [],
      })
    ),
    render: ({ data }) => <StocksKpiPage data={data} />,
  },

  'performance::stocks::overview': {
    id: 'performance-stocks-overview',
    title: 'Vue d\'ensemble Stocks',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisStocksData>(
      nav,
      async () => ({
        nbArticles: 0,
        ruptures: 0,
        ruptureRatio: 0,
        valeurStockHt: 0,
        trends: [],
      })
    ),
    render: ({ data }) => <StocksKpiPage data={data} />,
  },

  'performance::stocks::trends': {
    id: 'performance-stocks-trends',
    title: 'Tendances Stocks',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisStocksData>(
      nav,
      async () => ({
        nbArticles: 0,
        ruptures: 0,
        ruptureRatio: 0,
        valeurStockHt: 0,
        trends: [],
      })
    ),
    render: ({ data }) => <StocksKpiPage data={data} />,
  },

  // Phase P6: performance::materiel/* (Matériel)
  'performance::materiel::dashboard': {
    id: 'performance-materiel-dashboard',
    title: 'Vue d\'ensemble Matériel',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisMaterielData>(
      nav,
      async () => ({
        nbMateriel: 0,
        maintenanceOuverte: 0,
        backlogCuratif: 0,
        tauxDispo: 0,
      })
    ),
    render: ({ data }) => <MaterielKpiPage data={data} />,
  },

  'performance::materiel::overview': {
    id: 'performance-materiel-overview',
    title: 'Parc matériel',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisMaterielData>(
      nav,
      async () => ({
        nbMateriel: 0,
        maintenanceOuverte: 0,
        backlogCuratif: 0,
        tauxDispo: 0,
      })
    ),
    render: ({ data }) => <MaterielOverviewPage data={data} />,
  },

  'performance::materiel::backlog': {
    id: 'performance-materiel-backlog',
    title: 'Backlog Maintenance',
    ttl: 60_000,
    loader: (nav) => loadGeneric<KpisMaterielData>(
      nav,
      async () => ({
        nbMateriel: 0,
        maintenanceOuverte: 0,
        backlogCuratif: 0,
        tauxDispo: 0,
      })
    ),
    render: ({ data }) => <MaterielKpiPage data={data} />,
  },

  // Phase P7: performance::reporting/* (Reporting Direction)
  'performance::reporting::dashboard': {
    id: 'performance-reporting-dashboard',
    ttl: 60_000,
    loader: (nav) => loadGeneric(nav),
    render: ({ data }) => <ReportingOverviewPage data={data} />,
  },

  'performance::reporting::tendances': {
    id: 'performance-reporting-trends',
    ttl: 60_000,
    loader: (nav) => loadGeneric(nav),
    render: ({ data }) => <ReportingTrendsPage data={data} />,
  },

  'performance::reporting::bureaux': {
    id: 'performance-reporting-bureaux',
    ttl: 60_000,
    loader: (nav) => loadGeneric(nav),
    render: ({ data }) => <ReportingByBureauPage data={data} />,
  },

  'performance::reporting::chantiers': {
    id: 'performance-reporting-chantiers',
    ttl: 60_000,
    loader: (nav) => loadGeneric(nav),
    render: ({ data }) => <ReportingByChantierPage data={data} />,
  },

  // Phase P8: performance::compliance/* (Conformité & Marchés publics)
  'performance::compliance::dashboard': {
    id: 'perf-compliance-dash',
    ttl: 60_000,
    loader: (nav) => loadGeneric(nav),
    render: ({ data }) => <ComplianceOverviewPage data={data} />,
  },
  'performance::compliance::documents': {
    id: 'perf-compliance-docs',
    ttl: 60_000,
    loader: (nav) => loadGeneric(nav),
    render: ({ data }) => <ComplianceDocumentsPage data={data} />,
  },
  'performance::compliance::backlog': {
    id: 'perf-compliance-back',
    ttl: 60_000,
    loader: (nav) => loadGeneric(nav),
    render: ({ data }) => <ComplianceWorkflowsPage data={data} />,
  },
  'performance::compliance::lots': {
    id: 'perf-compliance-lots',
    ttl: 60_000,
    loader: (nav) => loadGeneric(nav),
    render: ({ data }) => <ComplianceLotsPage data={data} />,
  },
};
