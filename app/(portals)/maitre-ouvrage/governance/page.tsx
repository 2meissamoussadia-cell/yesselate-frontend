'use client';

/**
 * Gouvernance & Arbitrage — Synthèse : pipeline des arbitrages DG, KPIs, listes.
 */

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { SectionHeader, Placeholder } from '@/components/bmo/metrics';
import { KPICard } from '@/modules/dashboard/components/shared';
import type { KPICardData } from '@/modules/dashboard/components/shared';
import { ReportExport } from '@/components/reports';
import { CommandBar } from '@/components/bmo/ui/CommandBar';
import type { CommandBarItem } from '@/components/bmo/ui/CommandBar';
import { Filter, Download, RefreshCw, Scale, AlertTriangle } from 'lucide-react';

const governanceCommands: CommandBarItem[] = [
  { id: 'filter', label: 'Filtrer', icon: <Filter className="h-4 w-4" />, primary: true, onClick: () => {} },
  { id: 'export', label: 'Exporter', icon: <Download className="h-4 w-4" />, primary: true, onClick: () => {} },
  { id: 'arbitrage', label: 'Arbitrages à rendre', icon: <Scale className="h-4 w-4" />, primary: false, onClick: () => {} },
  { id: 'attention', label: "Points d'attention", icon: <AlertTriangle className="h-4 w-4" />, primary: false, onClick: () => {} },
  { id: 'refresh', label: 'Rafraîchir', icon: <RefreshCw className="h-4 w-4" />, primary: false, onClick: () => {} },
];

const governanceKpis: KPICardData[] = [
  {
    id: 'arb-pending',
    label: 'Arbitrages en attente',
    value: '17',
    description: 'dont 5 critiques',
    color: 'rose',
  },
  {
    id: 'delai-moyen',
    label: "Délai moyen d'arbitrage",
    value: '4,2 j',
    description: '-1,1 j sur 30 j',
    color: 'emerald',
  },
  {
    id: 'attention',
    label: "Points d'attention ouverts",
    value: '23',
    description: '7 liés aux délais',
    color: 'amber',
  },
  {
    id: 'decisions-30j',
    label: 'Décisions prises 30 j',
    value: '48',
    description: "taux d'application 92 %",
    color: 'blue',
  },
];

export default function GovernanceOverviewPage() {
  return (
    <PageTemplate
      title="Gouvernance & Arbitrage"
      description="Pipeline des arbitrages DG, points d'attention et décisions de comité."
      windowTitle="DG Cockpit – Gouvernance & Arbitrage"
      commandBarSlot={<CommandBar items={governanceCommands} />}
      actionsSlot={<ReportExport onExportExcel={() => {}} onExportPdf={() => {}} />}
    >
      <div className="space-y-6">
        {/* KPIs gouvernance */}
        <section
          aria-label="Indicateurs de gouvernance"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {governanceKpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </section>

        {/* Kanban / pipeline d'arbitrages */}
        <section className="space-y-3">
          <SectionHeader
            title="Pipeline d'arbitrages"
            description="De la demande d'arbitrage à la décision appliquée."
          />
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 h-[320px]">
            <Placeholder>
              Kanban simplifié : À instruire → En comité → Décidé → Appliqué
            </Placeholder>
          </div>
        </section>

        {/* Listes détaillées */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <SectionHeader
              title="Arbitrages critiques à rendre"
              description="Dossiers à fort impact coûts / délais / risques."
            />
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-0">
              <Placeholder>Tableau arbitrages critiques</Placeholder>
            </div>
          </div>

          <div className="space-y-3">
            <SectionHeader
              title="Dernières décisions de comité"
              description="Décisions récentes avec impact sur portefeuille."
            />
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-0">
              <Placeholder>Liste décisions + impact + responsable</Placeholder>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
