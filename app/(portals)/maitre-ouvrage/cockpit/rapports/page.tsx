'use client';

/**
 * Cockpit DG fusionné dans le Dashboard.
 * Rapports → redirection vers Dashboard > Pilotage > Analytics.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CockpitRapportsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maitre-ouvrage/dashboard/r/pilotage/analytics/default');
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center bg-slate-950">
      <p className="text-slate-400 text-sm">Redirection vers Analytics & rapports…</p>
    </div>
  );
}
