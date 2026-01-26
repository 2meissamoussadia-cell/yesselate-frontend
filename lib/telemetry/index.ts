/**
 * Module de télémétrie
 * Phase P14: Télémétrie & Analytics
 * 
 * Export centralisé des fonctions et types de télémétrie
 */

export { track, flush, flushImmediate, clearQueue, getQueueSize } from './client';
export { 
  TelemetryEvent, 
  TelemetryBatch, 
  TelemetryEventType,
  type TelemetryEvent,
  type TelemetryBatch 
} from './schema';
