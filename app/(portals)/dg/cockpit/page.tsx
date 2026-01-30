/**
 * Route dédiée Cockpit DG — default DG home.
 * Redirige vers le dashboard maître-ouvrage avec l'état pilotage::dashboard::default
 * (équivalent DEFAULT_DG_HOME). Le contenu réel est rendu par /maitre-ouvrage/dashboard.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_DG_HOME } from '@/modules/dashboard/utils/routeValidation';

const DASHBOARD_BASE = '/maitre-ouvrage/dashboard';

export default function DgCockpitPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('main', DEFAULT_DG_HOME.main);
    if (DEFAULT_DG_HOME.sub) params.set('sub', DEFAULT_DG_HOME.sub);
    if (DEFAULT_DG_HOME.leaf) params.set('leaf', DEFAULT_DG_HOME.leaf);
    router.replace(`${DASHBOARD_BASE}?${params.toString()}`);
  }, [router]);

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-emerald-500/60 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Redirection Cockpit DG…</p>
      </div>
    </div>
  );
}
