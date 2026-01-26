/**
 * Observabilité - Exports centralisés
 * Phase P4: Observabilité & Robustesse
 */

// Telemetry (OpenTelemetry)
export { initializeTelemetry, withSpan } from './telemetry';

// Metrics (Prometheus)
export {
  metricsRegistry,
  apiRequestCounter,
  apiRequestDuration,
  apiErrorCounter,
  dbQueryDuration,
  dbPoolSize,
  dbQueryErrors,
  mviewRefreshCounter,
  mviewRefreshDuration,
  mviewRefreshErrors,
  mviewStaleness,
  workerNotificationsReceived,
  workerProcessingDuration,
  abacAccessDenied,
  recordDuration,
  incrementCounter,
  setGauge,
  collectMetrics,
} from './metrics';

// Logger (Pino)
export { logger, createChildLogger, getCorrelatedLogger, logError, logMetric } from './logger';

// HTTP Metrics (prom-client simplifié)
export { httpDuration, observeHttp } from './httpMetrics';

// Middleware
export { observabilityMiddleware } from './middleware';

// Rate Limiting
export { rateLimit } from './rateLimit';

// Health Checks
export { healthCheck } from './health';
