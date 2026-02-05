/**
 * V5 — Bannière de consentement Web Push (Cockpit DG).
 * Affiche « Activer les notifications ? » avec [Oui] [Plus tard].
 */

'use client';

import React from 'react';
import { Bell, X } from 'lucide-react';
import { usePushConsent } from '../../hooks/usePushConsent';
import { cn } from '@/lib/cn';

export function PushConsentBanner() {
  const {
    shouldShowBanner,
    subscribe,
    dismissBanner,
    isLoading,
    error,
    isSupported,
  } = usePushConsent();

  if (!isSupported || !shouldShowBanner) return null;

  const handleAccept = async () => {
    const granted = await subscribe();
    if (granted) dismissBanner();
  };

  return (
    <div
      role="region"
      aria-label="Demande d’activation des notifications"
      className={cn(
        'rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3',
        'bg-slate-800/80 border-slate-600/50',
        'shadow-lg'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
          <Bell className="h-5 w-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100">
            Activer les notifications ?
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Alertes Cockpit (urgences, chantiers critiques) même quand l’app est fermée.
          </p>
          {error && (
            <p className="text-xs text-rose-400 mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleAccept}
          disabled={isLoading}
          className={cn(
            'min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg text-sm font-medium',
            'bg-blue-600 hover:bg-blue-500 text-white',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          {isLoading ? 'En cours…' : 'Oui'}
        </button>
        <button
          type="button"
          onClick={dismissBanner}
          disabled={isLoading}
          aria-label="Fermer et ne plus afficher"
          className={cn(
            'min-h-[44px] min-w-[44px] p-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
          )}
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={dismissBanner}
          className={cn(
            'min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
          )}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
