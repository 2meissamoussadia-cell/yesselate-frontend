/**
 * Professional Skeleton Loaders for Calendar
 * Améliore la perception de performance pendant le chargement
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';

// ============================================
// BASE SKELETON
// ============================================

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'rounded' | 'circle';
}

function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  return (
    <div
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
// CALENDAR EVENT SKELETON
// ============================================

export function CalendarEventSkeleton() {
  return (
    <div className="p-3 border border-white/10 rounded-lg bg-gradient-to-br from-white/[0.03] to-transparent">
      <div className="flex items-start justify-between mb-2">
        <Skeleton className="h-4 w-32" variant="rounded" />
        <Skeleton className="h-5 w-16" variant="rounded" />
      </div>
      
      <div className="space-y-2 mb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3" variant="circle" />
          <Skeleton className="h-3 w-24" variant="rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3" variant="circle" />
          <Skeleton className="h-3 w-28" variant="rounded" />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" variant="rounded" />
        <Skeleton className="h-6 w-16" variant="rounded" />
      </div>
    </div>
  );
}

// ============================================
// CALENDAR LIST SKELETON
// ============================================

export function CalendarListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CalendarEventSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// CALENDAR GRID SKELETON
// ============================================

export function CalendarGridSkeleton() {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-4">
        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center">
              <Skeleton className="h-4 w-16 mx-auto" variant="rounded" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Days */}
      <div className="grid grid-cols-7 divide-x divide-white/5">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square border-b border-white/5 p-2">
            <Skeleton className="h-6 w-6 mb-2" variant="rounded" />
            <div className="space-y-1">
              <Skeleton className="h-2 w-full" variant="rounded" />
              <Skeleton className="h-2 w-3/4" variant="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CALENDAR STATS SKELETON
// ============================================

export function CalendarStatsSkeleton() {
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
// CALENDAR DETAIL SKELETON
// ============================================

export function CalendarDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" variant="rounded" />
            <Skeleton className="h-5 w-48" variant="rounded" />
          </div>
          <Skeleton className="h-10 w-32" variant="rounded" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" variant="rounded" />
          <Skeleton className="h-6 w-28" variant="rounded" />
          <Skeleton className="h-6 w-20" variant="rounded" />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
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
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div>
            <Skeleton className="h-5 w-40 mb-3" variant="rounded" />
            <Skeleton className="h-32 w-full" variant="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CALENDAR DASHBOARD SKELETON
// ============================================

export function CalendarDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <CalendarStatsSkeleton />

      {/* Calendar Grid */}
      <CalendarGridSkeleton />

      {/* Upcoming Events */}
      <div className="border border-white/10 rounded-lg p-6">
        <Skeleton className="h-6 w-40 mb-4" variant="rounded" />
        <CalendarListSkeleton count={3} />
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
