/**
 * Vue de Domaine avec Logique d'Affichage Complète
 * Implémente toutes les logiques d'affichage définies pour un domaine
 */

'use client';

import React, { useState } from 'react';
import { useDisplayLogic } from '../hooks/useDisplayLogic';
import { BTPAnalysisCard } from './BTPAnalysisCard';
import { BTPKPIWidget } from './BTPKPIWidget';
import { BTPDataTable } from './BTPDataTable';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { BTPContextualPopover } from './BTPContextualPopover';
import { BTPKPIModal } from './BTPKPIModal';
import { BTPAlertModal } from './BTPAlertModal';
import { BTPVisualization } from './BTPVisualization';
import { BTPFilterPanel } from './BTPFilterPanel';
import { BTPNotificationSystem } from './BTPNotificationSystem';
import { BTPAdvancedSearch } from './BTPAdvancedSearch';
import { BTPComparisonView } from './BTPComparisonView';
import { BTPSimulationModal } from './BTPSimulationModal';
import { BTPExportModal } from './BTPExportModal';
import { Info, TrendingUp, AlertTriangle, GitCompare, Calculator, Download } from 'lucide-react';
import { useFilters } from '../hooks/useFilters';
import { useKeyboardShortcuts, getAnalyticsShortcuts } from '../hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { findDomain } from '@/lib/config/analyticsBTPArchitecture';
import { useAnalyticsBTPNavigationStore } from '@/lib/stores/analyticsBTPNavigationStore';
import { useBTPViewStore } from '@/lib/stores/btpViewStore';
import { useAnalyticsData } from '@/lib/hooks/useAnalyticsData';
import { useQueryClient } from '@tanstack/react-query';
import { analyticsDataService } from '@/lib/services/analyticsDataService';
import { getMockDataForDomain } from '@/lib/mocks/analyticsMockData';

interface BTPDomainViewProps {
  domainId: string;
}

// Composant séparé pour les visualisations (pour éviter les hooks dans les boucles)
function VisualizationCard({
  visualization,
  domainId,
  data,
}: {
  visualization: any;
  domainId: string;
  data: any[];
}) {
  const vizDataSource = {
    id: visualization.dataSource,
    endpoint: `/api/analytics/domains/${domainId}/${visualization.dataSource}`,
    cache: { ttl: 300000, key: `${domainId}-${visualization.dataSource}` },
  };

  const { data: vizData } = useAnalyticsData({
    dataSource: vizDataSource,
    enabled: true,
  });

  const finalData = vizData || data;

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">
          {visualization.dataSource.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </h3>
        <BTPContextualPopover
          trigger={
            <button className="p-1 rounded hover:bg-slate-700">
              <Info className="h-4 w-4 text-slate-400" />
            </button>
          }
          title="Information"
          content={`Graphique de type ${visualization.type} pour ${visualization.dataSource}`}
        />
      </div>
      <BTPVisualization
        visualization={visualization}
        data={Array.isArray(finalData) ? finalData : []}
        height={250}
      />
    </div>
  );
}

export function BTPDomainView({ domainId }: BTPDomainViewProps) {
  const { displayLogic, kpis, alerts, actions } = useDisplayLogic();
  const { navigateToDomain, navigateToModule } = useAnalyticsBTPNavigationStore();
  const queryClient = useQueryClient();
  const {
    viewMode,
    setViewMode,
    modals,
    openModal,
    closeModal,
    toggleFiltersPanel,
    filtersPanelOpen,
  } = useBTPViewStore();
  const [selectedKPI, setSelectedKPI] = React.useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = React.useState<string | null>(null);
  const domain = findDomain(domainId);

  // Utiliser les modales du store
  const isComparisonOpen = modals.comparison;
  const isSimulationOpen = modals.simulation;
  const isExportOpen = modals.export;
  const showSearch = modals.search;

  // Gestion des filtres
  const { filters: activeFilters, clearFilters } = useFilters({
    onFiltersChange: (filters) => {
      // Invalider les queries avec les nouveaux filtres
      queryClient.invalidateQueries({
        queryKey: ['analytics', domainId],
      });
      // Les données seront automatiquement rechargées via useAnalyticsData
    },
  });

  // Raccourcis clavier
  useKeyboardShortcuts({
    shortcuts: getAnalyticsShortcuts({
      openSearch: () => {
        openModal('search');
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
          searchInput?.focus();
        }, 100);
      },
      setViewMode: (mode: 'grid' | 'dashboard' | 'comparative') => setViewMode(mode),
      openExport: () => openModal('export'),
      toggleFilters: () => toggleFiltersPanel(),
    }),
  });

  // Charger les données du domaine
  const summaryDataSource = displayLogic?.dataSources.find((ds) => ds.id.includes('summary')) || {
    id: 'summary',
    endpoint: `/api/analytics/domains/${domainId}/summary`,
    cache: { ttl: 300000, key: `${domainId}-summary` },
  };

  const { data: summaryData, isLoading: isLoadingSummary } = useAnalyticsData({
    dataSource: summaryDataSource,
    enabled: !!displayLogic,
  });

  // Données mockées en fallback
  const mockData = React.useMemo(() => getMockDataForDomain(domainId), [domainId]);
  const finalSummaryData = summaryData || mockData?.summary || {};

  if (!displayLogic || !domain) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-400">Configuration d'affichage non trouvée pour ce domaine</p>
        </div>
      </div>
    );
  }

  const DomainIcon = domain.icon;

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <DomainIcon className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-semibold text-slate-200">{displayLogic.header.title}</h1>
          </div>
          {displayLogic.header.description && (
            <p className="text-slate-400 text-sm mb-4">{displayLogic.header.description}</p>
          )}
          {displayLogic.header.badges && displayLogic.header.badges.length > 0 && (
            <div className="flex items-center gap-2">
              {displayLogic.header.badges.map((badge, idx) => (
                <Badge key={idx} variant="default" className="text-xs">
                  {badge.label}: {badge.value === 'dynamic' ? '...' : badge.value}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action) => {
            // Actions spéciales
            if (action.id === 'analyse-comparative' || action.type === 'comparison') {
              return (
                <Button
                  key={action.id}
                  variant="default"
                  size="sm"
                  onClick={() => openModal('comparison')}
                  className="text-xs"
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              );
            }
            if (action.id === 'simulation' || action.type === 'simulation') {
              return (
                <Button
                  key={action.id}
                  variant="default"
                  size="sm"
                  onClick={() => openModal('simulation')}
                  className="text-xs"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              );
            }
            if (action.id === 'export-complet' || action.type === 'reporting') {
              return (
                <Button
                  key={action.id}
                  variant="default"
                  size="sm"
                  onClick={() => openModal('export')}
                  className="text-xs"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              );
            }

            // Actions normales
            return (
              <Button
                key={action.id}
                variant="default"
                size="sm"
                onClick={() => {
                  if (action.modal) {
                    openModal(action.modal);
                  } else if (action.type === 'comparison') {
                    openModal('comparison');
                  } else if (action.type === 'simulation') {
                    openModal('simulation');
                  } else if (action.type === 'reporting' && action.apiEndpoint) {
                    // Appeler l'API de reporting
                    window.open(action.apiEndpoint, '_blank');
                  }
                }}
                className="text-xs"
              >
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recherche Avancée */}
      {showSearch && (
        <div className="mb-4">
          <BTPAdvancedSearch
            onSelect={(result) => {
              closeModal('search');
              
              // Navigation selon le type de résultat
              if (result.type === 'domain' && result.domainId) {
                navigateToDomain(result.domainId);
              } else if (result.type === 'module' && result.domainId && result.moduleId) {
                navigateToModule(result.domainId, result.moduleId);
              } else if (result.type === 'submodule' && result.domainId && result.moduleId && result.subModuleId) {
                // Naviguer vers le sous-module
                navigateToModule(result.domainId, result.moduleId);
                // TODO: Naviguer vers le sous-module spécifique
              } else if (result.type === 'element' && result.domainId && result.moduleId) {
                // Naviguer vers le module et ouvrir le détail de l'élément
                navigateToModule(result.domainId, result.moduleId);
                // TODO: Ouvrir le détail de l'élément
              } else if (result.type === 'kpi' && result.domainId) {
                // Naviguer vers le domaine et ouvrir le KPI
                navigateToDomain(result.domainId);
                setSelectedKPI(result.id);
              } else if (result.type === 'alert' && result.domainId) {
                // Naviguer vers le domaine et ouvrir l'alerte
                navigateToDomain(result.domainId);
                setSelectedAlert(result.id);
              } else if (result.domainId) {
                // Fallback: naviguer vers le domaine
                navigateToDomain(result.domainId);
              }
            }}
            className="w-full"
          />
        </div>
      )}

      {/* Panel de Filtres */}
      {displayLogic.filters && displayLogic.filters.length > 0 && (
        <BTPFilterPanel
          filters={displayLogic.filters}
          onFiltersChange={(filters) => {
            // Les filtres sont gérés par useFilters hook qui invalide automatiquement les queries
            // Pas besoin d'action supplémentaire ici
          }}
          activeFilters={activeFilters}
          className="mb-4"
        />
      )}

      {/* Système de Notifications */}
      <BTPNotificationSystem
        alerts={alerts.map((alert) => ({
          ...alert,
          title: `Alerte ${alert.category}`,
          description: 'Description de l\'alerte...',
          detectedAt: new Date().toISOString(),
        }))}
        onAlertClick={(alertId) => setSelectedAlert(alertId)}
        maxNotifications={5}
        autoDismiss={true}
        autoDismissDelay={5000}
      />

      {/* KPIs Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            onClick={() => {
              if (kpi.clickAction === 'modal') {
                setSelectedKPI(kpi.id);
              }
            }}
            className={kpi.clickAction === 'modal' ? 'cursor-pointer' : ''}
          >
            <BTPKPIWidget
              label={kpi.label}
              value={finalSummaryData?.kpis?.[kpi.id]?.value || 0}
              target={kpi.target || finalSummaryData?.kpis?.[kpi.id]?.target}
              unit={kpi.unit || finalSummaryData?.kpis?.[kpi.id]?.unit}
              status={finalSummaryData?.kpis?.[kpi.id]?.status || 'info'}
              description={`KPI: ${kpi.label}`}
            />
          </div>
        ))}
      </div>

      {/* Alertes Globales */}
      {alerts.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-200">Alertes</h2>
            <Badge variant="default" className="ml-auto">
              {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="space-y-2">
            {(finalSummaryData?.alerts || alerts).slice(0, 5).map((alert: any) => {
            const alertData = typeof alert === 'string' 
              ? alerts.find((a) => a.id === alert)
              : alert;
            
            if (!alertData) return null;
            
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert.id)}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        alertData.type === 'critical'
                          ? 'destructive'
                          : alertData.type === 'warning'
                          ? 'default'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {alertData.type}
                    </Badge>
                    <span className="text-sm font-medium text-slate-300">
                      {alertData.title || `Alerte ${alertData.category}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {alertData.description || 'Description de l\'alerte...'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlert(alertData.id);
                  }}
                >
                  Voir détail
                </Button>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Tendances */}
      {displayLogic.visualizations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayLogic.visualizations.map((viz) => {
            // Données mockées en fallback (pas de hook dans la boucle)
            const mockVizData = mockData?.[viz.dataSource as keyof typeof mockData] || [];
            const finalVizData = Array.isArray(mockVizData) ? mockVizData : [];

            return (
              <VisualizationCard
                key={viz.id}
                visualization={viz}
                domainId={domainId}
                data={finalVizData}
              />
            );
          })}
        </div>
      )}

      {/* Modules Internes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domain.modules.map((module) => (
          <div
            key={module.id}
            onClick={() => navigateToModule(domainId, module.id)}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer group"
          >
            <h3 className="text-sm font-medium text-slate-300 mb-2 group-hover:text-blue-400 transition-colors">
              {module.label}
            </h3>
            {module.description && (
              <p className="text-slate-400 text-xs mb-3 line-clamp-2">{module.description}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {module.subModules.length} sous-module{module.subModules.length > 1 ? 's' : ''}
              </div>
              <TrendingUp className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Tableaux */}
      {displayLogic.tables && displayLogic.tables.length > 0 && (
        <div className="space-y-4">
          {displayLogic.tables.map((table) => (
            <BTPDataTable
              key={table.id}
              data={[]} // À remplacer par les données réelles
              columns={table.columns.map((col) => ({
                key: col.key,
                label: col.label,
                sortable: col.sortable,
                // render est ignoré car c'est une string dans la config, pas une fonction
              }))}
              searchable={true}
            />
          ))}
        </div>
      )}

      {/* Les modales sont maintenant gérées par le store useBTPViewStore */}

      {/* Modale KPI */}
      {selectedKPI && (
        <BTPKPIModal
          isOpen={!!selectedKPI}
          onClose={() => setSelectedKPI(null)}
          kpi={kpis.find((k) => k.id === selectedKPI)!}
          currentValue={finalSummaryData?.kpis?.[selectedKPI]?.value}
          target={kpis.find((k) => k.id === selectedKPI)?.target || finalSummaryData?.kpis?.[selectedKPI]?.target}
        />
      )}

      {/* Modale Alerte */}
      {selectedAlert && (() => {
        const alertConfig = alerts.find((a) => a.id === selectedAlert);
        const alertData = finalSummaryData?.alerts?.find((a: any) => a.id === selectedAlert);
        
        return (
          <BTPAlertModal
            isOpen={!!selectedAlert}
            onClose={() => setSelectedAlert(null)}
            alert={{
              ...alertConfig!,
              id: selectedAlert,
              title: alertData?.title || `Alerte ${alertConfig?.category}`,
              description: alertData?.description || 'Description de l\'alerte...',
              detectedAt: alertData?.detectedAt || new Date().toISOString(),
              impact: alertData?.impact,
              causes: alertData?.causes,
              recommendations: alertData?.recommendations,
            }}
          />
        );
      })()}

      {/* Modale de Comparaison */}
      {isComparisonOpen && (
        <BTPIntelligentModal
          isOpen={isComparisonOpen}
          onClose={() => closeModal('comparison')}
          title="Analyse Comparative"
          description="Comparez plusieurs éléments"
          size="xl"
        >
          <BTPComparisonView
            items={[]}
            onItemsChange={(items) => {
              // Sauvegarder les éléments de comparaison dans le store si nécessaire
              // Pour l'instant, juste gérer localement
            }}
          />
        </BTPIntelligentModal>
      )}

      {/* Modale de Simulation */}
      {isSimulationOpen && (
        <BTPSimulationModal
          isOpen={isSimulationOpen}
          onClose={() => closeModal('simulation')}
          title="Simulation"
          initialParameters={[
            {
              id: 'budget',
              label: 'Budget',
              type: 'number',
              value: 1000000,
              unit: 'FCFA',
              min: 0,
              max: 5000000,
            },
            {
              id: 'delai',
              label: 'Délai',
              type: 'slider',
              value: 30,
              unit: 'jours',
              min: 0,
              max: 365,
            },
          ]}
          onSimulate={async (parameters) => {
            // L'API sera appelée automatiquement dans BTPSimulationModal
            // Cette fonction n'est utilisée que si onSimulate est fourni
            // Sinon, BTPSimulationModal utilisera l'API directement
            return {};
          }}
        />
      )}

      {/* Modale d'Export */}
      {isExportOpen && (
        <BTPExportModal
          isOpen={isExportOpen}
          onClose={() => closeModal('export')}
          data={finalSummaryData}
          filename={`analytics-${domainId}-${new Date().toISOString().split('T')[0]}`}
          title="Exporter les données"
        />
      )}
    </div>
  );
}


