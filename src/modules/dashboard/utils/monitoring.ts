/**
 * Utilitaires pour l'intégration avec les services de monitoring
 * Supporte Sentry, LogRocket, et API interne
 * Phase 6: Logging Structuré
 */

'use client';

/**
 * Interface pour les services de monitoring
 */
interface MonitoringService {
  captureException(error: Error, options?: {
    extra?: Record<string, unknown>;
    tags?: Record<string, string>;
    contexts?: Record<string, unknown>;
  }): void;
  captureMessage?(message: string, level?: 'info' | 'warning' | 'error'): void;
}

/**
 * Détecte et retourne le service de monitoring disponible
 */
export function getMonitoringService(): MonitoringService | null {
  if (typeof window === 'undefined') return null;

  // Option 1: Sentry
  const Sentry = (window as any).Sentry;
  if (Sentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return {
      captureException: (error: Error, options?) => {
        Sentry.captureException(error, {
          extra: options?.extra,
          tags: options?.tags,
          contexts: options?.contexts,
        });
      },
      captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
        Sentry.captureMessage(message, level);
      },
    };
  }

  // Option 2: LogRocket
  const LogRocket = (window as any).LogRocket;
  if (LogRocket) {
    return {
      captureException: (error: Error, options?) => {
        LogRocket.captureException(error, {
          extra: options?.extra,
        });
      },
    };
  }

  return null;
}

/**
 * Envoie une erreur au service de monitoring disponible
 */
export function captureException(
  error: Error,
  options?: {
    extra?: Record<string, unknown>;
    tags?: Record<string, string>;
    contexts?: Record<string, unknown>;
  }
): void {
  const service = getMonitoringService();
  if (service) {
    try {
      service.captureException(error, options);
    } catch (e) {
      // Ignorer les erreurs de monitoring
    }
  } else {
    // Fallback: envoyer à l'API interne
    sendToInternalAPI('error', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...options?.extra,
    });
  }
}

/**
 * Envoie un message au service de monitoring disponible
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  extra?: Record<string, unknown>
): void {
  const service = getMonitoringService();
  if (service && service.captureMessage) {
    try {
      service.captureMessage(message, level);
    } catch (e) {
      // Ignorer les erreurs de monitoring
    }
  } else {
    // Fallback: envoyer à l'API interne
    sendToInternalAPI(level, { message, ...extra });
  }
}

/**
 * Envoie un log à l'API interne (fallback)
 */
function sendToInternalAPI(
  level: string,
  data: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  try {
    const logEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT || '/api/logs';
    const logData = {
      level,
      ...data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Utiliser sendBeacon pour les logs critiques (non-bloquant)
    if ('sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(logData)], { type: 'application/json' });
      navigator.sendBeacon(logEndpoint, blob);
    } else {
      // Fallback vers fetch (peut être bloqué si la page se ferme)
      fetch(logEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
        keepalive: true,
      }).catch(() => {
        // Ignorer les erreurs de réseau
      });
    }
  } catch (e) {
    // Ignorer les erreurs de logging
  }
}
