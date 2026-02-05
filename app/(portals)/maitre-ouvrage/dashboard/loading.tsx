/**
 * État de chargement du segment Dashboard (audit ERP BTP 2026).
 * Affiche un skeleton pendant le chargement de la page.
 */

import { ContentLoadingSkeleton } from '@/modules/dashboard/components/ContentLoadingSkeleton';

export default function DashboardLoading() {
  return (
    <div
      className="p-4 sm:p-6 w-full min-w-0"
      role="status"
      aria-busy="true"
      aria-label="Chargement du dashboard"
    >
      <ContentLoadingSkeleton kpiCount={6} chartCount={2} showTable />
    </div>
  );
}
