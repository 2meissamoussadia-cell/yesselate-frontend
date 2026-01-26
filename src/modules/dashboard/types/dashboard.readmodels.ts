/**
 * Types de Read Models CQRS pour le Dashboard (Phase 2)
 * 
 * Contrats stricts pour les données retournées par les Read Models
 * Ces types sont utilisés par l'API et les loaders
 */

export type Main =
  | 'overview'
  | 'performance'
  | 'actions'
  | 'risks'
  | 'decisions'
  | 'realtime';

export type Sub = string | null;
export type Leaf = string | null;

/** Vue principale : overview/summary/dashboard */
export interface OverviewSummaryDashboardData {
  kpis: {
    demandes: number;
    validations: number;
    budget: number;
    blocages: number;
    risques: number;
    decisions: number;
    conformite: number;
    // Phase P3: KPIs Finance
    rat?: number;              // Revenu à Terme
    rap?: number;              // Revenu à Payer
    resteAFacturer?: number;   // Reste à Facturer
    dso?: number;              // Days Sales Outstanding
    facturesImpayees?: number; // Factures impayées
    caRealise30j?: number;     // CA réalisé (30 jours)
  };
  trends: Array<{ date: string; demandes: number; validations: number; budget: number }>;
  financeTrends?: Array<{ date: string; rat: number; rap: number; encaissements: number }>; // Phase P3
  monthlyComparison: Array<{ month: string; actuel: number; precedent: number }>;
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  tableData: Array<{ id: string; type: string; statut: string; priorite: string; date: string; bureau: string }>;
  previousPeriod: { demandes: number; validations: number; budget: number };
}

/** Vue KPI Projets */
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

/** Vue KPI Demandes */
export interface KpisDemandesData {
  demandes: Array<{ id: string; type: string; statut: string; priorite: string; date: string; bureau: string }>;
  total: number;
  enAttente: number;
  validees: number;
  rejetees: number;
}

/**
 * Read Model Finance (Phase P3)
 * KPIs Finance : RAT, RAP, RàF, DSO
 */
export interface KpisFinanceData {
  rat: number;              // Revenu à Terme (situations validées non facturées)
  rap: number;              // Revenu à Payer (factures émises non payées)
  resteAFacturer: number;   // Reste à Facturer (alias RAT)
  dso: number;              // Days Sales Outstanding (jours moyens de recouvrement)
  facturesImpayees: number; // Montant total factures impayées
  caRealise30j: number;     // CA réalisé sur 30 derniers jours
  trends: Array<{ date: string; rat: number; rap: number; encaissements: number }>;
  byBureau?: Array<{
    bureauCode: string;
    rat: number;
    rap: number;
    resteAFacturer: number;
  }>;
}

/**
 * Read Model pour performance/kpis/budget
 * 
 * TODO: Compléter selon les besoins
 */
export interface KpisBudgetData {
  budget: {
    total: number;
    consomme: number;
    reste: number;
    pourcentage: number; // ratio 0..100
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
 * Read Model pour performance/validations/global
 * 
 * TODO: Compléter selon les besoins
 */
export interface ValidationsGlobalData {
  kpis: Array<{
    id: string;
    label: string;
    value: string | number;
    trend?: string | number;
    color?: string;
  }>;
  bureauStats?: Array<{
    id: string;
    code: string;
    bureau: string;
    enAttente: number;
    validees: number;
    rejetees: number;
    tempsMoyen: number;
    slaCompliance: number; // ratio 0..1
    evolution: number;
  }>;
}

/**
 * Read Model pour overview/summary/points
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
 * Read Model pour overview/kpis/highlights
 */
export interface OverviewKpisHighlightsData {
  topKPIs: Array<{
    id: string;
    label: string;
    value: string | number;
    trend: string | number;
    tone: 'ok' | 'warn' | 'crit' | 'info';
    trendDirection: 'up' | 'down' | 'neutral';
  }>;
  risques?: Array<{
    id: string;
    label: string;
    severity: 'high' | 'medium' | 'low';
    count: number;
  }>;
}

// ============================================================================
// Type union pour tous les Read Models
// ============================================================================

/**
 * Read Model Achats/Contrats (Phase P5)
 * KPIs Achats : Lead time, Conformité (OTIF), Variance prix, Dépenses
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

/**
 * Read Model Stocks & Matériel (Phase P6)
 */
export interface KpisStocksData {
  nbArticles: number;
  ruptures: number;
  ruptureRatio: number;
  valeurStockHt: number;
  trends?: Array<{
    date: string;
    entree_qte: number;
    sortie_qte: number;
  }>;
}

export interface KpisMaterielData {
  nbMateriel: number;
  maintenanceOuverte: number;
  backlogCuratif: number;
  tauxDispo: number;
}

/**
 * Read Model Conformité & Marchés publics (Phase P8)
 */
export interface KpisComplianceData {
  ratio_completude_procedure: number;
  delai_visa_moy_j: number;
  lots_non_attribues: number;
  avenants_en_visa: number;
  contrats_pieces_incompletes: number;
  visas_backlog?: Array<{
    ref_objet: string;
    etape_en_cours?: number;
    chaine_visa: string;
    nb_etapes_restantes: number;
  }>;
  missing_docs?: Array<{
    contrat_id: string;
    manquant_ccap: boolean;
    manquant_ccag: boolean;
    manquant_pv: boolean;
  }>;
}

/**
 * Read Model Reporting Direction (Phase P7)
 * Vue synthèse mensuelle tenant-wide pour pilotage Direction
 */
export interface ReportingOverviewMonthlyData {
  mois: string;
  productionHt: number;
  factureHt: number;
  encaisseHt: number;
  rapHt: number;
  rafHt: number;
}

/**
 * DSO mensuel (12 derniers mois) pour pilotage CODIR
 */
export interface ReportingDSOMonthlyData {
  mois: string;
  dsoJours: number;
}

/**
 * Consolidation mensuelle par bureau (office)
 */
export interface ReportingByBureauMonthlyData {
  bureauCode: string;
  mois: string;
  productionHt: number;
}

/**
 * Consolidation mensuelle par chantier (site)
 */
export interface ReportingByChantierMonthlyData {
  chantierCode: string;
  mois: string;
  productionHt: number;
}

// Structure combinée pour reportingOverview (dashboard)
export interface ReportingOverviewCombinedData {
  monthly: ReportingOverviewMonthlyData[];
  dso?: ReportingDSOMonthlyData[];
}

// Aliases pour compatibilité avec l'existant
export type ReportingTrendsMonthlyData = ReportingOverviewMonthlyData;
export type ReportingByBureauData = ReportingByBureauMonthlyData;
export type ReportingByChantierData = ReportingByChantierMonthlyData;
// Alias pour compatibilité avec l'ancien type
export type ReportingOverviewData = ReportingOverviewCombinedData;

export type DashboardReadModelData =
  | OverviewSummaryDashboardData
  | OverviewSummaryPointsData
  | OverviewKpisHighlightsData
  | KpisProjetsData
  | KpisDemandesData
  | KpisBudgetData
  | ValidationsGlobalData
  | KpisFinanceData
  | KpisAchatsData
  | KpisStocksData
  | KpisMaterielData
  | KpisComplianceData
  | ReportingOverviewCombinedData
  | ReportingOverviewMonthlyData[]
  | ReportingDSOMonthlyData[]
  | ReportingByBureauMonthlyData[]
  | ReportingByChantierMonthlyData[];
