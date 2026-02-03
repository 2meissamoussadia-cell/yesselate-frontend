/**
 * Page Calendrier & Planification v3.0 - Page racine
 * Redirige vers la vue d'ensemble par défaut
 */

'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const CalendrierOverviewPage = dynamic(
  () => import('@/modules/calendrier/pages/overview/CalendrierOverviewPage').then((m) => ({ default: m.CalendrierOverviewPage })),
  {
    loading: () => (
      <div className="min-h-[400px] p-6 space-y-4" role="status" aria-label="Chargement du calendrier">
        <Skeleton variant="rectangular" className="h-12 w-64 rounded-xl" />
        <Skeleton variant="rectangular" className="h-[350px] w-full rounded-xl" />
      </div>
    ),
  }
);

export default function CalendrierPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est sur la page racine, rediriger vers la vue d'ensemble
    if (pathname === '/maitre-ouvrage/calendrier' || pathname === '/maitre-ouvrage/calendrier/') {
      router.replace('/maitre-ouvrage/calendrier/vue-ensemble');
    }
  }, [pathname, router]);

  // Afficher la vue d'ensemble pendant la redirection
  return <CalendrierOverviewPage />;
}
