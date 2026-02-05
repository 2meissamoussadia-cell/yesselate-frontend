'use client';

/**
 * Error Boundary du portail Maître d'Ouvrage.
 * Capture les erreurs non gérées dans le shell ou les layouts enfants. Focus auto sur Réessayer (a11y).
 */

import { useEffect, useRef } from 'react';
import { ERROR_BOUNDARY, ARIA_LABELS } from '@lib-root/constants';
import { logger } from '@/lib/utils/logger';

export default function MaitreOuvrageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const retryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && error) {
      logger.error('MaitreOuvrageError', error, { component: 'MaitreOuvrageError', digest: error?.digest });
    }
  }, [error]);

  useEffect(() => {
    retryRef.current?.focus();
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6"
      role="alert"
    >
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-lg text-center">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {ERROR_BOUNDARY.PORTAL_TITLE}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {error?.message ?? ERROR_BOUNDARY.PORTAL_FALLBACK}
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
