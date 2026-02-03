/**
 * Redirection /maitre-ouvrage/dashboard/performances → dashboard avec section Performance
 * Le dashboard utilise une seule page avec query params (?main=performance&sub=...&leaf=...).
 */

import { redirect } from 'next/navigation';

export default function DashboardPerformancesPage() {
  redirect('/maitre-ouvrage/dashboard/r/performance/indicators/synthese');
}
