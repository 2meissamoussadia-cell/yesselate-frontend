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
 * Error Boundary - Capture les erreurs React et affiche un UI de fallback
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  private errorCount = 0;
  private lastErrorTime = 0;
  private readonly MAX_ERRORS = 5;
  private readonly ERROR_WINDOW_MS = 1000; // 1 seconde

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

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // Si on est en état d'erreur, ne re-render QUE si l'erreur change vraiment
    // Cela empêche les re-renders inutiles qui pourraient déclencher de nouvelles erreurs
    if (this.state.hasError && nextState.hasError) {
      // Comparer les messages d'erreur plutôt que les références
      const currentErrorMsg = this.state.error?.message;
      const nextErrorMsg = nextState.error?.message;
      
      // Ne re-render que si le message d'erreur change vraiment
      if (currentErrorMsg === nextErrorMsg && 
          this.state.errorInfo === nextState.errorInfo) {
        return false; // Même erreur, pas besoin de re-render - ÉVITE LES BOUCLES INFINIES
      }
    }
    
    // Si on passe d'un état sans erreur à un état avec erreur, re-render pour afficher le fallback
    if (!this.state.hasError && nextState.hasError) {
      return true;
    }
    
    // Si on passe d'un état avec erreur à un état sans erreur (reset), re-render
    if (this.state.hasError && !nextState.hasError) {
      return true;
    }
    
    // Si on est en état d'erreur et qu'on reste en état d'erreur, ne pas re-render
    // (déjà géré plus haut, mais on le réitère pour être sûr)
    if (this.state.hasError) {
      return false;
    }
    
    // Si pas d'erreur, re-render normalement (mais seulement si les props changent vraiment)
    // Note: On ne compare PAS children car React crée toujours de nouvelles références
    // et cela causerait des re-renders infinis
    return this.props.fallback !== nextProps.fallback ||
           this.props.onError !== nextProps.onError ||
           this.props.showDetails !== nextProps.showDetails;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Si on est déjà en état d'erreur et que c'est la même erreur, ne rien faire
    if (this.state.hasError && 
        this.state.error === error && 
        this.state.errorInfo === errorInfo) {
      return; // Déjà capturée, éviter les mises à jour inutiles
    }

    const now = Date.now();
    
    // Protection contre les boucles infinies : limiter le nombre d'erreurs capturées
    if (now - this.lastErrorTime < this.ERROR_WINDOW_MS) {
      this.errorCount++;
    } else {
      this.errorCount = 1;
    }
    this.lastErrorTime = now;

    // Si trop d'erreurs en peu de temps, empêcher les mises à jour pour éviter la boucle infinie
    if (this.errorCount > this.MAX_ERRORS) {
      console.error('ErrorBoundary: Trop d\'erreurs capturées en peu de temps, arrêt de la capture pour éviter une boucle infinie');
      return;
    }

    // Log l'erreur seulement si c'est une nouvelle erreur
    if (!this.state.hasError || this.state.error !== error) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Utiliser setState de manière sécurisée pour éviter les boucles
    // Note: getDerivedStateFromError a déjà mis hasError à true, donc on met juste à jour error et errorInfo
    this.setState({
      error,
      errorInfo,
    });

    // Appeler callback personnalisé si fourni (seulement pour les nouvelles erreurs)
    if (this.props.onError && (!this.state.hasError || this.state.error !== error)) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error('ErrorBoundary: Erreur dans le callback onError:', callbackError);
      }
    }

    // En production: envoyer à un service de monitoring (Sentry, etc.)
    if (process.env.NODE_ENV === 'production' && (!this.state.hasError || this.state.error !== error)) {
      try {
        // Intégration Sentry (si disponible)
        if (typeof window !== 'undefined') {
          const Sentry = (window as any).Sentry;
          if (Sentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.captureException(error, {
              contexts: { react: { componentStack: errorInfo.componentStack } },
              tags: {
                component: 'BMOErrorBoundary',
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

  handleReset = () => {
    // Réinitialiser le compteur d'erreurs lors du reset
    this.errorCount = 0;
    this.lastErrorTime = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    // Si on est en état d'erreur, NE JAMAIS rendre les enfants
    // Cela empêche les composants enfants de continuer à se re-render et déclencher des erreurs
    if (this.state.hasError) {
      // Fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const showDetails = this.props.showDetails ?? process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-2xl w-full">
            <div className="p-8 rounded-2xl border border-red-500/30 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
              {/* Icône et titre */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Oops ! Une erreur est survenue</h1>
                  <p className="text-sm text-slate-400 mt-1">L'application a rencontré un problème inattendu</p>
                </div>
              </div>

              {/* Message utilisateur */}
              <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 mb-6">
                <p className="text-slate-300">
                  Nous sommes désolés pour ce désagrément. L'erreur a été enregistrée et sera examinée par notre équipe.
                </p>
                {showDetails && error && (
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <p className="text-sm font-mono text-red-400 mb-2">{error.message}</p>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                          Stack trace
                        </summary>
                        <pre className="mt-2 p-3 rounded-lg bg-slate-900/50 text-xs text-slate-400 overflow-auto max-h-48">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recharger la page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </button>

                <a
                  href="mailto:support@yesselate.com?subject=Erreur Application"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contacter le support
                </a>
              </div>

              {/* Détails techniques (dev only) */}
              {showDetails && errorInfo && (
                <details className="mt-6">
                  <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                    Détails techniques (développement)
                  </summary>
                  <div className="mt-3 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                    <p className="text-xs font-mono text-slate-400 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </p>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour déclencher une erreur depuis un composant
 * Utile pour tester l'Error Boundary
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

/**
 * Composant wrapper avec Error Boundary intégré
 * Note: Cette fonction crée un nouveau composant à chaque appel.
 * Pour éviter les re-renders, utilisez directement <ErrorBoundary> autour de vos composants.
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P> | undefined | null,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  // Protection contre les composants undefined
  if (!Component) {
    console.error('[withErrorBoundary] Component is undefined or null');
    // Retourner un composant placeholder qui affiche une erreur
    const FallbackComponent = () => (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
        Composant non trouvé
      </div>
    );
    FallbackComponent.displayName = 'withErrorBoundary(MissingComponent)';
    return FallbackComponent;
  }

  // Créer le composant enveloppé une seule fois
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}


