/**
 * Vue Calendrier & Planification
 * Vue principale pour le domaine Calendrier
 * Module de pilotage temporel transversal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, History, AlertTriangle, Clock, CheckCircle2, Users, Calendar, Brain, TrendingUp } from 'lucide-react';
import { BaseDomainView } from './BaseDomainView';
import { findDomain, findModule, type AnalyticsDomain } from '@/lib/config/analyticsBTPArchitecture';
import { useBTPViewStore } from '@/lib/stores/btpViewStore';
import { useAnalyticsBTPNavigationStore } from '@/lib/stores/analyticsBTPNavigationStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarTimelineGlobal,
  CalendarHeatmapCharges,
  CalendarMultiResources,
  CalendarCrossViewSLA,
  CalendarPlanningProjet,
} from '../components/calendar';

interface CalendrierViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
}

export function CalendrierView({ domainId, moduleId, subModuleId }: CalendrierViewProps) {
  const { modals, openModal, closeModal } = useBTPViewStore();
  
  const isTimelineOpen = modals['calendar-timeline'];
  const isHeatmapOpen = modals['calendar-heatmap'];
  const isMultiResourcesOpen = modals['calendar-multi-resources'];
  const isCrossViewOpen = modals['calendar-cross-view'];
  const isPlanningProjetOpen = modals['calendar-planning-projet'];

  // Ouvrir automatiquement les fenêtres selon le module sélectionné
  useEffect(() => {
    if (!moduleId) return;

    switch (moduleId) {
      case 'vue-ensemble-temporelle':
        if (!isTimelineOpen) {
          openModal('calendar-timeline');
        }
        break;
      case 'sla-delais-critiques':
        if (!isCrossViewOpen) {
          openModal('calendar-cross-view');
        }
        break;
      case 'conflits-chevauchements':
        if (!isMultiResourcesOpen) {
          openModal('calendar-multi-resources');
        }
        break;
      case 'planification-intelligente-ia':
        if (!isHeatmapOpen) {
          openModal('calendar-heatmap');
        }
        break;
      case 'jalons-projets-livrables':
        if (!isPlanningProjetOpen) {
          openModal('calendar-planning-projet');
        }
        break;
    }
  }, [moduleId, openModal, modals, isTimelineOpen, isHeatmapOpen, isMultiResourcesOpen, isCrossViewOpen, isPlanningProjetOpen]);

  // Si on est au niveau domaine, utiliser customContent pour afficher les actions Calendrier
  if (!moduleId && !subModuleId) {
    return (
      <>
        <BaseDomainView
          domainId={domainId}
          moduleId={moduleId}
          subModuleId={subModuleId}
          icon={CalendarDays}
          customContent={({ domain }) => (
            <CalendarDomainContent
              domain={domain}
              onOpenTimeline={() => openModal('calendar-timeline')}
              onOpenHeatmap={() => openModal('calendar-heatmap')}
              onOpenMultiResources={() => openModal('calendar-multi-resources')}
              onOpenCrossView={() => openModal('calendar-cross-view')}
              onOpenPlanningProjet={() => openModal('calendar-planning-projet')}
            />
          )}
        />
        
        {/* Fenêtres avancées Calendrier */}
        <CalendarTimelineGlobal
          isOpen={isTimelineOpen}
          onClose={() => closeModal('calendar-timeline')}
        />
        <CalendarHeatmapCharges
          isOpen={isHeatmapOpen}
          onClose={() => closeModal('calendar-heatmap')}
        />
        <CalendarMultiResources
          isOpen={isMultiResourcesOpen}
          onClose={() => closeModal('calendar-multi-resources')}
        />
        <CalendarCrossViewSLA
          isOpen={isCrossViewOpen}
          onClose={() => closeModal('calendar-cross-view')}
        />
        <CalendarPlanningProjet
          isOpen={isPlanningProjetOpen}
          onClose={() => closeModal('calendar-planning-projet')}
        />
      </>
    );
  }

  return (
    <>
      <BaseDomainView
        domainId={domainId}
        moduleId={moduleId}
        subModuleId={subModuleId}
        icon={CalendarDays}
      />
      
      {/* Fenêtres avancées selon le module */}
      {moduleId === 'vue-ensemble-temporelle' && (
        <CalendarTimelineGlobal
          isOpen={isTimelineOpen}
          onClose={() => closeModal('calendar-timeline')}
        />
      )}
      {moduleId === 'sla-delais-critiques' && (
        <CalendarCrossViewSLA
          isOpen={isCrossViewOpen}
          onClose={() => closeModal('calendar-cross-view')}
        />
      )}
      {moduleId === 'conflits-chevauchements' && (
        <CalendarMultiResources
          isOpen={isMultiResourcesOpen}
          onClose={() => closeModal('calendar-multi-resources')}
        />
      )}
      {moduleId === 'planification-intelligente-ia' && (
        <CalendarHeatmapCharges
          isOpen={isHeatmapOpen}
          onClose={() => closeModal('calendar-heatmap')}
        />
      )}
      {moduleId === 'jalons-projets-livrables' && (
        <CalendarPlanningProjet
          isOpen={isPlanningProjetOpen}
          onClose={() => closeModal('calendar-planning-projet')}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Composant de Contenu Domaine
// ═══════════════════════════════════════════════════════════════════════════

interface CalendarDomainContentProps {
  domain: AnalyticsDomain;
  onOpenTimeline: () => void;
  onOpenHeatmap: () => void;
  onOpenMultiResources: () => void;
  onOpenCrossView: () => void;
  onOpenPlanningProjet: () => void;
}

function CalendarDomainContent({
  domain,
  onOpenTimeline,
  onOpenHeatmap,
  onOpenMultiResources,
  onOpenCrossView,
  onOpenPlanningProjet,
}: CalendarDomainContentProps) {
  const { navigateToModule } = useAnalyticsBTPNavigationStore();
  const { openModal } = useBTPViewStore();

  // Mapping module -> action (ouvrir fenêtre ou naviguer)
  const moduleActions: Record<string, () => void> = {
    'vue-ensemble-temporelle': onOpenTimeline,
    'sla-delais-critiques': onOpenCrossView,
    'conflits-chevauchements': onOpenMultiResources,
    'planification-intelligente-ia': onOpenHeatmap,
    'jalons-projets-livrables': onOpenPlanningProjet,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-semibold text-slate-200">{domain.label}</h1>
        </div>
        {domain.description && (
          <p className="text-slate-400 text-sm mb-4">{domain.description}</p>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">
            Transversal
          </Badge>
          <Badge variant="default" className="text-xs">
            Synchronisé
          </Badge>
          <Badge variant="default" className="text-xs">
            IA
          </Badge>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Fenêtres Avancées</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant="default"
            onClick={onOpenTimeline}
            className="justify-start h-auto py-3"
          >
            <History className="h-5 w-5 mr-2 text-blue-400" />
            <div className="text-left">
              <div className="font-medium text-slate-200">Timeline Globale</div>
              <div className="text-xs text-slate-500">Vue temporelle complète</div>
            </div>
          </Button>
          
          <Button
            variant="default"
            onClick={onOpenHeatmap}
            className="justify-start h-auto py-3"
          >
            <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
            <div className="text-left">
              <div className="font-medium text-slate-200">Heatmap des Charges</div>
              <div className="text-xs text-slate-500">Analyse charge/disponibilité</div>
            </div>
          </Button>
          
          <Button
            variant="default"
            onClick={onOpenMultiResources}
            className="justify-start h-auto py-3"
          >
            <Users className="h-5 w-5 mr-2 text-emerald-400" />
            <div className="text-left">
              <div className="font-medium text-slate-200">Calendrier Multi-Ressources</div>
              <div className="text-xs text-slate-500">Gestion des conflits</div>
            </div>
          </Button>
          
          <Button
            variant="default"
            onClick={onOpenCrossView}
            className="justify-start h-auto py-3"
          >
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-400" />
            <div className="text-left">
              <div className="font-medium text-slate-200">Vue Croisée SLA/Retards</div>
              <div className="text-xs text-slate-500">SLA & conflits</div>
            </div>
          </Button>
          
          <Button
            variant="default"
            onClick={onOpenPlanningProjet}
            className="justify-start h-auto py-3"
          >
            <Calendar className="h-5 w-5 mr-2 text-indigo-400" />
            <div className="text-left">
              <div className="font-medium text-slate-200">Planning Projet Intégré</div>
              <div className="text-xs text-slate-500">Jalons & livrables</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domain.modules.map((mod) => {
          let icon = CalendarDays;
          let color = 'text-blue-400';
          
          switch (mod.id) {
            case 'vue-ensemble-temporelle':
              icon = History;
              color = 'text-blue-400';
              break;
            case 'sla-delais-critiques':
              icon = Clock;
              color = 'text-amber-400';
              break;
            case 'conflits-chevauchements':
              icon = AlertTriangle;
              color = 'text-rose-400';
              break;
            case 'echeances-operationnelles':
              icon = CheckCircle2;
              color = 'text-emerald-400';
              break;
            case 'jalons-projets-livrables':
              icon = Calendar;
              color = 'text-indigo-400';
              break;
            case 'evenements-rh-absences':
              icon = Users;
              color = 'text-purple-400';
              break;
            case 'instances-reunions':
              icon = CalendarDays;
              color = 'text-cyan-400';
              break;
            case 'planification-intelligente-ia':
              icon = Brain;
              color = 'text-pink-400';
              break;
          }
          
          const Icon = icon;
          const action = moduleActions[mod.id];
          
          return (
            <div
              key={mod.id}
              onClick={() => {
                if (action) {
                  action();
                } else {
                  navigateToModule(domain.id, mod.id);
                }
              }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3 mb-2">
                <Icon className={`h-5 w-5 ${color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-300 mb-1 group-hover:text-blue-400 transition-colors">
                    {mod.label}
                  </h3>
                  {mod.description && (
                    <p className="text-slate-500 text-xs mb-2 line-clamp-2">{mod.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-slate-400">
                  {mod.subModules.length} sous-module{mod.subModules.length > 1 ? 's' : ''}
                </div>
                <Badge variant="default" className="text-xs">
                  Synchronisé
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

