'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * ========================
 * 
 * Capture les erreurs React et affiche une UI de fallback élégante
 * Empêche le crash de toute l'application
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Met à jour l'état
    this.setState({
      error,
      errorInfo,
    });

    // Callback optionnel
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En production: envoyer à un service d'erreur (Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      try {
        // Intégration Sentry (si disponible)
        if (typeof window !== 'undefined') {
          const Sentry = (window as any).Sentry;
          if (Sentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.captureException(error, {
              contexts: { react: errorInfo },
              tags: {
                component: 'ErrorBoundary',
                errorBoundary: true,
              },
            });
            return;
          }
        }
      } catch (e) {
        // Ignorer les erreurs de logging
      }
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, afficher l'UI par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-red-500/20 shadow-2xl p-8">
              {/* Icône et titre */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-200 mb-2">
                  Oups ! Une erreur est survenue
                </h1>
                <p className="text-slate-400">
                  Une erreur inattendue s'est produite. L'équipe technique a été notifiée.
                </p>
              </div>

              {/* Détails de l'erreur (développement uniquement) */}
              {this.props.showDetails && this.state.error && (
                <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">Détails de l'erreur:</h3>
                  <pre className="text-xs text-slate-300 font-mono overflow-auto max-h-48">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recharger la page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Accueil
                </button>
              </div>

              {/* Support */}
              <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                <p className="text-sm text-slate-400 mb-2">
                  Le problème persiste ?
                </p>
                <a
                  href="mailto:support@yesselate.sn"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contacter le support
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour utiliser Error Boundary dans les composants fonctionnels
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // En production: envoyer à Sentry
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Peut être utilisé avec react-error-boundary ou Sentry
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error);
    }
  };
}

/**
 * HOC pour wrapper un composant avec Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P> | undefined | null,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  // Protection contre les composants undefined
  if (!Component) {
    console.error('[withErrorBoundary] Component is undefined or null');
    const FallbackComponent = () => (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
        Composant non trouvé
      </div>
    );
    FallbackComponent.displayName = 'withErrorBoundary(MissingComponent)';
    return FallbackComponent;
  }

  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
