/**
 * Logger serveur pour le Dashboard v20 — sans dépendance client.
 * Utilisé par les API routes, security, loaders, readModels et lib/server.
 * Ne pas utiliser 'use client' ni importer ./monitoring.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

class DashboardLoggerServer {
  private minLevel: LogLevel;
  private context: string;

  constructor(context: string = 'Dashboard', minLevel: LogLevel = 'info') {
    this.context = context;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
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

export function createLogger(component: string, minLevel?: LogLevel): DashboardLoggerServer {
  return new DashboardLoggerServer(component, minLevel);
}

const defaultLogger = new DashboardLoggerServer('Dashboard');
export const logger = defaultLogger;
export type { DashboardLoggerServer, LogContext };
