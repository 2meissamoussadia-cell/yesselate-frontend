/**
 * Route dashboard par path (routing moderne #1)
 * URL : /maitre-ouvrage/dashboard/r/{main}/{sub}/{leaf}
 * Ex. /maitre-ouvrage/dashboard/r/pilotage/dashboard/default
 * Même contenu que la page dashboard (query params), le hook useDashboardCommandCenterUrlSync lit le path.
 */

import DashboardPage from '../../page';

export default function DashboardPathPage() {
  return <DashboardPage />;
}
