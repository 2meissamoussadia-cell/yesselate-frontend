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
import { ChartSkeleton } from '@/components/ui/skeleton';

// Lazy load de l'implémentation (export default)
export const LineChart = dynamic(
  () => import('./LineChartImpl'),
  {
    ssr: false,
    loading: () => <ChartSkeleton className="min-h-[256px] w-full" minHeight={256} />,
  }
);

// Alias pour compatibilité (Phase 1)
export const LineChartLazy = LineChart;

// Export des types pour usage externe
export type { LineChartImplProps as LineChartProps } from './LineChartImpl';
