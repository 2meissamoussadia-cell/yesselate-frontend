/**
 * Redirection /maitre-ouvrage/dashboard/performance/retards → module Centre d'alertes > Projets > Retards (redistribution).
 */

import { redirect } from 'next/navigation';

export default function DashboardPerformanceRetardsPage() {
  redirect('/maitre-ouvrage/alerts/projets/retards');
}
