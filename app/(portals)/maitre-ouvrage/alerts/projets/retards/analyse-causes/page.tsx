/**
 * Route: /maitre-ouvrage/alerts/projets/retards/analyse-causes
 * Vue Analyse des causes de retards (réutilise la vue dashboard)
 */

'use client';

import { DelaysAnalyseCausesPage } from '@/modules/dashboard/components/views/DelaysAnalyseCausesPage';

export default function RetardsAnalyseCausesPage() {
  return <DelaysAnalyseCausesPage />;
}
