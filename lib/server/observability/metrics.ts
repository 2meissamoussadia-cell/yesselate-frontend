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
