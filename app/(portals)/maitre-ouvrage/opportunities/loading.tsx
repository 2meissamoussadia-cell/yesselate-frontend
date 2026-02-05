'use client';

import { OutlookLikeLoadingSkeleton } from '@/components/ui/OutlookLikeLoadingSkeleton';

export default function OpportunitiesLoading() {
  return (
    <OutlookLikeLoadingSkeleton
      ariaLabel="Chargement des opportunités"
      variant="simple"
      className="h-[calc(100vh-8rem)]"
    />
  );
}
