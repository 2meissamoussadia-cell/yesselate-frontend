/**
 * Professional Skeleton Loaders for Delegations
 * Améliore la perception de performance pendant le chargement
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// BASE SKELETON
// ============================================

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'rounded' | 'circle';
  width?: string | number;
  style?: React.CSSProperties;
}

function Skeleton({ className, variant = 'default', width, style }: SkeletonProps) {
  const computedStyle: React.CSSProperties = { ...style };
  if (width) computedStyle.width = typeof width === 'number' ? `${width}px` : width;
  return (
    <div
      style={Object.keys(computedStyle).length ? computedStyle : undefined}
      className={cn(
        'animate-pulse bg-white/5',
        variant === 'rounded' && 'rounded-lg',
        variant === 'circle' && 'rounded-full',
        variant === 'default' && 'rounded',
        className
      )}
    />
  );
}

// ============================================
// DELEGATION CARD SKELETON
// ============================================

export function DelegationCardSkeleton() {
  return (
    <div className="p-4 border border-white/10 rounded-lg bg-gradient-to-br from-white/[0.03] to-transparent">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" variant="rounded" />
          <Skeleton className="h-4 w-48" variant="rounded" />
        </div>
        <Skeleton className="h-6 w-20" variant="rounded" />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" variant="circle" />
          <Skeleton className="h-4 w-40" variant="rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" variant="circle" />
          <Skeleton className="h-4 w-32" variant="rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" variant="circle" />
          <Skeleton className="h-4 w-36" variant="rounded" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" variant="rounded" />
          <Skeleton className="h-8 w-20" variant="rounded" />
        </div>
        <Skeleton className="h-8 w-8" variant="rounded" />
      </div>
    </div>
  );
}

// ============================================
// DELEGATION LIST SKELETON
// ============================================

export function DelegationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <DelegationCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// DELEGATION STATS SKELETON
// ============================================

export function DelegationStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 border border-white/10 rounded-lg bg-gradient-to-br from-white/[0.03] to-transparent"
        >
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24" variant="rounded" />
            <Skeleton className="h-5 w-5" variant="circle" />
          </div>
          <Skeleton className="h-8 w-16 mb-1" variant="rounded" />
          <Skeleton className="h-3 w-32" variant="rounded" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// DELEGATION DETAIL SKELETON
// ============================================

export function DelegationDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" variant="rounded" />
            <Skeleton className="h-5 w-64" variant="rounded" />
          </div>
          <Skeleton className="h-10 w-32" variant="rounded" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" variant="rounded" />
          <Skeleton className="h-6 w-24" variant="rounded" />
          <Skeleton className="h-6 w-28" variant="rounded" />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-32 mb-3" variant="rounded" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" variant="circle" />
                  <Skeleton className="h-4 w-full" variant="rounded" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-5 w-40 mb-3" variant="rounded" />
            <Skeleton className="h-32 w-full" variant="rounded" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-36 mb-3" variant="rounded" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" variant="rounded" />
                  <Skeleton className="h-4 w-20" variant="rounded" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-5 w-28 mb-3" variant="rounded" />
            <Skeleton className="h-48 w-full" variant="rounded" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-white/10">
        <Skeleton className="h-10 w-32" variant="rounded" />
        <Skeleton className="h-10 w-28" variant="rounded" />
        <Skeleton className="h-10 w-24" variant="rounded" />
      </div>
    </div>
  );
}

// ============================================
// DELEGATION TABLE SKELETON
// ============================================

export function DelegationTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-4">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" variant="rounded" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-full" variant="rounded" />
              <Skeleton className="h-4 w-full" variant="rounded" />
              <Skeleton className="h-4 w-full" variant="rounded" />
              <Skeleton className="h-4 w-full" variant="rounded" />
              <Skeleton className="h-6 w-20" variant="rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" variant="rounded" />
                <Skeleton className="h-8 w-8" variant="rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// DELEGATION CHART SKELETON
// ============================================

export function DelegationChartSkeleton() {
  return (
    <div className="border border-white/10 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-transparent">
      <Skeleton className="h-6 w-48 mb-6" variant="rounded" />
      
      {/* Chart bars */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" variant="rounded" />
            <Skeleton 
              className="h-8" 
              variant="default"
              width={`${30 + i * 8}%`}
            />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6 pt-6 border-t border-white/10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3" variant="circle" />
            <Skeleton className="h-3 w-16" variant="rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// DELEGATION TIMELINE SKELETON
// ============================================

export function DelegationTimelineSkeleton({ events = 5 }: { events?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: events }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <Skeleton className="h-3 w-3 mb-2" variant="circle" />
            {i < events - 1 && (
              <Skeleton className="h-16 w-0.5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-48" variant="rounded" />
              <Skeleton className="h-4 w-32" variant="rounded" />
            </div>
            <Skeleton className="h-4 w-full mb-1" variant="rounded" />
            <Skeleton className="h-4 w-3/4" variant="rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// DELEGATION DASHBOARD SKELETON
// ============================================

export function DelegationDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <DelegationStatsSkeleton />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DelegationChartSkeleton />
        <DelegationChartSkeleton />
      </div>

      {/* Recent Activity */}
      <div className="border border-white/10 rounded-lg p-6">
        <Skeleton className="h-6 w-40 mb-4" variant="rounded" />
        <DelegationTimelineSkeleton events={3} />
      </div>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export {
  Skeleton,
};

