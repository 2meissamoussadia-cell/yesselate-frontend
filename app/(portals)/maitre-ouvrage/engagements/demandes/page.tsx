'use client';

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { SectionHeader, Placeholder } from '@/components/bmo/metrics';

export default function EngagementsDemandesPage() {
  return (
    <PageTemplate
      title="Demandes"
      description="Demandes de travaux et changements en attente de validation."
    >
      <div className="space-y-6">
        <SectionHeader
          title="Demandes d'engagement"
          description="Liste des demandes triées par montant et urgence."
        />
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 min-h-[280px]">
          <Placeholder>Tableau des demandes (filtres, tri, actions contextuelles)</Placeholder>
        </div>
      </div>
    </PageTemplate>
  );
}
