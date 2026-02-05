'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function PerformanceError({
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
      fallbackMessage="La performance n’a pas pu être chargée. Veuillez réessayer."
    />
  );
}
