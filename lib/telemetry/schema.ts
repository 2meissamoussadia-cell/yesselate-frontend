/**
 * Schémas Zod pour la télémétrie
 * Phase P14: Télémétrie & Analytics
 * 
 * Validation des événements de télémétrie côté client et serveur
 */

import { z } from 'zod';

/**
 * Schéma d'un événement de télémétrie
 */
export const TelemetryEvent = z.object({
  event: z.string(),                       // 'view_opened', 'kpi_click', 'export_triggered', 'filter_applied', 'error', 'perf'
  routeKey: z.string().optional(),         // 'main::sub::leaf' (ex: 'overview::summary::dashboard')
  at: z.number().int(),                   // Date.now() (timestamp Unix en millisecondes)
  props: z.record(z.any()).optional(),     // Payload minimal: {kpiId:'...', action:'export', ...}
});

export type TelemetryEvent = z.infer<typeof TelemetryEvent>;

/**
 * Schéma d'un batch d'événements de télémétrie
 */
export const TelemetryBatch = z.object({
  items: z.array(TelemetryEvent).min(1).max(200),  // Entre 1 et 200 événements par batch
  seq: z.number().int().optional(),                 // Séquence pour idempotence simple
});

export type TelemetryBatch = z.infer<typeof TelemetryBatch>;

/**
 * Types d'événements supportés
 */
export const TelemetryEventType = z.enum([
  'view_opened',
  'kpi_click',
  'export_triggered',
  'filter_applied',
  'error',
  'perf',
]);

export type TelemetryEventType = z.infer<typeof TelemetryEventType>;
