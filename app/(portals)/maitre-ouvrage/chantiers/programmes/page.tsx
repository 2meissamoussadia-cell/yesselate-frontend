'use client';

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { Placeholder } from '@/components/bmo/metrics';

export default function ProgramsPage() {
  return (
    <PageTemplate
      title="Programmes"
      description="Vue des programmes de chantiers (groupes, portefeuilles)."
    >
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-6 min-h-[200px]">
        <Placeholder>Liste des programmes — à venir</Placeholder>
      </div>
    </PageTemplate>
  );
}
