/**
 * OpenTelemetry Configuration
 * Phase P4: Observabilité & Robustesse
 * 
 * Instrumentation pour tracing distribué, métriques et logs corrélés
 * 
 * Configuration alignée avec l'architecture ERP BTP
 */

import process from 'node:process';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes as SRA } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

/**
 * Initialise OpenTelemetry SDK
 * Phase P4: Observabilité
 * 
 * Configuration alignée avec l'architecture ERP BTP
 * À appeler au démarrage de l'application (instrumentation.ts)
 */
export function initializeTelemetry(): NodeSDK | null {
  // Désactiver si OTEL_SDK_DISABLED=true ou si pas de endpoint configuré
  if (process.env.OTEL_SDK_DISABLED === 'true') {
    console.info('[OTEL] OpenTelemetry désactivé (OTEL_SDK_DISABLED=true)');
    return null;
  }

  const tracesEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  const metricsEndpoint = process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
  const serviceName = process.env.OTEL_SERVICE_NAME || 'erp-btp-dashboard';

  // Si aucun endpoint n'est configuré, désactiver silencieusement
  if (!tracesEndpoint && !metricsEndpoint) {
    console.info('[OTEL] OpenTelemetry désactivé (aucun endpoint configuré)');
    return null;
  }

  try {
    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [SRA.SERVICE_NAME]: serviceName,
        [SRA.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SRA.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      }),
      // Traces exporter (si configuré)
      ...(tracesEndpoint && {
        traceExporter: new OTLPTraceExporter({
          url: tracesEndpoint,
          headers: {},
        }),
      }),
      // Metrics exporter (si configuré)
      ...(metricsEndpoint && {
        metricReader: new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({
            url: metricsEndpoint,
            headers: {},
          }),
          exportIntervalMillis: 60_000, // Export toutes les 60s
        }),
      }),
      // Instrumentations spécifiques (plus léger que auto-instrumentations)
      instrumentations: [
        new HttpInstrumentation(),
        new PgInstrumentation(),
      ],
    });

    (sdk.start() as unknown as Promise<void>).then(() => {
      console.log(`[OTEL] ✅ Tracing started (service: ${serviceName}${tracesEndpoint ? `, traces: ${tracesEndpoint}` : ''}${metricsEndpoint ? `, metrics: ${metricsEndpoint}` : ''})`);
    }).catch((err) => {
      console.error('[OTEL] ❌ Init error:', err);
    });

    // Arrêt propre
    process.on('SIGTERM', () => {
      (sdk.shutdown() as unknown as Promise<void>)
        .then(() => {
          console.info('[OTEL] 🛑 OpenTelemetry arrêté');
          process.exit(0);
        })
        .catch((error) => {
          console.error('[OTEL] Erreur lors de l\'arrêt:', error);
          process.exit(1);
        });
    });

    return sdk;
  } catch (error) {
    console.error('[OTEL] ❌ Erreur lors de l\'initialisation OpenTelemetry:', error);
    return null;
  }
}

/**
 * Helper pour créer un span manuel
 * Phase P4: Tracing personnalisé
 */
export async function withSpan<T>(
  name: string,
  fn: (span: any) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  // Si OpenTelemetry n'est pas disponible, exécuter directement
  if (process.env.OTEL_SDK_DISABLED === 'true') {
    return fn(null as any);
  }

  try {
    const { trace } = await import('@opentelemetry/api');
    const tracer = trace.getTracer('yesselate-dashboard');
    return tracer.startActiveSpan(name, { attributes }, async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: 1 }); // OK
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' }); // ERROR
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        span.end();
      }
    });
  } catch {
    // Fallback si OpenTelemetry n'est pas disponible
    return fn(null as any);
  }
}
