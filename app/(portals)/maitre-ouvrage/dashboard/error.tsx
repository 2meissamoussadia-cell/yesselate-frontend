'use client';

/**
 * Error Boundary du segment Dashboard (audit ERP BTP 2026).
 * Capture les erreurs des vues (ex. HSE, Calendrier) et affiche un fallback avec Réessayer. Focus auto (a11y).
 */

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/utils/logger';
import { ERROR_BOUNDARY, ARIA_LABELS } from '@lib-root/constants';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const retryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && error) {
      logger.error('DashboardError', error, { component: 'DashboardError', digest: error?.digest });
    }
  }, [error]);

  useEffect(() => {
    retryRef.current?.focus();
  }, []);

  return (
    <div className="p-4 sm:p-6 w-full min-w-0 flex items-center justify-center min-h-[40vh]" role="alert">
      <div className="max-w-md w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-xl text-center">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">
          {ERROR_BOUNDARY.SEGMENT_TITLE}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {error?.message ?? ERROR_BOUNDARY.SEGMENT_FALLBACK}
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
