/**
 * Page Logs Système (Administration)
 * Consultation des logs système
 */

'use client';

import React, { memo } from 'react';
import { ServerCog } from 'lucide-react';
import { DashboardPageLayout, DashboardSection } from '../shared';
import { EmptyState } from '../shared/EmptyState';

export const AdministrationLogsSystemePage = memo(function AdministrationLogsSystemePage() {
  return (
    <DashboardPageLayout>
      <DashboardSection
        title="Logs Système"
        description="Logs techniques et événements système"
      >
        <EmptyState
          title="Logs système"
          description="La consultation des logs système sera disponible ici."
          icon={ServerCog}
          variant="default"
        />
      </DashboardSection>
    </DashboardPageLayout>
  );
});
