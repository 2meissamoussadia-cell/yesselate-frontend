'use client';

import { OutlookLikeLoadingSkeleton } from '@/components/ui/OutlookLikeLoadingSkeleton';

export default function PlanningLoading() {
  return (
    <OutlookLikeLoadingSkeleton
      ariaLabel="Chargement du planning"
      variant="simple"
      className="h-[calc(100vh-8rem)]"
    />
  );
}
