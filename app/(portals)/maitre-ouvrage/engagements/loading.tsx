'use client';

import { OutlookLikeLoadingSkeleton } from '@/components/ui/OutlookLikeLoadingSkeleton';

export default function EngagementsLoading() {
  return (
    <OutlookLikeLoadingSkeleton
      ariaLabel="Chargement des engagements"
      variant="simple"
      className="h-[calc(100vh-8rem)]"
    />
  );
}
