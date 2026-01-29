'use client';

import dynamic from 'next/dynamic';
import { LoadingSkeleton } from './LoadingSkeleton';
import type { LiveChantier3DProps } from './LiveChantier3D';

const LiveChantier3D = dynamic(
  () => import('./LiveChantier3D').then((m) => ({ default: m.LiveChantier3D })),
  {
    ssr: false,
    loading: () => <LoadingSkeleton className="h-[400px]" />,
  }
);

export function LiveChantier3DDynamic(props: LiveChantier3DProps) {
  return <LiveChantier3D {...props} />;
}
