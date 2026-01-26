/**
 * Next.js Instrumentation
 * Phase P4: Observabilité & Robustesse
 * 
 * Initialise OpenTelemetry au démarrage de l'application
 * 
 * Requis: next.config.ts doit avoir experimental.instrumentationHook = true
 * 
 * Configuration:
 * - OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: Endpoint pour les traces (ex: http://tempo:4318/v1/traces)
 * - OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: Endpoint pour les métriques (optionnel)
 * - OTEL_SERVICE_NAME: Nom du service (défaut: erp-btp-dashboard)
 * - OTEL_SDK_DISABLED: true pour désactiver OpenTelemetry
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Charger dotenv si disponible (pour développement local)
    try {
      await import('dotenv/config');
    } catch {
      // dotenv non disponible, continuer sans
    }

    const { initializeTelemetry } = await import('./lib/server/observability/telemetry');
    initializeTelemetry();
  }
}
