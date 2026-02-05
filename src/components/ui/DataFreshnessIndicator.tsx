'use client';

/**
 * DataFreshnessIndicator — Indicateur de fraîcheur des données (cockpit DG).
 * Dernière mise à jour + bouton Actualiser pour mises à jour en temps réel.
 * L'heure n'est formatée qu'après montage pour éviter un hydration mismatch (server vs client).
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { RefreshCw } from 'lucide-react';

export interface DataFreshnessIndicatorProps {
  /** Date/heure de la dernière mise à jour des données */
  lastUpdated: Date;
  /** Callback au clic sur Actualiser (rafraîchissement manuel) */
  onRefresh?: () => void;
  /** En cours de rafraîchissement */
  isRefreshing?: boolean;
  className?: string;
}

export function DataFreshnessIndicator({
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  className,
}: DataFreshnessIndicatorProps) {
  const [timeStr, setTimeStr] = useState<string>('--:--:--');

  useEffect(() => {
    setTimeStr(
      lastUpdated.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  }, [lastUpdated]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs text-slate-400',
        className
      )}
      aria-live="polite"
    >
      <span>Dernière mise à jour : {timeStr}</span>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-100',
            'hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Actualiser les données"
        >
          <RefreshCw
            className={cn('h-3 w-3', isRefreshing && 'animate-spin')}
            aria-hidden
          />
          Actualiser
        </button>
      )}
    </div>
  );
}
