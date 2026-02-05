'use client';

import { cn } from '@/lib/cn';

/**
 * Skeleton Loaders pour les alertes
 * ==================================
 */

export function AlertCardSkeleton() {
  return (
    <div className="p-4 border-b border-slate-200/70 dark:border-slate-800 animate-pulse">
      <div className="flex items-start gap-3">
        {/* Icon skeleton */}
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertInboxSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
      {/* Header skeleton */}
      <div className="p-4 border-b border-slate-200/70 dark:border-slate-800 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-32" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
        
        {/* Search bar skeleton */}
        <div className="h-11 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      </div>
      
      {/* List skeleton */}
      <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
        {Array.from({ length: count }).map((_, i) => (
          <AlertCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AlertStatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Score global skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-64" />
          </div>
          <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
      </div>
      
      {/* Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-2" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-1" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertCountersSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12 mb-1" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function AlertDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-4 animate-pulse">
      {/* Main content skeleton */}
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
            </div>
          </div>
        </div>
        
        {/* Info grid */}
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-6">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sidebar skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic skeleton for any card
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 animate-pulse', className)}>
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

