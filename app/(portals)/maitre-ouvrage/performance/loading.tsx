'use client';

import { OutlookLikeLoadingSkeleton } from '@/components/ui/OutlookLikeLoadingSkeleton';

export default function PerformanceLoading() {
  return (
    <OutlookLikeLoadingSkeleton
      ariaLabel="Chargement de la performance"
      variant="simple"
      className="h-[calc(100vh-8rem)]"
    />
  );
}
