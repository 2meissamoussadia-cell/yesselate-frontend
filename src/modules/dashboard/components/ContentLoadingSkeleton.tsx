/**
 * Composant de skeleton pour le chargement du contenu du dashboard
 * Affiche des placeholders animés pendant le chargement
 * Version optimisée avec animate-pulse (classe Tailwind native)
 * 
 * Phase 1 : Amélioré pour couvrir KPI rail + charts + tables lourds
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

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
 * Skeleton pour une carte KPI
 */
function KPICardSkeleton() {
  return (
    <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-slate-700/50 rounded" />
        <div className="h-6 w-6 bg-slate-700/50 rounded" />
      </div>
      <div className="h-8 w-20 bg-slate-700/50 rounded mb-2" />
      <div className="h-3 w-16 bg-slate-700/30 rounded" />
    </div>
  );
}

/**
 * Skeleton pour un graphique
 */
function ChartSkeleton() {
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 animate-pulse">
      <div className="h-6 w-48 bg-slate-700/50 rounded mb-4" />
      <div className="h-64 bg-slate-700/30 rounded">
        {/* Lignes de grille simulées */}
        <div className="h-full flex flex-col justify-between p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-px bg-slate-700/20 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour un tableau
 */
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 p-4">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-700/50 rounded" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-700/30">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-4 bg-slate-700/30 rounded" />
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
    <div className={cn('space-y-6', className)}>
      {/* Header skeleton */}
      <div className="h-8 w-1/3 bg-slate-800/50 rounded animate-pulse" />

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
