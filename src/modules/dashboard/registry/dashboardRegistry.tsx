/**
 * Registry centralisé pour les vues du Dashboard
 * Système de chargement de données et rendu conditionnel basé sur la navigation
 */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FileText, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DashboardAdvancedView } from '../components/DashboardAdvancedView';
import { CockpitDGPage } from '../components/views/CockpitDGPage';
import { CockpitDG_V2Page } from '../components/views/CockpitDG_V2Page';

// Lazy load DashboardHome (1749 lignes — Phase 1 audit #3)
const DashboardHome = dynamic(
  () => import('../components/views/DashboardHome').then((m) => ({ default: m.DashboardHome })),
  {
    loading: () => <DashboardPageSkeleton />,
    ssr: false,
  }
);
import { RapportDGPage } from '../components/views/RapportDGPage';
import { DashboardDGLayout } from '../components/views/DashboardDGLayout';
import { PortefeuilleChantiersPage } from '../components/views/PortefeuilleChantiersPage';
import { GovernancePilotageView } from '../components/views/GovernancePilotageView';
import { CalendrierEcheancesView } from '../components/views/CalendrierEcheancesView';
import { AnalyticsReportsView } from '../components/views/AnalyticsReportsView';
import { HSEConformiteView } from '../components/views/HSEConformiteView';
import { DashboardPageSkeleton } from '../components/shared/DashboardSkeleton';
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
  { loading: () => <DashboardPageSkeleton />, ssr: false }
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

/** Fallback unifié pour le chargement lazy des vues. */
function createLazyView(
  loader: () => Promise<{ default: React.ComponentType<{ data?: unknown }> }>,
  opts?: { passData?: boolean }
): ViewEntry['render'] {
  const Lazy = React.lazy(loader as () => Promise<{ default: React.ComponentType<{ data?: unknown }> }>);
  return ({ data }) => (
    <React.Suspense fallback={<DashboardPageSkeleton />}>
      {opts?.passData ? <Lazy data={data} /> : <Lazy />}
    </React.Suspense>
  );
}

// Helper pour créer une vue par défaut (fallback)
const createDefaultView = (title: string, description?: string): ViewEntry => ({
  id: `default-${title.toLowerCase().replace(/\s+/g, '-')}`,
  title,
  render: ({ nav }) => (
    <div className="p-6 space-y-4 animate-fadeIn">
      <div>
        <h1 className="sr-only">{title}</h1>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        {description && (
          <p className="text-slate-400 text-sm">{description}</p>
        )}
      </div>
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6 text-center">
        <p className="text-slate-300 mb-2">Vue en cours de développement</p>
        <p className="text-sm text-slate-400">
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

// Loader HSE : pas d'API dashboard avec main=pilotage (route rejette pilotage). Retour statique pour afficher la vue.
const loadHseView: Loader<DashboardViewData> = async (nav) => ({
  key: navToKey(nav),
  data: {} as DashboardViewData,
  fetchedAt: Date.now(),
});

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
// 6 blocs métier DG (PILOTAGE, CHANTIERS, FINANCE, CLIENTS, RH, SYSTÈME)
// --------------------------
const portefeuilleChantiers = () => <PortefeuilleChantiersPage />;
const pilotageAlertes = createLazyView(() => import('../components/views/AlertsActivesPage').then(m => ({ default: m.AlertsActivesPage })));
const chantiersDemandes = createLazyView(() => import('../components/views/DemandesKpiPage').then(m => ({ default: m.DemandesKpiPage })) as Promise<{ default: React.ComponentType<{ data?: unknown }> }>, { passData: true });
const financeBudget = createLazyView(() => import('../components/views/BudgetKpiPage').then(m => ({ default: m.BudgetKpiPage as React.ComponentType<{ data?: unknown }> })), { passData: true });
const financeValidation = createLazyView(() => import('../components/views/ValidationPaiementsPage').then(m => ({ default: m.ValidationPaiementsPage as React.ComponentType<{ data?: unknown }> })));
const clientsProjets = createLazyView(() => import('../components/views/ProjetKpiPage').then(m => ({ default: m.ProjetKpiPage })) as Promise<{ default: React.ComponentType<{ data?: unknown }> }>, { passData: true });

// Dashboard = entrée par défaut (clé canonique pilotage::dashboard::default ; fusion Cockpit DG)
const dgCockpitEntry: ViewEntry<DashboardViewData> = {
  id: 'dg-cockpit',
  title: 'Dashboard',
  ttl: 60_000,
  loader: loadOverviewSummaryDashboard,
  render: () => <DashboardDGLayout content={<DashboardHome />} />,
};

export const dashboardRegistry: DashboardRegistry = {
  // --- PILOTAGE ---
  'pilotage::dashboard::default': dgCockpitEntry,
  'pilotage::dashboard::dashboard': dgCockpitEntry,
  'pilotage::gouvernance::default': {
    id: 'pilotage-gouvernance',
    title: 'Gouvernance & décisions',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: () => <GovernancePilotageView />,
  },
  'pilotage::calendrier::default': {
    id: 'pilotage-calendrier',
    title: 'Calendrier & échéances',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: () => <CalendrierEcheancesView />,
  },
  'pilotage::analytics::default': {
    id: 'pilotage-analytics',
    title: 'Analytics & rapports',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: () => <AnalyticsReportsView />,
  },
  'pilotage::alertes::default': {
    id: 'pilotage-alertes',
    title: "Centre d'alertes",
    ttl: 30_000,
    loader: loadAlertsActivesApi,
    render: pilotageAlertes,
  },
  'pilotage::hse::default': {
    id: 'pilotage-hse',
    title: 'HSE & Conformité',
    ttl: 60_000,
    loader: loadHseView,
    render: () => <HSEConformiteView />,
  },
  'pilotage::cockpit-advanced::default': {
    id: 'dg-cockpit-advanced',
    title: 'Vue avancée 3D (IA)',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: () => <CockpitDG_V2Page />,
  },
  // --- CHANTIERS & MARCHÉS ---
  'chantiers::portefeuille::default': { id: 'chantiers-portefeuille', title: 'Portefeuille chantiers', ttl: 60_000, loader: loadOverviewSummaryDashboard, render: portefeuilleChantiers },
  'chantiers::demandes::default': { id: 'chantiers-demandes', title: 'Demandes & devis', ttl: 60_000, loader: loadOverviewKpisDemandes, render: chantiersDemandes },
  'chantiers::execution::default': createDefaultView('Exécution chantiers', 'Suivi d\'exécution'),
  'chantiers::dossiers-bloques::default': createDefaultView('Dossiers bloqués', 'Dossiers en attente de déblocage'),
  'chantiers::litiges::default': createDefaultView('Arbitrages & litiges', 'Litiges et arbitrages'),
  // --- FINANCE ---
  'finance::budget::default': { id: 'finance-budget', title: 'Budget & engagements', ttl: 60_000, loader: loadOverviewKpisBudget, render: financeBudget },
  'finance::validation-paiements::default': { id: 'finance-validation-paiements', title: 'Validation paiements', ttl: 60_000, loader: loadValidationsEnAttenteApi, render: financeValidation },
  'finance::gains-pertes::default': createDefaultView('Gains & pertes', 'Analyse gains et pertes'),
  'finance::tresorerie::default': createDefaultView('Trésorerie', 'Suivi trésorerie'),
  'finance::recouvrements::default': createDefaultView('Recouvrements', 'Suivi recouvrements'),
  // --- CLIENTS & COMMERCIAL ---
  'clients::projets::default': { id: 'clients-projets', title: 'Projets en cours', ttl: 60_000, loader: loadOverviewKpisProjets, render: clientsProjets },
  'clients::clients::default': createDefaultView('Clients', 'Répertoire clients'),
  'clients::tickets::default': createDefaultView('Tickets clients / SAV', 'Support et SAV'),
  'clients::propositions::default': createDefaultView('Propositions commerciales', 'Devis et propositions'),
  // --- RH & RESSOURCES ---
  'rh::employes::default': createDefaultView('Employés & agents', 'Effectifs et fiches'),
  'rh::missions::default': createDefaultView('Missions & affectations', 'Affectations en cours'),
  'rh::evaluations::default': createDefaultView('Évaluations', 'Évaluations et objectifs'),
  'rh::demandes-rh::default': createDefaultView('Demandes RH', 'Congés, formations, etc.'),
  'rh::organigramme::default': createDefaultView('Organigramme', 'Structure et organigramme'),
  // --- COMMUNICATION & SYSTÈME ---
  'systeme::echanges::default': createDefaultView('Échanges structures', 'Messagerie interne'),
  'systeme::conferences::default': createDefaultView('Conférences décisionnelles', 'Réunions et conférences'),
  'systeme::messages::default': createDefaultView('Messages externes', 'Emails et canaux externes'),
  'systeme::registre-decisions::default': createDefaultView('Registre des décisions', 'Décisions enregistrées'),
  'systeme::audit::default': createDefaultView('Audit & conformité', 'Traçabilité et conformité'),
  'systeme::journal-actions::default': createDefaultView('Journal des actions', 'Historique des actions'),
  'systeme::logs::default': createDefaultView('Logs système', 'Logs techniques'),
  'systeme::ia::default': createDefaultView('IA & assistants', 'Assistants et automatisations'),
  'systeme::parametres::default': createDefaultView('Paramètres', 'Configuration du système'),

  // overview/summary/* — Legacy (mode avancé 3D, non entrée par défaut)
  'overview::summary::dashboard': {
    id: 'overview-summary-dashboard',
    title: 'Cockpit (legacy)',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: () => <CockpitDGPage />,
  },

  'overview::summary::cockpit': {
    id: 'overview-summary-cockpit',
    title: 'Cockpit (legacy)',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: () => <CockpitDGPage />,
  },

  'overview::summary::cockpit-v2': {
    id: 'overview-summary-cockpit-v2',
    title: 'Vue avancée 3D (IA)',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: () => <CockpitDG_V2Page />,
  },

  'overview::summary::rapport-dg': {
    id: 'overview-summary-rapport-dg',
    title: 'Rapport DG',
    ttl: 5 * 60_000,
    render: () => <RapportDGPage />,
  },

  'overview::summary::highlights': {
    id: 'overview-summary-highlights',
    title: 'Centrale de commandement',
    ttl: 60_000,
    loader: loadOverviewSummaryHighlights,
    render: () => <CockpitDGPage />,
  },

  // overview/kpis/highlights
  'overview::kpis::highlights': {
    id: 'overview-kpis-highlights',
    title: 'Synthèse stratégique',
    ttl: 60_000,
    loader: loadOverviewKpisHighlights as TypedLoaderFn<OverviewKpisHighlightsData>,
    render: createLazyView(() => import('../components/views/HighlightsKpiPage').then(m => ({ default: m.HighlightsKpiPage }))),
  },

  // overview/kpis/projets
  'overview::kpis::projets': {
    id: 'overview-kpis-projets',
    title: 'KPIs Projets',
    ttl: 60_000,
    loader: loadOverviewKpisProjets,
    render: createLazyView(() => import('../components/views/ProjetKpiPage').then(m => ({ default: m.ProjetKpiPage })) as Promise<{ default: React.ComponentType<{ data?: unknown }> }>, { passData: true }),
  },

  // overview/kpis/demandes
  'overview::kpis::demandes': {
    id: 'overview-kpis-demandes',
    title: 'KPIs Demandes',
    ttl: 60_000,
    loader: loadOverviewKpisDemandes,
    render: createLazyView(() => import('../components/views/DemandesKpiPage').then(m => ({ default: m.DemandesKpiPage })) as Promise<{ default: React.ComponentType<{ data?: unknown }> }>, { passData: true }),
  },

  // overview/kpis/budget — utilise BudgetKpiPage (logique domaine: gouvernance/budget)
  'overview::kpis::budget': {
    id: 'overview-kpis-budget',
    title: 'KPIs Budget',
    ttl: 60_000,
    loader: loadOverviewKpisBudget,
    render: createLazyView(() => import('../components/views/BudgetKpiPage').then(m => ({ default: m.BudgetKpiPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'overview::kpis::finances': {
    id: 'overview-kpis-finances',
    title: 'Finances',
    ttl: 60_000,
    render: createLazyView(() => import('../components/views/FinancesOverviewPage').then(m => ({ default: m.FinancesOverviewPage }))),
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
    render: createLazyView(() => import('../components/views/AlertsActivesPage').then(m => ({ default: m.AlertsActivesPage }))),
  },

  'overview::alerts::urgentes': {
    id: 'overview-alerts-urgentes',
    title: 'Alertes Urgentes',
    ttl: 30_000,
    loader: loadAlertsUrgentesApi,
    render: createLazyView(() => import('../components/views/AlertsUrgentesPage').then(m => ({ default: m.AlertsUrgentesPage }))),
  },

  // Overview - Activity
  'overview::activity::timeline': {
    id: 'overview-activity-timeline',
    title: "Timeline d'Activité",
    ttl: 30_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'overview', sub: 'activity', leaf: 'timeline' }),
    render: createLazyView(() => import('../components/views/ActivityTimelinePage').then(m => ({ default: m.ActivityTimelinePage }))),
  },

  'overview::activity::notifications': {
    id: 'overview-activity-notifications',
    title: 'Notifications',
    ttl: 30_000,
    loader: loadOverviewActivityNotificationsApi,
    render: createLazyView(() => import('../components/views/ActivityNotificationsPage').then(m => ({ default: m.ActivityNotificationsPage }))),
  },

  'overview::activity::conversations': {
    id: 'overview-activity-conversations',
    title: 'Historique conversations',
    ttl: 30_000,
    render: createLazyView(() => import('../components/views/ConversationsHistoryPage').then(m => ({ default: m.ConversationsHistoryPage }))),
  },

  // Performance - Validation
  'performance::validation::en-attente': {
    id: 'performance-validation-en-attente',
    title: 'Validations En Attente',
    ttl: 60_000,
    loader: loadValidationsEnAttenteApi,
    render: createLazyView(() => import('../components/views/ValidationsEnAttentePage').then(m => ({ default: m.ValidationsEnAttentePage }))),
  },

  'performance::validation::validees': {
    id: 'performance-validation-validees',
    title: 'Validations Validées',
    ttl: 60_000,
    loader: loadValidationsValideesApi,
    render: createLazyView(() => import('../components/views/ValidationsValideesPage').then(m => ({ default: m.ValidationsValideesPage }))),
  },

  'performance::validation::rejetees': {
    id: 'performance-validation-rejetees',
    title: 'Validations Rejetées',
    ttl: 60_000,
    loader: loadValidationsRejeteesApi,
    render: createLazyView(() => import('../components/views/ValidationsRejeteesPage').then(m => ({ default: m.ValidationsRejeteesPage }))),
  },

  'performance::validation::circuit': {
    id: 'performance-validation-circuit',
    title: 'Circuit de Validation',
    ttl: 60_000,
    loader: loadValidationsCircuitApi,
    render: createLazyView(() => import('../components/views/ValidationsCircuitPage').then(m => ({ default: m.ValidationsCircuitPage }))),
  },

  // Performance - Budget détaillé
  'performance::budget::consommation': {
    id: 'performance-budget-consommation',
    title: 'Budget Consommation',
    ttl: 60_000,
    loader: loadBudgetConsommationApi,
    render: createLazyView(() => import('../components/views/BudgetConsommationPage').then(m => ({ default: m.BudgetConsommationPage }))),
  },

  'performance::budget::restant': {
    id: 'performance-budget-restant',
    title: 'Budget Restant',
    ttl: 60_000,
    loader: loadBudgetRestantApi,
    render: createLazyView(() => import('../components/views/BudgetRestantPage').then(m => ({ default: m.BudgetRestantPage }))),
  },

  'performance::budget::previsions': {
    id: 'performance-budget-previsions',
    title: 'Budget Prévisions',
    ttl: 60_000,
    loader: loadBudgetPrevisionsApi,
    render: createLazyView(() => import('../components/views/BudgetPrevisionsPage').then(m => ({ default: m.BudgetPrevisionsPage }))),
  },

  'performance::budget::analyse': {
    id: 'performance-budget-analyse',
    title: 'Budget Analyse',
    ttl: 60_000,
    loader: loadBudgetAnalyseApi,
    render: createLazyView(() => import('../components/views/BudgetAnalysePage').then(m => ({ default: m.BudgetAnalysePage }))),
  },

  // Actions - Inbox
  'actions::inbox::urgentes': {
    id: 'actions-inbox-urgentes',
    title: 'Actions Urgentes',
    ttl: 30_000,
    loader: loadActionsInboxUrgentesApi,
    render: createLazyView(() => import('../components/views/ActionsInboxUrgentesPage').then(m => ({ default: m.ActionsInboxUrgentesPage }))),
  },

  'actions::inbox::aujourdhui': {
    id: 'actions-inbox-aujourdhui',
    title: 'Actions Aujourd\'hui',
    ttl: 30_000,
    loader: loadActionsInboxAujourdhuiApi,
    render: createLazyView(() => import('../components/views/ActionsInboxAujourdhuiPage').then(m => ({ default: m.ActionsInboxAujourdhuiPage }))),
  },

  'actions::inbox::semaine': {
    id: 'actions-inbox-semaine',
    title: 'Actions Cette Semaine',
    ttl: 60_000,
    loader: loadActionsInboxSemaineApi,
    render: createLazyView(() => import('../components/views/ActionsInboxSemainePage').then(m => ({ default: m.ActionsInboxSemainePage }))),
  },

  'actions::inbox::personnalisees': {
    id: 'actions-inbox-personnalisees',
    title: 'Actions Personnalisées',
    ttl: 60_000,
    loader: loadActionsInboxPersonnaliseesApi,
    render: createLazyView(() => import('../components/views/ActionsInboxPersonnaliseesPage').then(m => ({ default: m.ActionsInboxPersonnaliseesPage }))),
  },

  // Performance - Delays
  'performance::delays::critiques': {
    id: 'performance-delays-critiques',
    title: 'Retards Critiques',
    ttl: 30_000,
    loader: loadDelaysCritiquesApi,
    render: createLazyView(() => import('../components/views/DelaysCritiquesPage').then(m => ({ default: m.DelaysCritiquesPage }))),
  },

  'performance::delays::moyens': {
    id: 'performance-delays-moyens',
    title: 'Retards Moyens',
    ttl: 60_000,
    loader: loadDelaysMoyensApi,
    render: createLazyView(() => import('../components/views/DelaysMoyensPage').then(m => ({ default: m.DelaysMoyensPage }))),
  },

  'performance::delays::analyse-causes': {
    id: 'performance-delays-analyse-causes',
    title: 'Analyse des Causes de Retards',
    ttl: 60_000,
    loader: loadDelaysAnalyseCausesApi,
    render: createLazyView(() => import('../components/views/DelaysAnalyseCausesPage').then(m => ({ default: m.DelaysAnalyseCausesPage }))),
  },

  // Performance - Stocks
  'performance::stocks::overview': {
    id: 'performance-stocks-overview',
    title: 'Stocks Vue d\'Ensemble',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'stocks', leaf: 'overview' }),
    render: createLazyView(() => import('../components/views/StocksOverviewPage').then(m => ({ default: m.StocksOverviewPage }))),
  },

  'performance::stocks::trends': {
    id: 'performance-stocks-trends',
    title: 'Stocks Tendances',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'stocks', leaf: 'trends' }),
    render: createLazyView(() => import('../components/views/StocksTrendsPage').then(m => ({ default: m.StocksTrendsPage }))),
  },

  // Performance - Materiel
  'performance::materiel::overview': {
    id: 'performance-materiel-overview',
    title: 'Parc Matériel',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'materiel', leaf: 'overview' }),
    render: createLazyView(() => import('../components/views/MaterielOverviewPage').then(m => ({ default: m.MaterielOverviewPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  // Performance - Comparison
  'performance::comparison::bureaux': {
    id: 'performance-comparison-bureaux',
    title: 'Comparaison par Bureaux',
    ttl: 60_000,
    loader: loadComparisonBureauxApi,
    render: createLazyView(() => import('../components/views/ComparisonBureauxPage').then(m => ({ default: m.ComparisonBureauxPage }))),
  },

  'performance::comparison::projets': {
    id: 'performance-comparison-projets',
    title: 'Comparaison par Projets',
    ttl: 60_000,
    loader: loadComparisonProjetsApi,
    render: createLazyView(() => import('../components/views/ComparisonProjetsPage').then(m => ({ default: m.ComparisonProjetsPage }))),
  },

  'performance::comparison::periode': {
    id: 'performance-comparison-periode',
    title: 'Comparaison par Période',
    ttl: 60_000,
    loader: loadComparisonPeriodeApi,
    render: createLazyView(() => import('../components/views/ComparisonPeriodePage').then(m => ({ default: m.ComparisonPeriodePage }))),
  },

  'performance::comparison::benchmarking': {
    id: 'performance-comparison-benchmarking',
    title: 'Benchmarking',
    ttl: 60_000,
    loader: loadComparisonBenchmarkingApi,
    render: createLazyView(() => import('../components/views/ComparisonBenchmarkingPage').then(m => ({ default: m.ComparisonBenchmarkingPage }))),
  },

  // Performance - Compliance
  'performance::compliance::dashboard': {
    id: 'performance-compliance-dashboard',
    title: 'Compliance Synthèse',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'compliance', leaf: 'dashboard' }),
    render: createLazyView(() => import('../components/views/ComplianceDashboardPage').then(m => ({ default: m.ComplianceDashboardPage }))),
  },

  'performance::compliance::documents': {
    id: 'performance-compliance-documents',
    title: 'Pièces Manquantes',
    ttl: 60_000,
    loader: loadComplianceDocumentsApi,
    render: createLazyView(() => import('../components/views/ComplianceDocumentsPage').then(m => ({ default: m.ComplianceDocumentsPage }))),
  },

  'performance::compliance::backlog': {
    id: 'performance-compliance-backlog',
    title: 'Backlog de Visas',
    ttl: 60_000,
    loader: loadComplianceBacklogApi,
    render: createLazyView(() => import('../components/views/ComplianceBacklogPage').then(m => ({ default: m.ComplianceBacklogPage }))),
  },

  'performance::compliance::lots': {
    id: 'performance-compliance-lots',
    title: 'Lots Non Attribués',
    ttl: 60_000,
    loader: loadComplianceLotsApi,
    render: createLazyView(() => import('../components/views/ComplianceLotsPage').then(m => ({ default: m.ComplianceLotsPage }))),
  },

  // Performance - Indicators
  'performance::indicators::synthese': {
    id: 'performance-indicators-synthese',
    title: 'Performance Synthèse',
    ttl: 60_000,
    loader: loadPerformanceSyntheseApi,
    render: createLazyView(() => import('../components/views/PerformanceSynthesePage').then(m => ({ default: m.PerformanceSynthesePage }))),
  },

  'performance::indicators::projets': {
    id: 'performance-indicators-projets',
    title: 'Performance Projets',
    ttl: 60_000,
    loader: loadPerformanceProjetsApi,
    render: createLazyView(() => import('../components/views/PerformanceProjetsPage').then(m => ({ default: m.PerformanceProjetsPage }))),
  },

  'performance::indicators::demandes': {
    id: 'performance-indicators-demandes',
    title: 'Performance Demandes',
    ttl: 60_000,
    loader: loadPerformanceDemandesApi,
    render: createLazyView(() => import('../components/views/PerformanceDemandesPage').then(m => ({ default: m.PerformanceDemandesPage }))),
  },

  'performance::indicators::budget': {
    id: 'performance-indicators-budget',
    title: 'Performance Budget',
    ttl: 60_000,
    loader: loadPerformanceBudgetApi,
    render: createLazyView(() => import('../components/views/PerformanceBudgetPage').then(m => ({ default: m.PerformanceBudgetPage }))),
  },

  // Performance - Trends
  'performance::trends::mensuelles': {
    id: 'performance-trends-mensuelles',
    title: 'Tendances Mensuelles',
    ttl: 60_000,
    loader: loadTrendsMensuellesApi,
    render: createLazyView(() => import('../components/views/TrendsMensuellesPage').then(m => ({ default: m.TrendsMensuellesPage }))),
  },

  'performance::trends::trimestrielles': {
    id: 'performance-trends-trimestrielles',
    title: 'Tendances Trimestrielles',
    ttl: 60_000,
    loader: loadTrendsTrimestriellesApi,
    render: createLazyView(() => import('../components/views/TrendsTrimestriellesPage').then(m => ({ default: m.TrendsTrimestriellesPage }))),
  },

  'performance::trends::annuelles': {
    id: 'performance-trends-annuelles',
    title: 'Tendances Annuelles',
    ttl: 60_000,
    loader: loadTrendsAnnuellesApi,
    render: createLazyView(() => import('../components/views/TrendsAnnuellesPage').then(m => ({ default: m.TrendsAnnuellesPage }))),
  },

  // Actions - Type
  'actions::type::contrats': {
    id: 'actions-type-contrats',
    title: 'Actions Contrats',
    ttl: 60_000,
    loader: loadActionsTypeContratsApi,
    render: createLazyView(() => import('../components/views/ActionsTypeContratsPage').then(m => ({ default: m.ActionsTypeContratsPage }))),
  },

  'actions::type::arbitrages': {
    id: 'actions-type-arbitrages',
    title: 'Actions Arbitrages',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'type', leaf: 'arbitrages' }),
    render: createLazyView(() => import('../components/views/ActionsTypeArbitragesPage').then(m => ({ default: m.ActionsTypeArbitragesPage }))),
  },

  'actions::type::paiements': {
    id: 'actions-type-paiements',
    title: 'Actions Paiements',
    ttl: 60_000,
    loader: loadActionsTypePaiementsApi,
    render: createLazyView(() => import('../components/views/ActionsTypePaiementsPage').then(m => ({ default: m.ActionsTypePaiementsPage }))),
  },

  'actions::type::bc': {
    id: 'actions-type-bc',
    title: 'Actions BC',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'type', leaf: 'bc' }),
    render: createLazyView(() => import('../components/views/ActionsTypeBcPage').then(m => ({ default: m.ActionsTypeBcPage }))),
  },

  'actions::type::autres': {
    id: 'actions-type-autres',
    title: 'Actions Autres',
    ttl: 60_000,
    loader: loadActionsTypeAutresApi,
    render: createLazyView(() => import('../components/views/ActionsTypeAutresPage').then(m => ({ default: m.ActionsTypeAutresPage }))),
  },

  'actions::priority::critique': {
    id: 'actions-priority-critique',
    title: 'Actions Priorité Critique',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'priority', leaf: 'critique' }),
    render: createLazyView(() => import('../components/views/ActionsPriorityCritiquePage').then(m => ({ default: m.ActionsPriorityCritiquePage }))),
  },

  'actions::priority::haute': {
    id: 'actions-priority-haute',
    title: 'Actions Priorité Haute',
    ttl: 60_000,
    loader: loadActionsPriorityHauteApi,
    render: createLazyView(() => import('../components/views/ActionsPriorityHautePage').then(m => ({ default: m.ActionsPriorityHautePage }))),
  },

  'actions::priority::moyenne': {
    id: 'actions-priority-moyenne',
    title: 'Actions Priorité Moyenne',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'priority', leaf: 'moyenne' }),
    render: createLazyView(() => import('../components/views/ActionsPriorityMoyennePage').then(m => ({ default: m.ActionsPriorityMoyennePage }))),
  },

  'actions::blocked::blocages': {
    id: 'actions-blocked-blocages',
    title: 'Actions Blocages',
    ttl: 60_000,
    loader: loadActionsBlockedBlocagesApi,
    render: createLazyView(() => import('../components/views/ActionsBlockedBlocagesPage').then(m => ({ default: m.ActionsBlockedBlocagesPage }))),
  },

  'actions::blocked::escalades': {
    id: 'actions-blocked-escalades',
    title: 'Actions Escalades',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'blocked', leaf: 'escalades' }),
    render: createLazyView(() => import('../components/views/ActionsBlockedEscaladesPage').then(m => ({ default: m.ActionsBlockedEscaladesPage }))),
  },

  'actions::blocked::analyse': {
    id: 'actions-blocked-analyse',
    title: 'Analyse des Blocages',
    ttl: 60_000,
    loader: loadActionsBlockedAnalyseApi,
    render: createLazyView(() => import('../components/views/ActionsBlockedAnalysePage').then(m => ({ default: m.ActionsBlockedAnalysePage }))),
  },

  'actions::assigned::moi': {
    id: 'actions-assigned-moi',
    title: 'Actions À Moi',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'assigned', leaf: 'moi' }),
    render: createLazyView(() => import('../components/views/ActionsAssignedMoiPage').then(m => ({ default: m.ActionsAssignedMoiPage }))),
  },

  'actions::assigned::equipe': {
    id: 'actions-assigned-equipe',
    title: 'Actions À Mon Équipe',
    ttl: 60_000,
    loader: loadActionsAssignedEquipeApi,
    render: createLazyView(() => import('../components/views/ActionsAssignedEquipePage').then(m => ({ default: m.ActionsAssignedEquipePage }))),
  },

  'actions::assigned::non-assignees': {
    id: 'actions-assigned-non-assignees',
    title: 'Actions Non Assignées',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'assigned', leaf: 'non-assignees' }),
    render: createLazyView(() => import('../components/views/ActionsAssignedNonAssigneesPage').then(m => ({ default: m.ActionsAssignedNonAssigneesPage }))),
  },

  'actions::history::recentes': {
    id: 'actions-history-recentes',
    title: 'Actions Récentes',
    ttl: 60_000,
    loader: loadActionsHistoryRecentesApi,
    render: createLazyView(() => import('../components/views/ActionsHistoryRecentPage').then(m => ({ default: m.ActionsHistoryRecentPage }))),
  },

  'actions::history::anciennes': {
    id: 'actions-history-anciennes',
    title: 'Actions Anciennes',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'actions', sub: 'history', leaf: 'anciennes' }),
    render: createLazyView(() => import('../components/views/ActionsHistoryAnciennesPage').then(m => ({ default: m.ActionsHistoryAnciennesPage }))),
  },

  'actions::history::archivees': {
    id: 'actions-history-archivees',
    title: 'Actions Archivées',
    ttl: 60_000,
    loader: loadActionsHistoryArchiveesApi,
    render: createLazyView(() => import('../components/views/ActionsHistoryArchiveesPage').then(m => ({ default: m.ActionsHistoryArchiveesPage }))),
  },

  'performance::bureaux::all': {
    id: 'performance-bureaux-all',
    title: 'Tous les Bureaux',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'all' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxAllPage').then(m => ({ default: m.PerformanceBureauxAllPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bmo': {
    id: 'performance-bureaux-bmo',
    title: 'BMO',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bmo' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBmoPage').then(m => ({ default: m.PerformanceBureauxBmoPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bf': {
    id: 'performance-bureaux-bf',
    title: 'BF',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bf' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBfPage').then(m => ({ default: m.PerformanceBureauxBfPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bj': {
    id: 'performance-bureaux-bj',
    title: 'BJ',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bj' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBjPage').then(m => ({ default: m.PerformanceBureauxBjPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bct': {
    id: 'performance-bureaux-bct',
    title: 'BCT',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bct' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBctPage').then(m => ({ default: m.PerformanceBureauxBctPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bop': {
    id: 'performance-bureaux-bop',
    title: 'BOP',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bop' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBopPage').then(m => ({ default: m.PerformanceBureauxBopPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bcg': {
    id: 'performance-bureaux-bcg',
    title: 'BCG',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bcg' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBcgPage').then(m => ({ default: m.PerformanceBureauxBcgPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bja': {
    id: 'performance-bureaux-bja',
    title: 'BJA',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bja' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBjaPage').then(m => ({ default: m.PerformanceBureauxBjaPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::brc': {
    id: 'performance-bureaux-brc',
    title: 'BRC',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'brc' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBrcPage').then(m => ({ default: m.PerformanceBureauxBrcPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bpl': {
    id: 'performance-bureaux-bpl',
    title: 'BPL',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bpl' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBplPage').then(m => ({ default: m.PerformanceBureauxBplPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::bex': {
    id: 'performance-bureaux-bex',
    title: 'BEX',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'bex' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxBexPage').then(m => ({ default: m.PerformanceBureauxBexPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'performance::bureaux::comparaison': {
    id: 'performance-bureaux-comparaison',
    title: 'Comparaison Bureaux',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'performance', sub: 'bureaux', leaf: 'comparaison' }),
    render: createLazyView(() => import('../components/views/PerformanceBureauxComparaisonPage').then(m => ({ default: m.PerformanceBureauxComparaisonPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'risks::critical::risques': {
    id: 'risks-critical-risques',
    title: 'Risques Critiques',
    ttl: 60_000,
    loader: loadRisksCriticalRisquesApi,
    render: createLazyView(() => import('../components/views/RisksCriticalRisquesPage').then(m => ({ default: m.RisksCriticalRisquesPage }))),
  },

  'risks::critical::alertes': {
    id: 'risks-critical-alertes',
    title: 'Alertes Critiques',
    ttl: 60_000,
    loader: loadRisksCriticalAlertesApi,
    render: createLazyView(() => import('../components/views/RisksCriticalAlertesPage').then(m => ({ default: m.RisksCriticalAlertesPage }))),
  },

  'risks::warnings::moyens': {
    id: 'risks-warnings-moyens',
    title: 'Risques Moyens',
    ttl: 60_000,
    loader: loadRisksWarningsMoyensApi,
    render: createLazyView(() => import('../components/views/RisksWarningsMoyensPage').then(m => ({ default: m.RisksWarningsMoyensPage }))),
  },

  'risks::warnings::faibles': {
    id: 'risks-warnings-faibles',
    title: 'Risques Faibles',
    ttl: 60_000,
    loader: loadRisksWarningsFaiblesApi,
    render: createLazyView(() => import('../components/views/RisksWarningsFaiblesPage').then(m => ({ default: m.RisksWarningsFaiblesPage }))),
  },

  'risks::type::paiements-retard': {
    id: 'risks-type-paiements-retard',
    title: 'Paiements en Retard',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'risks', sub: 'type', leaf: 'paiements-retard' }),
    render: createLazyView(() => import('../components/views/RisksTypePaiementsRetardPage').then(m => ({ default: m.RisksTypePaiementsRetardPage }))),
  },

  'risks::type::contrats-expires': {
    id: 'risks-type-contrats-expires',
    title: 'Contrats Expirés',
    ttl: 60_000,
    loader: loadRisksTypeContratsExpiresApi,
    render: createLazyView(() => import('../components/views/RisksTypeContratsExpiresPage').then(m => ({ default: m.RisksTypeContratsExpiresPage }))),
  },

  'risks::type::blocages': {
    id: 'risks-type-blocages',
    title: 'Blocages',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'risks', sub: 'type', leaf: 'blocages' }),
    render: createLazyView(() => import('../components/views/RisksTypeBlocagesPage').then(m => ({ default: m.RisksTypeBlocagesPage }))),
  },

  'risks::type::alertes-systeme': {
    id: 'risks-type-alertes-systeme',
    title: 'Alertes Système',
    ttl: 60_000,
    loader: loadRisksTypeAlertesSystemeApi,
    render: createLazyView(() => import('../components/views/RisksTypeAlertesSystemePage').then(m => ({ default: m.RisksTypeAlertesSystemePage }))),
  },

  'risks::analyse::tendances': {
    id: 'risks-analyse-tendances',
    title: 'Tendances des Risques',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'risks', sub: 'analyse', leaf: 'tendances' }),
    render: createLazyView(() => import('../components/views/RisksAnalyseTendancesPage').then(m => ({ default: m.RisksAnalyseTendancesPage }))),
  },

  'risks::analyse::causes-racines': {
    id: 'risks-analyse-causes-racines',
    title: 'Causes Racines',
    ttl: 60_000,
    loader: loadRisksAnalyseCausesRacinesApi,
    render: createLazyView(() => import('../components/views/RisksAnalyseCausesRacinesPage').then(m => ({ default: m.RisksAnalyseCausesRacinesPage }))),
  },

  'risks::analyse::previsions': {
    id: 'risks-analyse-previsions',
    title: 'Prévisions des Risques',
    ttl: 60_000,
    loader: loadRisksAnalysePrevisionsApi,
    render: createLazyView(() => import('../components/views/RisksAnalysePrevisionsPage').then(m => ({ default: m.RisksAnalysePrevisionsPage }))),
  },

  'risks::actions-correctives::en-cours': {
    id: 'risks-actions-correctives-en-cours',
    title: 'Actions Correctives En Cours',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'risks', sub: 'actions-correctives', leaf: 'en-cours' }),
    render: createLazyView(() => import('../components/views/RisksActionsCorrectivesEnCoursPage').then(m => ({ default: m.RisksActionsCorrectivesEnCoursPage }))),
  },

  'risks::actions-correctives::planifiees': {
    id: 'risks-actions-correctives-planifiees',
    title: 'Actions Correctives Planifiées',
    ttl: 60_000,
    loader: loadRisksActionsCorrectivesPlanifieesApi,
    render: createLazyView(() => import('../components/views/RisksActionsCorrectivesPlanifieesPage').then(m => ({ default: m.RisksActionsCorrectivesPlanifieesPage }))),
  },

  'decisions::pending::urgentes': {
    id: 'decisions-pending-urgentes',
    title: 'Décisions Urgentes',
    ttl: 60_000,
    loader: loadDecisionsPendingUrgentesApi,
    render: createLazyView(() => import('../components/views/DecisionsPendingUrgentesPage').then(m => ({ default: m.DecisionsPendingUrgentesPage }))),
  },

  'decisions::pending::normales': {
    id: 'decisions-pending-normales',
    title: 'Décisions Normales',
    ttl: 60_000,
    loader: loadDecisionsPendingNormalesApi,
    render: createLazyView(() => import('../components/views/DecisionsPendingNormalesPage').then(m => ({ default: m.DecisionsPendingNormalesPage }))),
  },

  'decisions::pending::planifiees': {
    id: 'decisions-pending-planifiees',
    title: 'Décisions Planifiées',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'pending', leaf: 'planifiees' }),
    render: createLazyView(() => import('../components/views/DecisionsPendingPlanifieesPage').then(m => ({ default: m.DecisionsPendingPlanifieesPage }))),
  },

  'decisions::executed::recentes': {
    id: 'decisions-executed-recentes',
    title: 'Décisions Récentes',
    ttl: 60_000,
    loader: loadDecisionsExecutedRecentesApi,
    render: createLazyView(() => import('../components/views/DecisionsExecutedRecentesPage').then(m => ({ default: m.DecisionsExecutedRecentesPage }))),
  },

  'decisions::executed::anciennes': {
    id: 'decisions-executed-anciennes',
    title: 'Décisions Anciennes',
    ttl: 60_000,
    loader: loadDecisionsExecutedAnciennesApi,
    render: createLazyView(() => import('../components/views/DecisionsExecutedAnciennesPage').then(m => ({ default: m.DecisionsExecutedAnciennesPage }))),
  },

  'decisions::executed::par-type': {
    id: 'decisions-executed-par-type',
    title: 'Décisions Par Type',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'executed', leaf: 'par-type' }),
    render: createLazyView(() => import('../components/views/DecisionsExecutedParTypePage').then(m => ({ default: m.DecisionsExecutedParTypePage }))),
  },

  'decisions::timeline::chronologique': {
    id: 'decisions-timeline-chronologique',
    title: 'Timeline Chronologique',
    ttl: 60_000,
    loader: loadDecisionsTimelineChronologiqueApi,
    render: createLazyView(() => import('../components/views/DecisionsTimelineChronologiquePage').then(m => ({ default: m.DecisionsTimelineChronologiquePage }))),
  },

  'decisions::timeline::par-type': {
    id: 'decisions-timeline-par-type',
    title: 'Timeline Par Type',
    ttl: 60_000,
    loader: loadDecisionsTimelineParTypeApi,
    render: createLazyView(() => import('../components/views/DecisionsTimelineParTypePage').then(m => ({ default: m.DecisionsTimelineParTypePage }))),
  },

  'decisions::timeline::par-auteur': {
    id: 'decisions-timeline-par-auteur',
    title: 'Timeline Par Auteur',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'timeline', leaf: 'par-auteur' }),
    render: createLazyView(() => import('../components/views/DecisionsTimelineParAuteurPage').then(m => ({ default: m.DecisionsTimelineParAuteurPage }))),
  },

  'decisions::audit::traces': {
    id: 'decisions-audit-traces',
    title: "Traces d'Audit",
    ttl: 60_000,
    loader: loadDecisionsAuditTracesApi,
    render: createLazyView(() => import('../components/views/DecisionsAuditTracesPage').then(m => ({ default: m.DecisionsAuditTracesPage }))),
  },

  'decisions::audit::rapports': {
    id: 'decisions-audit-rapports',
    title: "Rapports d'Audit",
    ttl: 60_000,
    loader: loadDecisionsAuditRapportsApi,
    render: createLazyView(() => import('../components/views/DecisionsAuditRapportsPage').then(m => ({ default: m.DecisionsAuditRapportsPage }))),
  },

  'decisions::audit::conformite': {
    id: 'decisions-audit-conformite',
    title: 'Conformité',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'audit', leaf: 'conformite' }),
    render: createLazyView(() => import('../components/views/DecisionsAuditConformitePage').then(m => ({ default: m.DecisionsAuditConformitePage }))),
  },

  'decisions::modeles::substitution': {
    id: 'decisions-modeles-substitution',
    title: 'Modèles de Substitution',
    ttl: 60_000,
    loader: loadDecisionsModelesSubstitutionApi,
    render: createLazyView(() => import('../components/views/DecisionsModelesSubstitutionPage').then(m => ({ default: m.DecisionsModelesSubstitutionPage }))),
  },

  'decisions::modeles::delegation': {
    id: 'decisions-modeles-delegation',
    title: 'Modèles de Délégation',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'decisions', sub: 'modeles', leaf: 'delegation' }),
    render: createLazyView(() => import('../components/views/DecisionsModelesDelegationPage').then(m => ({ default: m.DecisionsModelesDelegationPage }))),
  },

  'decisions::modeles::arbitrage': {
    id: 'decisions-modeles-arbitrage',
    title: "Modèles d'Arbitrage",
    ttl: 60_000,
    loader: loadDecisionsModelesArbitrageApi,
    render: createLazyView(() => import('../components/views/DecisionsModelesArbitragePage').then(m => ({ default: m.DecisionsModelesArbitragePage }))),
  },

  'realtime::monitoring::vue-globale': {
    id: 'realtime-monitoring-vue-globale',
    title: 'Vue Globale',
    ttl: 60_000,
    loader: loadRealtimeMonitoringVueGlobaleApi,
    render: createLazyView(() => import('../components/views/RealtimeMonitoringVueGlobalePage').then(m => ({ default: m.RealtimeMonitoringVueGlobalePage }))),
  },

  'realtime::monitoring::metriques': {
    id: 'realtime-monitoring-metriques',
    title: 'Métriques',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'realtime', sub: 'monitoring', leaf: 'metriques' }),
    render: createLazyView(() => import('../components/views/RealtimeMonitoringMetriquesPage').then(m => ({ default: m.RealtimeMonitoringMetriquesPage }))),
  },

  'realtime::monitoring::performance': {
    id: 'realtime-monitoring-performance',
    title: 'Performance',
    ttl: 60_000,
    loader: loadRealtimeMonitoringPerformanceApi,
    render: createLazyView(() => import('../components/views/RealtimeMonitoringPerformancePage').then(m => ({ default: m.RealtimeMonitoringPerformancePage }))),
  },

  'realtime::alerts::actives': {
    id: 'realtime-alerts-actives',
    title: 'Alertes Actives',
    ttl: 60_000,
    loader: loadRealtimeAlertsActivesApi,
    render: createLazyView(() => import('../components/views/RealtimeAlertsActivesPage').then(m => ({ default: m.RealtimeAlertsActivesPage }))),
  },

  'realtime::alerts::resolues': {
    id: 'realtime-alerts-resolues',
    title: 'Alertes Résolues',
    ttl: 60_000,
    loader: loadRealtimeAlertsResoluesApi,
    render: createLazyView(() => import('../components/views/RealtimeAlertsResoluesPage').then(m => ({ default: m.RealtimeAlertsResoluesPage }))),
  },

  'realtime::alerts::historique': {
    id: 'realtime-alerts-historique',
    title: 'Historique des Alertes',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'realtime', sub: 'alerts', leaf: 'historique' }),
    render: createLazyView(() => import('../components/views/RealtimeAlertsHistoriquePage').then(m => ({ default: m.RealtimeAlertsHistoriquePage }))),
  },

  'realtime::notifications::non-lues': {
    id: 'realtime-notifications-non-lues',
    title: 'Notifications Non Lues',
    ttl: 60_000,
    loader: loadRealtimeNotificationsNonLuesApi,
    render: createLazyView(() => import('../components/views/RealtimeNotificationsNonLuesPage').then(m => ({ default: m.RealtimeNotificationsNonLuesPage }))),
  },

  'realtime::notifications::toutes': {
    id: 'realtime-notifications-toutes',
    title: 'Toutes les Notifications',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'realtime', sub: 'notifications', leaf: 'toutes' }),
    render: createLazyView(() => import('../components/views/RealtimeNotificationsToutesPage').then(m => ({ default: m.RealtimeNotificationsToutesPage }))),
  },

  'realtime::notifications::preferences': {
    id: 'realtime-notifications-preferences',
    title: 'Préférences Notifications',
    ttl: 60_000,
    loader: loadRealtimeNotificationsPreferencesApi,
    render: createLazyView(() => import('../components/views/RealtimeNotificationsPreferencesPage').then(m => ({ default: m.RealtimeNotificationsPreferencesPage }))),
  },

  'realtime::sync::etat': {
    id: 'realtime-sync-etat',
    title: 'État de Synchronisation',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'realtime', sub: 'sync', leaf: 'etat' }),
    render: createLazyView(() => import('../components/views/RealtimeSyncEtatPage').then(m => ({ default: m.RealtimeSyncEtatPage }))),
  },

  'realtime::sync::historique': {
    id: 'realtime-sync-historique',
    title: 'Historique de Synchronisation',
    ttl: 60_000,
    loader: loadRealtimeSyncHistoriqueApi,
    render: createLazyView(() => import('../components/views/RealtimeSyncHistoriquePage').then(m => ({ default: m.RealtimeSyncHistoriquePage }))),
  },

  'realtime::sync::configuration': {
    id: 'realtime-sync-configuration',
    title: 'Configuration Synchronisation',
    ttl: 60_000,
    loader: loadRealtimeSyncConfigurationApi,
    render: createLazyView(() => import('../components/views/RealtimeSyncConfigurationPage').then(m => ({ default: m.RealtimeSyncConfigurationPage }))),
  },

  'administration::settings::dashboard': {
    id: 'administration-settings-dashboard',
    title: 'Paramètres Dashboard',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'settings', leaf: 'dashboard' }),
    render: createLazyView(() => import('../components/views/AdminSettingsDashboardPage').then(m => ({ default: m.AdminSettingsDashboardPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'administration::settings::kpis': {
    id: 'administration-settings-kpis',
    title: 'Paramètres KPIs',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'settings', leaf: 'kpis' }),
    render: createLazyView(() => import('../components/views/AdminSettingsKpisPage').then(m => ({ default: m.AdminSettingsKpisPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'administration::settings::notifications': {
    id: 'administration-settings-notifications',
    title: 'Paramètres Notifications',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'settings', leaf: 'notifications' }),
    render: createLazyView(() => import('../components/views/AdminSettingsNotificationsPage').then(m => ({ default: m.AdminSettingsNotificationsPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'administration::users::liste': {
    id: 'administration-users-liste',
    title: 'Liste des Utilisateurs',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'users', leaf: 'liste' }),
    render: createLazyView(() => import('../components/views/AdminUsersListePage').then(m => ({ default: m.AdminUsersListePage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'administration::users::permissions': {
    id: 'administration-users-permissions',
    title: 'Permissions Utilisateurs',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'users', leaf: 'permissions' }),
    render: createLazyView(() => import('../components/views/AdminUsersPermissionsPage').then(m => ({ default: m.AdminUsersPermissionsPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'administration::permissions::roles': {
    id: 'administration-permissions-roles',
    title: 'Rôles',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'permissions', leaf: 'roles' }),
    render: createLazyView(() => import('../components/views/AdminPermissionsRolesPage').then(m => ({ default: m.AdminPermissionsRolesPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'administration::permissions::acces': {
    id: 'administration-permissions-acces',
    title: 'Accès',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'permissions', leaf: 'acces' }),
    render: createLazyView(() => import('../components/views/AdminPermissionsAccesPage').then(m => ({ default: m.AdminPermissionsAccesPage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'administration::logs::activite': {
    id: 'administration-logs-activite',
    title: "Logs d'Activité",
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'logs', leaf: 'activite' }),
    render: createLazyView(() => import('../components/views/AdminLogsActivitePage').then(m => ({ default: m.AdminLogsActivitePage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },

  'administration::logs::systeme': {
    id: 'administration-logs-systeme',
    title: 'Logs Système',
    ttl: 60_000,
    loader: createDynamicApiLoader<DashboardViewData>({ main: 'administration', sub: 'logs', leaf: 'systeme' }),
    render: createLazyView(() => import('../components/views/AdminLogsSystemePage').then(m => ({ default: m.AdminLogsSystemePage as React.ComponentType<{ data?: unknown }> })), { passData: true }),
  },
};

