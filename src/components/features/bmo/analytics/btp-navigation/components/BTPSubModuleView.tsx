/**
 * Vue de Sous-Module avec Analyses Détaillées
 * Affiche un sous-module avec ses visualisations, analyses, KPIs spécialisés
 */

'use client';

import React from 'react';
import { useDisplayLogic } from '../hooks/useDisplayLogic';
import { useAnalyticsBTPNavigationStore } from '@/lib/stores/analyticsBTPNavigationStore';
import { findDomain, findModule, findSubModule } from '@/lib/config/analyticsBTPArchitecture';
import { BTPVisualization } from './BTPVisualization';
import { BTPKPIWidget } from './BTPKPIWidget';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { AlertTriangle, TrendingDown, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { getMockDataForDomain } from '@/lib/mocks/analyticsMockData';
import { useAnalyticsData } from '@/lib/hooks/useAnalyticsData';

interface BTPSubModuleViewProps {
  domainId: string;
  moduleId: string;
  subModuleId: string;
}

export function BTPSubModuleView({
  domainId,
  moduleId,
  subModuleId,
}: BTPSubModuleViewProps) {
  const { displayLogic, kpis, alerts, actions } = useDisplayLogic();
  const [selectedModal, setSelectedModal] = React.useState<string | null>(null);

  const domain = findDomain(domainId);
  const mod = findModule(domainId, moduleId);
  const subModule = findSubModule(domainId, moduleId, subModuleId);

  if (!domain || !mod || !subModule) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Sous-module introuvable</p>
      </div>
    );
  }

  // Charger les KPIs du sous-module
  const kpisDataSource = {
    id: 'submodule-kpis',
    endpoint: `/api/analytics/submodules/${domainId}/${moduleId}/${subModuleId}/kpis`,
    cache: { ttl: 300000, key: `${domainId}-${moduleId}-${subModuleId}-kpis` },
  };

  const { data: kpisData } = useAnalyticsData({
    dataSource: kpisDataSource,
    enabled: true,
  });

  // Charger les dérives
  const deviationsDataSource = {
    id: 'submodule-deviations',
    endpoint: `/api/analytics/submodules/${domainId}/${moduleId}/${subModuleId}/deviations`,
    cache: { ttl: 60000, key: `${domainId}-${moduleId}-${subModuleId}-deviations` },
  };

  const { data: deviationsData } = useAnalyticsData({
    dataSource: deviationsDataSource,
    enabled: true,
  });

  // Données mockées en fallback
  const mockData = React.useMemo(() => getMockDataForDomain(domainId), [domainId]);
  
  // Utiliser les données API ou fallback
  const kpisWithValues = (kpisData as any)?.kpis || kpis.map((kpi) => ({
    ...kpi,
    value: 0,
    status: 'info' as const,
  }));

  const deviations = (deviationsData as any)?.deviations || [];

  return (
    <div className="h-full p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>{domain.label}</span>
        <ChevronRight className="h-4 w-4" />
        <span>{mod.label}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-300">{subModule.label}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">{subModule.label}</h3>
          {subModule.description && (
            <p className="text-slate-400 text-sm">{subModule.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => {
                if (action.modal) {
                  setSelectedModal(action.modal);
                }
              }}
              className="text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Visualisations Adaptées */}
      {displayLogic?.visualizations && displayLogic.visualizations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayLogic.visualizations.map((viz) => {
            const mockVizData = mockData?.[viz.dataSource as keyof typeof mockData] || [];
            return (
              <div
                key={viz.id}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
              >
                <h4 className="text-sm font-semibold text-slate-300 mb-4">
                  {viz.dataSource.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h4>
                <BTPVisualization
                  visualization={viz}
                  data={Array.isArray(mockVizData) ? mockVizData : []}
                  height={300}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* KPIs Spécialisés */}
      {kpisWithValues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpisWithValues.map((kpi: any) => (
            <BTPKPIWidget
              key={kpi.id}
              label={kpi.label}
              value={typeof kpi.value === 'number' ? kpi.value : 0}
              target={kpi.target}
              unit={kpi.unit}
              status={kpi.status || 'info'}
              description={kpi.label}
            />
          ))}
        </div>
      )}

      {/* Dérives Détectées */}
      {deviations.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-slate-300">Dérives Détectées</h4>
            <Badge variant="default" className="ml-auto">
              {deviations.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {deviations.map((deviation: any) => (
              <div
                key={deviation.id}
                className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={deviation.impact === 'Élevé' ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {deviation.type}
                      </Badge>
                      <span className="text-xs text-slate-400">Impact: {deviation.impact}</span>
                    </div>
                    <p className="text-sm text-slate-300">{deviation.description}</p>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-300">
                      <span className="font-medium text-blue-400">Recommandation:</span>{' '}
                      {deviation.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyses Détaillées */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">Analyses Détaillées</h4>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-2">Analyse des tendances</p>
            <p className="text-sm text-slate-300">
              Analyse approfondie des données avec détection de patterns et identification de
              tendances significatives.
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2">Calculs statistiques</p>
            <p className="text-sm text-slate-300">
              Calculs statistiques avancés incluant moyennes, médianes, écarts-types et corrélations.
            </p>
          </div>
        </div>
      </div>

      {/* Actions Analytiques */}
      <div className="flex items-center gap-2">
        {actions
          .filter((a) => a.type === 'analytical' || a.type === 'simulation' || a.type === 'ia')
          .map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => {
                if (action.modal) {
                  setSelectedModal(action.modal);
                }
              }}
              className="text-xs"
            >
              {action.label}
            </Button>
          ))}
      </div>

      {/* Modales */}
      {selectedModal && (
        <BTPIntelligentModal
          isOpen={!!selectedModal}
          onClose={() => setSelectedModal(null)}
          title="Modal"
          description="Description"
          actions={actions.filter((a) => a.modal === selectedModal).map((a) => ({ label: a.label, onClick: () => {} }))}
        >
          <p className="text-slate-400">Contenu de la modale {selectedModal}</p>
        </BTPIntelligentModal>
      )}
    </div>
  );
}

