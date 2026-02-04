'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export function ValidationBCDashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Live Counters Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1">
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Direction Panel Skeleton */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Analytics Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-8 bg-slate-200 dark:bg-slate-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

