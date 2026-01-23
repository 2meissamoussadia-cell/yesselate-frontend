/**
 * Vue d'ensemble - Dashboard opérationnel
 * Centre de commandement avec KPIs, décisions et escalades
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Users,
  Wallet,
  FolderKanban,
  AlertOctagon,
  ChevronRight,
  Play,
  Target,
  Zap,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Données mock pour la démo
const urgentDecisions = [
  { id: '1', ref: 'DEC-2024-089', title: 'Validation avenant budget lot 3', deadline: '12/01', impact: 'high', type: 'budget' },
  { id: '2', ref: 'DEC-2024-090', title: 'Prolongation délai phase 2', deadline: '14/01', impact: 'medium', type: 'planning' },
  { id: '3', ref: 'DEC-2024-091', title: 'Remplacement sous-traitant électricité', deadline: '15/01', impact: 'high', type: 'contract' },
  { id: '4', ref: 'DEC-2024-092', title: 'Approbation devis travaux supplémentaires', deadline: '16/01', impact: 'medium', type: 'budget' },
];

const activeEscalations = [
  { id: '1', ref: 'ESC-001', title: 'Retard livraison matériaux site B', level: 2, daysOpen: 5, origin: 'Chef de projet' },
  { id: '2', ref: 'ESC-002', title: 'Non-conformité qualité béton', level: 3, daysOpen: 2, origin: 'Conducteur travaux' },
];

const criticalProjects = [
  { id: '1', name: 'Projet Alpha - Tours Horizon', progress: 45, status: 'at-risk', budget: '12.5M€', delay: '+15j' },
  { id: '2', name: 'Projet Beta - Centre Commercial', progress: 72, status: 'on-track', budget: '8.2M€', delay: '0j' },
  { id: '3', name: 'Projet Gamma - Résidence Verte', progress: 28, status: 'late', budget: '5.8M€', delay: '+32j' },
];

const recentAlerts = [
  { id: '1', type: 'critical', message: 'Dépassement seuil budget lot 4', time: 'il y a 15 min', project: 'Alpha' },
  { id: '2', type: 'warning', message: 'Retard validation BC #2847', time: 'il y a 1h', project: 'Beta' },
  { id: '3', type: 'warning', message: 'Ressource non disponible semaine 3', time: 'il y a 2h', project: 'Gamma' },
  { id: '4', type: 'info', message: 'Jalon J5 atteint avec succès', time: 'il y a 3h', project: 'Beta' },
];

export function OverviewView() {
  const { navigation, openModal, navigate } = useGovernanceCommandCenterStore();

  return (
    <div className="p-4 space-y-4">
      {/* Section Décisions & Escalades */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Décisions urgentes */}
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-slate-300">Décisions à prendre</h3>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                {urgentDecisions.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-slate-300"
              onClick={() => navigate('decisions-arbitrages', 'pending-decisions')}
            >
              Voir tout
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {urgentDecisions.map((decision) => (
              <div
                key={decision.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('decision', { ...decision, title: decision.title })}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'w-1 h-8 rounded-full',
                    decision.impact === 'high' ? 'bg-red-500' : 'bg-amber-500'
                  )} />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-300 truncate">{decision.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{decision.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{decision.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn(
                    'text-xs font-medium',
                    decision.impact === 'high' ? 'text-red-400' : 'text-slate-400'
                  )}>
                    Éch. {decision.deadline}
                  </span>
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('decision', decision);
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Traiter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalades actives */}
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-medium text-slate-300">Escalades actives</h3>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {activeEscalations.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-slate-300"
              onClick={() => navigate('escalations-risks', 'active-escalations')}
            >
              Voir tout
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {activeEscalations.map((esc) => (
              <div
                key={esc.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('escalation', esc)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                    <span className="text-sm font-bold text-red-400">N{esc.level}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-300 truncate">{esc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{esc.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">Origine: {esc.origin}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-red-400 font-medium">
                    {esc.daysOpen}j ouverts
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            ))}
            {activeEscalations.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                Aucune escalade active
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Projets critiques */}
      <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-300">Projets à surveiller</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-slate-300"
            onClick={() => navigate('instances-coordination', 'sensitive-projects')}
          >
            Portefeuille complet
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Projet</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Avancement</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Budget</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Écart délai</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {criticalProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => openModal('project-detail', project)}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">{project.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            project.status === 'on-track' ? 'bg-emerald-500' :
                            project.status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="default"
                      className={cn(
                        'text-xs',
                        project.status === 'on-track'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : project.status === 'at-risk'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      )}
                    >
                      {project.status === 'on-track' ? 'En bonne voie' :
                       project.status === 'at-risk' ? 'À risque' : 'En retard'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">{project.budget}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-sm font-medium',
                      project.delay === '0j' ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {project.delay}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-slate-500 hover:text-slate-300"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Alertes récentes */}
      <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-medium text-slate-300">Flux d'alertes</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-slate-300"
            onClick={() => navigate('escalations-risks', 'major-risks')}
          >
            Toutes les alertes
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="divide-y divide-slate-800/50 max-h-64 overflow-y-auto">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/30 transition-colors cursor-pointer"
              onClick={() => openModal('alert-detail', alert)}
            >
              <div className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                alert.type === 'critical' ? 'bg-red-500' :
                alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400 truncate">{alert.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="default" className="text-xs bg-slate-800 text-slate-500 border-slate-700">
                  {alert.project}
                </Badge>
                <span className="text-xs text-slate-600">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

