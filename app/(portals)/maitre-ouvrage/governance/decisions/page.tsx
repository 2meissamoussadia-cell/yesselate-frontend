'use client';

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { Placeholder } from '@/components/bmo/metrics';

export default function GovernanceDecisionsPage() {
  return (
    <PageTemplate
      title="Décisions & comités"
      description="Décisions de comité et instances (réunions DG, MOA/MOE)."
    >
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-6 min-h-[200px]">
        <Placeholder>Liste des décisions et comités — à venir</Placeholder>
      </div>
    </PageTemplate>
  );
}
