/**
 * Page Lots non attribués
 * Vue des lots de marchés publics non attribués
 */

'use client';

import { FileX, Calendar, DollarSign } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel } from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { formatKPICurrency } from '../../utils/kpi';

export function ComplianceLotsPage({ data }: any) {
  // Cette page peut être utilisée pour afficher les lots depuis rm_compliance_overview.lots_non_attribues
  // ou depuis une vue détaillée si nécessaire
  const count = data?.lots_non_attribues ?? 0;

  return (
    <DashboardPageLayout title="Lots non attribués" description="Lots de marchés publics en attente d'attribution">
      <DashboardSection>
        {count === 0 ? (
          <EmptyState message="Aucun lot non attribué" />
        ) : (
          <div className="text-slate-300">
            <p className="text-lg font-semibold">{count} lot{count > 1 ? 's' : ''} non attribué{count > 1 ? 's' : ''}</p>
            <p className="text-sm text-slate-400 mt-2">Détail des lots à venir...</p>
          </div>
        )}
      </DashboardSection>
    </DashboardPageLayout>
  );
}
