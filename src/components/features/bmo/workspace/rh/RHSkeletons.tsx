'use client';

import { cn } from '@/lib/cn';

// ================================
// Skeleton Components
// ================================

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-slate-200 dark:bg-slate-700 rounded animate-pulse', className)} />
  );
}

export function RHDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-64 h-4" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-24 h-10 rounded-xl" />
        </div>
      </div>

      {/* Counters skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4">
            <Skeleton className="w-8 h-8 rounded-lg mb-3" />
            <Skeleton className="w-16 h-8 mb-2" />
            <Skeleton className="w-24 h-4" />
          </div>
        ))}
      </div>

      {/* Direction panel skeleton */}
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4">
              <Skeleton className="w-full h-4 mb-3" />
              <Skeleton className="w-16 h-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Alerts skeleton */}
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-6">
        <Skeleton className="w-40 h-5 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <Skeleton className="w-5 h-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-48 h-4" />
                <Skeleton className="w-full h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RHCountersSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/80">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-12 h-5 rounded-full" />
          </div>
          <Skeleton className="w-16 h-8 mb-2" />
          <Skeleton className="w-24 h-4" />
        </div>
      ))}
    </div>
  );
}

export function RHCardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/80">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-24 h-3" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')} />
        ))}
      </div>
    </div>
  );
}

export function RHTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4 items-center">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RHTimelineSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="w-10 h-10 rounded-full" />
            {i < items - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-2" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-32 h-3" />
            </div>
            <Skeleton className="w-full h-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RHModalSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-64 h-4" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-24 h-10 rounded-xl" />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-48 h-3" />
              </div>
            </div>
            <Skeleton className="w-full h-12 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

