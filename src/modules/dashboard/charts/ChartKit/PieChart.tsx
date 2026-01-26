/**
 * PieChart - Graphique en camembert avec lazy loading
 */

'use client';

import dynamic from 'next/dynamic';

export const PieChart = dynamic(
  () => import('./PieChartImpl').then((mod) => ({ default: mod.PieChartImpl })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 min-h-[256px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-slate-400" />
          <p className="text-xs text-slate-400">Chargement du graphique…</p>
        </div>
      </div>
    ),
  }
);

export type { PieChartImplProps as PieChartProps } from './PieChartImpl';
