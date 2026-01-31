/**
 * Content Router du Projets Command Center - VERSION AMÉLIORÉE
 * Intègre LiveCounters, Actions Rapides, Analytics Charts et hooks
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useProjetsCommandCenterStore } from '@/lib/stores/projetsCommandCenterStore';
import { useProjetsData } from './hooks/useProjetsData';
import { ProjetsLiveCounters } from '@/components/features/bmo/workspace/projets/ProjetsLiveCounters';
import {
  ProjetsTrendChart,
  ProjetsStatusChart,
  ProjetsBureauPerformanceChart,
  ProjetsBudgetHealthChart,
  ProjetsTypeDistributionChart,
  ProjetsTimelineChart,
  ProjetsTeamUtilizationChart,
  ProjetsAnalyticsCharts,
} from './analytics/ProjetsAnalyticsCharts';
import {
  StatCard,
  QuickActionButton,
  SectionHeader,
  EmptyState,
  SkeletonList,
} from './shared/UIComponents';
import {
  Briefcase,
  Zap,
  Scale,
  LayoutGrid,
  BarChart3,
  Target,
  Play,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  Columns,
  GitBranch,
  Eye,
  FileText,
  Settings,
  Layers,
} from 'lucide-react';

// Import mock data
import {
  mockProjects,
  getProjectsByStatus,
  getDelayedProjects,
  getAtRiskProjects,
  getProjectsByBureau,
} from '@/lib/mocks/projets/mockProjects';
import { getUpcomingMilestones } from '@/lib/mocks/projets/mockMilestones';
import { mockBudgetSummary } from '@/lib/mocks/projets/mockBudgets';
import { mockBureauComparison } from '@/lib/mocks/projets/mockAnalytics';
import { mockTeams } from '@/lib/mocks/projets/mockTeams';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ROUTER
// ═══════════════════════════════════════════════════════════════════════════

interface ProjetsContentRouterProps {
  onViewProject?: (project: any) => void;
  onEditProject?: (project: any) => void;
  onDeleteProject?: (id: string) => void;
}

export function ProjetsContentRouter({
  onViewProject,
  onEditProject,
  onDeleteProject,
}: ProjetsContentRouterProps = {}) {
  const { navigation } = useProjetsCommandCenterStore();

  // Pass callbacks to all views
  const viewProps = { onViewProject, onEditProject, onDeleteProject };

  switch (navigation.mainCategory) {
    case 'overview':
      return <OverviewView {...viewProps} />;
    case 'active':
      return <ActiveProjectsView {...viewProps} />;
    case 'delayed':
      return <DelayedView {...viewProps} />;
    case 'analytics':
      return <AnalyticsView />;
    case 'timeline':
      return <TimelineView />;
    case 'budget':
      return <BudgetView />;
    case 'by-bureau':
      return <BureauxView {...viewProps} />;
    case 'kanban':
      return <KanbanView />;
    default:
      return <OverviewView {...viewProps} />;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW VIEW - Vue d'ensemble améliorée
// ═══════════════════════════════════════════════════════════════════════════

function OverviewView({ onViewProject, onEditProject, onDeleteProject }: ProjetsContentRouterProps = {}) {
  const { stats, navigate, openModal } = useProjetsCommandCenterStore();
  const { data: projects, loading } = useProjetsData();

  const recentProjects = projects.slice(0, 5);
  const delayedProjects = projects.filter(p => p.status === 'delayed');

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Alert Banner pour retards */}
      {delayedProjects.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30">
              <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {delayedProjects.length} projet(s) en retard
              </h2>
              <p className="text-slate-400">Intervention requise pour respecter les délais</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('delayed', 'all')}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            Voir les retards <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Live Counters */}
      <section>
        <ProjetsLiveCounters
          onOpenQueue={(queue) => {
            if (queue === 'critical') navigate('delayed', 'all');
            else if (queue === 'all') navigate('active', 'all');
          }}
        />
      </section>

      {/* Stats Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Briefcase}
            label="Total Projets"
            value={stats?.total ?? 0}
            color="blue"
            onClick={() => navigate('active', 'all')}
          />
          <StatCard
            icon={Play}
            label="En Cours"
            value={stats?.active ?? 0}
            color="emerald"
            trend="up"
            trendValue="+5%"
            onClick={() => navigate('active', 'all')}
          />
          <StatCard
            icon={Clock}
            label="En Retard"
            value={stats?.delayed ?? 0}
            color="rose"
            onClick={() => navigate('delayed', 'all')}
          />
          <StatCard
            icon={Target}
            label="Livraison à temps"
            value={stats?.onTimeDelivery ?? 0}
            suffix="%"
            color="emerald"
          />
        </div>
      </section>

      {/* Actions Rapides + Derniers Projets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Rapides */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Actions Rapides
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <QuickActionButton
              icon={Plus}
              title="Nouveau projet"
              description="Créer un nouveau projet"
              color="emerald"
              onClick={() => openModal('new-project')}
            />
            <QuickActionButton
              icon={LayoutGrid}
              title="Vue Kanban"
              description="Organisation visuelle"
              color="purple"
              onClick={() => navigate('kanban', 'all')}
            />
            <QuickActionButton
              icon={BarChart3}
              title="Analytics"
              description="Analyses et tendances"
              color="blue"
              onClick={() => navigate('analytics', 'performance')}
            />
            <QuickActionButton
              icon={Calendar}
              title="Timeline"
              description="Jalons et échéances"
              color="orange"
              onClick={() => navigate('timeline', 'milestones')}
            />
          </div>
        </section>

        {/* Derniers Projets */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Derniers projets actifs
            </h2>
            <Button
              onClick={() => navigate('active', 'all')}
              variant="ghost"
              size="sm"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Tout voir <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="divide-y divide-slate-700/50">
            {loading ? (
              <div className="p-4">
                <SkeletonList count={3} />
              </div>
            ) : recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onViewProject?.(project)}
                  className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 truncate">{project.title}</p>
                      <p className="text-sm text-slate-400">{project.client.name}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Progression</p>
                        <p className="text-sm font-medium text-emerald-400">{project.progress}%</p>
                      </div>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Briefcase}
                title="Aucun projet actif"
                description="Créez votre premier projet pour commencer"
                action={{
                  label: 'Nouveau projet',
                  onClick: () => openModal('new-project'),
                }}
              />
            )}
          </div>
        </section>
      </div>

      {/* Analytics Charts */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Analytics & Tendances</h2>
        <ProjetsAnalyticsCharts />
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVE PROJECTS VIEW
// ═══════════════════════════════════════════════════════════════════════════

function ActiveProjectsView({ onViewProject, onEditProject, onDeleteProject }: ProjetsContentRouterProps = {}) {
  const { stats, openModal } = useProjetsCommandCenterStore();
  const { data: projects, loading } = useProjetsData();
  
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <SectionHeader
        icon={Play}
        title="Projets Actifs"
        subtitle={`${activeProjects.length} projet(s) en cours`}
        action={
          <Button onClick={() => openModal('new-project')} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        }
      />

      {loading ? (
        <SkeletonList count={5} />
      ) : activeProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {activeProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onClick={() => openModal('project-detail', { projectId: project.id })} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="Aucun projet actif"
          description="Tous les projets sont planifiés ou terminés"
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DELAYED VIEW
// ═══════════════════════════════════════════════════════════════════════════

function DelayedView({ onViewProject, onEditProject, onDeleteProject }: ProjetsContentRouterProps = {}) {
  const { stats, openModal } = useProjetsCommandCenterStore();
  const delayedProjects = getDelayedProjects();

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header Alert */}
      <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {delayedProjects.length} projet(s) en retard
            </h1>
            <p className="text-slate-400">
              Nécessitent une action immédiate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={AlertTriangle}
            label="Retards critiques"
            value={delayedProjects.filter(p => p.riskLevel === 'high').length}
            color="rose"
          />
          <StatCard
            icon={Clock}
            label="Délai moyen"
            value="12"
            suffix="jours"
            color="amber"
          />
          <StatCard
            icon={DollarSign}
            label="Impact budget"
            value="2.5"
            suffix="M€"
            color="orange"
          />
        </div>
      </div>

      {/* Liste projets retardés */}
      <div className="space-y-4">
        {delayedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onClick={() => openModal('project-detail', { projectId: project.id })} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS VIEW - Avec tous les graphiques
// ═══════════════════════════════════════════════════════════════════════════

function AnalyticsView() {
  const upcomingMilestones = getUpcomingMilestones(10);
  const budgetSummary = mockBudgetSummary;
  const bureauComparison = mockBureauComparison;
  const teams = mockTeams;

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <SectionHeader
        icon={BarChart3}
        title="Analytics & Rapports"
        subtitle="Vue d'ensemble des performances"
      />

      {/* Graphiques Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <ProjetsTrendChart
            data={[
              { date: '2024-01', value: 45, label: 'Janv' },
              { date: '2024-02', value: 52, label: 'Févr' },
              { date: '2024-03', value: 48, label: 'Mars' },
              { date: '2024-04', value: 55, label: 'Avr' },
              { date: '2024-05', value: 58, label: 'Mai' },
              { date: '2024-06', value: 62, label: 'Juin' },
            ]}
          />
        </section>

        {/* Status Distribution */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <ProjetsStatusChart
            data={[
              { label: 'En cours', value: 18, color: 'bg-emerald-500' },
              { label: 'Planification', value: 8, color: 'bg-blue-500' },
              { label: 'En retard', value: 5, color: 'bg-rose-500' },
              { label: 'Terminés', value: 32, color: 'bg-slate-500' },
            ]}
          />
        </section>

        {/* Bureau Performance */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <ProjetsBureauPerformanceChart
            data={bureauComparison.map((b) => ({
              bureau: b.bureau,
              count: b.projects,
              onTime: b.onTimeRate,
            }))}
          />
        </section>

        {/* Budget Health */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <ProjetsBudgetHealthChart
            allocated={budgetSummary.totalBudget}
            consumed={budgetSummary.totalConsumed}
            committed={budgetSummary.totalCommitted}
            forecast={budgetSummary.forecastEndYear}
          />
        </section>

        {/* Type Distribution */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <ProjetsTypeDistributionChart
            data={[
              { label: 'Infrastructure', value: 12 },
              { label: 'Bâtiment', value: 18 },
              { label: 'Réhabilitation', value: 8 },
              { label: 'Urbanisme', value: 6 },
              { label: 'Environnement', value: 4 },
            ]}
          />
        </section>

        {/* Timeline */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <ProjetsTimelineChart
            milestones={upcomingMilestones.map((m) => ({
              id: m.id,
              title: m.title,
              date: m.plannedDate,
              status: m.status as 'pending' | 'at-risk' | 'completed',
              projectTitle: m.projectId,
            }))}
          />
        </section>
      </div>

      {/* Team Utilization */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <ProjetsTeamUtilizationChart
          teams={teams.map((t) => ({
            name: t.name,
            utilization: t.utilizationRate,
            available: 100 - t.utilizationRate,
            projects: t.projectCount,
          }))}
        />
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTRES VUES (Simplifiées pour l'exemple)
// ═══════════════════════════════════════════════════════════════════════════

function TimelineView() {
  const milestones = getUpcomingMilestones(15);
  
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <SectionHeader
        icon={Calendar}
        title="Timeline des Jalons"
        subtitle="Échéances et livrables à venir"
      />
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <ProjetsTimelineChart
          milestones={milestones.map((m) => ({
            id: m.id,
            title: m.title,
            date: m.plannedDate,
            status: m.status as 'pending' | 'at-risk' | 'completed',
            projectTitle: m.projectId,
          }))}
        />
      </section>
    </div>
  );
}

function BudgetView() {
  const budgetSummary = mockBudgetSummary;
  
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <SectionHeader
        icon={DollarSign}
        title="Gestion Budgétaire"
        subtitle="Suivi financier global"
      />
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <ProjetsBudgetHealthChart
          allocated={budgetSummary.totalBudget}
          consumed={budgetSummary.totalConsumed}
          committed={budgetSummary.totalCommitted}
          forecast={budgetSummary.forecastEndYear}
        />
      </section>
    </div>
  );
}

function BureauxView({ onViewProject, onEditProject, onDeleteProject }: ProjetsContentRouterProps = {}) {
  const bureauComparison = mockBureauComparison;
  
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <SectionHeader
        icon={Building2}
        title="Projets par Bureau"
        subtitle="Performance et répartition"
      />
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <ProjetsBureauPerformanceChart
          data={bureauComparison.map((b) => ({
            bureau: b.bureau,
            count: b.projects,
            onTime: b.onTimeRate,
          }))}
        />
      </section>
    </div>
  );
}

function KanbanView() {
  const { openModal } = useProjetsCommandCenterStore();
  const statusColumns = ['planning', 'active', 'delayed', 'completed'] as const;
  
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <SectionHeader
        icon={Columns}
        title="Vue Kanban"
        subtitle="Organisation visuelle des projets"
      />
      
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-280px)]">
        {statusColumns.map((status) => {
          const projects = getProjectsByStatus(status);
          return (
            <div key={status} className="flex flex-col rounded-xl border border-slate-700/50 bg-slate-800/30">
              <div className="p-4 border-b border-slate-700/50">
                <h3 className="font-medium text-slate-200 capitalize">{status}</h3>
                <p className="text-xs text-slate-400 mt-1">{projects.length} projets</p>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => openModal('project-detail', { projectId: project.id })}
                    className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-emerald-500/50 cursor-pointer transition-all"
                  >
                    <p className="font-medium text-slate-200 text-sm mb-1">{project.title}</p>
                    <p className="text-xs text-slate-400">{project.client.name}</p>
                    <div className="mt-2 w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT CARD - Carte projet réutilisable
// ═══════════════════════════════════════════════════════════════════════════

function ProjectCard({ project, onClick }: { project: any; onClick: () => void }) {
  const statusConfig = {
    active: { label: 'En cours', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    planning: { label: 'Planification', color: 'bg-blue-500', textColor: 'text-blue-400' },
    delayed: { label: 'En retard', color: 'bg-rose-500', textColor: 'text-rose-400' },
    completed: { label: 'Terminé', color: 'bg-slate-500', textColor: 'text-slate-400' },
    'on-hold': { label: 'Suspendu', color: 'bg-amber-500', textColor: 'text-amber-400' },
  };

  const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <div
      onClick={onClick}
      className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-200 mb-1">{project.title}</h3>
          <p className="text-sm text-slate-400">{project.client?.name || project.client}</p>
        </div>
        <div className={cn('px-3 py-1 rounded-full text-xs font-medium', config.color, 'bg-opacity-20', config.textColor)}>
          {config.label}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Progression</p>
          <p className={cn('text-sm font-medium', config.textColor)}>{project.progress}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Bureau</p>
          <p className="text-sm font-medium text-slate-300">{project.bureau}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Équipe</p>
          <p className="text-sm font-medium text-slate-300">{project.teamSize || project.team} pers.</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Budget</p>
          <p className="text-sm font-medium text-slate-300">{((project.budget?.current || project.budget) / 1000000).toFixed(1)}M€</p>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full', config.color)}
          style={{ width: `${project.progress}%` }}
        />
      </div>
    </div>
  );
}

