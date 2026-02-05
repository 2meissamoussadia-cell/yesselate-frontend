/**
 * Dashboard Personnalisable
 * Permet aux utilisateurs de créer et personnaliser leur propre dashboard
 */

'use client';

import React, { useState } from 'react';
import { LayoutGrid, Plus, Settings, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BTPKPIWidget } from './BTPKPIWidget';
import { BTPVisualization } from './BTPVisualization';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { cn } from '@/lib/cn';
import type { KPIDefinition, VisualizationDefinition } from '@/lib/config/analyticsDisplayLogic';

interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'alert';
  config: any;
  position: { x: number; y: number; w: number; h: number };
}

interface BTPCustomizableDashboardProps {
  initialWidgets?: DashboardWidget[];
  availableKPIs?: KPIDefinition[];
  availableVisualizations?: VisualizationDefinition[];
  onSave?: (widgets: DashboardWidget[]) => void;
  className?: string;
}

export function BTPCustomizableDashboard({
  initialWidgets = [],
  availableKPIs = [],
  availableVisualizations = [],
  onSave,
  className,
}: BTPCustomizableDashboardProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const addWidget = (type: 'kpi' | 'chart', config: any) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      config,
      position: {
        x: (widgets.length % 4) * 3,
        y: Math.floor(widgets.length / 4) * 3,
        w: type === 'kpi' ? 3 : 6,
        h: type === 'kpi' ? 2 : 4,
      },
    };
    setWidgets([...widgets, newWidget]);
    setIsAddModalOpen(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const handleSave = () => {
    onSave?.(widgets);
    setIsEditMode(false);
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-200">Dashboard Personnalisé</h2>
          <Badge variant="default" className="text-xs">
            {widgets.length} widget{widgets.length > 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button variant="default" size="sm" onClick={() => setIsEditMode(false)} className="text-xs">
                Annuler
              </Button>
              <Button variant="default" size="sm" onClick={handleSave} className="text-xs">
                Sauvegarder
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
              <Button variant="default" size="sm" onClick={() => setIsEditMode(true)} className="text-xs">
                <Settings className="h-4 w-4 mr-2" />
                Personnaliser
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LayoutGrid className="h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Dashboard vide</h3>
            <p className="text-sm text-slate-400 mb-4">
              Ajoutez des widgets pour créer votre dashboard personnalisé
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un widget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={cn(
                  'relative bg-slate-800/50 rounded-lg border p-4',
                  isEditMode ? 'border-blue-500/50' : 'border-slate-700',
                  widget.type === 'kpi' ? 'col-span-1' : 'col-span-2'
                )}
              >
                {isEditMode && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    <button
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                      title="Déplacer"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {widget.type === 'kpi' && widget.config.kpi && (
                  <BTPKPIWidget
                    label={widget.config.kpi.label}
                    value={0} // À remplacer par les données réelles
                    target={widget.config.kpi.target}
                    unit={widget.config.kpi.unit}
                    status="info"
                    description={widget.config.kpi.label}
                  />
                )}

                {widget.type === 'chart' && widget.config.visualization && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">
                      {widget.config.visualization.dataSource}
                    </h4>
                    <BTPVisualization
                      visualization={widget.config.visualization}
                      data={[]} // À remplacer par les données réelles
                      height={200}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale d'ajout */}
      {isAddModalOpen && (
        <BTPIntelligentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Ajouter un widget"
          description="Choisissez le type de widget à ajouter"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">KPIs</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableKPIs.slice(0, 4).map((kpi) => (
                  <button
                    key={kpi.id}
                    onClick={() => addWidget('kpi', { kpi })}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors text-left"
                  >
                    <p className="text-sm font-medium text-slate-300">{kpi.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{kpi.unit}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Graphiques</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableVisualizations.slice(0, 4).map((viz) => (
                  <button
                    key={viz.id}
                    onClick={() => addWidget('chart', { visualization: viz })}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors text-left"
                  >
                    <p className="text-sm font-medium text-slate-300">
                      {viz.dataSource.replace(/-/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{viz.type}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </BTPIntelligentModal>
      )}
    </div>
  );
}

