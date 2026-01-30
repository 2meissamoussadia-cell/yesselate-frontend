'use client';

/**
 * OpportunitiesKanbanView — Vue Kanban par phase (0, 1, 2).
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { GitCommit, MapPin, DollarSign } from 'lucide-react';
import type { OpportunityRow } from './types';

function formatBudget(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} Md`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} M`;
  return value.toLocaleString('fr-FR');
}

const COLUMNS: { phase: number; label: string; color: string }[] = [
  { phase: 0, label: 'Phase 0 — Pré-projet', color: 'bg-slate-800/60 border-slate-600/50' },
  { phase: 1, label: 'Phase 1 — Foncier', color: 'bg-blue-900/30 border-blue-600/50' },
  { phase: 2, label: 'Phase 2 — Programme', color: 'bg-emerald-900/30 border-emerald-600/50' },
];

export interface OpportunitiesKanbanViewProps {
  data: OpportunityRow[];
  onCardClick: (row: OpportunityRow) => void;
  className?: string;
}

export function OpportunitiesKanbanView({
  data,
  onCardClick,
  className,
}: OpportunitiesKanbanViewProps) {
  const byPhase = React.useMemo(() => {
    const map: Record<number, OpportunityRow[]> = { 0: [], 1: [], 2: [] };
    for (const row of data) {
      if (row.phase >= 0 && row.phase <= 2) {
        map[row.phase].push(row);
      }
    }
    return map;
  }, [data]);

  return (
    <div
      className={cn('grid grid-cols-3 gap-4 overflow-x-auto pb-2', className)}
      style={{ minHeight: '480px' }}
    >
      {COLUMNS.map((col) => (
        <div
          key={col.phase}
          className={cn(
            'rounded-xl border flex flex-col min-w-[280px] overflow-hidden',
            col.color
          )}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/50 shrink-0">
            <GitCommit className="h-4 w-4 text-amber-400" aria-hidden />
            <span className="text-xs font-semibold text-slate-200">{col.label}</span>
            <span className="ml-auto text-[0.65rem] text-slate-500">
              {byPhase[col.phase].length} fiche{byPhase[col.phase].length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {byPhase[col.phase].map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onCardClick(row)}
                className={cn(
                  'w-full text-left rounded-lg border border-slate-700/60 bg-slate-950/60 p-3',
                  'hover:border-slate-600 hover:bg-slate-900/50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500/50'
                )}
              >
                <div className="font-medium text-slate-100 text-xs truncate">{row.projet}</div>
                <div className="flex items-center gap-1 mt-1 text-[0.65rem] text-slate-400">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                  <span className="truncate">{row.ville} · {row.clientType}</span>
                </div>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <span className="text-[0.65rem] text-slate-500 flex items-center gap-0.5">
                    <DollarSign className="h-3 w-3" aria-hidden />
                    {formatBudget(row.budget)} FCFA
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[0.6rem]',
                      row.risque === 'high'
                        ? 'bg-red-900/40 text-red-200'
                        : row.risque === 'medium'
                          ? 'bg-amber-900/40 text-amber-200'
                          : 'bg-emerald-900/40 text-emerald-200'
                    )}
                  >
                    {row.proba} %
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
