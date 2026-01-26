/**
 * Métriques Prometheus
 * Phase P4: Observabilité & Robustesse
 * 
 * Métriques pour API, DB, jobs et MViews
 */

import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Registry global
export const metricsRegistry = new Registry();

// ============================================================================
// MÉTRIQUES API
// ============================================================================

export const apiRequestCounter = new Counter({
  name: 'dashboard_api_requests_total',
  help: 'Total number of dashboard API requests',
  labelNames: ['method', 'route', 'status'],
  registers: [metricsRegistry],
});

export const apiRequestDuration = new Histogram({
  name: 'dashboard_api_request_duration_seconds',
  help: 'Duration of dashboard API requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry],
});

export const apiErrorCounter = new Counter({
  name: 'dashboard_api_errors_total',
  help: 'Total number of dashboard API errors',
  labelNames: ['method', 'route', 'error_type'],
  registers: [metricsRegistry],
});

// ============================================================================
// MÉTRIQUES DATABASE
// ============================================================================

export const dbQueryDuration = new Histogram({
  name: 'dashboard_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

export const dbPoolSize = new Gauge({
  name: 'dashboard_db_pool_size',
  help: 'Current PostgreSQL connection pool size',
  labelNames: ['state'], // 'idle', 'active', 'total'
  registers: [metricsRegistry],
});

export const dbQueryErrors = new Counter({
  name: 'dashboard_db_query_errors_total',
  help: 'Total number of database query errors',
  labelNames: ['query_type', 'error_type'],
  registers: [metricsRegistry],
});

// ============================================================================
// MÉTRIQUES MVIEWS REFRESH
// ============================================================================

export const mviewRefreshCounter = new Counter({
  name: 'dashboard_mview_refresh_total',
  help: 'Total number of materialized view refreshes',
  labelNames: ['view_name', 'trigger'], // 'event-driven' | 'cron'
  registers: [metricsRegistry],
});

export const mviewRefreshDuration = new Histogram({
  name: 'dashboard_mview_refresh_duration_seconds',
  help: 'Duration of materialized view refreshes in seconds',
  labelNames: ['view_name', 'trigger'],
  buckets: [0.5, 1, 2, 5, 10, 30],
  registers: [metricsRegistry],
});

export const mviewRefreshErrors = new Counter({
  name: 'dashboard_mview_refresh_errors_total',
  help: 'Total number of materialized view refresh errors',
  labelNames: ['view_name', 'error_type'],
  registers: [metricsRegistry],
});

export const mviewStaleness = new Gauge({
  name: 'dashboard_mview_staleness_seconds',
  help: 'Time since last refresh of materialized view (seconds)',
  labelNames: ['view_name'],
  registers: [metricsRegistry],
});

// ============================================================================
// MÉTRIQUES SLO (Phase P11: Performance & Coût)
// ============================================================================

/**
 * Compteur d'alertes SLO (budgets dépassés)
 */
export const sloBudgetExceededCounter = new Counter({
  name: 'dashboard_slo_budget_exceeded_total',
  help: 'Total number of SLO budget violations',
  labelNames: ['route', 'budget_type'], // budget_type: 'p95' | 'p99'
  registers: [metricsRegistry],
});

/**
 * Time To First Byte (TTFB) - Temps jusqu'au premier byte de la réponse
 * Budget SLO: P95 < 400ms pour les endpoints API read
 */
export const apiTTFB = new Histogram({
  name: 'dashboard_api_ttfb_seconds',
  help: 'Time To First Byte for dashboard API requests (seconds)',
  labelNames: ['method', 'route', 'cache_strategy'],
  buckets: [0.05, 0.1, 0.2, 0.4, 0.8, 1.6, 3.2], // Budget: P95 < 0.4s
  registers: [metricsRegistry],
});

/**
 * Cache hit rate - Taux de succès du cache
 */
export const cacheHitCounter = new Counter({
  name: 'dashboard_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_strategy', 'route'],
  registers: [metricsRegistry],
});

export const cacheMissCounter = new Counter({
  name: 'dashboard_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_strategy', 'route'],
  registers: [metricsRegistry],
});

/**
 * Export size - Taille des exports pour piloter les coûts
 */
export const exportSizeBytes = new Histogram({
  name: 'dashboard_export_size_bytes',
  help: 'Size of exported data in bytes',
  labelNames: ['format', 'route'], // format: csv, json, pdf, excel
  buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600], // 1KB, 10KB, 100KB, 1MB, 10MB, 100MB
  registers: [metricsRegistry],
});

/**
 * Database query cost - Coût estimé des requêtes DB
 * Basé sur pg_stat_statements (à enrichir avec des labels)
 */
export const dbQueryCost = new Histogram({
  name: 'dashboard_db_query_cost_estimated',
  help: 'Estimated cost of database queries (arbitrary units)',
  labelNames: ['query_type', 'table'],
  buckets: [1, 10, 100, 1000, 10000],
  registers: [metricsRegistry],
});

// ============================================================================
// MÉTRIQUES WORKER
// ============================================================================

export const workerNotificationsReceived = new Counter({
  name: 'dashboard_worker_notifications_total',
  help: 'Total number of PostgreSQL notifications received',
  labelNames: ['domain'],
  registers: [metricsRegistry],
});

export const workerProcessingDuration = new Histogram({
  name: 'dashboard_worker_processing_duration_seconds',
  help: 'Duration of worker notification processing in seconds',
  labelNames: ['domain'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

// ============================================================================
// MÉTRIQUES ABAC
// ============================================================================

export const abacAccessDenied = new Counter({
  name: 'dashboard_abac_access_denied_total',
  help: 'Total number of ABAC access denials',
  labelNames: ['route', 'role'],
  registers: [metricsRegistry],
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Enregistre une métrique de durée pour une opération
 * Phase P4: Observabilité
 */
export function recordDuration(
  histogram: Histogram,
  labels: Record<string, string>,
  durationSeconds: number
): void {
  histogram.observe(labels, durationSeconds);
}

/**
 * Incrémente un compteur
 * Phase P4: Observabilité
 */
export function incrementCounter(
  counter: Counter,
  labels: Record<string, string>,
  value: number = 1
): void {
  counter.inc(labels, value);
}

/**
 * Met à jour une gauge
 * Phase P4: Observabilité
 */
export function setGauge(
  gauge: Gauge,
  labels: Record<string, string>,
  value: number
): void {
  gauge.set(labels, value);
}

/**
 * Collecte toutes les métriques au format Prometheus
 * Phase P4: Observabilité
 */
export async function collectMetrics(): Promise<string> {
  return metricsRegistry.metrics();
}
