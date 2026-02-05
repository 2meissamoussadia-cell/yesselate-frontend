/**
 * AnalyticsErrorBoundary
 * Error Boundary avancé pour le module Analytics
 * Avec retry, reporting et fallback UI
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';

interface AnalyticsErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface AnalyticsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string | null;
}

/**
 * Génère un ID unique pour l'erreur
 */
function generateErrorId(): string {
  return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log l'erreur vers un service de tracking
 */
function logErrorToService(
  error: Error,
  errorInfo: ErrorInfo,
  errorId: string,
  context?: Record<string, any>
) {
  // En production, envoyer à un service de tracking (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Exemple avec console pour le moment
    console.error('Error logged:', {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
      timestamp: new Date().toISOString(),
    });
    
    // TODO: Intégrer avec un service de tracking réel
    // Sentry.captureException(error, {
    //   contexts: { react: { componentStack: errorInfo.componentStack } },
    //   tags: { errorId, module: 'analytics' },
    //   extra: context,
    // });
  } else {
    // En développement, afficher dans la console
    console.error('Analytics Error:', error);
    console.error('Error Info:', errorInfo);
    if (context) {
      console.error('Context:', context);
    }
  }
}

/**
 * Reporte l'erreur à l'utilisateur (optionnel)
 */
function reportError(
  error: Error,
  errorId: string,
  context?: Record<string, any>
) {
  // En production, permettre à l'utilisateur de reporter l'erreur
  const reportData = {
    errorId,
    message: error.message,
    stack: error.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    context,
  };
  
  // TODO: Envoyer à un endpoint backend
  console.log('Error report:', reportData);
}

export class AnalyticsErrorBoundary extends Component<
  AnalyticsErrorBoundaryProps,
  AnalyticsErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: AnalyticsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AnalyticsErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log l'erreur
    if (this.state.errorId) {
      logErrorToService(error, errorInfo, this.state.errorId, {
        retryCount: this.state.retryCount,
        module: 'analytics',
      });
    }
    
    // Callback personnalisé
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Mettre à jour l'état
    this.setState({ errorInfo });
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      errorId: null,
    }));
  };

  handleReport = () => {
    const { error, errorId } = this.state;
    if (error && errorId) {
      reportError(error, errorId, {
        retryCount: this.state.retryCount,
        module: 'analytics',
      });
      
      // Afficher un message de confirmation
      alert('Merci pour votre signalement. L\'erreur a été enregistrée.');
    }
  };

  handleGoHome = () => {
    window.location.href = '/maitre-ouvrage/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          showDetails={this.props.showDetails ?? process.env.NODE_ENV === 'development'}
          onRetry={this.handleRetry}
          onReport={this.handleReport}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  showDetails: boolean;
  onRetry: () => void;
  onReport: () => void;
  onGoHome: () => void;
}

function ErrorFallback({
  error,
  errorInfo,
  errorId,
  retryCount,
  showDetails,
  onRetry,
  onReport,
  onGoHome,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-2xl w-full">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-slate-400 mb-1">
            {error?.message || 'Une erreur inattendue s\'est produite dans le module Analytics'}
          </p>
          {errorId && (
            <p className="text-xs text-slate-400 mt-2">
              ID d'erreur: <code className="bg-slate-800 px-2 py-1 rounded">{errorId}</code>
            </p>
          )}
          {retryCount > 0 && (
            <p className="text-xs text-amber-400 mt-2">
              Tentative de récupération #{retryCount}
            </p>
          )}
        </div>

        {showDetails && errorInfo && (
          <details className="mb-6 text-left bg-slate-900/50 rounded-lg border border-slate-700/50">
            <summary className="cursor-pointer p-4 text-slate-400 text-sm font-medium hover:text-slate-200 transition-colors">
              <Bug className="w-4 h-4 inline mr-2" />
              Détails techniques (développement)
            </summary>
            <div className="p-4 border-t border-slate-700/50">
              {error?.stack && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Stack Trace:</p>
                  <pre className="text-xs text-slate-300 bg-slate-950 p-3 rounded overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo.componentStack && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">Component Stack:</p>
                  <pre className="text-xs text-slate-300 bg-slate-950 p-3 rounded overflow-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <FluentButton
            onClick={onRetry}
            variant="primary"
            className="min-w-[120px]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </FluentButton>
          <FluentButton
            onClick={onReport}
            variant="secondary"
            className="min-w-[120px]"
          >
            <Bug className="w-4 h-4 mr-2" />
            Signaler
          </FluentButton>
          <FluentButton
            onClick={onGoHome}
            variant="ghost"
            className="min-w-[120px]"
          >
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </FluentButton>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            <strong>Conseil:</strong> Si le problème persiste, essayez de rafraîchir la page ou de contacter le support technique.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook pour utiliser l'Error Boundary dans les composants fonctionnels
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { captureError, resetError };
}

