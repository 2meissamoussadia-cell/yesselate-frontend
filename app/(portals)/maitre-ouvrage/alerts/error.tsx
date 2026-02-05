'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function AlertsError({
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
      title="Erreur chargement alertes"
      fallbackMessage="Les alertes n’ont pas pu être chargées. Veuillez réessayer."
    />
  );
}
