/**
 * Maître d'Ouvrage — Page racine BMO v1
 * Redirige vers le Dashboard (/maitre-ouvrage/dashboard) pour afficher
 * la synthèse pilotage, KPIs, Vue finance DG, Risques & Phase 4 (DashboardHome).
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function MaitreOuvrageRootPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/maitre-ouvrage' || pathname === '/maitre-ouvrage/') {
      router.replace('/maitre-ouvrage/dashboard');
    }
  }, [pathname, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-slate-400 text-sm">Redirection vers le Dashboard Maître d’ouvrage…</p>
    </div>
  );
}

