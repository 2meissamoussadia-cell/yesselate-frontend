'use client';

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { Placeholder } from '@/components/bmo/metrics';

export default function ChantiersCartePage() {
  return (
    <PageTemplate
      title="Carte"
      description="Carte géographique des chantiers."
    >
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-6 min-h-[300px]">
        <Placeholder>Carte des chantiers — à venir</Placeholder>
      </div>
    </PageTemplate>
  );
}
