/**
 * Système de logging unifié pour le Dashboard v20
 * Remplace tous les console.log/error/warn par un système centralisé
 * 
 * Features:
 * - Niveaux de log configurables (debug, info, warn, error)
 * - Filtrage par contexte/composant
 * - Formatage structuré pour production
 * - Performance tracking intégré
 */

'use client';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

class DashboardLogger {
  private enabled: boolean;
  private minLevel: LogLevel;
  private context: string;

  constructor(context: string = 'Dashboard', minLevel: LogLevel = 'info') {
    this.context = context;
    this.minLevel = minLevel;
    this.enabled = process.env.NODE_ENV === 'development' || 
                   (typeof window !== 'undefined' && 
                    localStorage.getItem('dashboard:debug') === 'true');
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const ctx = context?.component ? `[${context.component}]` : `[${this.context}]`;
    return `${timestamp} ${level.toUpperCase()} ${ctx} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, context);
    const data = context ? { ...context, message } : { message };

    switch (level) {
      case 'debug':
        console.debug(formatted, data);
        break;
      case 'info':
        console.info(formatted, data);
        break;
      case 'warn':
        console.warn(formatted, data);
        break;
      case 'error':
        console.error(formatted, error || data);
        break;
    }

    // En production, envoyer les erreurs critiques à un service de monitoring
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      // TODO: Intégrer avec service de monitoring (Sentry, LogRocket, etc.)
      this.sendToMonitoring(message, context, error);
    }
  }

  private sendToMonitoring(message: string, context?: LogContext, error?: Error): void {
    // Placeholder pour intégration future avec service de monitoring
    if (typeof window !== 'undefined' && (window as any).__MONITORING__) {
      (window as any).__MONITORING__.captureException(error || new Error(message), {
        extra: context,
      });
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  // Helpers pour les cas d'usage courants
  navigation(from: string, to: string, context?: LogContext): void {
    this.debug(`Navigation: ${from} → ${to}`, { ...context, action: 'navigation' });
  }

  performance(metric: string, duration: number, context?: LogContext): void {
    this.debug(`Performance: ${metric} took ${duration}ms`, { ...context, action: 'performance', duration });
  }

  dataLoad(key: string, success: boolean, context?: LogContext): void {
    const level = success ? 'debug' : 'error';
    this.log(level, `Data load: ${key} ${success ? 'success' : 'failed'}`, { ...context, action: 'dataLoad', key });
  }
}

// Instance par défaut
const defaultLogger = new DashboardLogger('Dashboard');

// Factory pour créer des loggers spécifiques par composant
export function createLogger(component: string, minLevel?: LogLevel): DashboardLogger {
  return new DashboardLogger(component, minLevel);
}

// Export de l'instance par défaut
export const logger = defaultLogger;

// Export du type pour usage dans les composants
export type { DashboardLogger, LogContext };
