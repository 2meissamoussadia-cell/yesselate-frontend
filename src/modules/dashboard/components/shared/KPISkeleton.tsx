/**
 * Skeleton loader pour les cartes KPI
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export function KPISkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl p-5 border-2 bg-slate-800/40 border-slate-700/40 animate-pulse',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-700/50" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700/50 rounded w-2/3" />
          <div className="h-8 bg-slate-700/50 rounded w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-slate-700/30 rounded w-1/3" />
    </div>
  );
}

export function KPIGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
      {Array.from({ length: count }).map((_, i) => (
        <KPISkeleton key={i} />
      ))}
    </div>
  );
}

