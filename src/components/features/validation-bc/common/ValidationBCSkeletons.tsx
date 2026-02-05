/**
 * Skeleton loaders pour Validation-BC
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export function ValidationBCKPIBarSkeleton() {
  return (
    <div className="bg-slate-900/40 border-b border-slate-700/40 animate-pulse">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50">
        <div className="h-3 w-48 bg-slate-700 rounded" />
        <div className="flex gap-1">
          <div className="h-6 w-6 bg-slate-700 rounded" />
          <div className="h-6 w-6 bg-slate-700 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-px bg-slate-800/30 p-px">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-slate-900/60 px-3 py-2 space-y-2">
            <div className="h-3 w-20 bg-slate-700 rounded" />
            <div className="h-6 w-12 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ValidationBCDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/40">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-700 rounded" />
              <div className="h-8 w-16 bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/40">
            <div className="space-y-4">
              <div className="h-5 w-32 bg-slate-700 rounded" />
              <div className="h-64 bg-slate-800/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ValidationBCListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-4 bg-slate-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
              <div className="h-4 bg-slate-700 rounded w-20" />
              <div className="h-4 bg-slate-700 rounded w-24" />
              <div className="h-4 bg-slate-700 rounded w-16" />
              <div className="h-8 w-8 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center px-2">
        <div className="h-4 w-32 bg-slate-700 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-700 rounded" />
          <div className="h-4 w-16 bg-slate-700 rounded" />
          <div className="h-8 w-24 bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ValidationBCCardSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/40 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-700 rounded" />
          <div className="h-8 w-8 bg-slate-700 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-800 rounded" />
          <div className="h-4 w-3/4 bg-slate-800 rounded" />
          <div className="h-4 w-5/6 bg-slate-800 rounded" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-9 w-24 bg-slate-700 rounded" />
          <div className="h-9 w-24 bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ValidationBCTimelineSkeleton({ events = 5 }: { events?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(events)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-slate-700" />
            {i < events - 1 && <div className="flex-1 w-0.5 bg-slate-700 my-2" />}
          </div>
          <div className="flex-1 pb-8">
            <div className="space-y-2">
              <div className="h-4 w-48 bg-slate-700 rounded" />
              <div className="h-3 w-32 bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

