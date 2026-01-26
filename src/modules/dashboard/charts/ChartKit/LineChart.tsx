/**
 * LineChart - Graphique en ligne avec lazy loading
 * 
 * Wrapper lazy pour LineChartImpl
 * Utilise Next.js dynamic import pour le code splitting
 * 
 * Phase 1 : Standardisé sur Recharts avec ChartContainer
 */

'use client';

import dynamic from 'next/dynamic';

// Lazy load de l'implémentation (export default)
export const LineChart = dynamic(
  () => import('./LineChartImpl'),
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

// Alias pour compatibilité (Phase 1)
export const LineChartLazy = LineChart;

// Export des types pour usage externe
export type { LineChartImplProps as LineChartProps } from './LineChartImpl';
