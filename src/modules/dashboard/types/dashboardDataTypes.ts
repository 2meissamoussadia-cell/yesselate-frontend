/**
 * Types de données pour le Dashboard Registry
 * Contrats typés pour chaque vue (remplace la "shape libre")
 * 
 * DESIGN SYSTEM DATA - Types stricts pour éviter les erreurs à l'exécution
 */

import type { NavKey } from './dashboard';

// ============================================
// TYPES DE BASE
// ============================================

export interface BaseKPIData {
  id: string;
  label: string;
  value: string | number;
  trend?: string | number;
  trendType?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan' | 'slate';
  description?: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MonthlyComparisonDataPoint {
  month: string;
  actuel: number;
  precedent: number;
}

export interface CategoryDistributionDataPoint {
  category: string;
  count: number;
  percentage: number;
}

// ============================================
// CONTRATS PAR VUE
// ============================================

/**
 * Données pour overview/summary/dashboard
 * 
 * @property kpis.validations - Ratio de validation (0..1)
 * @property kpis.budget - Ratio de budget consommé (0..1)
 * @property kpis.conformite - Ratio de conformité (0..1)
 */
export interface OverviewSummaryDashboardData {
  kpis: {
    demandes: number;
    validations: number; // ratio 0..1
    budget: number;      // ratio 0..1
    blocages: number;
    risques: number;
    decisions: number;
    conformite: number;  // ratio 0..1
  };
  highlights?: Array<{
    id: string;
    text: string;
    type?: 'critical' | 'warning' | 'info' | 'success';
  }>;
  trends: Array<{
    date: string;
    demandes: number;
    validations: number;
    budget: number;
  }>;
  monthlyComparison: Array<{
    month: string;
    actuel: number;
    precedent: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  tableData: Array<{
    id: string;
    type: string;
    statut: string;
    priorite: string;
    date: string;
    bureau: string;
  }>;
  previousPeriod: {
    demandes: number;
    validations: number;
    budget: number;
  };
}

/**
 * Données pour overview/summary/points
 */
export interface OverviewSummaryPointsData {
  points: Array<{
    id: string;
    label: string;
    value: number;
    trend?: string | number;
    color?: string;
  }>;
}

/**
 * Données pour overview/kpis/highlights
 */
export interface OverviewKpisHighlightsData {
  topKPIs: Array<{
    id: string;
    label: string;
    value: string | number;
    trend: string | number;
    tone: 'ok' | 'warn' | 'crit' | 'info';
    trendDirection: 'up' | 'down' | 'neutral';
    description?: string;
    sparkline?: number[];
  }>;
  risques?: Array<{
    id: string;
    label: string;
    severity: 'high' | 'medium' | 'low';
    count: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  rankings?: Array<{
    id: string;
    type: 'bureau' | 'region' | 'projet';
    label: string;
    items: Array<{
      name: string;
      score: number;
      trend: 'up' | 'down' | 'neutral';
    }>;
  }>;
  trends?: Array<{
    id: string;
    label: string;
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    description?: string;
  }>;
}

/**
 * Données pour performance/kpis/projets
 */
export interface KpisProjetsData {
  projets: Array<{
    id: string;
    nom: string;
    statut: 'En cours' | 'En attente' | 'Terminé';
    progression: number;
    budget: number;
    consomme: number;
  }>;
  total: number;
  enCours: number;
  termines: number;
  enAttente: number;
}

/**
 * Données pour performance/kpis/demandes
 */
export interface KpisDemandesData {
  demandes: Array<{
    id: string;
    type: string;
    statut: string;
    priorite: string;
    date: string;
    bureau: string;
  }>;
  total: number;
  enAttente: number;
  validees: number;
  rejetees: number;
}

/**
 * Données pour overview/kpis/budget
 */
export interface KpisBudgetData {
  budget: {
    total: number;
    consomme: number;
    reste: number;
    pourcentage: number;
  };
  parCategorie?: Array<{
    categorie: string;
    budget: number;
    consomme: number;
    pourcentage: number;
  }>;
  tendances?: Array<{
    mois: string;
    budget: number;
    consomme: number;
  }>;
}

/**
 * Données pour performance/validation/global
 */
export interface ValidationsGlobalData {
  kpis: Array<BaseKPIData & {
    onClick?: () => void;
  }>;
  bureauStats?: Array<{
    id: string;
    code: string;
    bureau: string;
    enAttente: number;
    validees: number;
    rejetees: number;
    tempsMoyen: number;
    slaCompliance: number;
    evolution: number;
  }>;
  recentValidations?: Array<{
    id: string;
    reference: string;
    type: 'bc' | 'facture' | 'avenant';
    statut: 'validee' | 'rejetee' | 'en-attente';
    bureau: string;
    montant: number;
    dateCreation: string;
    delai: number;
  }>;
}

/**
 * Données pour performance/achats/* (Phase P5)
 * KPIs Achats/Contrats : Lead time, Conformité (OTIF), Variance prix, Dépenses, Fournisseurs, Commandes ouvertes
 */
export interface KpisAchatsData {
  // KPIs Overview
  leadTimeJours: number;              // Délai moyen entre BC émis et BL reçu
  conformiteRatio: number;             // Ratio OTIF (BL 'recu' / total BL) - ratio 0..1
  priceVarianceRatio: number;          // Variance prix moyenne (écart reçu vs prix réf) - ratio -1..1
  spend30dHt: number;                  // Dépenses HT sur 30 derniers jours
  
  // Trends (30 derniers jours)
  trends?: Array<{
    date: string;
    bcEmis: number;                    // Nombre de BC émis ce jour
    blRecus: number;                   // Nombre de BL reçus ce jour
    spendHt: number;                   // Dépenses HT ce jour
  }>;
  
  // Top fournisseurs
  topFournisseurs?: Array<{
    id: string;
    code: string;
    nom: string;
    nbBl: number;                      // Nombre de BL reçus
    otifRatio: number;                  // Ratio OTIF (BL 'recu' / total BL) - ratio 0..1
    priceVarRatio: number;              // Variance prix moyenne - ratio -1..1
  }>;
  
  // Commandes ouvertes (BC non soldés avec quantités restantes)
  commandesOuvertes?: Array<{
    id: string;
    ref: string;                       // Référence BC
    dateEmission: string;              // Date émission BC
    delaiJours: number;                // Délai depuis émission (jours)
    fournisseurCode: string;
    fournisseurNom: string;
    bureauCode?: string;
    chantierCode?: string;
    qteCommande: number;                // Quantité totale commandée
    qteRecue: number;                  // Quantité reçue
    qteRestante: number;                 // Quantité restante à recevoir
    montantHtCommande: number;          // Montant HT commandé
  }>;
}

// ============================================
// TYPE UNION POUR TOUTES LES VUES
// ============================================

// Phase P7: Types Reporting Direction
export type {
  ReportingOverviewData,
  ReportingTrendsMonthlyData,
  ReportingByBureauData,
  ReportingByChantierData,
} from './dashboard.readmodels';

export type DashboardViewData =
  | OverviewSummaryDashboardData
  | OverviewSummaryPointsData
  | OverviewKpisHighlightsData
  | KpisProjetsData
  | KpisDemandesData
  | KpisBudgetData
  | ValidationsGlobalData
  | KpisAchatsData
  | ReportingOverviewCombinedData
  | ReportingOverviewMonthlyData[]
  | ReportingDSOMonthlyData[]
  | ReportingByBureauMonthlyData[]
  | ReportingByChantierMonthlyData[]
  | Record<string, unknown>; // Fallback pour vues non typées

// ============================================
// HELPERS DE TYPE
// ============================================

/**
 * Type guard pour vérifier le type de données
 */
export function isOverviewSummaryDashboardData(
  data: DashboardViewData
): data is OverviewSummaryDashboardData {
  return 'kpis' in data && typeof (data as any).kpis === 'object';
}

export function isKpisProjetsData(data: DashboardViewData): data is KpisProjetsData {
  return 'projets' in data && Array.isArray((data as any).projets);
}

export function isKpisDemandesData(data: DashboardViewData): data is KpisDemandesData {
  return 'demandes' in data && Array.isArray((data as any).demandes);
}

export function isKpisBudgetData(data: DashboardViewData): data is KpisBudgetData {
  return 'budget' in data && typeof (data as any).budget === 'object';
}

export function isKpisAchatsData(data: DashboardViewData): data is KpisAchatsData {
  return 'leadTimeJours' in data && typeof (data as any).leadTimeJours === 'number';
}

// ============================================
// TYPE POUR LOADER GÉNÉRIQUE
// ============================================

export type TypedLoaderFn<T extends DashboardViewData = DashboardViewData> = (
  nav: NavKey
) => Promise<{
  key: string;
  data: T;
  fetchedAt: number;
}>;
