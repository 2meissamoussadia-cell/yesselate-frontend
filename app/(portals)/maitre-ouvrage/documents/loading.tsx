'use client';

import { OutlookLikeLoadingSkeleton } from '@/components/ui/OutlookLikeLoadingSkeleton';

export default function DocumentsLoading() {
  return (
    <OutlookLikeLoadingSkeleton
      ariaLabel="Chargement des documents"
      variant="simple"
      className="h-[calc(100vh-8rem)]"
    />
  );
}
