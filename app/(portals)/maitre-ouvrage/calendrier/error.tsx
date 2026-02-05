'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function CalendrierError({
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
      fallbackMessage="Le calendrier n’a pas pu être chargé. Veuillez réessayer."
    />
  );
}
