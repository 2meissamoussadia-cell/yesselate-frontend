'use client';

/**
 * Cockpit DG fusionné dans le Dashboard.
 * KPIs → redirection vers Dashboard > Finance > Budget.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CockpitKpisRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maitre-ouvrage/dashboard/r/finance/budget/default');
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center bg-slate-950">
      <p className="text-slate-400 text-sm">Redirection vers KPIs (Budget)…</p>
    </div>
  );
}
