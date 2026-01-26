/**
 * Logger structuré avec corrélation (Pino)
 * Phase P4: Observabilité & Robustesse
 * 
 * Logs JSON structurés avec x-request-id pour corrélation
 * 
 * Utilise le logger centralisé de lib/server/logging.ts
 */

import { logger as baseLogger, withReq } from '@/lib/server/logging';
import type pino from 'pino';

// Ré-exporter le logger de base
export const logger = baseLogger;

/**
 * Crée un logger enfant avec contexte
 * Phase P4: Logs corrélés
 */
export function createChildLogger(context: Record<string, string | number | boolean>) {
  return baseLogger.child(context);
}

/**
 * Logger avec corrélation (x-request-id)
 * Phase P4: Logs corrélés
 * 
 * Utilise withReq du logger centralisé
 */
export function getCorrelatedLogger(requestId?: string, additionalContext?: Record<string, any>) {
  const correlatedLogger = withReq(requestId);
  // Si contexte additionnel, créer un enfant avec ce contexte
  if (additionalContext && Object.keys(additionalContext).length > 0) {
    return correlatedLogger.child(additionalContext);
  }
  return correlatedLogger;
}

/**
 * Helper pour logger les erreurs avec stack trace
 * Phase P4: Observabilité
 * 
 * Compatibilité : wrapper autour de log.error() standard
 */
export function logError(
  log: pino.Logger,
  message: string,
  error: Error | unknown,
  context?: Record<string, any>
): void {
  log.error(
    {
      ...context,
      err: error,
    },
    message
  );
}

/**
 * Helper pour logger les métriques
 * Phase P4: Observabilité
 */
export function logMetric(
  log: pino.Logger,
  metric: string,
  value: number,
  labels?: Record<string, string>
): void {
  log.info({ metric, value, labels, type: 'metric' }, `[METRIC] ${metric}`);
}
