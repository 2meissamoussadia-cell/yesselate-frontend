/**
 * LazyLoad Components
 * Composants pour le lazy loading et code splitting
 */

'use client';

import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Skeleton loader générique
 */
export function LoadingSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
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

/**
 * Skeleton pour les cartes
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 animate-pulse"
        >
          <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-3" />
          <div className="h-8 bg-slate-700/50 rounded w-1/2 mb-2" />
          <div className="h-3 bg-slate-700/50 rounded w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour les tableaux
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-slate-700/50 rounded flex-1"
              style={{ width: j === 0 ? '200px' : 'auto' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Wrapper pour lazy loading avec fallback
 */
export function LazyWrapper<T extends ComponentType<any>>({
  component: LazyComponent,
  fallback,
  ...props
}: {
  component: React.LazyExoticComponent<T>;
  fallback?: ReactNode;
} & React.ComponentProps<T>) {
  return (
    <Suspense fallback={fallback || <LoadingSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Crée un composant lazy avec un fallback personnalisé
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyComponentWithFallback(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LoadingSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

