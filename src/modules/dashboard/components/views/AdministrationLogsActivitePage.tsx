/**
 * Page Logs d'Activité (Administration)
 * Consultation des logs d'activité utilisateur
 */

'use client';

import React, { memo } from 'react';
import { Activity } from 'lucide-react';
import { DashboardPageLayout, DashboardSection } from '../shared';
import { EmptyState } from '../shared/EmptyState';

export const AdministrationLogsActivitePage = memo(function AdministrationLogsActivitePage() {
  return (
    <DashboardPageLayout>
      <DashboardSection
        title="Logs d'Activité"
        description="Historique des actions et événements utilisateur"
      >
        <EmptyState
          title="Logs d'activité"
          description="La consultation des logs d'activité sera disponible ici."
          icon={Activity}
          variant="default"
        />
      </DashboardSection>
    </DashboardPageLayout>
  );
});
