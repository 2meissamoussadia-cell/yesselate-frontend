'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlanningLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 animate-pulse">
      <div className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 px-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
