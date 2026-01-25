/**
 * Page Synthèse
 */

'use client';

import React from 'react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardPanel,
} from '../shared';

export function SummaryPage() {
  return (
    <DashboardPageLayout maxWidth="xl" padding="md">
      <div className="min-w-0">
        <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl mb-2">
          Synthèse
        </h1>
        <p className="text-slate-400 text-sm">
          Résumé des indicateurs clés
        </p>
      </div>
      
      <DashboardSection title="Synthèse">
        <DashboardPanel padding="md">
          <p className="text-slate-300 text-sm">Contenu Synthèse à implémenter</p>
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
}

