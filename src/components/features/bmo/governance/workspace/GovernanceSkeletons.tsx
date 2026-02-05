/**
 * Skeletons de chargement pour le workspace Gouvernance
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';

export function GovernanceDashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome Card Skeleton */}
      <Card className="border-white/10 bg-slate-900/50">
        <CardContent className="p-6 space-y-4">
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
      
      {/* Counters Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-white/10 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="h-4 w-4 bg-white/10 rounded mb-2 animate-pulse" />
              <div className="h-8 w-16 bg-white/10 rounded mb-1 animate-pulse" />
              <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Actions Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-white/10 bg-slate-900/50">
            <CardContent className="p-6 space-y-3">
              <div className="h-12 w-12 bg-white/10 rounded-full mx-auto animate-pulse" />
              <div className="h-5 w-32 bg-white/10 rounded mx-auto animate-pulse" />
              <div className="h-3 w-24 bg-white/10 rounded mx-auto animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function GovernanceListSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
      </div>
      
      {/* Filters Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-10 flex-1 bg-white/10 rounded animate-pulse" />
        <div className="h-10 w-20 bg-white/10 rounded animate-pulse" />
        <div className="h-10 w-20 bg-white/10 rounded animate-pulse" />
      </div>
      
      {/* List Items Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-white/10 bg-slate-900/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-64 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-5 bg-white/10 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function GovernanceDetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-10 w-96 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
          <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <Card className="border-white/10 bg-slate-900/50">
        <CardContent className="p-6 space-y-4">
          <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 space-y-2">
                <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white/10 rounded animate-pulse', className)} />
  );
}

