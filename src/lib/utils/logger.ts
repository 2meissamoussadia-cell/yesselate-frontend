/**
 * Système de logging structuré pour l'application
 * Remplace les console.log/error/warn par un système professionnel
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  
  // Niveaux de log activés (en production, seulement warn et error)
  private enabledLevels: Set<LogLevel> = new Set(
    this.isDevelopment 
      ? ['debug', 'info', 'warn', 'error']
      : ['warn', 'error']
  );

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[level];

    const contextStr = context?.component 
      ? `[${context.component}]${context.action ? ` ${context.action}` : ''}`
      : '';

    return `${emoji} ${contextStr} ${message}`.trim();
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: error?.stack,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.has(level);
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formatted = this.formatMessage(entry.level, entry.message, entry.context);
    const data = entry.context ? { ...entry.context } : {};

    switch (entry.level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formatted, data);
        }
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(formatted, data);
        }
        break;
      case 'warn':
        console.warn(formatted, data);
        break;
      case 'error':
        console.error(formatted, data);
        if (entry.stack && this.isDevelopment) {
          console.error('Stack:', entry.stack);
        }
        break;
    }
  }

  private logToService(entry: LogEntry): void {
    // En production, envoyer les erreurs critiques à un service de tracking
    if (this.isProduction && entry.level === 'error') {
      try {
        // Intégration avec Sentry (si disponible)
        if (typeof window !== 'undefined') {
          // Option 1: Sentry via @sentry/nextjs (si installé)
          const Sentry = (window as any).Sentry;
          if (Sentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.captureException(new Error(entry.message), {
              contexts: { custom: entry.context },
              tags: {
                component: entry.context?.component,
                action: entry.context?.action,
              },
              level: 'error',
            });
            return;
          }

          // Option 2: LogRocket (si disponible)
          const LogRocket = (window as any).LogRocket;
          if (LogRocket) {
            LogRocket.captureException(new Error(entry.message), {
              extra: entry.context,
            });
            return;
          }
        }
        
        // Option 3: Fallback - utiliser sendBeacon pour envoyer les logs critiques
        if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
          const blob = new Blob([JSON.stringify(entry)], { type: 'application/json' });
          const logEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT || '/api/logs';
          navigator.sendBeacon(logEndpoint, blob);
        }
      } catch (e) {
        // Ne pas bloquer l'application en cas d'erreur de logging
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('debug', message, context);
    this.logToConsole(entry);
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, context);
    this.logToConsole(entry);
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('warn', message, context);
    this.logToConsole(entry);
    this.logToService(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry('error', message, context, error);
    this.logToConsole(entry);
    this.logToService(entry);
  }

  // Méthodes utilitaires pour les cas courants
  navigation(from: string, to: string, context?: LogContext): void {
    this.debug(`Navigation: ${from} → ${to}`, {
      ...context,
      action: 'navigation',
      from,
      to,
    });
  }

  performance(metric: string, duration: number, context?: LogContext): void {
    this.debug(`Performance: ${metric} took ${duration.toFixed(2)}ms`, {
      ...context,
      action: 'performance',
      metric,
      duration,
    });
  }

  apiCall(endpoint: string, method: string, status?: number, context?: LogContext): void {
    const level = status && status >= 400 ? 'error' : 'info';
    const message = `API ${method} ${endpoint}${status ? ` → ${status}` : ''}`;
    
    if (level === 'error') {
      this.error(message, undefined, { ...context, action: 'api', endpoint, method, status });
    } else {
      this.info(message, { ...context, action: 'api', endpoint, method, status });
    }
  }
}

// Instance singleton
export const logger = new Logger();

// Hook React pour utiliser le logger avec contexte automatique
export function useLogger(component: string) {
  return {
    debug: (message: string, context?: Omit<LogContext, 'component'>) =>
      logger.debug(message, { ...context, component }),
    info: (message: string, context?: Omit<LogContext, 'component'>) =>
      logger.info(message, { ...context, component }),
    warn: (message: string, context?: Omit<LogContext, 'component'>) =>
      logger.warn(message, { ...context, component }),
    error: (message: string, error?: Error, context?: Omit<LogContext, 'component'>) =>
      logger.error(message, error, { ...context, component }),
    navigation: (from: string, to: string, context?: Omit<LogContext, 'component'>) =>
      logger.navigation(from, to, { ...context, component }),
    performance: (metric: string, duration: number, context?: Omit<LogContext, 'component'>) =>
      logger.performance(metric, duration, { ...context, component }),
    apiCall: (endpoint: string, method: string, status?: number, context?: Omit<LogContext, 'component'>) =>
      logger.apiCall(endpoint, method, status, { ...context, component }),
  };
}


