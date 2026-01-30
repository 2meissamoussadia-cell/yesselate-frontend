'use client';

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { SectionHeader, Placeholder } from '@/components/bmo/metrics';

export default function EngagementsPaiementsPage() {
  return (
    <PageTemplate
      title="Paiements"
      description="Paiements planifiés et réalisés."
    >
      <div className="space-y-6">
        <SectionHeader
          title="Paiements"
          description="Sorties de trésorerie prévues vs réalisées."
        />
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 min-h-[280px]">
          <Placeholder>Tableau des paiements (date, bénéficiaire, montant, statut)</Placeholder>
        </div>
      </div>
    </PageTemplate>
  );
}
