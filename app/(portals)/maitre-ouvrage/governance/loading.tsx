'use client';

import { OutlookLikeLoadingSkeleton } from '@/components/ui/OutlookLikeLoadingSkeleton';

export default function GovernanceLoading() {
  return (
    <OutlookLikeLoadingSkeleton
      ariaLabel="Chargement de la gouvernance"
      variant="simple"
      className="h-[calc(100vh-8rem)]"
    />
  );
}
