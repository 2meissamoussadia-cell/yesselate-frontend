/**
 * Page Vue d'ensemble du Calendrier
 * Affiche les panneaux d'alertes, actions rapides, poste de contrôle et la vue principale
 */

'use client';

import React from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { AlertsSummaryPanel } from '../../components/AlertsSummaryPanel';
import { QuickActionsPanel } from '../../components/QuickActionsPanel';
import { ControlStationPanel } from '../../components/ControlStationPanel';
import { GanttChart } from '../../components/GanttChart';
import { CalendarGrid } from '../../components/CalendarGrid';
import { TimelineView } from '../../components/TimelineView';
import { useCalendrierFilters } from '../../hooks/useCalendrierFilters';
import { useCalendrierDataWithDomain } from '../../hooks/useCalendrierDataWithDomain';
import { useCalendrierFiltersStore } from '../../stores/calendrierFiltersStore';

export function CalendrierOverviewPage() {
  const { periode, vue, chantierId, equipeId, dateDebut, dateFin } = useCalendrierFilters();
  // Mémoriser les filtres pour éviter les re-renders infinis
  const filters = React.useMemo(() => ({
    periode,
    vue,
    chantier_id: chantierId || undefined,
    equipe_id: equipeId || undefined,
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
  }), [periode, vue, chantierId, equipeId, dateDebut, dateFin]);
  
  // Utiliser le hook avec domain pour bénéficier des calculs automatiques
  const { 
    data, 
    domainData,
    overview: domainOverview,
    stats: domainStats,
    conflits,
    isLoading: loading, 
    error 
  } = useCalendrierDataWithDomain(filters);

  type DataWithExtras = typeof data & { chantiers?: unknown[]; stats?: Record<string, unknown> };
  const dataExt = data as DataWithExtras | null | undefined;
  const displayData = domainData ? {
    jalons: domainData.jalons,
    evenements: domainData.evenements,
    absences: domainData.absences,
    chantiers: dataExt?.chantiers ?? [],
  } : (dataExt ?? undefined);

  // Mettre à jour les stats dans le store
  React.useEffect(() => {
    if (domainStats || dataExt?.stats) {
      const { setStats } = useCalendrierFiltersStore.getState();
      if (domainStats) {
        setStats({
          jalons_at_risk_count: domainStats.jalons_sla_risque || 0,
          jalons_retard_count: domainStats.jalons_retard || 0,
          jalons_total_count: domainStats.jalons_total || 0,
          retards_detectes_count: domainStats.jalons_retard || 0,
          sur_allocation_ressources_count: domainStats.sur_allocations || 0,
        });
      } else if (dataExt?.stats) {
        setStats(dataExt.stats);
      }
    }
  }, [domainStats, dataExt?.stats]);

  const renderMainView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96 text-slate-400">
          Chargement...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96 text-red-400">
          Erreur: {error.message}
        </div>
      );
    }

    switch (vue) {
      case 'gantt':
        return (
          <GanttChart
            jalons={displayData?.jalons || []}
            evenements={displayData?.evenements || []}
            chantiers={displayData?.chantiers || []}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            jalons={displayData?.jalons || []}
            evenements={displayData?.evenements || []}
            absences={displayData?.absences || []}
          />
        );
      case 'calendrier':
      default:
        return (
          <CalendarGrid
            jalons={displayData?.jalons || []}
            evenements={displayData?.evenements || []}
            absences={displayData?.absences || []}
            periode={periode}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <CalendarHeader />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Panneaux d'information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AlertsSummaryPanel />
            </div>
            <div className="space-y-6">
              <QuickActionsPanel />
              <ControlStationPanel />
            </div>
          </div>

          {/* Vue principale */}
          <div className="mt-6">
            {renderMainView()}
          </div>
        </div>
      </div>
    </div>
  );
}

