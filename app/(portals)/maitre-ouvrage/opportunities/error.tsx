'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function OpportunitiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SegmentErrorView
      error={error}
      reset={reset}
      fallbackMessage="Les opportunités n’ont pas pu être chargées. Veuillez réessayer."
    />
  );
}
