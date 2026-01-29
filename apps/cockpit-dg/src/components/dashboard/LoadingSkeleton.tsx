'use client';

import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-[300px] w-full items-center justify-center rounded-lg bg-muted/30 animate-pulse',
        className
      )}
      aria-busy="true"
      aria-label="Chargement scène 3D"
    >
      <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}
