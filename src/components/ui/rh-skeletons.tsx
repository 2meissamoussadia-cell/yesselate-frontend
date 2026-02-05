/**
 * Professional Skeleton Loaders for Demandes RH
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
// DEMANDE CARD SKELETON
// ============================================

export function DemandeCardSkeleton() {
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

      {/* Agent Info */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-8 w-8" variant="circle" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" variant="rounded" />
          <Skeleton className="h-3 w-24" variant="rounded" />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" variant="circle" />
          <Skeleton className="h-4 w-40" variant="rounded" />
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
// DEMANDE LIST SKELETON
// ============================================

export function DemandeListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <DemandeCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// DEMANDE STATS SKELETON
// ============================================

export function DemandeStatsSkeleton() {
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
// DEMANDE DETAIL SKELETON
// ============================================

export function DemandeDetailSkeleton() {
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

      {/* Agent Info */}
      <div className="flex items-center gap-4 p-4 border border-white/10 rounded-lg">
        <Skeleton className="h-16 w-16" variant="circle" />
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-2" variant="rounded" />
          <Skeleton className="h-4 w-32 mb-1" variant="rounded" />
          <Skeleton className="h-4 w-40" variant="rounded" />
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
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-24" variant="rounded" />
                    <Skeleton className="h-5 w-20" variant="rounded" />
                  </div>
                  <Skeleton className="h-3 w-full" variant="rounded" />
                </div>
              ))}
            </div>
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
// VALIDATION FLOW SKELETON
// ============================================

export function ValidationFlowSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {/* Step indicator */}
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-8 mb-2" variant="circle" />
            {i < 2 && <Skeleton className="h-12 w-0.5" />}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-40" variant="rounded" />
              <Skeleton className="h-6 w-24" variant="rounded" />
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
// DEMANDE DASHBOARD SKELETON
// ============================================

export function DemandeDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <DemandeStatsSkeleton />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" variant="rounded" />
        ))}
      </div>

      {/* Recent Demands */}
      <div className="border border-white/10 rounded-lg p-6">
        <Skeleton className="h-6 w-48 mb-4" variant="rounded" />
        <DemandeListSkeleton count={3} />
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

