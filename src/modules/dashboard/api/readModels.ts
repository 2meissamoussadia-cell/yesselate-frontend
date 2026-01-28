/**
 * Read Models CQRS pour le Dashboard v20
 * 
 * Implémente les services de récupération de données depuis les read models
 * Chaque fonction correspond à une vue spécifique du dashboard
 * Utilise le système de logging unifié
 */

import type { NavKey, Main } from '../types/dashboard';
import type {
  OverviewSummaryDashboardData,
  OverviewSummaryPointsData,
  OverviewKpisHighlightsData,
  KpisProjetsData,
  KpisDemandesData,
  KpisBudgetData,
  DashboardViewData,
} from '../types/dashboardDataTypes';
import type { SecurityContext } from './types';
import { createLogger } from '../utils/logger';

const logger = createLogger('ReadModels');

// ============================================================================
// Types pour les options de récupération
// ============================================================================

export interface ReadModelOptions {
  bureauId?: string;
  chantierId?: string;
  dateFrom?: string;
  dateTo?: string;
  securityContext?: SecurityContext | null;
}

// ============================================================================
// Service principal de récupération
// ============================================================================

/**
 * Récupère les données depuis le read model selon la route
 * 
 * ✅ Phase 3: Utilise maintenant les loaders API réels via dashboardRegistry
 * Les appels passent par /api/dashboard/* avec authentification complète
 */
export async function fetchReadModel(
  nav: NavKey,
  options: ReadModelOptions = {}
): Promise<DashboardViewData> {
  const { main, sub, leaf } = nav;
  const key = `${main}::${sub || ''}::${leaf || ''}`;
  
  // Router vers le bon read model selon la route
  switch (key) {
    case 'overview::summary::dashboard':
      return await fetchOverviewSummaryDashboard(options);
    
    case 'overview::summary::points':
      return await fetchOverviewSummaryPoints(options);
    
    case 'overview::kpis::highlights':
      return await fetchOverviewKpisHighlights(options);
    
    case 'performance::kpis::projets':
      return await fetchKpisProjets(options);
    
    case 'performance::kpis::demandes':
      return await fetchKpisDemandes(options);
    
    case 'performance::kpis::budget':
      return await fetchKpisBudget(options);
    
    default:
      // Fallback: retourner des données vides
      logger.warn(`No handler for route: ${key}`, { key, action: 'fetchReadModel' });
      return {} as DashboardViewData;
  }
}

// ============================================================================
// Read Models spécifiques par vue
// ============================================================================

/**
 * Read Model pour overview/summary/dashboard
 * 
 * ⚠️ FALLBACK: Cette fonction est utilisée comme fallback uniquement.
 * Les vraies données viennent des loaders API via dashboardRegistry (Phase 3).
 */
async function fetchOverviewSummaryDashboard(
  options: ReadModelOptions
): Promise<OverviewSummaryDashboardData> {
  // ⚠️ FALLBACK: Données mockées - les vraies données viennent de /api/dashboard/*
  // Exemple:
  // const db = await getReadModelDatabase();
  // const kpis = await db.query(`
  //   SELECT 
  //     COUNT(*) as demandes,
  //     AVG(validation_rate) as validations,
  //     SUM(budget_consumed) / SUM(budget_total) as budget
  //   FROM dashboard_aggregates
  //   WHERE tenant_id = $1
  //     AND bureau_id = COALESCE($2, bureau_id)
  //     AND date >= $3 AND date <= $4
  // `, [
  //   options.securityContext?.tenantId,
  //   options.bureauId,
  //   options.dateFrom || '2024-01-01',
  //   options.dateTo || new Date().toISOString(),
  // ]);
  
  // Pour l'instant, retourner des données mockées
  // qui correspondent au contrat OverviewSummaryDashboardData
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simuler délai réseau
  
  return {
    kpis: {
      demandes: 247,
      validations: 0.89,
      budget: 0.67,
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
    tableData: [],
    previousPeriod: {
      demandes: 235,
      validations: 0.86,
      budget: 0.64,
    },
  };
}

/**
 * Read Model pour overview/summary/points
 * 
 * ⚠️ FALLBACK: Cette fonction est utilisée comme fallback uniquement.
 * Les vraies données viennent des loaders API via dashboardRegistry (Phase 3).
 */
async function fetchOverviewSummaryPoints(
  options: ReadModelOptions
): Promise<OverviewSummaryPointsData> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  return {
    points: [
      { id: 'P1', label: 'Demandes actives', value: 247, trend: '+12%', color: 'blue' },
      { id: 'P2', label: 'Taux de validation', value: 89, trend: '+3%', color: 'emerald' },
      { id: 'P3', label: 'Budget consommé', value: 67, trend: '+5%', color: 'amber' },
    ],
  };
}

/**
 * Read Model pour overview/kpis/highlights
 */
async function fetchOverviewKpisHighlights(
  options: ReadModelOptions
): Promise<OverviewKpisHighlightsData> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  return {
    highlights: [
      { id: 'H1', text: '3 risques critiques', type: 'critical' },
      { id: 'H2', text: '5 blocages', type: 'warning' },
      { id: 'H3', text: '8 décisions en attente', type: 'info' },
    ],
  };
}

/**
 * Read Model pour performance/kpis/projets
 * 
 * ⚠️ FALLBACK: Cette fonction est utilisée comme fallback uniquement.
 * Les vraies données viennent des loaders API via dashboardRegistry (Phase 3).
 */
async function fetchKpisProjets(
  options: ReadModelOptions
): Promise<KpisProjetsData> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  
  // ⚠️ FALLBACK: Données mockées - les vraies données viennent de /api/dashboard/*
  // const db = await getReadModelDatabase();
  // const projets = await db.query(`
  //   SELECT id, nom, statut, progression, budget, consomme
  //   FROM projets_read_model
  //   WHERE tenant_id = $1
  //     AND (bureau_id = $2 OR bureau_id IS NULL)
  //     AND statut IN ('En cours', 'En attente', 'Terminé')
  // `, [
  //   options.securityContext?.tenantId,
  //   options.bureauId,
  // ]);
  
  return {
    projets: [
      {
        id: 'P001',
        nom: 'Projet Alpha',
        statut: 'En cours',
        progression: 67,
        budget: 1000000,
        consomme: 670000,
      },
      {
        id: 'P002',
        nom: 'Projet Beta',
        statut: 'En attente',
        progression: 0,
        budget: 500000,
        consomme: 0,
      },
      {
        id: 'P003',
        nom: 'Projet Gamma',
        statut: 'Terminé',
        progression: 100,
        budget: 750000,
        consomme: 750000,
      },
    ],
    total: 3,
    enCours: 1,
    termines: 1,
    enAttente: 1,
  };
}

/**
 * Read Model pour performance/kpis/demandes
 * 
 * ⚠️ FALLBACK: Cette fonction est utilisée comme fallback uniquement.
 * Les vraies données viennent des loaders API via dashboardRegistry (Phase 3).
 */
async function fetchKpisDemandes(
  options: ReadModelOptions
): Promise<KpisDemandesData> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  
  // ⚠️ FALLBACK: Données mockées - les vraies données viennent de /api/dashboard/*
  // const db = await getReadModelDatabase();
  // const demandes = await db.query(`
  //   SELECT id, type, statut, priorite, date, bureau
  //   FROM demandes_read_model
  //   WHERE tenant_id = $1
  //     AND (bureau_id = $2 OR bureau_id IS NULL)
  //     AND (date >= $3 OR $3 IS NULL)
  //     AND (date <= $4 OR $4 IS NULL)
  // `, [
  //   options.securityContext?.tenantId,
  //   options.bureauId,
  //   options.dateFrom,
  //   options.dateTo,
  // ]);
  
  return {
    demandes: [
      {
        id: 'D001',
        type: 'Demande RH',
        statut: 'En attente',
        priorite: 'Haute',
        date: '2024-01-15',
        bureau: 'Paris',
      },
      {
        id: 'D002',
        type: 'Validation BC',
        statut: 'Validée',
        priorite: 'Moyenne',
        date: '2024-01-14',
        bureau: 'Lyon',
      },
      {
        id: 'D003',
        type: 'Décision',
        statut: 'Rejetée',
        priorite: 'Critique',
        date: '2024-01-13',
        bureau: 'Marseille',
      },
    ],
    total: 247,
    enAttente: 89,
    validees: 123,
    rejetees: 35,
  };
}

/**
 * Read Model pour performance/kpis/budget
 */
async function fetchKpisBudget(
  options: ReadModelOptions
): Promise<KpisBudgetData> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  
  return {
    kpis: [
      {
        id: 'budget-consomme',
        label: 'Budget consommé',
        value: '4.2 Mds',
        trend: '+5%',
        trendType: 'up',
        color: 'amber',
      },
      {
        id: 'taux-consommation',
        label: 'Taux de consommation',
        value: '67%',
        trend: '+2%',
        trendType: 'up',
        color: 'emerald',
      },
    ],
  };
}

// ============================================================================
// Helpers pour générer des données de test
// ============================================================================

function generateTrendData(days: number = 30) {
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
}

function generateMonthlyData() {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  return months.map((month, index) => ({
    month,
    actuel: index === months.length - 1 ? 247 : Math.floor(200 + Math.random() * 80),
    precedent: index === months.length - 2 ? 235 : Math.floor(190 + Math.random() * 70),
  }));
}

function generateCategoryData() {
  return [
    { category: 'Demandes RH', count: 89, percentage: 36 },
    { category: 'Validation BC', count: 67, percentage: 27 },
    { category: 'Décisions', count: 45, percentage: 18 },
    { category: 'Projets', count: 34, percentage: 14 },
    { category: 'Autres', count: 12, percentage: 5 },
  ];
}
