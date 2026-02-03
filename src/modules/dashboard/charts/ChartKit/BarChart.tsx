/**
 * BarChart - Graphique en barres avec lazy loading
 */

'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/skeleton';

export const BarChart = dynamic(
  () => import('./BarChartImpl').then((mod) => ({ default: mod.BarChartImpl })),
  {
    ssr: false,
    loading: () => <ChartSkeleton className="min-h-[256px] w-full" minHeight={256} />,
  }
);

export type { BarChartImplProps as BarChartProps } from './BarChartImpl';
