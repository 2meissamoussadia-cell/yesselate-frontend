'use client';

import { SegmentErrorView } from '@/components/ui/SegmentErrorView';

export default function EtudesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentErrorView error={error} reset={reset} />;
}
