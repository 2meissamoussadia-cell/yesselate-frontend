/**
 * Layout pour le Dashboard
 * Fournit le contexte de navigation et synchronise avec l'URL
 * ✅ Amélioré avec ErrorBoundary et gestion d'erreurs
 */

'use client';

import React, { Suspense } from 'react';
import { DashboardNavigationProvider } from '@/modules/dashboard/context/DashboardNavigationContext';
import { useDashboardNavigationSync } from '@/modules/dashboard/hooks/useDashboardNavigationSync';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

/**
 * Composant interne pour la synchronisation
 * Le hook utilise directement le store, donc il peut être appelé ici
 * ✅ Wrappé dans Suspense pour éviter les erreurs SSR
 */
function DashboardSync() {
  useDashboardNavigationSync();
  return null;
}

/**
 * Composant de fallback pour le chargement
 */
function DashboardLayoutFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="relative">
          <div className="h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Chargement du dashboard...</p>
      </div>
    </div>
  );
}

/**
 * Composant d'erreur pour le layout
 */
function DashboardLayoutError({ error }: { error: Error }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-900/50 border border-red-500/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-red-400">Erreur de chargement du dashboard</h2>
        <p className="text-slate-300 text-sm">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Recharger la page
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={(error) => <DashboardLayoutError error={error} />}>
      <DashboardNavigationProvider>
        <Suspense fallback={<DashboardLayoutFallback />}>
          <DashboardSync />
        </Suspense>
        <ErrorBoundary fallback={(error) => <DashboardLayoutError error={error} />}>
          {children}
        </ErrorBoundary>
      </DashboardNavigationProvider>
    </ErrorBoundary>
  );
}

