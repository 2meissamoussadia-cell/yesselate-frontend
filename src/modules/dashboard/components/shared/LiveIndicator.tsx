/**
 * Indicateur "● LIVE" + optionnel "Mise à jour : il y a X min"
 * Phase 2 #8 : temps réel visible (standard 2026)
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { LastUpdateDisplay } from '../LastUpdateDisplay';

export interface LiveIndicatorProps {
  /** Dernière mise à jour des données (optionnel) */
  lastUpdate?: Date | null;
  /** Afficher le texte "Mise à jour : X" à côté du badge Live */
  showTimestamp?: boolean;
  /** Données considérées "live" (sinon affiche Offline) */
  isLive?: boolean;
  className?: string;
}

export const LiveIndicator = memo(function LiveIndicator({
  lastUpdate,
  showTimestamp = true,
  isLive = true,
  className,
}: LiveIndicatorProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-2 flex-wrap', className)}
      role="status"
      aria-live="polite"
      aria-label={isLive ? 'Données temps réel' : 'Hors ligne'}
    >
      {isLive ? (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          title="Données à jour"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
          LIVE
        </span>
      ) : (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-600/40 text-slate-400 border border-slate-500/40"
          title="Hors ligne"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" aria-hidden />
          Offline
        </span>
      )}
      {showTimestamp && lastUpdate && (
        <LastUpdateDisplay lastUpdate={lastUpdate} prefix="Mise à jour" className="text-[10px] text-slate-400" />
      )}
    </div>
  );
});
