// lib/telemetry/schema.ts
// Phase P14: Observabilité produit - Schéma de validation Zod

import { z } from 'zod';

/**
 * Schéma d'un événement de télémetrie
 * Phase P14: Observabilité produit
 */
export const TelemetryEvent = z.object({
  event: z.string(),                       // 'view_opened', 'kpi_click', 'export_triggered', 'filter_applied', 'error', 'perf'
  routeKey: z.string().optional(),         // 'main::sub::leaf'
  at: z.number().int(),                    // Date.now()
  props: z.record(z.string(), z.any()).optional(),     // Payload minimal: {kpiId:'...', action:'export', format:'xlsx', ...}
});

/**
 * Schéma d'un batch d'événements
 * Phase P14: Observabilité produit
 */
export const TelemetryBatch = z.object({
  items: z.array(TelemetryEvent).min(1).max(200),
  seq: z.number().int().optional(),        // Pour idempotence simple
});

export type TelemetryEventType = z.infer<typeof TelemetryEvent>;
export type TelemetryBatchType = z.infer<typeof TelemetryBatch>;
