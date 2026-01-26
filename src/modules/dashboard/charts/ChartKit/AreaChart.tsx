// modules/dashboard/charts/ChartKit/AreaChart.tsx
'use client';
import dynamic from 'next/dynamic';
export const AreaChartLazy = dynamic(() => import('./AreaChartImpl'), {
  ssr: false,
  loading: () => <div className="animate-pulse text-slate-400">Chargement…</div>,
});

export type AreaChartProps = { data: any[]; series: Array<{ key: string; label: string; color: string }> };
