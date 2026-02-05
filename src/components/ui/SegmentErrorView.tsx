'use client';

/**
 * Vue d’erreur partagée pour les error boundaries de segments (Outlook, alertes, planning, etc.).
 * Utilise ERROR_BOUNDARY et ARIA_LABELS pour cohérence et accessibilité (LAYOUT_UI_GAPS).
 * Focus automatique sur le bouton Réessayer au montage pour la navigation clavier et lecteurs d’écran.
 */

import React, { useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ERROR_BOUNDARY, ARIA_LABELS } from '@lib-root/constants';

export interface SegmentErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Titre affiché (défaut : ERROR_BOUNDARY.SEGMENT_TITLE) */
  title?: string;
  /** Message de fallback si error.message vide (défaut : ERROR_BOUNDARY.SEGMENT_FALLBACK) */
  fallbackMessage?: string;
  /** Hauteur min du conteneur */
  className?: string;
}

export function SegmentErrorView({
  error,
  reset,
  title = ERROR_BOUNDARY.SEGMENT_TITLE,
  fallbackMessage = ERROR_BOUNDARY.SEGMENT_FALLBACK,
  className = 'min-h-[400px]',
}: SegmentErrorViewProps) {
  const retryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    retryRef.current?.focus();
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-8 ${className}`}
      role="alert"
    >
      <AlertCircle className="h-12 w-12 text-rose-500 shrink-0" aria-hidden />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center">
        {title}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
        {error?.message?.trim() ? error.message : fallbackMessage}
      </p>
      <Button
        ref={retryRef}
        variant="outline"
        onClick={reset}
        aria-label={ARIA_LABELS.RETRY}
      >
        Réessayer
      </Button>
    </div>
  );
}
