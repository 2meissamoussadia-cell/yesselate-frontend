'use client';

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { SectionHeader, Placeholder } from '@/components/bmo/metrics';

export default function AlertsQualitePage() {
  return (
    <PageTemplate
      title="Qualité / sécurité"
      description="Alertes liées à la qualité et à la sécurité."
    >
      <div className="space-y-6">
        <SectionHeader
          title="Alertes qualité et sécurité"
          description="Incidents qualité, non-conformités, sécurité chantier."
        />
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 min-h-[280px]">
          <Placeholder>Tableau des alertes qualité / sécurité</Placeholder>
        </div>
      </div>
    </PageTemplate>
  );
}
