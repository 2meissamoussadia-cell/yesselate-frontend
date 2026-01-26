// lib/server/observability/prometheus/slo_queries.ts
// Phase P11: Requêtes Prometheus pour dashboards SLO & budgets

/**
 * Requêtes Prometheus pour visualiser les budgets SLO
 * 
 * À utiliser dans Grafana ou directement via Prometheus
 */

// ============================================================================
// MÉTRIQUES DE BASE
// ============================================================================

/**
 * Durée totale des requêtes API (histogramme)
 */
export const API_DURATION_HISTOGRAM = 'dashboard_api_request_duration_seconds';

/**
 * Violations de budget SLO (compteur)
 */
export const SLO_VIOLATIONS = 'dashboard_slo_budget_exceeded_total';

/**
 * TTFB (Time To First Byte)
 */
export const TTFB_HISTOGRAM = 'dashboard_api_ttfb_seconds';

// ============================================================================
// REQUÊTES P95/P99
// ============================================================================

/**
 * P95 de la durée des requêtes par route
 * 
 * Utilisation: histogram_quantile(0.95, rate(dashboard_api_request_duration_seconds_bucket[5m]))
 */
export const P95_DURATION_BY_ROUTE = `
histogram_quantile(0.95, 
  sum(rate(${API_DURATION_HISTOGRAM}_bucket[5m])) by (le, route)
) by (route)
`;

/**
 * P99 de la durée des requêtes par route
 */
export const P99_DURATION_BY_ROUTE = `
histogram_quantile(0.99, 
  sum(rate(${API_DURATION_HISTOGRAM}_bucket[5m])) by (le, route)
) by (route)
`;

/**
 * P95 TTFB par route
 */
export const P95_TTFB_BY_ROUTE = `
histogram_quantile(0.95, 
  sum(rate(${TTFB_HISTOGRAM}_bucket[5m])) by (le, route)
) by (route)
`;

// ============================================================================
// VIOLATIONS DE BUDGET
// ============================================================================

/**
 * Taux de violations P95 par route (requêtes/min)
 */
export const P95_VIOLATION_RATE = `
sum(rate(${SLO_VIOLATIONS}{budget_type="p95"}[5m])) by (route)
`;

/**
 * Taux de violations P99 par route
 */
export const P99_VIOLATION_RATE = `
sum(rate(${SLO_VIOLATIONS}{budget_type="p99"}[5m])) by (route)
`;

/**
 * Total de violations sur 1h par route
 */
export const VIOLATIONS_TOTAL_1H = `
sum(increase(${SLO_VIOLATIONS}[1h])) by (route, budget_type)
`;

/**
 * Top 10 routes avec le plus de violations
 */
export const TOP_10_VIOLATIONS = `
topk(10, sum by (route) (${SLO_VIOLATIONS}))
`;

// ============================================================================
// COMPARAISON BUDGET vs RÉALITÉ
// ============================================================================

/**
 * Durée moyenne par route (pour comparaison avec budgets)
 */
export const AVG_DURATION_BY_ROUTE = `
sum(rate(${API_DURATION_HISTOGRAM}_sum[5m])) by (route) 
/ 
sum(rate(${API_DURATION_HISTOGRAM}_count[5m])) by (route)
`;

/**
 * Durée max par route (sur 5 min)
 */
export const MAX_DURATION_BY_ROUTE = `
max_over_time(
  histogram_quantile(0.99, 
    sum(rate(${API_DURATION_HISTOGRAM}_bucket[1m])) by (le, route)
  ) by (route)[5m:]
)
`;

// ============================================================================
// TAUX DE RÉUSSITE SLO
// ============================================================================

/**
 * Taux de réussite SLO (P95) par route
 * 
 * Retourne un pourcentage: 100% si toutes les requêtes respectent le budget P95
 */
export const SLO_SUCCESS_RATE_P95 = `
(
  1 - (
    sum(rate(${SLO_VIOLATIONS}{budget_type="p95"}[5m])) by (route)
    /
    sum(rate(${API_DURATION_HISTOGRAM}_count[5m])) by (route)
  )
) * 100
`;

/**
 * Taux de réussite SLO (P99) par route
 */
export const SLO_SUCCESS_RATE_P99 = `
(
  1 - (
    sum(rate(${SLO_VIOLATIONS}{budget_type="p99"}[5m])) by (route)
    /
    sum(rate(${API_DURATION_HISTOGRAM}_count[5m])) by (route)
  )
) * 100
`;

// ============================================================================
// REQUÊTES POUR DASHBOARD GRAFANA
// ============================================================================

/**
 * Requêtes prêtes pour Grafana (format tableau)
 */
export const GRAFANA_QUERIES = {
  // Panel 1: P95/P99 par route (graphique)
  durationPercentiles: {
    p95: P95_DURATION_BY_ROUTE,
    p99: P99_DURATION_BY_ROUTE,
  },
  
  // Panel 2: Violations par route (graphique)
  violations: {
    p95: P95_VIOLATION_RATE,
    p99: P99_VIOLATION_RATE,
  },
  
  // Panel 3: Taux de réussite SLO (gauge)
  successRate: {
    p95: SLO_SUCCESS_RATE_P95,
    p99: SLO_SUCCESS_RATE_P99,
  },
  
  // Panel 4: Top routes avec violations (tableau)
  topViolations: TOP_10_VIOLATIONS,
  
  // Panel 5: Durée moyenne vs max (graphique)
  durationStats: {
    avg: AVG_DURATION_BY_ROUTE,
    max: MAX_DURATION_BY_ROUTE,
  },
};
