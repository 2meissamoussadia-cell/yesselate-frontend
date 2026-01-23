/**
 * Vue stratégique - Onglet 1
 * Tableau de bord consolidé offrant une vision d'ensemble immédiate
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  Wallet,
  Calendar,
  AlertTriangle,
  Clock,
  TrendingUp,
  Bell,
  ShieldCheck,
  Target,
  AlertOctagon,
  ChevronRight,
  Play,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Données mock pour la démo
const strategicKPIs = [
  {
    id: 'projects-active',
    label: 'Projets actifs',
    value: 24,
    subValue: '12 on-track, 8 at-risk, 4 late',
    icon: FolderKanban,
    status: 'neutral' as const,
  },
  {
    id: 'budget-consumed',
    label: 'Budget consommé',
    value: '67%',
    subValue: '12.5M€ / 18.7M€',
    icon: Wallet,
    status: 'warning' as const,
  },
  {
    id: 'milestones-late',
    label: 'Jalons en retard',
    value: 5,
    subValue: '> 7 jours',
    icon: Calendar,
    status: 'warning' as const,
  },
  {
    id: 'risks-critical',
    label: 'Risques critiques',
    value: 3,
    subValue: 'Exposition: 450K€',
    icon: AlertTriangle,
    status: 'critical' as const,
  },
  {
    id: 'validations-pending',
    label: 'Validations en attente',
    value: 12,
    subValue: 'Bloqué: 1.2M€',
    icon: Clock,
    status: 'warning' as const,
  },
  {
    id: 'resources-utilization',
    label: 'Taux utilisation',
    value: '84%',
    subValue: 'RH & Matériel',
    icon: TrendingUp,
    status: 'success' as const,
  },
  {
    id: 'alerts-unread',
    label: 'Alertes non lues',
    value: 8,
    subValue: '3 escaladées',
    icon: Bell,
    status: 'warning' as const,
  },
  {
    id: 'sla-compliance',
    label: 'Conformité SLA',
    value: '96%',
    subValue: '5 en dépassement',
    icon: ShieldCheck,
    status: 'success' as const,
  },
];

const urgentDecisions = [
  {
    id: '1',
    ref: 'DEC-2024-089',
    title: 'Validation avenant budget lot 3',
    deadline: '12/01',
    impact: 'high' as const,
    type: 'budget',
    blocked: false,
  },
  {
    id: '2',
    ref: 'DEC-2024-090',
    title: 'Prolongation délai phase 2',
    deadline: '14/01',
    impact: 'medium' as const,
    type: 'planning',
    blocked: true,
  },
  {
    id: '3',
    ref: 'DEC-2024-091',
    title: 'Remplacement sous-traitant électricité',
    deadline: '15/01',
    impact: 'high' as const,
    type: 'contract',
    blocked: false,
  },
];

const activeEscalations = [
  {
    id: '1',
    ref: 'ESC-001',
    title: 'Retard livraison matériaux site B',
    level: 2,
    daysOpen: 5,
    origin: 'Centre d\'alertes',
    module: 'alertes',
  },
  {
    id: '2',
    ref: 'ESC-002',
    title: 'Dossier bloqué - Validation BC #2847',
    level: 3,
    daysOpen: 2,
    origin: 'Dossiers bloqués',
    module: 'blocked',
  },
  {
    id: '3',
    ref: 'ESC-003',
    title: 'Substitution non résolue - Projet Alpha',
    level: 2,
    daysOpen: 4,
    origin: 'Substitution',
    module: 'substitution',
  },
];

const criticalProjects = [
  {
    id: '1',
    name: 'Projet Alpha - Tours Horizon',
    progress: 45,
    status: 'at-risk' as const,
    budget: '12.5M€',
    delay: '+15j',
    type: 'delay',
  },
  {
    id: '2',
    name: 'Projet Beta - Centre Commercial',
    progress: 72,
    status: 'on-track' as const,
    budget: '8.2M€',
    delay: '0j',
    type: 'vip',
  },
  {
    id: '3',
    name: 'Projet Gamma - Résidence Verte',
    progress: 28,
    status: 'late' as const,
    budget: '5.8M€',
    delay: '+32j',
    type: 'delay',
  },
];

export function StrategicViewView() {
  const { navigate, openModal } = useGovernanceCommandCenterStore();

  return (
    <div className="p-4 space-y-4">
      {/* KPIs stratégiques consolidés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {strategicKPIs.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      kpi.status === 'critical'
                        ? 'text-red-400'
                        : kpi.status === 'warning'
                        ? 'text-amber-400'
                        : kpi.status === 'success'
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    )}
                  />
                  <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
                </div>
              </div>
              <div className="mb-1">
                <div
                  className={cn(
                    'text-2xl font-bold',
                    kpi.status === 'critical'
                      ? 'text-red-400'
                      : kpi.status === 'warning'
                      ? 'text-amber-400'
                      : kpi.status === 'success'
                      ? 'text-emerald-400'
                      : 'text-slate-200'
                  )}
                >
                  {kpi.value}
                </div>
              </div>
              <div className="text-xs text-slate-500">{kpi.subValue}</div>
            </div>
          );
        })}
      </div>

      {/* Section Décisions & Escalades */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Décisions à prendre */}
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
              onClick={() => navigate('decisions-arbitrages' as any)}
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
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-1 h-8 rounded-full',
                      decision.impact === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-300 truncate">{decision.title}</p>
                      {decision.blocked && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          Bloqué
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{decision.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{decision.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      decision.impact === 'high' ? 'text-red-400' : 'text-slate-400'
                    )}
                  >
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
              onClick={() => navigate('escalades-blocages' as any)}
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
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                    <span className="text-sm font-bold text-red-400">N{esc.level}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300 truncate">{esc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{esc.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{esc.origin}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-red-400 font-medium">{esc.daysOpen}j ouverts</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Projets à surveiller */}
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
            onClick={() => navigate('projets-sensibles' as any)}
          >
            Voir tout
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Projet
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Avancement
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Statut
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Budget
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Écart délai
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                  Actions
                </th>
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-300">{project.name}</span>
                      {project.type === 'vip' && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          VIP
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
                            project.status === 'on-track'
                              ? 'bg-emerald-500'
                              : project.status === 'at-risk'
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
                      {project.status === 'on-track'
                        ? 'En bonne voie'
                        : project.status === 'at-risk'
                        ? 'À risque'
                        : 'En retard'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">{project.budget}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        project.delay === '0j' ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {project.delay}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-slate-500 hover:text-slate-300"
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

      {/* Actions rapides */}
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="text-xs border-slate-700 text-slate-400 hover:text-slate-300"
          onClick={() => navigate('decisions-arbitrages' as any)}
        >
          <FileText className="h-3 w-3 mr-1.5" />
          Générer synthèse
        </Button>
      </div>
    </div>
  );
}
