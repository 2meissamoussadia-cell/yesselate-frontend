/**
 * Graphique Cashflow — 3 mois passés + 3 mois futurs (prévision).
 * Barres ou courbes : entrées, sorties, solde par mois.
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatMoneyCompact } from '@lib-root/dashboard/kpi';
import type { CashflowMonthMock } from '../../data/financesGlobalesMock';

export interface CashflowChartProps {
  data: CashflowMonthMock[];
  className?: string;
  /** Hauteur du graphique (px) */
  height?: number;
}

export function CashflowChart({ data, className, height = 220 }: CashflowChartProps) {
  const maxAbs = useMemo(() => {
    let max = 0;
    data.forEach((d) => {
      max = Math.max(max, d.entrees, d.sorties, Math.abs(d.solde));
    });
    return max || 1;
  }, [data]);

  const scale = (v: number) => (v / maxAbs) * 100;

  return (
    <div className={cn('rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden', className)}>
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-100">Cashflow prévisionnel</h3>
        <p className="text-xs text-slate-500 mt-0.5">3 mois passés • 3 mois futurs (prévision)</p>
      </div>
      <div className="p-4">
        <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
          {data.map((d) => (
            <div
              key={d.mois}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
            >
              <div className="w-full flex flex-col gap-0.5 justify-end flex-1 min-h-0" style={{ minHeight: 120 }}>
                {/* Entrées (barre verte) */}
                <div
                  className="w-full rounded-t bg-emerald-500/70 hover:bg-emerald-500/90 transition-colors"
                  style={{ height: `${scale(d.entrees) * 0.4}%`, minHeight: 2 }}
                  title={`Entrées: ${formatMoneyCompact(d.entrees)}`}
                />
                {/* Sorties (barre ambre) */}
                <div
                  className="w-full rounded-t bg-amber-500/60 hover:bg-amber-500/80 transition-colors"
                  style={{ height: `${scale(d.sorties) * 0.4}%`, minHeight: 2 }}
                  title={`Sorties: ${formatMoneyCompact(d.sorties)}`}
                />
              </div>
              <span className={cn('text-[10px] font-medium truncate w-full text-center', d.previsionnel ? 'text-slate-500' : 'text-slate-400')}>
                {d.label}
              </span>
              {d.previsionnel && (
                <span className="text-[9px] text-slate-600 uppercase">Prév.</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/70" />
            Entrées
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/60" />
            Sorties
          </span>
          <span className="text-slate-500">• Solde = Entrées − Sorties</span>
        </div>
        {/* Solde par mois (ligne secondaire) */}
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
          {data.map((d) => (
            <div key={d.mois} className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[10px]">{d.label}:</span>
              <span className={cn('text-[10px] font-medium', d.solde >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {d.solde >= 0 ? '+' : ''}{formatMoneyCompact(d.solde)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
