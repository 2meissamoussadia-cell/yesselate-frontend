// lib/server/dashboard/alerting/dsl_v2.ts
// Phase P17: DSL v2 d'alertes — types TypeScript

/**
 * DSL v2 : structure déclarative enrichie pour règles d'alertes avancées
 * Supporte : compositions booléennes, fenêtres temporelles, agrégations, seuils dynamiques, group-by, corrélations
 */

// ============================================================================
// SOURCE (où lire les données)
// ============================================================================

export type SourceType = 'view' | 'query';

export interface SourceView {
  view: string; // ex: "rm_finance_overview"
  params?: Record<string, unknown>; // paramètres optionnels pour la vue
}

export interface SourceQuery {
  query: string; // SQL direct
  params?: unknown[]; // paramètres SQL ($1, $2, ...)
}

export type AlertSource = 
  | ({ type: 'view' } & SourceView)
  | ({ type: 'query' } & SourceQuery);

// ============================================================================
// FENÊTRE TEMPORELLE
// ============================================================================

export type TimeRange = '15m' | '1h' | '6h' | '24h' | '7d' | '30d' | '90d';
export type Granularity = '1m' | '5m' | '15m' | '1h' | '1d';

export interface TimeWindow {
  range: TimeRange; // fenêtre de temps (ex: "30d")
  granularity?: Granularity; // bucket de calcul (optionnel, ex: "1d")
}

// ============================================================================
// AGRÉGATION
// ============================================================================

export type AggregateFunc = 'avg' | 'sum' | 'min' | 'max' | 'p50' | 'p90' | 'p95' | 'p99' | 'count' | 'stddev';

export interface Aggregate {
  metric: string; // nom du champ à agréger (ex: "dso_jours", "raf_ht")
  func: AggregateFunc; // fonction d'agrégation
  field?: string; // champ optionnel si différent de metric
}

// ============================================================================
// BASELINE (seuil dynamique)
// ============================================================================

export type BaselineFunc = 'moving_avg' | 'median' | 'percentile' | 'z_score';

export interface BaselineCompare {
  op: 'delta_pct' | 'delta_abs' | 'ratio' | 'z_score';
  gt?: number; // seuil supérieur (ex: 0.25 = +25%)
  lt?: number; // seuil inférieur
}

export interface Baseline {
  func: BaselineFunc;
  range: TimeRange; // fenêtre pour calculer le baseline (ex: "90d")
  compare: BaselineCompare; // comparaison avec le baseline
}

// ============================================================================
// CONDITION (seuil statique ou expression booléenne)
// ============================================================================

export type ComparisonOp = '>' | '>=' | '<' | '<=' | '=' | '!=' | 'in' | 'not_in';
export type LogicalOp = 'any' | 'all' | 'not';

export interface SimpleCondition {
  op: ComparisonOp;
  left: string | number; // "metric" (référence à la métrique agrégée) ou valeur littérale
  right: string | number | number[]; // valeur de seuil ou array pour "in"/"not_in"
}

export interface BooleanCondition {
  any?: Condition[]; // OR
  all?: Condition[]; // AND
  not?: Condition; // NOT
}

export type Condition = SimpleCondition | BooleanCondition;

// ============================================================================
// GROUP-BY (découpage par périmètre)
// ============================================================================

export interface GroupBy {
  keys: string[]; // ex: ["bureau_code"], ["chantier_code"], ["bureau_code", "chantier_code"]
  topN?: number; // limite aux N pires éléments (ex: 5)
  orderBy?: 'desc' | 'asc'; // ordre de tri (défaut: desc)
}

// ============================================================================
// HYSTÉRÉSIS (anti-flapping)
// ============================================================================

/** Opérateurs de seuil utilisés pour enter/exit (sous-ensemble de ComparisonOp) */
export type HysteresisOp = '>' | '>=' | '<' | '<=';

export interface Hysteresis {
  enter: Partial<Record<HysteresisOp, number>>; // seuil d'entrée (ex: { ">=": 60 })
  exit: Partial<Record<HysteresisOp, number>>; // seuil de sortie (ex: { "<=": 55 })
}

// ============================================================================
// CORRÉLATION (inter-KPIs)
// ============================================================================

export interface CorrelationCondition {
  metric: string; // nom du champ (ex: "raf_ht", "production")
  op: ComparisonOp;
  value: number | string;
  compare?: 'n-1' | 'baseline' | 'absolute'; // comparaison relative ou absolue
  delta_pct?: number; // delta en pourcentage si compare = "n-1" ou "baseline"
}

export type Correlation = CorrelationCondition[]; // AND entre conditions

// ============================================================================
// DSL V2 COMPLET
// ============================================================================

export interface AlertDSLv2 {
  source: AlertSource; // où lire (view ou query)
  window?: TimeWindow; // fenêtre temporelle (optionnel, défaut: pas de fenêtre)
  aggregate?: Aggregate; // agrégation (optionnel si source retourne déjà une valeur)
  baseline?: Baseline; // seuil dynamique (optionnel)
  condition: Condition; // condition(s) booléenne(s)
  groupBy?: GroupBy; // découpage par périmètre (optionnel)
  correlation?: Correlation; // corrélations inter-KPIs (optionnel)
  hysteresis?: Hysteresis; // anti-flapping (optionnel)
  labels?: Record<string, string>; // tags standardisés (ex: { "domain": "finance", "kpi": "DSO" })
  channels?: Record<string, boolean>; // override canaux (ex: { "email": true, "teams": true })
}

// ============================================================================
// EXEMPLES PRÊTS À L'EMPLOI
// ============================================================================

/**
 * Exemple 1: RàF > 500k€ ET Production < N-1 de 20% (moy. 30j)
 */
export const exampleDSL_RafProduction: AlertDSLv2 = {
  source: { type: 'view', view: 'rm_finance_overview' },
  window: { range: '30d', granularity: '1d' },
  aggregate: { metric: 'raf_ht', func: 'avg' },
  condition: {
    all: [
      { op: '>', left: 'metric', right: 500000 },
    ],
  },
  correlation: [
    {
      metric: 'production',
      op: '<',
      value: 0.8,
      compare: 'n-1',
      delta_pct: -0.2,
    },
  ],
  labels: { domain: 'finance', kpi: 'RàF' },
};

/**
 * Exemple 2: OTIF Achats < 85% OU Variance prix > 8%
 */
export const exampleDSL_OtifVariance: AlertDSLv2 = {
  source: { type: 'view', view: 'rm_achats_overview' },
  window: { range: '7d', granularity: '1d' },
  aggregate: { metric: 'otif_pct', func: 'avg' },
  condition: {
    any: [
      { op: '<', left: 'metric', right: 85 },
    ],
  },
  correlation: [
    {
      metric: 'variance_prix_pct',
      op: '>',
      value: 8,
    },
  ],
  labels: { domain: 'achats', kpi: 'OTIF' },
};

/**
 * Exemple 3: Stocks : ruptures > 10 ET rotation < 0.5/mois
 */
export const exampleDSL_Stocks: AlertDSLv2 = {
  source: { type: 'view', view: 'rm_stocks_overview' },
  aggregate: { metric: 'ruptures_count', func: 'sum' },
  condition: {
    all: [
      { op: '>', left: 'metric', right: 10 },
    ],
  },
  correlation: [
    {
      metric: 'rotation_mois',
      op: '<',
      value: 0.5,
    },
  ],
  groupBy: { keys: ['bureau_code'], topN: 5 },
  labels: { domain: 'stocks', kpi: 'ruptures' },
};

/**
 * Exemple 4: Matériel : dispo < 80% avec backlog curatif > 10
 */
export const exampleDSL_Materiel: AlertDSLv2 = {
  source: { type: 'view', view: 'rm_materiel_overview' },
  aggregate: { metric: 'taux_dispo_pct', func: 'avg' },
  condition: {
    all: [
      { op: '<', left: 'metric', right: 80 },
    ],
  },
  correlation: [
    {
      metric: 'backlog_curatif',
      op: '>',
      value: 10,
    },
  ],
  hysteresis: {
    enter: { '>=': 80 },
    exit: { '<=': 75 },
  },
  labels: { domain: 'materiel', kpi: 'disponibilite' },
};

/**
 * Exemple 5: Conformité : contrats incomplets > 0 OU délai de visa > 5j
 */
export const exampleDSL_Compliance: AlertDSLv2 = {
  source: { type: 'view', view: 'rm_compliance_overview' },
  aggregate: { metric: 'contrats_incomplets', func: 'count' },
  condition: {
    any: [
      { op: '>', left: 'metric', right: 0 },
    ],
  },
  correlation: [
    {
      metric: 'delai_visa_jours',
      op: '>',
      value: 5,
    },
  ],
  labels: { domain: 'compliance', kpi: 'contrats' },
};
