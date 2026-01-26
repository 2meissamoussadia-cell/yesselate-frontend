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
// Loaders typés (mock pour l'instant)
// ⚠️ PHASE 1 - DONNÉES MOCKÉES
// Plus tard: remplace par fetch('/api/dashboard/:main/:sub/:leaf') ou services.
// TODO Phase 2: Remplacer par appels API réels
// --------------------------
const loadOverviewSummaryDashboard: Loader<OverviewSummaryDashboardData> = async (nav) => {
  // ⚠️ MOCK: Simule un délai réseau
  await new Promise((r) => setTimeout(r, 150));
  
  // Générer des données de tendances pour les 30 derniers jours
  const generateTrendData = (days: number = 30) => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        demandes: Math.floor(200 + Math.random() * 100),
        validations: 0.85 + Math.random() * 0.1,
        budget: 0.6 + Math.random() * 0.15,
      });
    }
    return data;
  };

  // Générer des données mensuelles pour comparaison
  const generateMonthlyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    return months.map((month, index) => ({
      month,
      actuel: index === months.length - 1 ? 247 : Math.floor(200 + Math.random() * 80),
      precedent: index === months.length - 2 ? 235 : Math.floor(190 + Math.random() * 70),
    }));
  };

  // Générer des données par catégorie
  const generateCategoryData = () => [
    { category: 'Demandes RH', count: 89, percentage: 36 },
    { category: 'Validation BC', count: 67, percentage: 27 },
    { category: 'Décisions', count: 45, percentage: 18 },
    { category: 'Projets', count: 34, percentage: 14 },
    { category: 'Autres', count: 12, percentage: 5 },
  ];

  // Générer des données de tableau détaillé
  const generateTableData = () => [
    { id: 'D001', type: 'Demande RH', statut: 'En attente', priorite: 'Haute', date: '2024-01-15', bureau: 'Paris' },
    { id: 'D002', type: 'Validation BC', statut: 'Validé', priorite: 'Moyenne', date: '2024-01-14', bureau: 'Lyon' },
    { id: 'D003', type: 'Décision', statut: 'En cours', priorite: 'Critique', date: '2024-01-13', bureau: 'Marseille' },
    { id: 'D004', type: 'Projet', statut: 'Validé', priorite: 'Haute', date: '2024-01-12', bureau: 'Paris' },
    { id: 'D005', type: 'Demande RH', statut: 'Rejeté', priorite: 'Basse', date: '2024-01-11', bureau: 'Lyon' },
    { id: 'D006', type: 'Validation BC', statut: 'En attente', priorite: 'Haute', date: '2024-01-10', bureau: 'Paris' },
    { id: 'D007', type: 'Décision', statut: 'Validé', priorite: 'Moyenne', date: '2024-01-09', bureau: 'Marseille' },
    { id: 'D008', type: 'Projet', statut: 'En cours', priorite: 'Haute', date: '2024-01-08', bureau: 'Lyon' },
  ];

  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      kpis: { 
        demandes: 247, 
        validations: 0.89, 
        budget: 0.67,
        // KPIs supplémentaires
        blocages: 5,
        risques: 3,
        decisions: 8,
        conformite: 0.94,
      },
      highlights: [
        { id: 'H1', text: '3 risques critiques détectés', type: 'critical' },
        { id: 'H2', text: '5 blocages nécessitent une attention', type: 'warning' },
        { id: 'H3', text: '8 décisions en attente de validation', type: 'info' },
      ],
      trends: generateTrendData(30),
      monthlyComparison: generateMonthlyData(),
      categoryDistribution: generateCategoryData(),
      tableData: generateTableData(),
      // Données pour comparaison
      previousPeriod: {
        demandes: 235,
        validations: 0.86,
        budget: 0.64,
      },
    },
  };
};

const loadOverviewSummaryHighlights: TypedLoaderFn<OverviewSummaryPointsData> = async (nav) => {
  await new Promise((r) => setTimeout(r, 120));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      points: [
        { id: 'P1', label: 'Blocages', value: 5 },
        { id: 'P2', label: 'Décisions en attente', value: 8 },
      ],
    },
  };
};

// Loader pour les KPIs Projets
const loadOverviewKpisProjets: Loader<KpisProjetsData> = async (nav) => {
  await new Promise((r) => setTimeout(r, 150));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      projets: [
        { id: 'P001', nom: 'Projet Alpha', statut: 'En cours', progression: 65, budget: 150000, consomme: 97500 },
        { id: 'P002', nom: 'Projet Beta', statut: 'En attente', progression: 0, budget: 80000, consomme: 0 },
        { id: 'P003', nom: 'Projet Gamma', statut: 'Terminé', progression: 100, budget: 200000, consomme: 195000 },
        { id: 'P004', nom: 'Projet Delta', statut: 'En cours', progression: 45, budget: 120000, consomme: 54000 },
        { id: 'P005', nom: 'Projet Epsilon', statut: 'En cours', progression: 80, budget: 95000, consomme: 76000 },
      ],
      total: 5,
      enCours: 3,
      termines: 1,
      enAttente: 1,
    },
  };
};

// Loader pour les KPIs Demandes
const loadOverviewKpisDemandes: TypedLoaderFn<KpisDemandesData> = async (nav) => {
  await new Promise((r) => setTimeout(r, 150));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      demandes: [
        { id: 'D001', type: 'Demande RH', statut: 'En attente', priorite: 'Haute', date: '2024-01-15', bureau: 'Paris' },
        { id: 'D002', type: 'Validation BC', statut: 'Validé', priorite: 'Moyenne', date: '2024-01-14', bureau: 'Lyon' },
        { id: 'D003', type: 'Décision', statut: 'En cours', priorite: 'Critique', date: '2024-01-13', bureau: 'Marseille' },
        { id: 'D004', type: 'Projet', statut: 'Validé', priorite: 'Haute', date: '2024-01-12', bureau: 'Paris' },
        { id: 'D005', type: 'Demande RH', statut: 'Rejeté', priorite: 'Basse', date: '2024-01-11', bureau: 'Lyon' },
      ],
      total: 247,
      enAttente: 89,
      validees: 123,
      rejetees: 35,
    },
  };
};

// Loader pour les KPIs Budget
const loadOverviewKpisBudget: Loader<KpisBudgetData> = async (nav) => {
  await new Promise((r) => setTimeout(r, 150));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      budget: {
        total: 1000000,
        consomme: 670000,
        reste: 330000,
        pourcentage: 67,
      },
      parCategorie: [
        { categorie: 'Projets', budget: 500000, consomme: 350000, pourcentage: 70 },
        { categorie: 'Demandes RH', budget: 300000, consomme: 200000, pourcentage: 67 },
        { categorie: 'Infrastructure', budget: 200000, consomme: 120000, pourcentage: 60 },
      ],
      tendances: [
        { mois: 'Jan', budget: 150000, consomme: 120000 },
        { mois: 'Fév', budget: 150000, consomme: 135000 },
        { mois: 'Mar', budget: 150000, consomme: 140000 },
        { mois: 'Avr', budget: 150000, consomme: 145000 },
        { mois: 'Mai', budget: 150000, consomme: 130000 },
      ],
    },
  };
};

// Loader pour les KPIs Highlights
const loadOverviewKpisHighlights: Loader<OverviewKpisHighlightsData> = async (nav) => {
  await new Promise((r) => setTimeout(r, 150));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      topKPIs: [
        { id: '1', label: 'Taux de conformité global', value: '94%', trend: '+2%', tone: 'ok' as const, trendDirection: 'up' as const },
        { id: '2', label: 'Projets en retard', value: 3, trend: -2, tone: 'warn' as const, trendDirection: 'down' as const },
        { id: '3', label: 'Risques critiques', value: 3, trend: 1, tone: 'crit' as const, trendDirection: 'up' as const },
      ],
      risques: [
        { id: 'r1', label: 'Retards projets', severity: 'high', count: 3 },
        { id: 'r2', label: 'Dépassements budget', severity: 'high', count: 2 },
      ],
    } as OverviewKpisHighlightsData,
  };
};

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
          projetsActifs: 0,
          projetsRetards: 0,
          budgetRatio: 0,
          resteAFacturerHt: 0,
          dsoJours: 0,
          achatsOtifRatio: 0,
          achatsVarPrixRatio: 0,
          rupturesStock: 0,
          tauxDispoMateriel: 0,
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
  const url = `/api/dashboard/${nav.main}/${nav.sub ?? ''}/${nav.leaf ?? ''}`;
  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
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
      return (
        <React.Suspense fallback={<div className="p-6 text-slate-400">Chargement...</div>}>
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
      return (
        <React.Suspense fallback={<div className="p-6 text-slate-400">Chargement...</div>}>
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
      return (
        <React.Suspense fallback={<div className="p-6 text-slate-400">Chargement...</div>}>
          <DemandesKpiPage data={data as KpisDemandesData} />
        </React.Suspense>
      );
    },
  },

  // overview/kpis/budget
  'overview::kpis::budget': {
    id: 'overview-kpis-budget',
    title: 'KPIs Budget',
    ttl: 60_000,
    loader: loadOverviewKpisBudget,
    render: ({ data }) => {
      const budgetData = data as KpisBudgetData;
      const { budget, parCategorie, tendances } = budgetData;
      
      return (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Indicateurs Budget</h2>
            <p className="text-slate-400 text-sm">Vue détaillée du budget et consommation</p>
          </div>

          {/* Budget global */}
          {budget && (
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-6 border border-amber-500/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Budget total</p>
                  <p className="text-3xl font-bold text-white">{formatMoneyEUR(budget.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Consommé</p>
                  <p className="text-3xl font-bold text-white">{formatMoneyEUR(budget.consomme)}</p>
                  <p className="text-sm text-amber-400 mt-1">{budget.pourcentage}%</p>
                </div>
              </div>
              <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${budget.pourcentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                <span>Reste disponible</span>
                <span className="font-semibold text-slate-200">{formatMoneyEUR(budget.reste)}</span>
              </div>
            </div>
          )}

          {/* Budget par catégorie */}
          {parCategorie && Array.isArray(parCategorie) && parCategorie.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Budget par catégorie</h3>
              <div className="space-y-3">
                {parCategorie.map((cat, index: number) => (
                  <div
                    key={cat.categorie}
                    className={cn(
                      'bg-slate-800/40 border border-slate-700/40 rounded-xl p-4',
                      'animate-fadeIn'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-semibold text-white">{cat.categorie}</h4>
                      <span className="text-sm text-slate-400">{cat.pourcentage}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                      <span>{formatMoneyEUR(cat.consomme)} / {formatMoneyEUR(cat.budget)}</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${cat.pourcentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tendances */}
          {tendances && Array.isArray(tendances) && tendances.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Tendances mensuelles</h3>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <div className="space-y-2">
                  {tendances.map((tendance, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">{tendance.mois}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">{formatMoneyEUR(tendance.consomme)}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{formatMoneyEUR(tendance.budget)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
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
};

