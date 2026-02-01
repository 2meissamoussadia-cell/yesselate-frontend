/**
 * Mapping système pour les KPIs du Dashboard BMO
 * Connecte les KPIs affichés aux APIs et aux données réelles
 */

import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Clock,
  Activity,
  TrendingUp,
  BarChart3,
  Leaf,
} from 'lucide-react';

// ============================================
// Types de base
// ============================================

export type KPITone = 'ok' | 'warn' | 'crit' | 'info';
export type KPITrend = 'up' | 'down' | 'neutral';
export type KPIPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface KPIDisplayData {
  label: string;
  value: string | number;
  delta: string;
  tone: KPITone;
  trend: KPITrend;
  icon: React.ComponentType<{ className?: string }>;
}

export interface KPIMetadata {
  id: string;
  apiKey: string; // Clé dans la réponse API
  category: 'operational' | 'financial' | 'performance' | 'quality' | 'compliance';
  unit?: string;
  target?: number;
  formula?: string;
  description: string;
  drillDownEnabled: boolean;
  comparisonEnabled: boolean;
  alertEnabled: boolean;
  exportEnabled: boolean;
}

export interface KPIMapping {
  display: KPIDisplayData;
  metadata: KPIMetadata;
  apiEndpoint?: string;
  transform?: (apiData: any) => KPIDisplayData;
}

// ============================================
// Configuration des KPIs
// ============================================

export const DASHBOARD_KPI_MAPPINGS: Record<string, KPIMapping> = {
  demandes: {
    display: {
      label: 'Demandes',
      value: 247,
      delta: '+12',
      tone: 'ok',
      trend: 'up',
      icon: FileText,
    },
    metadata: {
      id: 'demandes',
      apiKey: 'demandes',
      category: 'operational',
      description: 'Nombre total de demandes reçues et traitées',
      formula: 'COUNT(demandes)',
      target: 260,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => ({
      label: 'Demandes',
      value: data.kpis?.demandes?.value || 0,
      delta: data.kpis?.demandes?.trend > 0 
        ? `+${data.kpis.demandes.trend}` 
        : `${data.kpis?.demandes?.trend || 0}`,
      tone: data.kpis?.demandes?.value >= (data.kpis?.demandes?.target || 0) * 0.9 ? 'ok' : 'warn',
      trend: (data.kpis?.demandes?.trend || 0) > 0 ? 'up' : (data.kpis?.demandes?.trend || 0) < 0 ? 'down' : 'neutral',
      icon: FileText,
    }),
  },

  validations: {
    display: {
      label: 'Validations',
      value: '89%',
      delta: '+3%',
      tone: 'ok',
      trend: 'up',
      icon: CheckCircle2,
    },
    metadata: {
      id: 'validations',
      apiKey: 'validations',
      category: 'performance',
      unit: '%',
      description: 'Taux de validation des demandes',
      formula: '(validées / total) * 100',
      target: 92,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.kpis?.validations?.value || 0;
      const trend = data.kpis?.validations?.trend || 0;
      return {
        label: 'Validations',
        value: `${value}%`,
        delta: trend > 0 ? `+${trend}%` : `${trend}%`,
        tone: value >= 90 ? 'ok' : value >= 80 ? 'warn' : 'crit',
        trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
        icon: CheckCircle2,
      };
    },
  },

  blocages: {
    display: {
      label: 'Blocages',
      value: 5,
      delta: '-2',
      tone: 'warn',
      trend: 'down',
      icon: AlertTriangle,
    },
    metadata: {
      id: 'blocages',
      apiKey: 'blocages',
      category: 'operational',
      description: 'Nombre de dossiers actuellement bloqués',
      target: 0,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.counters?.blocages || 0;
      return {
        label: 'Blocages',
        value,
        delta: '—',
        tone: value === 0 ? 'ok' : value <= 5 ? 'warn' : 'crit',
        trend: 'neutral',
        icon: AlertTriangle,
      };
    },
  },

  risquesCritiques: {
    display: {
      label: 'Risques critiques',
      value: 3,
      delta: '+1',
      tone: 'crit',
      trend: 'up',
      icon: AlertCircle,
    },
    metadata: {
      id: 'risques-critiques',
      apiKey: 'risquesCritiques',
      category: 'compliance',
      description: 'Nombre de risques nécessitant une attention immédiate',
      target: 0,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.counters?.risquesCritiques || 0;
      return {
        label: 'Risques critiques',
        value,
        delta: '—',
        tone: value === 0 ? 'ok' : value <= 3 ? 'warn' : 'crit',
        trend: 'neutral',
        icon: AlertCircle,
      };
    },
  },

  budgetConsomme: {
    display: {
      label: 'Budget consommé',
      value: '67%',
      delta: '—',
      tone: 'info',
      trend: 'neutral',
      icon: DollarSign,
    },
    metadata: {
      id: 'budget-consomme',
      apiKey: 'budget',
      category: 'financial',
      unit: '%',
      description: 'Pourcentage du budget total consommé',
      formula: '(dépenses / budget_total) * 100',
      target: 75,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const budgetValue = data.kpis?.budget?.value || 0;
      const budgetTarget = data.kpis?.budget?.target || 0;
      const percentage = budgetTarget > 0 ? Math.round((budgetValue / budgetTarget) * 100) : 0;
      return {
        label: 'Budget consommé',
        value: `${percentage}%`,
        delta: '—',
        tone: percentage <= 75 ? 'ok' : percentage <= 90 ? 'warn' : 'crit',
        trend: 'neutral',
        icon: DollarSign,
      };
    },
  },

  decisionsEnAttente: {
    display: {
      label: 'Décisions en attente',
      value: 8,
      delta: '—',
      tone: 'warn',
      trend: 'neutral',
      icon: Clock,
    },
    metadata: {
      id: 'decisions-en-attente',
      apiKey: 'decisionsEnAttente',
      category: 'operational',
      description: 'Nombre de décisions nécessitant une action',
      target: 0,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.counters?.decisionsEnAttente || 0;
      return {
        label: 'Décisions en attente',
        value,
        delta: '—',
        tone: value === 0 ? 'ok' : value <= 5 ? 'warn' : 'crit',
        trend: 'neutral',
        icon: Clock,
      };
    },
  },

  tempsReponse: {
    display: {
      label: 'Temps réponse',
      value: '2.4j',
      delta: '-0.3j',
      tone: 'warn',
      trend: 'down',
      icon: Activity,
    },
    metadata: {
      id: 'temps-reponse',
      apiKey: 'delaiMoyen',
      category: 'performance',
      unit: 'jours',
      description: 'Délai moyen de traitement des demandes',
      formula: 'AVG(date_validation - date_reception)',
      target: 2.0,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.kpis?.delaiMoyen?.value || 0;
      const trend = data.kpis?.delaiMoyen?.trend || 0;
      return {
        label: 'Temps réponse',
        value: `${value}j`,
        delta: trend !== 0 ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}j` : '—',
        tone: value <= 2.0 ? 'ok' : value <= 3.0 ? 'warn' : 'crit',
        trend: trend < 0 ? 'down' : trend > 0 ? 'up' : 'neutral',
        icon: Activity,
      };
    },
  },

  conformiteSLA: {
    display: {
      label: 'Conformité SLA',
      value: '94%',
      delta: '+2%',
      tone: 'ok',
      trend: 'up',
      icon: TrendingUp,
    },
    metadata: {
      id: 'conformite-sla',
      apiKey: 'conformiteSLA',
      category: 'performance',
      unit: '%',
      description: 'Pourcentage de demandes respectant les SLA',
      formula: '(respectées / total) * 100',
      target: 95,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.kpis?.conformiteSLA?.value || 0;
      const trend = data.kpis?.conformiteSLA?.trend || 0;
      return {
        label: 'Conformité SLA',
        value: `${value}%`,
        delta: trend > 0 ? `+${trend}%` : `${trend}%`,
        tone: value >= 95 ? 'ok' : value >= 90 ? 'warn' : 'crit',
        trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
        icon: TrendingUp,
      };
    },
  },

  /** Phase 2 — Productivité €/h MO */
  productivite: {
    display: {
      label: 'Productivité (€/h MO)',
      value: '42',
      delta: '+2',
      tone: 'ok',
      trend: 'up',
      icon: Activity,
    },
    metadata: {
      id: 'productivite',
      apiKey: 'productivite',
      category: 'performance',
      unit: '€/h',
      description: 'Productivité main d’œuvre (euros par heure MO)',
      formula: 'CA / heures_MO',
      target: 45,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.kpis?.productivite?.value ?? 42;
      const trend = data.kpis?.productivite?.trend ?? 0;
      return {
        label: 'Productivité (€/h MO)',
        value: String(value),
        delta: trend > 0 ? `+${trend}` : trend < 0 ? `${trend}` : '—',
        tone: value >= 40 ? 'ok' : value >= 35 ? 'warn' : 'crit',
        trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
        icon: Activity,
      };
    },
  },

  /** Phase 2 — ROI moyen */
  roiMoyen: {
    display: {
      label: 'ROI moyen',
      value: '1.24',
      delta: '+0.05',
      tone: 'ok',
      trend: 'up',
      icon: TrendingUp,
    },
    metadata: {
      id: 'roi-moyen',
      apiKey: 'roiMoyen',
      category: 'financial',
      unit: '',
      description: 'Return on investment moyen (par type chantier)',
      formula: 'Bénéfice net / Investissement',
      target: 1.2,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.kpis?.roiMoyen?.value ?? 1.24;
      const trend = data.kpis?.roiMoyen?.trend ?? 0;
      return {
        label: 'ROI moyen',
        value: String(Number(value).toFixed(2)),
        delta: trend > 0 ? `+${Number(trend).toFixed(2)}` : trend < 0 ? `${Number(trend).toFixed(2)}` : '—',
        tone: value >= 1.2 ? 'ok' : value >= 1.0 ? 'warn' : 'crit',
        trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
        icon: TrendingUp,
      };
    },
  },

  /** Phase 2 — Délai moyen paiement clients (j) */
  delaiPaiement: {
    display: {
      label: 'Délai paiement',
      value: '42 j',
      delta: '-3 j',
      tone: 'ok',
      trend: 'down',
      icon: Clock,
    },
    metadata: {
      id: 'delai-paiement',
      apiKey: 'delaiPaiement',
      category: 'financial',
      unit: 'j',
      description: 'Délai moyen de paiement clients (jours)',
      formula: 'Moyenne(DATE_PAIEMENT - DATE_FACTURE)',
      target: 45,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.kpis?.delaiPaiement?.value ?? 42;
      const trend = data.kpis?.delaiPaiement?.trend ?? 0;
      return {
        label: 'Délai paiement',
        value: `${value} j`,
        delta: trend !== 0 ? `${trend > 0 ? '+' : ''}${trend} j` : '—',
        tone: value <= 45 ? 'ok' : value <= 60 ? 'warn' : 'crit',
        trend: trend < 0 ? 'down' : trend > 0 ? 'up' : 'neutral',
        icon: Clock,
      };
    },
  },

  /** Phase 2 — Taux d'utilisation (ressources) */
  tauxUtilisation: {
    display: {
      label: 'Taux utilisation',
      value: '78%',
      delta: '+2%',
      tone: 'warn',
      trend: 'up',
      icon: BarChart3,
    },
    metadata: {
      id: 'taux-utilisation',
      apiKey: 'tauxUtilisation',
      category: 'performance',
      unit: '%',
      description: 'Taux d\'utilisation des ressources (heures facturées / heures disponibles)',
      formula: 'Heures_facturées / Heures_disponibles',
      target: 80,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.kpis?.tauxUtilisation?.value ?? 78;
      const trend = data.kpis?.tauxUtilisation?.trend ?? 0;
      return {
        label: 'Taux utilisation',
        value: `${value}%`,
        delta: trend !== 0 ? `${trend > 0 ? '+' : ''}${trend}%` : '—',
        tone: value >= 80 ? 'ok' : value >= 70 ? 'warn' : 'crit',
        trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
        icon: BarChart3,
      };
    },
  },

  /** Phase 2 — Bilan carbone (tCO₂e) */
  bilanCarbone: {
    display: {
      label: 'Bilan carbone',
      value: '124',
      delta: '-8',
      tone: 'ok',
      trend: 'down',
      icon: Leaf,
    },
    metadata: {
      id: 'bilan-carbone',
      apiKey: 'bilanCarbone',
      category: 'compliance',
      unit: 'tCO₂e',
      description: 'Bilan carbone portefeuille (tonnes équivalent CO₂)',
      formula: 'Somme(émissions par chantier)',
      target: 150,
      drillDownEnabled: true,
      comparisonEnabled: true,
      alertEnabled: true,
      exportEnabled: true,
    },
    apiEndpoint: '/api/dashboard/stats',
    transform: (data: any) => {
      const value = data.kpis?.bilanCarbone?.value ?? 124;
      const trend = data.kpis?.bilanCarbone?.trend ?? 0;
      return {
        label: 'Bilan carbone',
        value: String(value),
        delta: trend !== 0 ? `${trend > 0 ? '+' : ''}${trend}` : '—',
        tone: value <= 150 ? 'ok' : value <= 200 ? 'warn' : 'crit',
        trend: trend < 0 ? 'down' : trend > 0 ? 'up' : 'neutral',
        icon: Leaf,
      };
    },
  },
};

// ============================================
// Helpers
// ============================================

/**
 * Récupère le mapping d'un KPI par son ID
 */
export function getKPIMapping(kpiId: string): KPIMapping | undefined {
  return DASHBOARD_KPI_MAPPINGS[kpiId];
}

/**
 * Récupère tous les mappings de KPIs
 */
export function getAllKPIMappings(): KPIMapping[] {
  return Object.values(DASHBOARD_KPI_MAPPINGS);
}

/**
 * Récupère les KPIs par catégorie
 */
export function getKPIsByCategory(category: KPIMetadata['category']): KPIMapping[] {
  return Object.values(DASHBOARD_KPI_MAPPINGS).filter(
    mapping => mapping.metadata.category === category
  );
}

/**
 * Transforme les données API en données d'affichage pour un KPI
 */
export function transformKPIData(kpiId: string, apiData: any): KPIDisplayData | null {
  const mapping = getKPIMapping(kpiId);
  if (!mapping || !mapping.transform) {
    return mapping?.display || null;
  }
  return mapping.transform(apiData);
}

/**
 * Récupère l'endpoint API pour un KPI
 */
export function getKPIEndpoint(kpiId: string): string | undefined {
  return getKPIMapping(kpiId)?.apiEndpoint;
}

/**
 * Récupère les métadonnées d'un KPI
 */
export function getKPIMetadata(kpiId: string): KPIMetadata | undefined {
  return getKPIMapping(kpiId)?.metadata;
}

/**
 * Récupère le mapping d'un KPI par son label
 */
export function getKPIMappingByLabel(label: string): KPIMapping | undefined {
  return Object.values(DASHBOARD_KPI_MAPPINGS).find(
    mapping => mapping.display.label === label
  );
}

/**
 * Liste des critères KPI disponibles pour le diaporama (cartes à défiler).
 * Utilisée dans les réglages BMO pour permettre à l'utilisateur de choisir
 * quels indicateurs afficher dans le bandeau du bas.
 */
export const AVAILABLE_TICKER_CRITERIA = [
  ...Object.values(DASHBOARD_KPI_MAPPINGS).map((m) => ({ id: m.metadata.id, label: m.display.label })),
  { id: 'chantiers-en-cours', label: 'Chantiers en cours' }, // présent dans mock "tous"
];

