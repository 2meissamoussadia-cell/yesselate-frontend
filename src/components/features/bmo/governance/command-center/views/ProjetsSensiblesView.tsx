/**
 * Projets sensibles & Priorités - Onglet 4
 * Surveille les projets nécessitant une attention particulière de la direction
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  FolderKanban,
  AlertTriangle,
  TrendingDown,
  Crown,
  Gavel,
  Calendar,
  DollarSign,
  ChevronRight,
  Play,
  Users,
  FileText,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Données mock pour la démo
const projectsByDelay = [
  {
    id: '1',
    name: 'Projet Gamma - Résidence Verte',
    delay: 32,
    threshold: 15,
    budget: '5.8M€',
    progress: 28,
    status: 'late' as const,
    priority: 'high' as const,
  },
  {
    id: '2',
    name: 'Projet Alpha - Tours Horizon',
    delay: 15,
    threshold: 15,
    budget: '12.5M€',
    progress: 45,
    status: 'at-risk' as const,
    priority: 'high' as const,
  },
  {
    id: '3',
    name: 'Projet Delta - Extension Usine',
    delay: 18,
    threshold: 10,
    budget: '9.2M€',
    progress: 62,
    status: 'late' as const,
    priority: 'medium' as const,
  },
];

const projectsByBudget = [
  {
    id: '4',
    name: 'Projet Epsilon - Centre Logistique',
    budgetConsumed: 85,
    budgetTotal: '15.2M€',
    budgetOverrun: '2.8M€',
    progress: 72,
    status: 'at-risk' as const,
    priority: 'critical' as const,
  },
  {
    id: '5',
    name: 'Projet Zeta - Rénovation Bureaux',
    budgetConsumed: 92,
    budgetTotal: '4.5M€',
    budgetOverrun: '1.2M€',
    progress: 88,
    status: 'late' as const,
    priority: 'high' as const,
  },
];

const vipProjects = [
  {
    id: '6',
    name: 'Projet Beta - Centre Commercial',
    type: 'vip' as const,
    budget: '8.2M€',
    progress: 72,
    status: 'on-track' as const,
    priority: 'critical' as const,
    reason: 'Projet image majeur',
  },
  {
    id: '7',
    name: 'Projet Theta - Siège Social',
    type: 'vip' as const,
    budget: '18.5M€',
    progress: 45,
    status: 'at-risk' as const,
    priority: 'critical' as const,
    reason: 'Projet stratégique Direction',
  },
];

const projectsInLitigation = [
  {
    id: '8',
    name: 'Projet Iota - Pont Autoroutier',
    budget: '22.5M€',
    progress: 65,
    status: 'at-risk' as const,
    litigationType: 'Contractuel',
    litigationAmount: '1.8M€',
    priority: 'critical' as const,
  },
  {
    id: '9',
    name: 'Projet Kappa - Parking Souterrain',
    budget: '6.8M€',
    progress: 55,
    status: 'at-risk' as const,
    litigationType: 'Technique',
    litigationAmount: '450K€',
    priority: 'high' as const,
  },
];

export function ProjetsSensiblesView() {
  const { navigate, openModal } = useGovernanceCommandCenterStore();
  const [selectedTab, setSelectedTab] = useState<
    'delay' | 'budget' | 'vip' | 'litigation'
  >('delay');

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/50">
        <button
          onClick={() => setSelectedTab('delay')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'delay'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Projets en retard
            {projectsByDelay.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {projectsByDelay.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('budget')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'budget'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Dépassements budgétaires
            {projectsByBudget.length > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                {projectsByBudget.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('vip')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'vip'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Projets VIP / Image
            {vipProjects.length > 0 && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                {vipProjects.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('litigation')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'litigation'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            Projets en litige
            {projectsInLitigation.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {projectsInLitigation.length}
              </Badge>
            )}
          </div>
        </button>
      </div>

      {/* Contenu selon l'onglet sélectionné */}
      {selectedTab === 'delay' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-medium text-slate-300">
                Projets en retard (seuil: 15j)
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Projet
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Retard
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Avancement
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Budget
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {projectsByDelay.map((project) => (
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
                        <span className="text-sm font-medium text-red-400">+{project.delay}j</span>
                        {project.delay > project.threshold * 2 && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            Critique
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              project.status === 'at-risk'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            )}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">{project.budget}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          project.status === 'at-risk'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        )}
                      >
                        {project.status === 'at-risk'
                          ? 'À risque'
                          : 'En retard'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-slate-400 hover:text-slate-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('project-detail', project);
                        }}
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
      )}

      {selectedTab === 'budget' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-medium text-slate-300">
                Dépassements budgétaires (seuil: 85%)
              </h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {projectsByBudget.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('project-detail', project)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-1 h-12 rounded-full bg-amber-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{project.name}</p>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Dépassement: {project.budgetOverrun}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">
                        Budget total: {project.budgetTotal}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-amber-400">
                        Consommé: {project.budgetConsumed}%
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        Avancement: {project.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('project-detail', { ...project, action: 'review' });
                    }}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Convoquer revue
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'vip' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-medium text-slate-300">Projets VIP / Image</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {vipProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('project-detail', project)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
                    <Crown className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{project.name}</p>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        VIP
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Budget: {project.budget}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        Avancement: {project.progress}%
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-purple-400">{project.reason}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-400 hover:text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('project-detail', project);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'litigation' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-medium text-slate-300">Projets en litige</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {projectsInLitigation.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('project-detail', project)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                    <Gavel className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{project.name}</p>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        {project.litigationType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Budget: {project.budget}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-red-400">
                        Enjeu: {project.litigationAmount}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        Avancement: {project.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-400 hover:text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('project-detail', project);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
