'use client';

import { OutlookLikeLoadingSkeleton } from '@/components/ui/OutlookLikeLoadingSkeleton';

export default function CalendrierLoading() {
  return (
    <OutlookLikeLoadingSkeleton
      ariaLabel="Chargement du calendrier"
      variant="simple"
      className="h-[calc(100vh-8rem)]"
    />
  );
}
