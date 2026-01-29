/**
 * Badge Live / Offline + "Dernière màj: il y a X min"
 * Pour les vues Cockpit chantiers : WebSocket temps réel + refresh auto 30s
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

function formatLastUpdate(updatedAt: number | undefined | null): string {
  if (updatedAt == null || !Number.isFinite(updatedAt)) return '—';
  const now = Date.now();
  const diffMs = now - updatedAt;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  if (diffSec < 60) return 'à l\'instant';
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHour < 24) return `il y a ${diffHour}h`;
  return `il y a ${Math.floor(diffHour / 24)}j`;
}

export interface LiveStatusBadgeProps {
  /** WebSocket connecté = Live, sinon Offline */
  isLive: boolean;
  /** Timestamp (ms) dernière mise à jour des données (ex. query.dataUpdatedAt) */
  lastUpdatedAt?: number | null;
  /** En cours de chargement / refetch */
  isLoading?: boolean;
  /** Compact : seulement Live/Offline + temps, sans libellé "Dernière màj" */
  compact?: boolean;
  className?: string;
}

export function LiveStatusBadge({
  isLive,
  lastUpdatedAt,
  isLoading = false,
  compact = false,
  className,
}: LiveStatusBadgeProps) {
  const lastUpdateText = formatLastUpdate(lastUpdatedAt);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 flex-wrap',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={isLive ? 'Temps réel actif' : 'Hors ligne'}
    >
      {isLive ? (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          title="WebSocket temps réel actif"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
          Live
        </span>
      ) : (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-600/40 text-slate-400 border border-slate-500/40"
          title="Pas de connexion temps réel"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" aria-hidden />
          Offline
        </span>
      )}
      {isLoading && (
        <span className="text-[10px] text-slate-500 animate-pulse">mise à jour…</span>
      )}
      {!compact && (lastUpdatedAt != null || lastUpdateText !== '—') && (
        <span className="text-[10px] text-slate-500" title="Dernière mise à jour des données">
          Dernière màj: {lastUpdateText}
        </span>
      )}
    </div>
  );
}
