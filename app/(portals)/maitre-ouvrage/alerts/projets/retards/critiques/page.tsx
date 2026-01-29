/**
 * Route: /maitre-ouvrage/alerts/projets/retards/critiques
 * Vue Retards critiques (réutilise la vue dashboard)
 */

'use client';

import { DelaysCritiquesPage } from '@/modules/dashboard/components/views/DelaysCritiquesPage';

export default function RetardsCritiquesPage() {
  return <DelaysCritiquesPage />;
}
