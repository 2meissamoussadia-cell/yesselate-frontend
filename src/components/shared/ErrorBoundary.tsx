'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary pour capturer les erreurs React et afficher un fallback
 * Utilisation: <ErrorBoundary><YourComponent /></ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // P6: En production, utiliser onError pour envoyer au monitoring (Sentry/LogRocket/API)
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        // Si fallback est une fonction, l'appeler avec l'erreur
        if (typeof this.props.fallback === 'function') {
          return this.state.error 
            ? this.props.fallback(this.state.error)
            : this.props.fallback(new Error('Unknown error'));
        }
        // Si fallback est un ReactNode, vérifier si c'est un composant React avec une prop error
        // et lui passer l'erreur
        if (React.isValidElement(this.props.fallback)) {
          const error = this.state.error || new Error('Unknown error');
          return React.cloneElement(this.props.fallback as React.ReactElement<any>, {
            error,
          });
        }
        // Sinon, retourner directement le ReactNode
        return this.props.fallback;
      }

      return (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">⚠️</span>
              <div>
                <h1 className="sr-only">Erreur</h1>
                <h2 className="text-lg font-bold text-red-300">Erreur de rendu</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Une erreur s'est produite lors du chargement de cette section.
                </p>
              </div>
            </div>

            {this.state.error && (
              <details className="mt-4">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                  Détails techniques (développement)
                </summary>
                <pre className="mt-2 p-3 bg-slate-900/50 rounded text-xs text-red-300 overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={this.handleReset}
                aria-label="Réessayer le chargement"
              >
                Réessayer
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.reload()}
                aria-label="Recharger la page"
              >
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

