/**
 * Vue de Module avec Logique d'Affichage
 * Affiche un module avec ses tableaux, cartes, timeline, indicateurs
 */

'use client';

import React, { useState } from 'react';
import { useDisplayLogic } from '../hooks/useDisplayLogic';
import { useAnalyticsBTPNavigationStore } from '@/lib/stores/analyticsBTPNavigationStore';
import { findDomain, findModule } from '@/lib/config/analyticsBTPArchitecture';
import { BTPDataTable } from './BTPDataTable';
import { BTPAnalysisCard } from './BTPAnalysisCard';
import { BTPVisualization } from './BTPVisualization';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { BTPElementDetailView } from './BTPElementDetailView';
import { Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalyticsData } from '@/lib/hooks/useAnalyticsData';
import { getMockDataForDomain } from '@/lib/mocks/analyticsMockData';

interface BTPModuleViewProps {
  domainId: string;
  moduleId: string;
}

export function BTPModuleView({ domainId, moduleId }: BTPModuleViewProps) {
  const { displayLogic, kpis, alerts, actions } = useDisplayLogic();
  const { navigateToSubModule } = useAnalyticsBTPNavigationStore();
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ id: string; type: string } | null>(null);
  
  const domain = findDomain(domainId);
  const mod = findModule(domainId, moduleId);

  if (!domain || !mod) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Module introuvable</p>
      </div>
    );
  }

  // Charger les données du module
  const moduleDataSource = displayLogic?.dataSources.find((ds) => ds.id.includes('list')) || {
    id: 'list',
    endpoint: `/api/analytics/modules/${moduleId}/data`,
    cache: { ttl: 60000, key: `${moduleId}-list` },
  };

  const { data: moduleData } = useAnalyticsData({
    dataSource: moduleDataSource,
    enabled: !!displayLogic,
  });

  // Données mockées en fallback
  const mockData = React.useMemo(() => {
    const domainMock = getMockDataForDomain(domainId);
    return domainMock?.list || [
      { id: '1', nom: 'Élément 1', statut: 'Actif', valeur: 100 },
      { id: '2', nom: 'Élément 2', statut: 'En cours', valeur: 200 },
    ];
  }, [domainId]);

  const finalData = (moduleData as any)?.data || mockData;

  return (
    <div className="h-full p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>{domain.label}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-300">{mod.label}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-200 mb-2">{mod.label}</h2>
          {mod.description && (
            <p className="text-slate-400 text-sm">{mod.description}</p>
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

      {/* KPIs du Module */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <BTPAnalysisCard
              key={kpi.id}
              title={kpi.label}
              value={0} // À remplacer par les données réelles
              trend={{ value: 5, label: 'vs mois dernier', isPositive: true }}
            />
          ))}
        </div>
      )}

      {/* Tableaux */}
      {displayLogic?.tables && displayLogic.tables.length > 0 && (
        <div className="space-y-4">
          {displayLogic.tables.map((table) => (
            <BTPDataTable
              key={table.id}
              data={finalData}
              columns={table.columns as any}
              searchable={true}
              onRowClick={(row) => {
                // Déterminer le type d'élément selon le module
                const elementType = moduleId.includes('chantier') ? 'chantier' :
                                  moduleId.includes('facture') ? 'facture' :
                                  moduleId.includes('ressource') ? 'ressource' : 'chantier';
                setSelectedElement({ id: row.id, type: elementType });
              }}
            />
          ))}
        </div>
      )}

      {/* Cartes d'Éléments */}
      {displayLogic?.cards && displayLogic.cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {finalData.slice(0, 6).map((item: any) => (
            <div
              key={item.id}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-300">{item.nom}</h3>
                <Badge variant="default" className="text-xs">
                  {item.statut}
                </Badge>
              </div>
              <div className="text-2xl font-semibold text-slate-200 mb-1">
                {item.valeur}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const elementType = moduleId.includes('chantier') ? 'chantier' :
                                      moduleId.includes('facture') ? 'facture' :
                                      moduleId.includes('ressource') ? 'ressource' : 'chantier';
                    setSelectedElement({ id: item.id, type: elementType });
                  }}
                >
                  Voir détail
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  Analyser
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-300">Timeline</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-300">Événement {i}</p>
                <p className="text-xs text-slate-400">Il y a {i} jour(s)</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visualisations */}
      {displayLogic?.visualizations && displayLogic.visualizations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayLogic.visualizations.map((viz) => {
            const mockVizData = mockData?.[viz.dataSource as keyof typeof mockData] || [];
            return (
              <div
                key={viz.id}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
              >
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  {viz.dataSource.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>
                <BTPVisualization
                  visualization={viz}
                  data={Array.isArray(mockVizData) ? mockVizData : []}
                  height={250}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Sous-Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mod.subModules.map((subMod) => (
          <div
            key={subMod.id}
            onClick={() => navigateToSubModule(domainId, moduleId, subMod.id)}
            className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <h3 className="text-sm font-medium text-slate-300 mb-1">{subMod.label}</h3>
            {subMod.description && (
              <p className="text-xs text-slate-400 line-clamp-2">{subMod.description}</p>
            )}
          </div>
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

      {/* Vue Détail Élément */}
      {selectedElement && (
        <BTPIntelligentModal
          isOpen={!!selectedElement}
          onClose={() => setSelectedElement(null)}
          title={`Détail ${selectedElement.type}`}
          description="Vue détaillée de l'élément"
          size="xl"
        >
          <BTPElementDetailView
            elementId={selectedElement.id}
            elementType={selectedElement.type as any}
            onClose={() => setSelectedElement(null)}
            onNavigateToRelated={(type, id) => {
              setSelectedElement({ id, type });
            }}
          />
        </BTPIntelligentModal>
      )}
    </div>
  );
}

