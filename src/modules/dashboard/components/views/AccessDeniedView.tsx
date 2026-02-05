/**
 * Vue "Accès refusé" - Affichée lorsque l'utilisateur n'a pas les droits pour la page.
 * Logiciel métier : message clair, action explicite (retour accueil).
 * Accessibilité : focus automatique sur le bouton de retour, ARIA.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { ShieldX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';

export interface AccessDeniedViewProps {
  /** Callback pour naviguer vers l'accueil (ex. overview) */
  onGoHome: () => void;
  /** Message optionnel (sinon message i18n par défaut) */
  message?: string;
  className?: string;
}

export function AccessDeniedView({
  onGoHome,
  message,
  className,
}: AccessDeniedViewProps) {
  const { t } = useI18n();
  const goHomeRef = useRef<HTMLButtonElement>(null);

  const title = t('dashboard.accessDenied.title');
  const defaultMessage = t('dashboard.accessDenied.message');
  const goHomeLabel = t('dashboard.accessDenied.goHome');
  const displayMessage = message ?? defaultMessage;

  useEffect(() => {
    goHomeRef.current?.focus();
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[320px] p-6 sm:p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5',
        className
      )}
      role="alert"
      aria-live="polite"
      aria-labelledby="access-denied-title"
      aria-describedby="access-denied-desc"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
        <ShieldX className="w-8 h-8 text-amber-400" aria-hidden />
      </div>
      <h2 id="access-denied-title" className="text-lg font-semibold text-slate-100 mb-2 text-center">
        {title}
      </h2>
      <p id="access-denied-desc" className="text-sm text-slate-400 text-center max-w-md mb-6">
        {displayMessage}
      </p>
      <Button
        ref={goHomeRef}
        onClick={onGoHome}
        variant="outline"
        className="gap-2 border-slate-600 bg-slate-800/50 hover:bg-slate-700/50"
        aria-label={goHomeLabel}
      >
        <Home className="w-4 h-4" aria-hidden />
        {goHomeLabel}
      </Button>
    </div>
  );
}
