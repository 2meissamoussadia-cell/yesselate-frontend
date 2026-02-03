// app/(portals)/maitre-ouvrage/dashboard/DashboardLayoutClient.tsx
// Phase P12: Composants client pour le layout dashboard

'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { DashboardSkeleton } from '@/components/ui/skeleton';

/**
 * Composant de fallback pour le chargement (skeleton animé, standard 2026)
 */
export function DashboardLayoutFallback() {
  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 p-4 sm:p-6 overflow-auto">
      <DashboardSkeleton />
    </div>
  );
}

/**
 * Composant d'erreur pour le layout
 */
export function DashboardLayoutError({ error }: { error: Error }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-white dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-50 dark:bg-slate-900/50 border border-red-500/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Erreur de chargement du dashboard</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm">{error.message}</p>
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

/**
 * Wrapper pour ErrorBoundary fallback (nécessaire car on ne peut pas passer de fonctions depuis Server Components)
 */
export function DashboardErrorFallback({ error }: { error: Error }) {
  return <DashboardLayoutError error={error} />;
}

/**
 * Composant client pour la synchronisation (nécessite hooks)
 */
export function DashboardSyncClient() {
  // Navigation unifiée: la sync URL <-> store est gérée par
  // `useDashboardCommandCenterUrlSync()` dans la page dashboard.
  return null;
}
