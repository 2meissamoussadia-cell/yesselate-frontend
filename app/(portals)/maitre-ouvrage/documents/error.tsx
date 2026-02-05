'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function DocumentsError({
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
      fallbackMessage="Les documents n’ont pas pu être chargés. Veuillez réessayer."
    />
  );
}
