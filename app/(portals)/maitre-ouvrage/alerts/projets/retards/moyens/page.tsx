/**
 * Route: /maitre-ouvrage/alerts/projets/retards/moyens
 * Vue Retards moyens (réutilise la vue dashboard)
 */

'use client';

import { DelaysMoyensPage } from '@/modules/dashboard/components/views/DelaysMoyensPage';

export default function RetardsMoyensPage() {
  return <DelaysMoyensPage />;
}
