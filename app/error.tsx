'use client';

/**
 * Error Boundary global — capture les erreurs non gérées (audit ERP BTP 2026).
 * Affiche un message lisible et un bouton Réessayer.
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('GlobalError:', error?.message, error?.digest);
    }
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div
        className="max-w-md w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-xl text-center"
        role="alert"
      >
        <h1 className="text-xl font-semibold text-slate-100 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          {error?.message ?? 'Erreur inattendue. Veuillez réessayer.'}
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
