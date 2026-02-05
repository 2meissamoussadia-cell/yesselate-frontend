'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function GovernanceError({
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
      fallbackMessage="La gouvernance n’a pas pu être chargée. Veuillez réessayer."
    />
  );
}
