/**
 * ErrorBoundary dédié au dashboard — Audit exhaustif §9.
 * Message clair, bouton Réessayer, pas d'erreurs techniques visibles par défaut.
 * P6: Intégration monitoring (Sentry / LogRocket / API) via onError → captureException.
 */

'use client';

import React, { useCallback, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary as BaseErrorBoundary } from '@/components/shared/ErrorBoundary';
import { captureException } from '../../utils/monitoring';

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  /** Afficher les détails techniques (stack) en dev */
  showDetails?: boolean;
}

function DashboardErrorFallback({ error, onRetry, showDetails }: { error: Error; onRetry: () => void; showDetails?: boolean }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 max-w-md">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" aria-hidden />
        <h1 className="sr-only">Erreur</h1>
        <h2 className="mt-4 text-xl font-bold text-red-300">
          Erreur de chargement du dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Impossible de récupérer les données. Vérifiez votre connexion et réessayez.
        </p>
        <Button
          onClick={onRetry}
          className="mt-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Réessayer le chargement"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 block w-full text-center text-xs text-slate-400 hover:text-slate-300 underline"
          aria-label="Recharger la page"
        >
          Recharger la page
        </button>
        {showDetails && error?.stack && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-slate-400 cursor-pointer">Détails techniques</summary>
            <pre className="mt-2 p-3 rounded-lg bg-slate-900/60 text-[10px] text-red-300 overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/** P6: Envoi des erreurs au monitoring centralisé (Sentry / LogRocket / API). */
function reportDashboardError(error: Error, errorInfo: React.ErrorInfo) {
  captureException(error, {
    extra: {
      componentStack: errorInfo?.componentStack,
      component: 'DashboardErrorBoundary',
    },
    tags: { errorBoundary: 'dashboard' },
  });
}

/**
 * Wrapper autour de ErrorBoundary avec fallback dashboard (audit §9).
 */
export function DashboardErrorBoundary({ children, showDetails = false }: DashboardErrorBoundaryProps) {
  const onError = useCallback(reportDashboardError, []);
  return (
    <BaseErrorBoundary
      onError={onError}
      fallback={(error: Error) => (
        <DashboardErrorFallback
          error={error}
          onRetry={() => window.location.reload()}
          showDetails={showDetails}
        />
      )}
    >
      {children}
    </BaseErrorBoundary>
  );
}
