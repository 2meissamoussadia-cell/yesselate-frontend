/**
 * Composant de skeleton pour le chargement du contenu du dashboard
 * Affiche des placeholders animés pendant le chargement
 * Version optimisée avec animate-pulse (classe Tailwind native)
 * 
 * Phase 1 : Amélioré pour couvrir KPI rail + charts + tables lourds
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';

interface ContentLoadingSkeletonProps {
  /**
   * Afficher le skeleton pour la barre KPI
   */
  showKPIBar?: boolean;
  
  /**
   * Nombre de cartes KPI à afficher
   */
  kpiCount?: number;
  
  /**
   * Afficher le skeleton pour les graphiques
   */
  showCharts?: boolean;
  
  /**
   * Nombre de graphiques à afficher
   */
  chartCount?: number;
  
  /**
   * Afficher le skeleton pour les tableaux
   */
  showTable?: boolean;
  
  /**
   * Nombre de lignes dans le tableau
   */
  tableRows?: number;
  
  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

/**
 * Skeleton pour une carte KPI (shimmer discret)
 */
function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 rounded-lg dashboard-skeleton-shimmer" />
        <div className="h-10 w-10 rounded-xl dashboard-skeleton-shimmer" />
      </div>
      <div className="h-8 w-28 rounded-lg dashboard-skeleton-shimmer mb-2" />
      <div className="h-3 w-16 rounded dashboard-skeleton-shimmer" />
    </div>
  );
}

/**
 * Skeleton pour un graphique
 */
function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/35 p-6 overflow-hidden">
      <div className="h-6 w-48 rounded-lg dashboard-skeleton-shimmer mb-4" />
      <div className="h-64 rounded-xl dashboard-skeleton-shimmer" />
    </div>
  );
}

/**
 * Skeleton pour un tableau
 */
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/35 overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-800/60 p-4">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 rounded dashboard-skeleton-shimmer" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800/40">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-4 rounded dashboard-skeleton-shimmer" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Composant de skeleton pour le chargement du contenu du dashboard
 * 
 * @example
 * ```tsx
 * // Skeleton complet (KPI + charts + table)
 * <ContentLoadingSkeleton />
 * 
 * // Skeleton minimal (seulement KPI)
 * <ContentLoadingSkeleton showCharts={false} showTable={false} />
 * 
 * // Skeleton personnalisé
 * <ContentLoadingSkeleton kpiCount={6} chartCount={2} tableRows={10} />
 * ```
 */
export function ContentLoadingSkeleton({
  showKPIBar = true,
  kpiCount = 4,
  showCharts = true,
  chartCount = 2,
  showTable = false,
  tableRows = 5,
  className,
}: ContentLoadingSkeletonProps = {}) {
  return (
    <div className={cn('space-y-6 animate-fadeIn', className)}>
      {/* Header skeleton */}
      <div className="h-8 max-w-xs rounded-xl dashboard-skeleton-shimmer" />

      {/* KPI Cards grid skeleton */}
      {showKPIBar && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(kpiCount)].map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Chart skeletons */}
      {showCharts && (
        <div className="space-y-6">
          {[...Array(chartCount)].map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Table skeleton */}
      {showTable && <TableSkeleton rows={tableRows} />}
    </div>
  );
}
