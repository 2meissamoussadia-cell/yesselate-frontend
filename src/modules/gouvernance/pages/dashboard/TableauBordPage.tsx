/**
 * Page Tableau de bord exécutif
 * Vue synthétique avec KPI, tendances et points d'attention
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { KpiPanel } from '../../components/KpiPanel';
import { TendancesChart } from '../../components/TendancesChart';
import { PointsAttentionPanel } from '../../components/PointsAttentionPanel';
import { QuickActionsPanel } from '../../components/QuickActionsPanel';
import { useGouvernanceDataWithDomain } from '../../hooks/useGouvernanceDataWithDomain';
import { useGouvernanceStatsWithDomain } from '../../hooks/useGouvernanceStatsWithDomain';

export default function TableauBordPage() {
  // Utiliser les nouveaux hooks avec domain pour bénéficier des calculs automatiques
  const { 
    data: overviewData, 
    overview: domainOverview,
    isLoading: isLoadingData 
  } = useGouvernanceDataWithDomain('executive-dashboard');
  
  const { 
    stats, 
    domainStats,
    overview: statsOverview,
    isLoading: isLoadingStats 
  } = useGouvernanceStatsWithDomain();

  // Utiliser les données domain si disponibles, sinon fallback sur API
  const displayStats = domainStats || stats;
  const displayOverview = domainOverview || statsOverview;
  
  const pointsAttention = overviewData?.points_attention || [];

  return (
    <div className="h-full w-full bg-slate-950 text-white p-6">
      <GouvernanceHeader
        title="Tableau de bord exécutif"
        subtitle="Vue synthétique des indicateurs stratégiques, alertes critiques et tendances"
        onExport={() => console.log('Export')}
        onRefresh={() => window.location.reload()}
      />

      {/* KPI Panel */}
      <div className="mb-6">
        <KpiPanel />
      </div>

      {/* Layout 2 colonnes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Contenu principal */}
        <section className="lg:col-span-2 space-y-4">
          {/* Tendances */}
          <TendancesChart type="line" />

          {/* Synthèse projets */}
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="mb-4 text-sm font-semibold">Synthèse projets</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <div className="text-xs text-slate-400">Projets actifs</div>
                <div className="mt-1 text-xl font-semibold">
                  {displayStats?.projets_actifs ?? displayOverview?.projets_actifs ?? 0}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <div className="text-xs text-slate-400">Budget consommé</div>
                <div className="mt-1 text-xl font-semibold">
                  {displayStats?.budget_consomme_pourcent ?? displayOverview?.budget_consomme_pourcent ?? 0}%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <PointsAttentionPanel points={pointsAttention} />
          <QuickActionsPanel />
        </aside>
      </div>
    </div>
  );
}

