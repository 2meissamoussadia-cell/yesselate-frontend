/**
 * PieChart - Graphique en camembert avec lazy loading
 */

'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/skeleton';

export const PieChart = dynamic(
  () => import('./PieChartImpl').then((mod) => ({ default: mod.PieChartImpl })),
  {
    ssr: false,
    loading: () => <ChartSkeleton className="min-h-[256px] w-full" minHeight={256} />,
  }
);

export type { PieChartImplProps as PieChartProps } from './PieChartImpl';
