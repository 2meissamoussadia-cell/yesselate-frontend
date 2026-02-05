/**
 * LoadingSkeleton Component
 * Composant de skeleton loader pour les états de chargement
 * Compatible avec Suspense et lazy loading
 */

'use client';

import { cn } from '@/lib/cn';

export interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

/**
 * Skeleton loader générique avec lignes animées
 */
export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse space-y-4 p-6', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-700/50 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

