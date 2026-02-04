// ============================================
// Composant Skeleton pour les loaders
// ============================================

import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/ui/card';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Composant Skeleton pour afficher des placeholders de chargement
 */
export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-300 dark:bg-slate-700/50 rounded';
  
  const variantClasses = {
    default: 'rounded',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-label="Chargement..."
      role="status"
    />
  );
}

/**
 * Skeleton pour une carte d'alerte
 */
export function AlertCardSkeleton() {
  return (
    <Card className="bg-slate-100 dark:bg-slate-800/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </div>
          <Skeleton variant="circular" width={24} height={24} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={14} />
          <Skeleton variant="text" width="80%" height={14} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width={60} height={20} />
          <Skeleton variant="rectangular" width={80} height={20} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour la table RACI
 */
export function RACITableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-[2fr_repeat(7,1fr)_1fr] gap-2 p-2">
        <Skeleton variant="text" height={20} />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" height={20} />
        ))}
        <Skeleton variant="text" height={20} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-[2fr_repeat(7,1fr)_1fr] gap-2 p-2">
          <Skeleton variant="text" height={18} />
          {Array.from({ length: 7 }).map((_, j) => (
            <Skeleton key={j} variant="circular" width={32} height={32} />
          ))}
          <Skeleton variant="text" height={18} />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour un graphique (barres animées)
 * Standard 2026 : remplacer "Chargement du graphique..." par skeleton animé.
 */
export function ChartSkeleton({ className, minHeight = 256 }: { className?: string; minHeight?: number }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40 overflow-hidden',
        className
      )}
      style={{ minHeight }}
      role="status"
      aria-label="Chargement du graphique"
    >
      <div className="p-4 space-y-4 h-full flex flex-col">
        <Skeleton variant="text" className="h-5 w-32" />
        <div className="flex-1 flex items-end gap-1 gap-x-2 pr-2">
          {[40, 65, 45, 80, 55, 70, 50, 90, 60, 75].map((h, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              className="flex-1 min-w-[8px] rounded-t"
              height={`${h}%`}
            />
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton variant="text" className="h-3 w-16" />
          <Skeleton variant="text" className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}/**
 * Skeleton pour la page Dashboard (header, cartes KPI, table)
 * Utilisé pendant le chargement des vues cockpit.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6" role="status" aria-label="Chargement du dashboard">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="rectangular" className="h-10 w-32 rounded-lg" />
      </div>      {/* Cards KPI */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 p-6"
          >
            <Skeleton variant="text" className="h-6 w-48" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="rectangular" className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>      {/* Table */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}