'use client';

/**
 * Error Boundary du segment Dashboard (audit ERP BTP 2026).
 * Capture les erreurs des vues (ex. HSE, Calendrier) et affiche un fallback avec Réessayer.
 */

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('DashboardError:', error?.message, error?.digest);
    }
  }, [error]);

  return (
    <div className="p-4 sm:p-6 w-full min-w-0 flex items-center justify-center min-h-[40vh]" role="alert">
      <div className="max-w-md w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-xl text-center">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">
          Erreur de chargement
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {error?.message ?? 'Cette vue n’a pas pu être chargée. Veuillez réessayer.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
