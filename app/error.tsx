'use client';

/**
 * Error Boundary global — capture les erreurs non gérées (audit ERP BTP 2026).
 * Affiche un message lisible et un bouton Réessayer. Focus automatique sur le bouton (a11y).
 */

import { useEffect, useRef } from 'react';
import { ERROR_BOUNDARY, ARIA_LABELS } from '@lib-root/constants';
import { logger } from '@/lib/utils/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const retryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && error) {
      logger.error('GlobalError', error, { component: 'GlobalError', digest: error?.digest });
    }
  }, [error]);

  useEffect(() => {
    retryRef.current?.focus();
  }, []);

  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div
        className="max-w-md w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-xl text-center"
        role="alert"
      >
        <h1 className="text-xl font-semibold text-slate-100 mb-2">
          {ERROR_BOUNDARY.GLOBAL_TITLE}
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          {error?.message ?? ERROR_BOUNDARY.GLOBAL_FALLBACK}
        </p>
        <button
          ref={retryRef}
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label={ARIA_LABELS.RETRY}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
