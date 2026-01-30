'use client';

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { SectionHeader, Placeholder } from '@/components/bmo/metrics';

export default function EngagementsBcPage() {
  return (
    <PageTemplate
      title="Bons de commande"
      description="Bons de commande en cours de validation ou validés."
    >
      <div className="space-y-6">
        <SectionHeader
          title="Bons de commande"
          description="Pipeline BC en attente, validés, en cours d'exécution."
        />
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 min-h-[280px]">
          <Placeholder>Tableau des bons de commande (statut, montant, fournisseur)</Placeholder>
        </div>
      </div>
    </PageTemplate>
  );
}
