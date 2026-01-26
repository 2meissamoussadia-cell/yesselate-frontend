/**
 * Page Tendances Conformité
 * Évolution mensuelle des procédures, contrats et visas
 */

'use client';

import { DashboardPageLayout, DashboardSection } from '../shared';
import { EmptyState } from '../shared/EmptyState';

export function ComplianceTrendsPage({ data }: any) {
  // Pour l'instant, cette page affiche un placeholder
  // Les tendances peuvent être ajoutées plus tard avec une vue dédiée
  return (
    <DashboardPageLayout title="Tendances Conformité" description="Évolution des indicateurs de conformité">
      <DashboardSection>
        <EmptyState
          message="Tendances conformité"
          description="Visualisation des tendances mensuelles à venir"
        />
      </DashboardSection>
    </DashboardPageLayout>
  );
}
