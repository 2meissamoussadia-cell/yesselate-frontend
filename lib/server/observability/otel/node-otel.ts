/**
 * OpenTelemetry Bootstrap (Node.js)
 * Phase P4: Observabilité & Robustesse
 * 
 * Bootstrap autonome pour OpenTelemetry, utilisable via:
 * - PM2: --require lib/server/observability/otel/node-otel.js
 * - Node.js: node --require lib/server/observability/otel/node-otel.js app.js
 * - Docker: CMD ["node", "--require", "./lib/server/observability/otel/node-otel.js", "app.js"]
 * 
 * Configuration via variables d'environnement:
 * - OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: Endpoint pour les traces (ex: http://tempo:4318/v1/traces)
 * - NODE_ENV: Environnement (development, production)
 */

import 'dotenv/config';
import process from 'node:process';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes as SRA } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SRA.SERVICE_NAME]: 'erp-btp-dashboard',
    [SRA.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT, // ex. http://tempo:4318/v1/traces
  }),
  instrumentations: [new HttpInstrumentation(), new PgInstrumentation()],
});

void (sdk.start() as unknown as Promise<void>).then(() => console.log('[OTEL] tracing started'))
  .catch((err) => console.error('[OTEL] init error', err));

process.on('SIGTERM', () => void (sdk.shutdown() as unknown as Promise<void>).finally(() => process.exit(0)));
