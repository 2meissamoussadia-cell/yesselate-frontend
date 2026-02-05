/**
 * Modales du Projets Command Center
 * Ensemble complet des modales pour la gestion des projets
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useProjetsCommandCenterStore,
  type ProjetsModalType,
} from '@/lib/stores/projetsCommandCenterStore';
import {
  X,
  Briefcase,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  Printer,
  Share2,
  Star,
  Milestone,
  GitBranch,
  Flag,
  DollarSign,
  Play,
  Pause,
  ArrowRight,
  ExternalLink,
  Building2,
  Activity,
  PieChart,
  Layers,
  Filter,
  Settings,
  Keyboard,
  Search,
  FileText,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  Check,
  Info,
  ShieldAlert,
  TrendingDown as TrendDown,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Send,
  XCircle,
  UserPlus,
  CalendarDays,
  FolderOpen,
} from 'lucide-react';

// Import mock data for modals
import { mockProjects, type Project } from '@/lib/mocks/projets/mockProjects';
import { mockMilestones, getMilestonesByProject } from '@/lib/mocks/projets/mockMilestones';
import { mockTeamMembers, getAvailableMembers } from '@/lib/mocks/projets/mockTeams';

// Import advanced modals
import {
  ResolutionWizardModal,
  DecisionCenterModal,
  GanttViewModal,
} from './modals/AdvancedModals';

// ═══════════════════════════════════════════════════════════════════════════
// MODAL WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function ModalWrapper({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-emerald-400',
  size = 'md',
  children,
  footer,
}: ModalWrapperProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl',
          'max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <Icon className={cn('w-5 h-5', iconColor)} />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
              {subtitle && (
                <p className="text-sm text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER - Format Currency
// ═══════════════════════════════════════════════════════════════════════════

const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M`;
  return `${(amount / 1_000).toFixed(0)} K`;
};

// ═══════════════════════════════════════════════════════════════════════════
// STATS MODAL
// ═══════════════════════════════════════════════════════════════════════════

function StatsModal() {
  const { modal, closeModal, stats } = useProjetsCommandCenterStore();

  if (modal.type !== 'stats') return null;

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Statistiques Projets"
      subtitle="Vue d'ensemble des indicateurs clés"
      icon={BarChart3}
      iconColor="text-purple-400"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Fermer
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* KPIs principaux */}
        <div className="grid grid-cols-4 gap-4">
          <StatKPI icon={Briefcase} label="Total Projets" value={stats?.total ?? 0} color="blue" />
          <StatKPI icon={Play} label="En cours" value={stats?.active ?? 0} trend={+2} color="emerald" />
          <StatKPI icon={AlertTriangle} label="En retard" value={stats?.delayed ?? 0} trend={-1} color="rose" />
          <StatKPI icon={Target} label="Livraison à temps" value={`${stats?.onTimeDelivery ?? 0}%`} color="emerald" />
        </div>

        {/* Budget */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Budget Total</span>
            </div>
            <p className="text-xl font-bold text-slate-200">{formatCurrency(stats?.totalBudget ?? 0)}</p>
            <p className="text-xs text-slate-400 mt-1">FCFA</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Consommé</span>
            </div>
            <p className="text-xl font-bold text-slate-200">{formatCurrency(stats?.budgetConsumed ?? 0)}</p>
            <p className="text-xs text-amber-400 mt-1">{stats?.avgBudgetUsage}%</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Équipes</span>
            </div>
            <p className="text-xl font-bold text-slate-200">{stats?.teamSize ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">Personnes mobilisées</p>
          </div>
        </div>

        {/* Répartitions */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Par bureau
            </h3>
            <div className="space-y-3">
              {stats?.byBureau.map((b) => (
                <div key={b.bureau} className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-12">{b.bureau}</span>
                  <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: `${(b.count / (stats?.total || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-200 w-8 text-right">{b.count}</span>
                  {b.delayed > 0 && (
                    <Badge variant="destructive" className="text-xs">{b.delayed}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Par type
            </h3>
            <div className="space-y-3">
              {stats?.byType.map((t, idx) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500'];
                return (
                  <div key={t.type} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-28 truncate">{t.type}</span>
                    <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', colors[idx % colors.length])}
                        style={{ width: `${(t.count / (stats?.total || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-200 w-8 text-right">{t.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════

function ProjectDetailModal() {
  const { modal, closeModal, openModal } = useProjetsCommandCenterStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'team' | 'budget' | 'documents'>('overview');

  if (modal.type !== 'project-detail') return null;

  const project = modal.data.project as any;
  if (!project) return null;

  const budgetPercent = project.budgetUsed && project.budget 
    ? Math.round((project.budgetUsed / project.budget) * 100) 
    : 0;
  
  const milestones = getMilestonesByProject(project.id);

  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: Eye },
    { id: 'milestones', label: 'Jalons', icon: Milestone, count: milestones.length },
    { id: 'team', label: 'Équipe', icon: Users, count: project.team || project.teamSize },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'documents', label: 'Documents', icon: FileText, count: project.documentsCount || 0 },
  ];

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title={project.title}
      subtitle={project.client?.name || project.client}
      icon={Briefcase}
      iconColor="text-emerald-400"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Fermer
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => openModal('milestone', { projectId: project.id })}>
            <Milestone className="w-4 h-4" />
            Gérer jalons
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Edit3 className="w-4 h-4" />
            Modifier
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Status Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant={project.status === 'delayed' ? 'destructive' : project.status === 'active' ? 'default' : 'gray'}
            className="text-sm"
          >
            {project.status === 'active' ? 'En cours' : project.status === 'delayed' ? 'En retard' : project.status === 'completed' ? 'Terminé' : project.status}
          </Badge>
          {project.priority === 'high' && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Prioritaire
            </Badge>
          )}
          {(project.risk === 'high' || project.riskLevel === 'high') && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Risque élevé
            </Badge>
          )}
          <Badge variant="default" className="text-slate-400 border-slate-600">
            {project.id || project.code}
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'text-emerald-400 border-emerald-400'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    activeTab === tab.id ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Avancement global</span>
                <span className={cn(
                  'text-lg font-bold',
                  project.progress >= 70 ? 'text-emerald-400' : project.progress >= 40 ? 'text-amber-400' : 'text-slate-400'
                )}>
                  {project.progress}%
                </span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    project.progress >= 70 ? 'bg-emerald-500' : project.progress >= 40 ? 'bg-amber-500' : 'bg-slate-500'
                  )}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              <MetricCard icon={MapPin} label="Bureau" value={project.bureau} />
              <MetricCard icon={Users} label="Équipe" value={`${project.team || project.teamSize || 0} pers.`} />
              <MetricCard 
                icon={Milestone} 
                label="Jalons" 
                value={`${project.completedMilestones || milestones.filter(m => m.status === 'completed').length}/${project.milestones || project.milestonesTotal || milestones.length}`} 
              />
              <MetricCard icon={Layers} label="Type" value={project.type} />
            </div>

            {/* Budget & Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  Budget
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Alloué</p>
                    <p className="text-lg font-bold text-slate-200">{formatCurrency(project.budget?.current || project.budget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Consommé</p>
                    <p className={cn(
                      'text-lg font-bold',
                      budgetPercent > 90 ? 'text-rose-400' : budgetPercent > 75 ? 'text-amber-400' : 'text-emerald-400'
                    )}>
                      {budgetPercent}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Dates
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Début</p>
                    <p className="text-sm font-medium text-slate-200">
                      {new Date(project.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Fin prévue</p>
                    <p className="text-sm font-medium text-slate-200">
                      {new Date(project.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Description</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-3">
            {milestones.length > 0 ? (
              milestones.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    m.status === 'completed'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : m.status === 'delayed'
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : m.status === 'in-progress'
                      ? 'border-blue-500/30 bg-blue-500/5'
                      : 'border-slate-700/50 bg-slate-800/30'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-1.5 rounded-lg',
                        m.status === 'completed' ? 'bg-emerald-500/20' :
                        m.status === 'delayed' ? 'bg-rose-500/20' :
                        m.status === 'in-progress' ? 'bg-blue-500/20' :
                        'bg-slate-700/50'
                      )}>
                        {m.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : m.status === 'delayed' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{m.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {new Date(m.plannedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </p>
                      <Badge
                        variant={m.status === 'completed' ? 'default' : m.status === 'delayed' ? 'destructive' : 'gray'}
                        className="mt-1 text-xs"
                      >
                        {m.progress}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Milestone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Aucun jalon défini pour ce projet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{project.teamSize || project.team || 0} membres affectés</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => openModal('team-assign', { projectId: project.id })}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Gérer l'équipe
            </Button>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="text-center py-8">
            <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Budget: {formatCurrency(project.budget?.current || project.budget)} FCFA</p>
            <p className="text-xs text-slate-600 mt-1">Consommé: {budgetPercent}%</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{project.documentsCount || 0} documents</p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW PROJECT MODAL
// ═══════════════════════════════════════════════════════════════════════════

function NewProjectModal() {
  const { modal, closeModal } = useProjetsCommandCenterStore();
  const [step, setStep] = useState(1);
  const [bureau, setBureau] = useState('');
  const [projectType, setProjectType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [chefProjet, setChefProjet] = useState('');

  if (modal.type !== 'new-project') return null;

  const steps = [
    { id: 1, label: 'Informations' },
    { id: 2, label: 'Budget & Dates' },
    { id: 3, label: 'Équipe' },
    { id: 4, label: 'Confirmation' },
  ];

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Nouveau Projet"
      subtitle={`Étape ${step} sur ${steps.length}`}
      icon={Plus}
      iconColor="text-emerald-400"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Précédent
            </Button>
          )}
          {step < steps.length ? (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(step + 1)}>
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Check className="w-4 h-4" />
              Créer le projet
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step >= s.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                )}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={cn(
                  'text-sm hidden sm:block',
                  step >= s.id ? 'text-slate-200' : 'text-slate-400'
                )}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-px mx-4',
                  step > s.id ? 'bg-emerald-500' : 'bg-slate-700'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Titre du projet *</label>
              <Input placeholder="Ex: Construction école primaire..." className="bg-slate-800/50 border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Bureau *</label>
                <Select value={bureau || '__none__'} onValueChange={(v) => setBureau(v === '__none__' ? '' : v)}>
                  <SelectTrigger className="w-full h-10 rounded-lg bg-slate-800/50 border-slate-700 text-slate-200 text-sm">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <SelectItem value="__none__">Sélectionner...</SelectItem>
                    <SelectItem value="BF">BF - Burkina Faso</SelectItem>
                    <SelectItem value="BM">BM - Mali</SelectItem>
                    <SelectItem value="BJ">BJ - Bénin</SelectItem>
                    <SelectItem value="BCT">BCT - Côte d'Ivoire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Type *</label>
                <Select value={projectType || '__none__'} onValueChange={(v) => setProjectType(v === '__none__' ? '' : v)}>
                  <SelectTrigger className="w-full h-10 rounded-lg bg-slate-800/50 border-slate-700 text-slate-200 text-sm">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <SelectItem value="__none__">Sélectionner...</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Bâtiment">Bâtiment</SelectItem>
                    <SelectItem value="Ouvrage d'art">Ouvrage d'art</SelectItem>
                    <SelectItem value="Aménagement">Aménagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Client *</label>
              <Input placeholder="Nom du client..." className="bg-slate-800/50 border-slate-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Description</label>
              <textarea 
                rows={3}
                placeholder="Description du projet..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 text-sm resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Budget initial (FCFA) *</label>
                <Input type="number" placeholder="0" className="bg-slate-800/50 border-slate-700" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Priorité *</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-full h-10 rounded-lg bg-slate-800/50 border-slate-700 text-slate-200 text-sm">
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="low">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Date de début *</label>
                <Input type="date" className="bg-slate-800/50 border-slate-700" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Date de fin prévue *</label>
                <Input type="date" className="bg-slate-800/50 border-slate-700" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Chef de projet *</label>
              <Select value={chefProjet || '__none__'} onValueChange={(v) => setChefProjet(v === '__none__' ? '' : v)}>
                <SelectTrigger className="w-full h-10 rounded-lg bg-slate-800/50 border-slate-700 text-slate-200 text-sm">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  <SelectItem value="__none__">Sélectionner...</SelectItem>
                  {mockTeamMembers.filter(m => m.role === 'chef_projet').map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName} - {m.bureau}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Membres de l'équipe</label>
              <p className="text-xs text-slate-400 mb-3">Vous pourrez ajouter des membres après la création du projet.</p>
              <div className="p-4 rounded-lg border border-dashed border-slate-700 text-center">
                <UserPlus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucun membre ajouté</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Prêt à créer</h3>
              <p className="text-sm text-slate-400">
                Vérifiez les informations avant de créer le projet.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Titre:</span>
                <span className="text-slate-200">Nouveau projet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Bureau:</span>
                <span className="text-slate-200">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Type:</span>
                <span className="text-slate-200">-</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MODAL
// ═══════════════════════════════════════════════════════════════════════════

function ExportModal() {
  const { modal, closeModal } = useProjetsCommandCenterStore();
  const [selectedFormat, setSelectedFormat] = useState('Excel');

  if (modal.type !== 'export') return null;

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Exporter les données"
      subtitle="Choisissez le format et les options d'export"
      icon={Download}
      iconColor="text-blue-400"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Format</label>
          <div className="grid grid-cols-3 gap-2">
            {['Excel', 'PDF', 'CSV'].map((format) => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={cn(
                  'p-3 rounded-lg border transition-all text-center',
                  selectedFormat === format
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-slate-600'
                )}
              >
                <p className="text-sm font-medium">{format}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Inclure</label>
          <div className="space-y-2">
            {[
              { label: 'Résumé général', checked: true },
              { label: 'Détails des projets', checked: true },
              { label: 'Budget et finances', checked: true },
              { label: 'Timeline et jalons', checked: false },
              { label: 'Équipes et ressources', checked: false },
            ].map((option) => (
              <label key={option.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 cursor-pointer">
                <input type="checkbox" defaultChecked={option.checked} className="rounded border-slate-600" />
                <span className="text-sm text-slate-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE MODAL
// ═══════════════════════════════════════════════════════════════════════════

function MilestoneModal() {
  const { modal, closeModal } = useProjetsCommandCenterStore();

  if (modal.type !== 'milestone') return null;

  const projectId = modal.data.projectId as string;
  const milestones = projectId ? getMilestonesByProject(projectId) : mockMilestones.slice(0, 10);

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Gestion des Jalons"
      subtitle={projectId ? `Projet ${projectId}` : 'Tous les jalons'}
      icon={Milestone}
      iconColor="text-cyan-400"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Fermer
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            Nouveau jalon
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
            <p className="text-xl font-bold text-slate-200">{milestones.length}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center">
            <p className="text-xl font-bold text-emerald-400">{milestones.filter(m => m.status === 'completed').length}</p>
            <p className="text-xs text-slate-400">Complétés</p>
          </div>
          <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-center">
            <p className="text-xl font-bold text-blue-400">{milestones.filter(m => m.status === 'in-progress').length}</p>
            <p className="text-xs text-slate-400">En cours</p>
          </div>
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-center">
            <p className="text-xl font-bold text-rose-400">{milestones.filter(m => m.status === 'delayed').length}</p>
            <p className="text-xs text-slate-400">En retard</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 p-3 rounded-lg border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                m.status === 'completed' ? 'bg-emerald-500/20' :
                m.status === 'delayed' ? 'bg-rose-500/20' :
                m.status === 'in-progress' ? 'bg-blue-500/20' :
                'bg-slate-700/50'
              )}>
                {m.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : m.status === 'delayed' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : m.status === 'in-progress' ? (
                  <Play className="w-5 h-5 text-blue-400" />
                ) : (
                  <Clock className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{m.title}</p>
                <p className="text-xs text-slate-400">{m.owner} • {m.category}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">
                  {new Date(m.plannedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </p>
                <div className="w-16 h-1.5 bg-slate-700/50 rounded-full mt-1 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      m.status === 'completed' ? 'bg-emerald-500' :
                      m.status === 'delayed' ? 'bg-rose-500' :
                      'bg-blue-500'
                    )}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300">
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEAM ASSIGN MODAL
// ═══════════════════════════════════════════════════════════════════════════

function TeamAssignModal() {
  const { modal, closeModal } = useProjetsCommandCenterStore();
  const [searchQuery, setSearchQuery] = useState('');

  if (modal.type !== 'team-assign') return null;

  const availableMembers = getAvailableMembers(20);
  const filteredMembers = searchQuery
    ? availableMembers.filter(m => 
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableMembers;

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Affectation d'équipe"
      subtitle="Gérer les membres du projet"
      icon={Users}
      iconColor="text-purple-400"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700"
          />
        </div>

        {/* Available Members */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">
            Membres disponibles ({filteredMembers.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                  {m.firstName[0]}{m.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-slate-400">{m.roleLabel} • {m.department}</p>
                </div>
                <div className="text-right">
                  <Badge variant="default" className={cn(
                    'text-xs',
                    m.availability > 50 ? 'text-emerald-400 border-emerald-500/30' :
                    m.availability > 20 ? 'text-amber-400 border-amber-500/30' :
                    'text-slate-400 border-slate-600'
                  )}>
                    {m.availability}% dispo
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTERS MODAL
// ═══════════════════════════════════════════════════════════════════════════

function FiltersModal() {
  const { modal, closeModal, filters, setFilter, resetFilters } = useProjetsCommandCenterStore();

  if (modal.type !== 'filters') return null;

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Filtres avancés"
      subtitle="Affiner la recherche de projets"
      icon={Filter}
      iconColor="text-blue-400"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={resetFilters}>
            Réinitialiser
          </Button>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={closeModal}>
            <Check className="w-4 h-4" />
            Appliquer
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Statut */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Statut</label>
          <div className="flex flex-wrap gap-2">
            {['active', 'planning', 'delayed', 'completed', 'on-hold'].map((status) => (
              <button
                key={status}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm border transition-all',
                  filters.status.includes(status as any)
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                )}
                onClick={() => {
                  const newStatus = filters.status.includes(status as any)
                    ? filters.status.filter(s => s !== status)
                    : [...filters.status, status as any];
                  setFilter('status', newStatus);
                }}
              >
                {status === 'active' ? 'En cours' :
                 status === 'planning' ? 'Planification' :
                 status === 'delayed' ? 'En retard' :
                 status === 'completed' ? 'Terminé' :
                 'Suspendu'}
              </button>
            ))}
          </div>
        </div>

        {/* Bureau */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Bureau</label>
          <div className="flex flex-wrap gap-2">
            {['BF', 'BM', 'BJ', 'BCT'].map((bureau) => (
              <button
                key={bureau}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm border transition-all',
                  filters.bureaux.includes(bureau)
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                )}
                onClick={() => {
                  const newBureaux = filters.bureaux.includes(bureau)
                    ? filters.bureaux.filter(b => b !== bureau)
                    : [...filters.bureaux, bureau];
                  setFilter('bureaux', newBureaux);
                }}
              >
                {bureau}
              </button>
            ))}
          </div>
        </div>

        {/* Priorité */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Priorité</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'high', label: 'Haute', color: 'rose' },
              { id: 'medium', label: 'Moyenne', color: 'amber' },
              { id: 'low', label: 'Basse', color: 'slate' },
            ].map((p) => (
              <button
                key={p.id}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm border transition-all',
                  filters.priority.includes(p.id as any)
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                )}
                onClick={() => {
                  const newPriority = filters.priority.includes(p.id as any)
                    ? filters.priority.filter(pr => pr !== p.id)
                    : [...filters.priority, p.id as any];
                  setFilter('priority', newPriority);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHORTCUTS MODAL
// ═══════════════════════════════════════════════════════════════════════════

function ShortcutsModal() {
  const { modal, closeModal } = useProjetsCommandCenterStore();

  if (modal.type !== 'shortcuts') return null;

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Ouvrir la palette de commandes' },
    { keys: ['⌘', 'B'], description: 'Basculer la sidebar' },
    { keys: ['F11'], description: 'Mode plein écran' },
    { keys: ['Alt', '←'], description: 'Retour arrière' },
    { keys: ['Esc'], description: 'Fermer les panneaux' },
    { keys: ['⌘', 'N'], description: 'Nouveau projet' },
    { keys: ['⌘', 'F'], description: 'Rechercher' },
    { keys: ['⌘', 'E'], description: 'Exporter' },
  ];

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Raccourcis clavier"
      subtitle="Accélérez votre navigation"
      icon={Keyboard}
      iconColor="text-amber-400"
      size="sm"
      footer={
        <Button variant="outline" onClick={closeModal}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-2">
        {shortcuts.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/30">
            <span className="text-sm text-slate-300">{s.description}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((key, kidx) => (
                <React.Fragment key={kidx}>
                  <kbd className="px-2 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded border border-slate-700">
                    {key}
                  </kbd>
                  {kidx < s.keys.length - 1 && <span className="text-slate-600">+</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════

function SettingsModal() {
  const { modal, closeModal, autoRefresh, setAutoRefresh, refreshInterval, setRefreshInterval } = useProjetsCommandCenterStore();

  if (modal.type !== 'settings') return null;

  return (
    <ModalWrapper
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Paramètres"
      subtitle="Configurer l'affichage"
      icon={Settings}
      iconColor="text-slate-400"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Fermer
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">Rafraîchissement auto</p>
            <p className="text-xs text-slate-400">Mettre à jour les données automatiquement</p>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              autoRefresh ? 'bg-emerald-500' : 'bg-slate-700'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
              autoRefresh ? 'left-5' : 'left-0.5'
            )} />
          </button>
        </div>

        {autoRefresh && (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Intervalle de rafraîchissement
            </label>
            <Select
              value={String(refreshInterval)}
              onValueChange={(v) => setRefreshInterval(Number(v))}
            >
              <SelectTrigger className="w-full h-10 rounded-lg bg-slate-800/50 border-slate-700 text-slate-200 text-sm">
                <SelectValue placeholder="Intervalle" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <SelectItem value="15000">15 secondes</SelectItem>
                <SelectItem value="30000">30 secondes</SelectItem>
                <SelectItem value="60000">1 minute</SelectItem>
                <SelectItem value="300000">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function StatKPI({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: number;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', colorClasses[color])} />
          <span className="text-xs text-slate-400">{label}</span>
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className="flex items-center gap-1 text-xs">
            {trend > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">+{trend}</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-rose-400" />
                <span className="text-rose-400">{trend}</span>
              </>
            )}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-200 mt-2">{value}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/20">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export function ProjetsModals() {
  const { modal, closeModal } = useProjetsCommandCenterStore();

  return (
    <>
      <StatsModal />
      <ProjectDetailModal />
      <ExportModal />
      <NewProjectModal />
      <MilestoneModal />
      <TeamAssignModal />
      <FiltersModal />
      <ShortcutsModal />
      <SettingsModal />
      
      {/* Advanced Modals */}
      <ResolutionWizardModal
        isOpen={modal.type === 'resolution-wizard' && modal.isOpen}
        onClose={closeModal}
        projectId={modal.data?.projectId as string | undefined}
        projectTitle={modal.data?.projectTitle as string | undefined}
      />
      <DecisionCenterModal
        isOpen={modal.type === 'decision-center' && modal.isOpen}
        onClose={closeModal}
      />
      <GanttViewModal
        isOpen={modal.type === 'gantt-view' && modal.isOpen}
        onClose={closeModal}
      />
    </>
  );
}
