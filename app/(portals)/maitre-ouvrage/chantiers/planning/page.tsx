'use client';

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { Placeholder } from '@/components/bmo/metrics';

export default function ChantiersPlanningPage() {
  return (
    <PageTemplate
      title="Planning"
      description="Planning global des chantiers (Gantt, jalons)."
    >
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-6 min-h-[300px]">
        <Placeholder>Planning chantiers — à venir</Placeholder>
      </div>
    </PageTemplate>
  );
}
