/**
 * Widget Alertes intelligentes — Phase 2 audit ERP BTP 2026.
 * Inspiré Graneet + Procore : prédictif, impact €, actions suggérées.
 */

'use client';

import React, { memo } from 'react';
import { AlertTriangle, TrendingDown, ChevronRight } from 'lucide-react';
import { formatMoneyCompact } from '@lib-root/dashboard/kpi';
import type { SmartAlert } from '../../types/smartAlert';
import { smartAlertsMock } from '../../data/smartAlertsMock';
import { cn } from '@/lib/cn';

const CURRENCY = 'XOF';

export interface AlertesIntelligentesWidgetProps {
  /** Liste d'alertes (si non fourni, mock utilisé) */
  alertes?: SmartAlert[];
  /** Clic sur une alerte (ex. ouvrir détail) */
  onAlerteClick?: (alerte: SmartAlert) => void;
  /** Clic "Voir tout" (ex. Centre d'alertes) */
  onVoirTout?: () => void;
  className?: string;
}

const severityClasses = {
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  critical: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
};

export const AlertesIntelligentesWidget = memo(function AlertesIntelligentesWidget({
  alertes = smartAlertsMock,
  onAlerteClick,
  onVoirTout,
  className,
}: AlertesIntelligentesWidgetProps) {
  const list = alertes.length > 0 ? alertes : smartAlertsMock;

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60',
        className
      )}
    >
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Alertes prédictives</h3>
        </div>
        {onVoirTout && (
          <button
            type="button"
            onClick={onVoirTout}
            className="text-[11px] text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 rounded px-1.5 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
            aria-label="Voir toutes les alertes (Centre d'alertes)"
          >
            Voir tout
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
      <div className="p-3 space-y-2">
        {list.slice(0, 3).map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onAlerteClick?.(a)}
            className={cn(
              'w-full text-left rounded-lg border p-3 transition-colors',
              severityClasses[a.severity],
              onAlerteClick && 'hover:opacity-90'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium truncate">{a.chantier} · {a.message}</p>
                {a.prediction && (
                  <p className="text-[10px] mt-1 opacity-90">
                    Impact estimé : {formatMoneyCompact(Math.abs(a.prediction.impact_eur), CURRENCY)}
                    {' · '}
                    Probabilité {a.prediction.proba} %
                  </p>
                )}
                {a.actions_suggerees.length > 0 && (
                  <p className="text-[10px] mt-0.5 opacity-80">
                    Actions : {a.actions_suggerees.map((x) => x.label).join(', ')}
                  </p>
                )}
              </div>
              {a.prediction?.trend === 'deterioration' && (
                <TrendingDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
