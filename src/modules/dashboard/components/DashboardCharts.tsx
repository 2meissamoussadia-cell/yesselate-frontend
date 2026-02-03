/**
 * Composants de graphiques pour le Dashboard utilisant Recharts
 * Standardisé sur Recharts pour réduire le bundle et améliorer la cohérence
 * Lazy-loaded pour optimiser les performances (vraie séparation de code)
 */

'use client';

import React, { Suspense, lazy } from 'react';
import { ChartSkeleton } from '@/components/ui/skeleton';

// ============================================
// TYPES
// ============================================

export interface TrendData {
  date: string;
  demandes: number;
  validations: number;
  budget: number;
}

export interface MonthlyComparisonData {
  month: string;
  actuel: number;
  precedent: number;
}

export interface CategoryDistributionData {
  category: string;
  count: number;
  percentage: number;
}

interface DashboardChartsProps {
  trends?: TrendData[];
  monthlyComparison?: MonthlyComparisonData[];
  categoryDistribution?: CategoryDistributionData[];
}

// ============================================
// COMPONENTS (exportés pour compatibilité, mais lazy-loaded dans l'usage)
// ============================================

// Les composants sont maintenant dans des fichiers séparés pour le code splitting
// Ré-exports pour compatibilité ascendante
export { TrendsChart } from './charts/TrendsChart';
export { MonthlyComparisonChart } from './charts/MonthlyComparisonChart';
export { CategoryDistributionChart } from './charts/CategoryDistributionChart';

// ============================================
// LAZY LOADED WRAPPER (vraie séparation de code)
// ============================================

const LazyTrendsChart = lazy(() => import('./charts/TrendsChart').then(m => ({ default: m.TrendsChart })));
const LazyMonthlyComparisonChart = lazy(() => import('./charts/MonthlyComparisonChart').then(m => ({ default: m.MonthlyComparisonChart })));
const LazyCategoryDistributionChart = lazy(() => import('./charts/CategoryDistributionChart').then(m => ({ default: m.CategoryDistributionChart })));

// ============================================
// FALLBACK COMPONENT
// ============================================

const ChartLoadingFallback = () => <ChartSkeleton className="h-64 w-full" minHeight={256} />;

// ============================================
// MAIN COMPONENT
// ============================================

export function DashboardCharts({ trends, monthlyComparison, categoryDistribution }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {trends && trends.length > 0 && (
        <Suspense fallback={<ChartLoadingFallback />}>
          <LazyTrendsChart trends={trends} />
        </Suspense>
      )}

      {monthlyComparison && monthlyComparison.length > 0 && (
        <Suspense fallback={<ChartLoadingFallback />}>
          <LazyMonthlyComparisonChart data={monthlyComparison} />
        </Suspense>
      )}

      {categoryDistribution && categoryDistribution.length > 0 && (
        <Suspense fallback={<ChartLoadingFallback />}>
          <LazyCategoryDistributionChart data={categoryDistribution} />
        </Suspense>
      )}
    </div>
  );
}
