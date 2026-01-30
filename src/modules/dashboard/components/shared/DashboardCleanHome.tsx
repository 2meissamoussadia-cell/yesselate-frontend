/**
 * Dashboard Clean Home — 4 KPI cards + Phase 4 table (focus exécution).
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { KpiCardClean } from './KpiCardClean';
import { formatCFA } from '../cockpit/OrangeMoneyButton';

// Données mock Phase 4 — à remplacer par API
const phase4Critiques = [
  { numero: '#042', ca: 2_400_000, sante: 0.62, stockPeinture: 0.02, bureau: '1/3' },
  { numero: '#038', ca: 1_800_000, sante: 0.45, stockPeinture: 0.08, bureau: '2/3' },
  { numero: '#051', ca: 3_100_000, sante: 0.78, stockPeinture: 0.15, bureau: '1/3' },
  { numero: '#033', ca: 950_000, sante: 0.31, stockPeinture: 0, bureau: '1/3' },
  { numero: '#047', ca: 2_700_000, sante: 0.55, stockPeinture: 0.05, bureau: '2/3' },
];

function getSanteColor(sante: number): string {
  if (sante >= 0.7) return 'bg-emerald-500';
  if (sante >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
}

export interface DashboardCleanHomeProps {
  /** KPIs principaux (optionnel, sinon défaut) */
  kpis?: Array<{ title: string; value: string | number; trend: string; color?: 'blue' | 'green' | 'yellow' | 'red'; critical?: boolean }>;
}

const defaultKpis = [
  { title: 'Chantiers Actifs', value: '42', trend: '+12%', color: 'blue' as const, critical: false },
  { title: 'CA Cumulé', value: '18M XOF', trend: '-2%', color: 'green' as const, critical: false },
  { title: 'Marge Nette', value: '23%', trend: '+1pt', color: 'yellow' as const, critical: false },
  { title: 'Alertes Critiques', value: '3', trend: '+1', color: 'red' as const, critical: true },
];

export function DashboardCleanHome({ kpis = defaultKpis }: DashboardCleanHomeProps) {
  return (
    <div className="flex-1 overflow-hidden p-6 sm:p-8 flex flex-col">
      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 shrink-0">
        {kpis.map((kpi) => (
          <KpiCardClean
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            trend={kpi.trend}
            color={kpi.color}
            critical={kpi.critical}
          />
        ))}
      </div>

      {/* TABLEAU PHASE 4 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 shrink-0">
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <div className="w-2 h-8 rounded bg-gradient-to-b from-red-400 to-red-600 shrink-0" />
            Phase 4 - Exécution (15 chantiers)
          </h3>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-700/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Chantier</th>
                <th className="p-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">CA</th>
                <th className="p-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">Santé</th>
                <th className="p-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">Problème</th>
                <th className="p-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {phase4Critiques.map((chantier, i) => (
                <tr
                  key={chantier.numero}
                  className={cn(
                    'border-t border-slate-200/50 dark:border-slate-700/50 transition-colors',
                    'hover:bg-slate-50/50 dark:hover:bg-slate-700/50'
                  )}
                >
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{chantier.numero}</td>
                  <td className="p-4 text-right tabular-nums text-slate-700 dark:text-slate-300">{formatCFA(chantier.ca)}</td>
                  <td className="p-4">
                    <div className="w-16 h-4 rounded-full overflow-hidden bg-slate-200/50 dark:bg-slate-700/50">
                      <div
                        className={cn('h-full rounded-full transition-all', getSanteColor(chantier.sante))}
                        style={{ width: `${Math.round(chantier.sante * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right text-sm text-red-600 dark:text-red-400">
                    {chantier.stockPeinture < 0.05 ? 'Peinture 0%' : `Bureau ${chantier.bureau}`}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Relancer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
