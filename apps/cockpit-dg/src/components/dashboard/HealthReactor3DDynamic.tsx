'use client';

import dynamic from 'next/dynamic';
import { LoadingSkeleton } from './LoadingSkeleton';
import type { HealthReactor3DProps } from './HealthReactor3D';

const HealthReactor3D = dynamic(
  () => import('./HealthReactor3D').then((m) => ({ default: m.HealthReactor3D })),
  {
    ssr: false,
    loading: () => <LoadingSkeleton className="h-[400px]" />,
  }
);

export function HealthReactor3DDynamic(props: HealthReactor3DProps) {
  return <HealthReactor3D {...props} />;
}
