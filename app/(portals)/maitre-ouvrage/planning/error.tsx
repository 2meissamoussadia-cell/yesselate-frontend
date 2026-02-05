'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function PlanningError({
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
      title="Erreur chargement planning"
      fallbackMessage="Le planning n’a pas pu être chargé. Veuillez réessayer."
    />
  );
}
