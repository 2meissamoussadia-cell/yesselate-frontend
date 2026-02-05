'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function EngagementsError({
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
      fallbackMessage="Les engagements n’ont pas pu être chargés. Veuillez réessayer."
    />
  );
}
