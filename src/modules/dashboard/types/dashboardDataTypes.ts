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

/**
 * Données pour overview/alerts/actives
 */
export interface AlertsActivesData {
  alerts: Array<{
    id: string;
    ruleId: string;
    ruleName: string;
    severity: 'info' | 'warning' | 'critical';
    status: 'open' | 'ack' | 'closed';
    firstSeen: string;
    lastSeen: string;
    count: number;
    payload: Record<string, any>;
    labels?: Record<string, any>;
    bureau?: string;
    domain?: string;
  }>;
  stats: {
    total: number;
    critiques: number;
    urgentes: number;
    normales: number;
  };
}

/**
 * Données pour overview/alerts/urgentes
 * Similaire à AlertsActivesData mais filtré pour severity='warning' ou 'critical'
 */
export interface AlertsUrgentesData {
  alerts: Array<{
    id: string;
    ruleId: string;
    ruleName: string;
    severity: 'warning' | 'critical';
    status: 'open' | 'ack' | 'closed';
    firstSeen: string;
    lastSeen: string;
    count: number;
    payload: Record<string, any>;
    labels?: Record<string, any>;
    bureau?: string;
    domain?: string;
  }>;
  stats: {
    total: number;
    critiques: number;
    urgentes: number;
  };
}

/**
 * Données pour actions/inbox/urgentes
 */
export interface ActionsInboxUrgentesData {
  actions: Array<{
    id: string;
    type: 'bc' | 'paiement' | 'contrat' | 'arbitrage' | 'autre';
    title: string;
    description: string;
    bureau: string;
    urgency: 'critical' | 'warning' | 'normal';
    delay: string;
    delayDays: number;
    amount?: number;
    amountFormatted?: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate: string;
    createdAt: string;
  }>;
  stats: {
    total: number;
    enRetard: number;
    aujourdhui: number;
    cetteSemaine: number;
  };
}

/**
 * Données pour actions/inbox/aujourdhui
 * Actions avec échéance aujourd'hui
 */
export interface ActionsInboxAujourdhuiData {
  actions: Array<{
    id: string;
    type: 'bc' | 'paiement' | 'contrat' | 'arbitrage' | 'autre';
    title: string;
    description: string;
    bureau: string;
    urgency: 'critical' | 'warning' | 'normal';
    delay: string;
    delayDays: number;
    amount?: number;
    amountFormatted?: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate: string;
    createdAt: string;
  }>;
  stats: {
    total: number;
    enRetard: number;
    aujourdhui: number;
  };
}

/**
 * Données pour actions/inbox/semaine
 * Actions avec échéance cette semaine
 */
export interface ActionsInboxSemaineData {
  actions: Array<{
    id: string;
    type: 'bc' | 'paiement' | 'contrat' | 'arbitrage' | 'autre';
    title: string;
    description: string;
    bureau: string;
    urgency: 'critical' | 'warning' | 'normal';
    delay: string;
    delayDays: number;
    amount?: number;
    amountFormatted?: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate: string;
    createdAt: string;
  }>;
  stats: {
    total: number;
    cetteSemaine: number;
    prochaineSemaine: number;
  };
}

/**
 * Données pour actions/inbox/personnalisees
 * Actions filtrées selon les préférences utilisateur
 */
export interface ActionsInboxPersonnaliseesData {
  actions: Array<{
    id: string;
    type: 'bc' | 'paiement' | 'contrat' | 'arbitrage' | 'autre';
    title: string;
    description: string;
    bureau: string;
    urgency: 'critical' | 'warning' | 'normal';
    delay: string;
    delayDays: number;
    amount?: number;
    amountFormatted?: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate: string;
    createdAt: string;
    isFavorite?: boolean;
    tags?: string[];
  }>;
  stats: {
    total: number;
    favoris: number;
    avecTags: number;
    filtrees: number;
  };
}

/**
 * Données pour performance/validation/en-attente
 * Validations en attente de traitement
 */
export interface ValidationsEnAttenteData {
  validations: Array<{
    id: string;
    type: 'bc' | 'facture' | 'avenant' | 'autre';
    titre: string;
    bureau: string;
    demandeur: string;
    montant?: number;
    montantFormatted?: string;
    dateCreation: string;
    dateLimite?: string;
    urgent: boolean;
    enRetard: boolean;
    niveau: number;
    etapeActuelle: string;
  }>;
  stats: {
    total: number;
    urgentes: number;
    normales: number;
    enRetard: number;
  };
}

/**
 * Données pour performance/validation/validees
 * Validations validées
 */
export interface ValidationsValideesData {
  validations: Array<{
    id: string;
    type: 'bc' | 'facture' | 'avenant' | 'autre';
    titre: string;
    bureau: string;
    demandeur: string;
    montant?: number;
    montantFormatted?: string;
    dateValidation: string;
    validePar: string;
    dureeValidation: number; // en jours
  }>;
  stats: {
    total: number;
    cetteSemaine: number;
    ceMois: number;
    tempsMoyen: number;
  };
}

/**
 * Données pour performance/validation/rejetees
 * Validations rejetées
 */
export interface ValidationsRejeteesData {
  validations: Array<{
    id: string;
    type: 'bc' | 'facture' | 'avenant' | 'autre';
    titre: string;
    bureau: string;
    demandeur: string;
    montant?: number;
    montantFormatted?: string;
    dateRejet: string;
    rejetePar: string;
    motif: string;
  }>;
  stats: {
    total: number;
    cetteSemaine: number;
    ceMois: number;
    tauxRejet: number; // ratio 0..1
  };
}

/**
 * Données pour performance/validation/circuit
 * Circuits de validation et workflows
 */
export interface ValidationsCircuitData {
  circuits: Array<{
    id: string;
    name: string;
    description: string;
    documentType: 'bc' | 'facture' | 'avenant';
    steps: Array<{
      order: number;
      name: string;
      role: string;
      required: boolean;
      slaHours: number;
      conditions: Array<{ type: string; value: number }>;
    }>;
    thresholds: Array<{
      maxAmount: number | null;
      requiredSteps: number[];
    }>;
    isActive: boolean;
    inUse: boolean;
    hasDelegation: boolean;
  }>;
  stats: {
    totalCircuits: number;
    actifs: number;
    enUtilisation: number;
    avecDelegation: number;
  };
}

/**
 * Données pour performance/budget/consommation
 * Consommation budgétaire détaillée
 */
export interface BudgetConsommationData {
  consommation: Array<{
    id: string;
    projet?: string;
    categorie: string;
    bureau: string;
    budgetInitial: number;
    budgetConsomme: number;
    budgetRestant: number;
    pourcentage: number; // 0..100
    tendance?: 'up' | 'down' | 'stable';
  }>;
  stats: {
    totalConsomme: number;
    totalBudget: number;
    pourcentage: number; // 0..100
    parProjet: number;
    parCategorie: number;
  };
  parProjet?: Array<{
    projet: string;
    budgetInitial: number;
    budgetConsomme: number;
    pourcentage: number;
  }>;
  parCategorie?: Array<{
    categorie: string;
    budgetInitial: number;
    budgetConsomme: number;
    pourcentage: number;
  }>;
}

/**
 * Données pour performance/budget/restant
 * Budget restant disponible
 */
export interface BudgetRestantData {
  budgetRestant: Array<{
    id: string;
    projet?: string;
    categorie: string;
    bureau: string;
    budgetInitial: number;
    budgetConsomme: number;
    budgetRestant: number;
    pourcentageRestant: number; // 0..100
    isCritique: boolean; // < 10% restant
  }>;
  stats: {
    totalRestant: number;
    parProjet: number;
    parCategorie: number;
    critique: number; // Nombre de projets avec budget restant critique
  };
}

/**
 * Données pour performance/budget/previsions
 * Prévisions budgétaires
 */
export interface BudgetPrevisionsData {
  previsions: Array<{
    id: string;
    periode: string; // 'YYYY-MM' ou 'YYYY-QX' ou 'YYYY'
    projet?: string;
    categorie: string;
    budgetPrevu: number;
    budgetRealise?: number;
    variance?: number;
    variancePourcentage?: number;
  }>;
  stats: {
    totalPrevu: number;
    ceMois: number;
    ceTrimestre: number;
    cetteAnnee: number;
  };
}

/**
 * Données pour performance/budget/analyse
 * Analyse approfondie du budget
 */
export interface BudgetAnalyseData {
  analyses: Array<{
    id: string;
    projet?: string;
    categorie: string;
    periode: string;
    budgetInitial: number;
    budgetConsomme: number;
    budgetPrevu: number;
    variance: number;
    variancePourcentage: number;
    tendance: 'up' | 'down' | 'stable';
  }>;
  stats: {
    variance: number;
    tendance: number; // % d'évolution
    ecartType: number;
    projetsSurBudget: number;
  };
  tendances?: Array<{
    periode: string;
    consommation: number;
    prevision: number;
  }>;
}

/**
 * Données pour performance/delays/critiques
 * Retards critiques nécessitant une intervention immédiate
 */
export interface DelaysCritiquesData {
  retards: Array<{
    id: string;
    projet?: string;
    type: 'demande' | 'validation' | 'paiement' | 'autre';
    titre: string;
    bureau: string;
    dateEcheance: string;
    dateActuelle: string;
    joursRetard: number;
    impactBudget?: number;
    impactBudgetFormatted?: string;
    priorite: 'critical' | 'high';
    cause?: string;
  }>;
  stats: {
    total: number;
    plus30Jours: number;
    plus60Jours: number;
    impactBudget: number;
  };
}

/**
 * Données pour performance/delays/moyens
 * Retards moyens nécessitant un suivi
 */
export interface DelaysMoyensData {
  retards: Array<{
    id: string;
    projet?: string;
    type: 'demande' | 'validation' | 'paiement' | 'autre';
    titre: string;
    bureau: string;
    dateEcheance: string;
    dateActuelle: string;
    joursRetard: number;
    tendance?: 'up' | 'down' | 'stable';
  }>;
  stats: {
    total: number;
    entre7et30Jours: number;
    entre30et60Jours: number;
    enAmelioration: number;
  };
}

/**
 * Données pour performance/delays/analyse-causes
 * Analyse approfondie des causes des retards
 */
export interface DelaysAnalyseCausesData {
  analyses: Array<{
    id: string;
    cause: string;
    occurrences: number;
    projetsAffectes: number;
    impactMoyen: number; // jours de retard moyen
    tendance: 'up' | 'down' | 'stable';
    actionsCorrectives?: string[];
  }>;
  stats: {
    causesIdentifiees: number;
    causesRecurrentes: number;
    projetsAffectes: number;
    tendance: number; // % d'amélioration
  };
}

/**
 * Données pour performance/indicators/synthese
 * Synthèse des indicateurs de performance
 */
export interface PerformanceSyntheseData {
  synthese: Array<{
    id: string;
    kpi: string;
    valeur: number;
    cible: number;
    statut: 'atteint' | 'en-retard' | 'critique';
    tendance: 'up' | 'down' | 'stable';
    evolution: number; // % d'évolution
  }>;
  stats: {
    scoreGlobal: number;
    kpisAtteints: number;
    kpisEnRetard: number;
    tendance: number; // % d'évolution globale
  };
}

/**
 * Données pour performance/indicators/projets
 * Indicateurs de performance des projets
 */
export interface PerformanceProjetsData {
  projets: Array<{
    id: string;
    nom: string;
    bureau: string;
    progression: number; // 0..100
    statut: 'en-avance' | 'dans-les-temps' | 'en-retard';
    joursRetard?: number;
    budgetConsomme: number;
    budgetPrevu: number;
  }>;
  stats: {
    total: number;
    enAvance: number;
    enRetard: number;
    dansLesTemps: number;
  };
}

/**
 * Données pour performance/indicators/demandes
 * Indicateurs de performance des demandes
 */
export interface PerformanceDemandesData {
  demandes: Array<{
    id: string;
    type: string;
    titre: string;
    bureau: string;
    statut: 'traitee' | 'en-cours' | 'en-attente';
    dateCreation: string;
    dateTraitement?: string;
    delaiTraitement?: number; // jours
  }>;
  stats: {
    total: number;
    traitees: number;
    enCours: number;
    enAttente: number;
  };
}

/**
 * Données pour performance/indicators/budget
 * Indicateurs de performance budgétaire
 */
export interface PerformanceBudgetData {
  budget: Array<{
    id: string;
    projet?: string;
    categorie: string;
    budgetAlloue: number;
    budgetConsomme: number;
    budgetRestant: number;
    pourcentage: number; // 0..100
  }>;
  stats: {
    totalAlloue: number;
    totalConsomme: number;
    pourcentage: number;
    reste: number;
  };
}

/**
 * Données pour performance/trends/mensuelles
 * Tendances mensuelles de performance
 */
export interface TrendsMensuellesData {
  trends: Array<{
    id: string;
    mois: string; // Format: "2024-01"
    label: string; // Format: "Janvier 2024"
    projets: number;
    demandes: number;
    budgetConsomme: number;
    budgetPrevu: number;
    retards: number;
    scorePerformance: number; // 0..100
    evolution: number; // % d'évolution vs mois précédent
    tendance: 'up' | 'down' | 'stable';
  }>;
  stats: {
    totalMois: number;
    moyenneScore: number;
    meilleurMois: string;
    pireMois: string;
    evolutionGlobale: number;
  };
}

/**
 * Données pour performance/trends/trimestrielles
 * Tendances trimestrielles de performance
 */
export interface TrendsTrimestriellesData {
  trends: Array<{
    id: string;
    trimestre: string; // Format: "2024-Q1"
    label: string; // Format: "Q1 2024"
    projets: number;
    demandes: number;
    budgetConsomme: number;
    budgetPrevu: number;
    retards: number;
    scorePerformance: number; // 0..100
    evolution: number; // % d'évolution vs trimestre précédent
    tendance: 'up' | 'down' | 'stable';
  }>;
  stats: {
    totalTrimestres: number;
    moyenneScore: number;
    meilleurTrimestre: string;
    pireTrimestre: string;
    evolutionGlobale: number;
  };
}

/**
 * Données pour performance/trends/annuelles
 * Tendances annuelles de performance
 */
export interface TrendsAnnuellesData {
  trends: Array<{
    id: string;
    annee: string; // Format: "2024"
    projets: number;
    demandes: number;
    budgetConsomme: number;
    budgetPrevu: number;
    retards: number;
    scorePerformance: number; // 0..100
    evolution: number; // % d'évolution vs année précédente
    tendance: 'up' | 'down' | 'stable';
  }>;
  stats: {
    totalAnnees: number;
    moyenneScore: number;
    meilleureAnnee: string;
    pireAnnee: string;
    evolutionGlobale: number;
  };
}

/**
 * Données pour performance/comparison/bureaux
 * Comparaison des performances entre bureaux
 */
export interface ComparisonBureauxData {
  comparaisons: Array<{
    id: string;
    bureau: string;
    projets: number;
    demandes: number;
    budgetConsomme: number;
    budgetPrevu: number;
    retards: number;
    scorePerformance: number; // 0..100
    rang: number; // Position dans le classement
    ecartMoyen: number; // % d'écart vs moyenne
  }>;
  stats: {
    totalBureaux: number;
    meilleurBureau: string;
    pireBureau: string;
    ecartMoyen: number;
    moyenneScore: number;
  };
}

/**
 * Données pour performance/comparison/projets
 * Comparaison des performances entre projets
 */
export interface ComparisonProjetsData {
  comparaisons: Array<{
    id: string;
    projet: string;
    bureau: string;
    progression: number; // 0..100
    budgetConsomme: number;
    budgetPrevu: number;
    retards: number;
    scorePerformance: number; // 0..100
    rang: number; // Position dans le classement
    ecartMoyen: number; // % d'écart vs moyenne
  }>;
  stats: {
    totalProjets: number;
    meilleurProjet: string;
    pireProjet: string;
    ecartMoyen: number;
    moyenneScore: number;
  };
}

/**
 * Données pour performance/comparison/periode
 * Comparaison des performances entre périodes
 */
export interface ComparisonPeriodeData {
  comparaisons: Array<{
    id: string;
    periode: string; // Format: "2024-Q1", "2024-01", etc.
    label: string; // Format: "Q1 2024", "Janvier 2024", etc.
    projets: number;
    demandes: number;
    budgetConsomme: number;
    budgetPrevu: number;
    retards: number;
    scorePerformance: number; // 0..100
    evolution: number; // % d'évolution vs période précédente
  }>;
  stats: {
    meilleurePeriode: string;
    pirePeriode: string;
    tendance: number; // % de tendance globale
    evolution: number; // % d'évolution globale
    moyenneScore: number;
  };
}

/**
 * Données pour performance/comparison/benchmarking
 * Comparaison avec les standards du secteur
 */
export interface ComparisonBenchmarkingData {
  benchmarks: Array<{
    id: string;
    kpi: string;
    valeurActuelle: number;
    valeurStandard: number;
    ecart: number; // % d'écart vs standard
    statut: 'au-dessus' | 'dans-la-moyenne' | 'en-dessous';
    secteur: string; // Secteur de référence
  }>;
  stats: {
    kpisAuDessus: number;
    kpisEnDessous: number;
    kpisDansLaMoyenne: number;
    scoreGlobal: number; // 0..100
  };
}

/**
 * Données pour performance/stocks/overview
 */
export interface StocksOverviewData {
  stocks: Array<{
    id: string;
    article: string;
    categorie: string;
    quantite: number;
    quantiteMin: number;
    quantiteMax: number;
    valeurUnitaire: number;
    valeurTotale: number;
    statut: 'normal' | 'faible' | 'critique';
    dernierMouvement?: string;
  }>;
  stats: {
    totalArticles: number;
    valeurTotale: number;
    articlesFaibles: number;
    articlesCritiques: number;
  };
}

/**
 * Données pour performance/stocks/trends
 */
export interface StocksTrendsData {
  tendances: Array<{
    id: string;
    article: string;
    categorie: string;
    periode: string;
    quantiteInitiale: number;
    quantiteActuelle: number;
    variation: number;
    tendance: 'up' | 'down' | 'stable';
    rotation: number;
  }>;
  stats: {
    tendanceGlobale: number;
    rotationMoyenne: number;
    articlesCroissants: number;
    articlesDecroissants: number;
  };
}

/**
 * Données pour performance/compliance/dashboard
 */
export interface ComplianceDashboardData {
  compliance: Array<{
    id: string;
    domaine: string;
    conformes: number;
    nonConformes: number;
    enAttente: number;
    tauxConformite: number;
  }>;
  stats: {
    tauxConformite: number;
    documentsConformes: number;
    documentsNonConformes: number;
    enAttente: number;
  };
}

/**
 * Données pour performance/compliance/documents
 */
export interface ComplianceDocumentsData {
  documents: Array<{
    id: string;
    type: string;
    projet?: string;
    bureau: string;
    statut: 'critique' | 'normal' | 'en-cours';
    dateEcheance?: string;
    responsable?: string;
  }>;
  stats: {
    totalManquants: number;
    critiques: number;
    normaux: number;
    enCours: number;
  };
}

/**
 * Données pour performance/compliance/backlog
 */
export interface ComplianceBacklogData {
  backlog: Array<{
    id: string;
    type: string;
    projet?: string;
    bureau: string;
    dateDepot: string;
    dateEcheance?: string;
    statut: 'en-retard' | 'cette-semaine' | 'ce-mois';
    joursAttente: number;
  }>;
  stats: {
    total: number;
    enRetard: number;
    cetteSemaine: number;
    ceMois: number;
  };
}

/**
 * Données pour performance/compliance/lots
 */
export interface ComplianceLotsData {
  lots: Array<{
    id: string;
    lot: string;
    projet?: string;
    bureau: string;
    statut: 'critique' | 'normal' | 'en-attente';
    valeur?: number;
    dateCreation: string;
  }>;
  stats: {
    total: number;
    critiques: number;
    normaux: number;
    enAttente: number;
  };
}

/**
 * Données génériques pour les vues Risks (risques, alertes, type, analyse, actions-correctives).
 * Chaque vue expose rows + stats; l’API peut retourner des champs additionnels par ligne.
 */
export interface RisksViewData {
  rows: Array<Record<string, unknown> & { id: string }>;
  stats: { total: number; [key: string]: number };
}

/**
 * Données génériques pour les vues Decisions (pending, executed, timeline, audit, modeles).
 */
export interface DecisionsViewData {
  rows: Array<Record<string, unknown> & { id: string }>;
  stats: { total: number; [key: string]: number };
}

/**
 * Données génériques pour les vues Realtime (monitoring, alerts, notifications, sync).
 */
export interface RealtimeViewData {
  rows: Array<Record<string, unknown> & { id: string }>;
  stats: { total: number; [key: string]: number };
}

/**
 * Données pour les vues Overview Activity (timeline, notifications).
 */
export interface OverviewActivityViewData {
  rows: Array<Record<string, unknown> & { id: string }>;
  stats: { total: number; [key: string]: number };
}

/**
 * Données pour les vues Actions (type, priority, blocked, assigned, history).
 */
export interface ActionsViewData {
  rows: Array<Record<string, unknown> & { id: string }>;
  stats: { total: number; [key: string]: number };
}

export type DashboardViewData =
  | OverviewSummaryDashboardData
  | OverviewSummaryPointsData
  | OverviewKpisHighlightsData
  | KpisProjetsData
  | KpisDemandesData
  | KpisBudgetData
  | ValidationsGlobalData
  | KpisAchatsData
  | AlertsActivesData
  | ReportingOverviewCombinedData
  | ReportingOverviewMonthlyData[]
  | ReportingDSOMonthlyData[]
  | ReportingByBureauMonthlyData[]
  | ReportingByChantierMonthlyData[]
  | AlertsActivesData
  | AlertsUrgentesData
  | ActionsInboxUrgentesData
  | ActionsInboxAujourdhuiData
  | ActionsInboxSemaineData
  | ActionsInboxPersonnaliseesData
  | ValidationsEnAttenteData
  | ValidationsValideesData
  | ValidationsRejeteesData
  | ValidationsCircuitData
  | BudgetConsommationData
  | BudgetRestantData
  | BudgetPrevisionsData
  | BudgetAnalyseData
  | DelaysCritiquesData
  | DelaysMoyensData
  | DelaysAnalyseCausesData
  | PerformanceSyntheseData
  | PerformanceProjetsData
  | PerformanceDemandesData
  | PerformanceBudgetData
  | TrendsMensuellesData
  | TrendsTrimestriellesData
  | TrendsAnnuellesData
  | ComparisonBureauxData
  | ComparisonProjetsData
  | ComparisonPeriodeData
  | ComparisonBenchmarkingData
  | StocksOverviewData
  | StocksTrendsData
  | ComplianceDashboardData
  | ComplianceDocumentsData
  | ComplianceBacklogData
  | ComplianceLotsData
  | RisksViewData
  | DecisionsViewData
  | RealtimeViewData
  | OverviewActivityViewData
  | ActionsViewData
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
