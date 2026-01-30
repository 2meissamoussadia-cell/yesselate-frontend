'use client';

/**
 * Fiche chantier — Vue 360° : planning, budget, risques, réserves et documents.
 */

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { SectionHeader, Placeholder } from '@/components/bmo/metrics';

export default function ProjectDetailPage({
  params,
}: {
  params: { chantierId: string };
}) {
  const chantierName = 'Chantier ' + (params?.chantierId ?? '').toUpperCase();

  return (
    <PageTemplate
      title={chantierName}
      description="Vue 360° : planning, budget, risques, réserves et documents."
      actionsSlot={
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-slate-100"
          >
            Ouvrir dans le centre d&apos;alertes
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-slate-100"
          >
            Export dossier
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Bandeau infos clés */}
        <section className="rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 grid gap-3 md:grid-cols-4 text-xs">
          <div>
            <p className="text-slate-400">Programme</p>
            <p className="text-slate-100 font-medium">Programme X</p>
          </div>
          <div>
            <p className="text-slate-400">Entreprise</p>
            <p className="text-slate-100 font-medium">Entreprise Y</p>
          </div>
          <div>
            <p className="text-slate-400">Budget</p>
            <p className="text-slate-100 font-medium">320 M F CFA</p>
          </div>
          <div>
            <p className="text-slate-400">Statut</p>
            <p className="text-amber-400 font-medium">En cours - risque modéré</p>
          </div>
        </section>

        {/* Grille principale */}
        <section className="grid gap-4 xl:grid-cols-3">
          {/* Colonne principale */}
          <div className="xl:col-span-2 space-y-4">
            <div className="space-y-3">
              <SectionHeader
                title="Planning & jalons"
                description="Vue synthétique des jalons critiques et du chemin critique."
              />
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 h-[280px]">
                <Placeholder>Mini Gantt / timeline des jalons</Placeholder>
              </div>
            </div>

            <div className="space-y-3">
              <SectionHeader
                title="Dérives coûts & délais"
                description="Écarts principaux sur ce chantier."
              />
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-0">
                <Placeholder>Tableau synthèse coûts / délais / risques</Placeholder>
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-4">
            <div className="space-y-3">
              <SectionHeader
                title="Alertes en cours"
                description="Incidents non résolus sur ce chantier."
              />
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 h-[200px]">
                <Placeholder>Liste des alertes du chantier</Placeholder>
              </div>
            </div>

            <div className="space-y-3">
              <SectionHeader
                title="Réserves & qualité"
                description="Réserves ouvertes et taux de levée."
              />
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 h-[200px]">
                <Placeholder>Stats réserves + lien vers module Qualité</Placeholder>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
