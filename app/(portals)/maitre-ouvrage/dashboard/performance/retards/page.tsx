/**
 * Redirection /maitre-ouvrage/dashboard/performance/retards → dashboard avec section Performance > Retards
 * Le dashboard utilise une seule page avec query params (?main=performance&sub=delays&leaf=...).
 */

import { redirect } from 'next/navigation';

export default function DashboardPerformanceRetardsPage() {
  redirect('/maitre-ouvrage/dashboard?main=performance&sub=delays&leaf=dashboard');
}
