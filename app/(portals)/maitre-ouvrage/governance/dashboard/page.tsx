/**
 * Route: /maitre-ouvrage/governance/dashboard
 * Redirection vers le dashboard unique (Command Center) avec la vue Gouvernance.
 * Un seul dashboard : /maitre-ouvrage/dashboard
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DASHBOARD_GOUVERNANCE_URL = '/maitre-ouvrage/dashboard?main=pilotage&sub=gouvernance';

export default function GovernanceDashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(DASHBOARD_GOUVERNANCE_URL);
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center bg-slate-950 text-slate-400 text-sm">
      Redirection vers le tableau de bord…
    </div>
  );
}
