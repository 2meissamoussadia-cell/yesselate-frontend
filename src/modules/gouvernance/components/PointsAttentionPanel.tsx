/**
 * Panel d'affichage des points d'attention majeurs
 * Affiche les alertes critiques nécessitant une action
 */

'use client';

import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PointAttention } from '../types/gouvernanceTypes';

interface PointsAttentionPanelProps {
  points?: PointAttention[];
  className?: string;
  onPointClick?: (point: PointAttention) => void;
}

function PointAttentionCard({
  point,
  onClick,
}: {
  point: PointAttention;
  onClick?: () => void;
}) {
  const priorityColors = {
    critical: 'bg-rose-500/10 text-rose-200 ring-rose-500/20',
    high: 'bg-amber-500/10 text-amber-200 ring-amber-500/20',
    medium: 'bg-yellow-500/10 text-yellow-200 ring-yellow-500/20',
    low: 'bg-slate-500/10 text-slate-200 ring-slate-500/20',
  };

  const priorityLabels = {
    critical: 'Critique',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Voir le point d'attention : ${point.titre}`}
      className={cn(
        'w-full flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5 min-h-[44px] ring-1 ring-white/10',
        'hover:bg-white/10 transition-colors text-left focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
              priorityColors[point.priorite]
            )}
          >
            {priorityLabels[point.priorite]}
          </span>
          {point.projet_nom && (
            <span className="text-xs text-slate-400">{point.projet_nom}</span>
          )}
        </div>
        <div className="text-sm font-medium text-white truncate">{point.titre}</div>
        {point.impact && (
          <div className="text-xs text-slate-400 mt-1">Impact : {point.impact}</div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
    </button>
  );
}

export function PointsAttentionPanel({
  points = [],
  className,
  onPointClick,
}: PointsAttentionPanelProps) {
  if (points.length === 0) {
    return (
      <div className={cn('rounded-2xl bg-white/5 p-4 ring-1 ring-white/10', className)}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-300" />
            <div className="text-sm font-semibold text-white">Points d'attention majeurs</div>
          </div>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-500/15 text-slate-200 ring-1 ring-slate-500/30">
            Aucun
          </span>
        </div>
        <div className="text-xs text-slate-400">Aucun point d'attention critique</div>
      </div>
    );
  }

  const criticalCount = points.filter((p) => p.priorite === 'critical').length;

  return (
    <div className={cn('rounded-2xl bg-white/5 p-4 ring-1 ring-white/10', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          <div className="text-sm font-semibold text-white">Points d'attention majeurs</div>
        </div>
        {criticalCount > 0 && (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30">
            {criticalCount} critique{criticalCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {points.slice(0, 5).map((point) => (
          <PointAttentionCard
            key={point.id}
            point={point}
            onClick={() => onPointClick?.(point)}
          />
        ))}
      </div>

      {points.length > 5 && (
        <div className="mt-3 text-xs text-slate-400 text-center">
          +{points.length - 5} autre{points.length - 5 > 1 ? 's' : ''} point{points.length - 5 > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

