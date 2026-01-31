/**
 * Vue Pilotage Projets
 * Portefeuille, jalons, livrables et dépendances
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Calendar,
  Users,
  Wallet,
  TrendingUp,
  Filter,
  LayoutGrid,
  List,
  GitBranch,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { SurveillanceTable } from '../SurveillanceTable';
import type { SurveillanceItem } from '../types';

// Données de démonstration
const projectsData: SurveillanceItem[] = [
  {
    id: '1',
    reference: 'PRJ-2024-001',
    designation: 'Tours Horizon - Phase 2',
    project: 'Immobilier Grand Paris',
    responsable: 'Martin Dupont',
    dateEcheance: '15/03/2026',
    status: 'at-risk',
    priority: 'critical',
    progress: 45,
    alerts: 3,
  },
  {
    id: '2',
    reference: 'PRJ-2024-002',
    designation: 'Centre Commercial Atlantis',
    project: 'Retail',
    responsable: 'Sophie Bernard',
    dateEcheance: '28/06/2026',
    status: 'on-track',
    priority: 'high',
    progress: 72,
    alerts: 0,
  },
  {
    id: '3',
    reference: 'PRJ-2024-003',
    designation: 'Résidence Les Jardins',
    project: 'Logement Social',
    responsable: 'Jean Moreau',
    dateEcheance: '10/02/2026',
    status: 'late',
    priority: 'critical',
    progress: 28,
    alerts: 5,
  },
  {
    id: '4',
    reference: 'PRJ-2024-004',
    designation: 'Réhabilitation Gare Est',
    project: 'Infrastructure',
    responsable: 'Claire Petit',
    dateEcheance: '20/09/2026',
    status: 'on-track',
    priority: 'medium',
    progress: 15,
    alerts: 1,
  },
  {
    id: '5',
    reference: 'PRJ-2024-005',
    designation: 'Extension Zone Industrielle',
    project: 'Industrie',
    responsable: 'Thomas Richard',
    dateEcheance: '05/12/2026',
    status: 'on-track',
    priority: 'low',
    progress: 8,
    alerts: 0,
  },
];

const milestones = [
  { id: '1', name: 'Fondations terminées', project: 'Tours Horizon', date: '12/01/2026', status: 'late', daysLate: 5 },
  { id: '2', name: 'Permis modificatif', project: 'Centre Commercial', date: '15/01/2026', status: 'upcoming', daysLate: 0 },
  { id: '3', name: 'Réception lot électricité', project: 'Résidence Jardins', date: '18/01/2026', status: 'at-risk', daysLate: 0 },
  { id: '4', name: 'Validation étude sol', project: 'Gare Est', date: '20/01/2026', status: 'completed', daysLate: 0 },
];

export function ProjectsView() {
  const { navigation, openModal, openDetailPanel } = useGovernanceCommandCenterStore();
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');

  const handleItemClick = (item: SurveillanceItem) => {
    openDetailPanel('project', item.id, item);
  };

  const handleAction = (action: string, item: SurveillanceItem) => {
    switch (action) {
      case 'view':
        openModal('project-detail', item);
        break;
      case 'escalate':
        openModal('escalation', { source: item });
        break;
    }
  };

  // Vue selon la sous-catégorie
  if ((navigation.subCategory as any) === 'milestones') {
    return <MilestonesView milestones={milestones} />;
  }

  if ((navigation.subCategory as any) === 'blockers') {
    return <BlockersView />;
  }

  if ((navigation.subCategory as any) === 'dependencies') {
    return <DependenciesView />;
  }

  // Vue portefeuille par défaut
  return (
    <div className="flex flex-col h-full">
      {/* Stats rapides */}
      <div className="grid grid-cols-5 gap-4 p-4 border-b border-slate-800/50">
        <StatCard
          label="Projets actifs"
          value={24}
          icon={FolderKanban}
          iconColor="text-blue-400"
        />
        <StatCard
          label="En bonne voie"
          value={18}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
        />
        <StatCard
          label="À risque"
          value={4}
          icon={AlertTriangle}
          iconColor="text-amber-400"
        />
        <StatCard
          label="En retard"
          value={2}
          icon={XCircle}
          iconColor="text-red-400"
        />
        <StatCard
          label="Budget total"
          value="45.2M€"
          icon={Wallet}
          iconColor="text-purple-400"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-slate-300">
            <Filter className="h-4 w-4 mr-1" />
            Filtres
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              viewMode === 'table' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
            )}
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              viewMode === 'cards' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
            )}
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'table' ? (
          <SurveillanceTable
            tableId="projects-portfolio"
            items={projectsData}
            onItemClick={handleItemClick}
            onAction={handleAction}
          />
        ) : (
          <ProjectCardsView projects={projectsData} onItemClick={handleItemClick} />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', iconColor)} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className="text-xl font-bold text-slate-200">{value}</span>
    </div>
  );
}

function ProjectCardsView({
  projects,
  onItemClick,
}: {
  projects: SurveillanceItem[];
  onItemClick: (item: SurveillanceItem) => void;
}) {
  const statusConfig = {
    'on-track': { label: 'En bonne voie', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'at-risk': { label: 'À risque', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'late': { label: 'En retard', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    'blocked': { label: 'Bloqué', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    'completed': { label: 'Terminé', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto h-full">
      {projects.map((project) => {
        const status = statusConfig[project.status];
        return (
          <div
            key={project.id}
            className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4 hover:border-slate-600/50 transition-colors cursor-pointer"
            onClick={() => onItemClick(project)}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-sm font-medium text-slate-300">{project.designation}</p>
                <p className="text-xs text-slate-400">{project.reference}</p>
              </div>
              <Badge variant="default" className={cn('text-xs', status.color)}>
                {status.label}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Avancement</span>
                  <span className="text-xs text-slate-400">{project.progress ?? 0}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      (project.progress ?? 0) >= 80 ? 'bg-emerald-500' :
                      (project.progress ?? 0) >= 50 ? 'bg-blue-500' :
                      (project.progress ?? 0) >= 25 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${project.progress ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="h-3 w-3" />
                  {project.responsable}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  {project.dateEcheance}
                </div>
              </div>

              {project.alerts && project.alerts > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  {project.alerts} alerte(s) active(s)
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MilestonesView({ milestones }: { milestones: any[] }) {
  const { openModal } = useGovernanceCommandCenterStore();

  const statusConfig = {
    'completed': { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    'upcoming': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    'at-risk': { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    'late': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Jalons à venir</h3>
        <Button variant="ghost" size="sm" className="text-slate-400">
          <Calendar className="h-4 w-4 mr-1" />
          Vue calendrier
        </Button>
      </div>

      <div className="space-y-2">
        {milestones.map((milestone) => {
          const status = statusConfig[milestone.status as keyof typeof statusConfig];
          const Icon = status.icon;

          return (
            <div
              key={milestone.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 transition-colors cursor-pointer"
              onClick={() => openModal('timeline-detail', milestone)}
            >
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', status.bg)}>
                  <Icon className={cn('h-4 w-4', status.color)} />
                </div>
                <div>
                  <p className="text-sm text-slate-300">{milestone.name}</p>
                  <p className="text-xs text-slate-400">{milestone.project}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">{milestone.date}</span>
                {milestone.status === 'late' && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                    +{milestone.daysLate}j
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BlockersView() {
  const blockers = [
    { id: '1', title: 'Attente permis modificatif', project: 'Tours Horizon', days: 12, owner: 'Mairie Paris', impact: 'critical' },
    { id: '2', title: 'Livraison béton retardée', project: 'Résidence Jardins', days: 5, owner: 'Fournisseur X', impact: 'high' },
    { id: '3', title: 'Validation étude géotechnique', project: 'Zone Industrielle', days: 3, owner: 'Bureau études', impact: 'medium' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-red-400" />
        <h3 className="text-sm font-medium text-slate-300">Points bloquants actifs</h3>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
          {blockers.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {blockers.map((blocker) => (
          <div
            key={blocker.id}
            className="p-4 rounded-lg bg-slate-900/60 border border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-300">{blocker.title}</p>
                <p className="text-xs text-slate-400 mt-1">Projet: {blocker.project}</p>
                <p className="text-xs text-slate-400">Responsable: {blocker.owner}</p>
              </div>
              <div className="text-right">
                <Badge
                  className={cn(
                    'text-xs',
                    blocker.impact === 'critical'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : blocker.impact === 'high'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  )}
                >
                  {blocker.impact}
                </Badge>
                <p className="text-sm font-medium text-red-400 mt-2">{blocker.days}j bloqué</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DependenciesView() {
  return (
    <div className="flex items-center justify-center h-full text-slate-400">
      <div className="text-center">
        <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">Vue des dépendances inter-projets</p>
        <p className="text-xs text-slate-600 mt-1">Diagramme de Gantt et liens</p>
      </div>
    </div>
  );
}

