'use client';

/**
 * Cockpit DG fusionné dans le Dashboard.
 * Redirection canonique : /maitre-ouvrage/dashboard (vue pilote unique).
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CockpitRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maitre-ouvrage/dashboard/r/pilotage/dashboard/default');
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center bg-slate-950">
      <p className="text-slate-400 text-sm">Redirection vers le Dashboard…</p>
    </div>
  );
}
