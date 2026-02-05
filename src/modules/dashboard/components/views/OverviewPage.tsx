/**
 * Page Vue d'ensemble - Executive Overview
 * VERSION 6.0 - ENTERPRISE UI
 * Vue d'ensemble exécutive avec sections organisées et hiérarchie visuelle claire
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  Users,
  Target,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import {
  DataCard,
  RiskScoreCard,
  ActionItem,
  AgendaItem,
  CircuitValidation,
} from '@/components/features/bmo/dashboard/components';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  KPICard,
  type KPICardData,
  MockDataIndicator,
} from '../shared';
import { AlertKPITiles } from '../AlertKPITiles';
import type {
  RiskScoreCardData,
  AgendaItemData,
  ActionItemData,
} from '@/components/features/bmo/dashboard/components';
import type { WorkflowStage } from '@/components/features/bmo/dashboard/components/CircuitValidation';

export function OverviewPage() {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);

  // Données mock (à remplacer par API)
  const summaryKPIs: KPICardData[] = useMemo(
    () => [
      {
        id: 'demandes',
        label: 'Demandes',
        value: 247,
        trend: 12,
        icon: FileCheck,
        color: 'blue',
        description: 'Nombre total de demandes en cours',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '89%',
        trend: 3,
        icon: CheckCircle,
        color: 'emerald',
        description: 'Taux de validation global',
      },
      {
        id: 'budget',
        label: 'Budget traité',
        value: '4.2 Mds',
        trend: 5,
        icon: DollarSign,
        color: 'amber',
        description: 'Montant total du budget traité',
      },
      {
        id: 'bureaux',
        label: 'Bureaux actifs',
        value: 5,
        trend: 0,
        icon: Users,
        color: 'purple',
        description: 'Nombre de bureaux actifs',
      },
    ],
    []
  );

  const topRisks: RiskScoreCardData[] = useMemo(
    () => [
      {
        id: 'risk-1',
        titre: 'Dépassement budgétaire projet Alpha',
        description: 'Risque de dépassement de 15% du budget initial',
        score: 88,
        impact: 'majeur',
        probabilite: 'elevee',
        age: 5,
      },
      {
        id: 'risk-2',
        titre: 'Retard livraison Phase 2',
        description: 'Délai de livraison menacé par manque de ressources',
        score: 72,
        impact: 'moyen',
        probabilite: 'moyenne',
        age: 3,
      },
      {
        id: 'risk-3',
        titre: 'Conformité réglementaire',
        description: 'Vérification de conformité en attente de validation',
        score: 65,
        impact: 'moyen',
        probabilite: 'faible',
        age: 7,
      },
    ],
    []
  );

  const priorityActions: ActionItemData[] = useMemo(
    () => [
      {
        id: 'action-1',
        titre: 'Validation BC-2026-0847',
        type: 'bc',
        priorite: 'critique',
        code: 'BC-2026-0847',
        montant: 2500000,
        deadline: "Aujourd'hui",
        responsable: { nom: 'M. Diallo', id: '1' },
      },
      {
        id: 'action-2',
        titre: 'Approbation contrat B2B',
        type: 'contrat',
        priorite: 'haute',
        code: 'CT-2026-0123',
        montant: 5000000,
        deadline: 'Demain',
        responsable: { nom: 'Mme Martin', id: '2' },
      },
      {
        id: 'action-3',
        titre: 'Arbitrage ressources Phase 3',
        type: 'arbitrage',
        priorite: 'haute',
        deadline: 'Sous 48h',
        responsable: { nom: 'M. Koné', id: '3' },
      },
    ],
    []
  );

  const todayAgenda: AgendaItemData[] = useMemo(
    () => [
      {
        id: 'agenda-1',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        titre: 'Réunion comité de pilotage',
        description: 'Revue mensuelle des projets en cours',
        type: 'meeting',
        priorite: 'urgent',
        participants: ['M. Diallo', 'Mme Martin', 'M. Koné'],
      },
      {
        id: 'agenda-2',
        date: new Date().toISOString().split('T')[0],
        time: '16:30',
        titre: 'Échéance validation BC',
        description: 'Deadline pour validation BC-2026-0847',
        type: 'deadline',
        priorite: 'critique',
      },
    ],
    []
  );

  const validationStages: WorkflowStage[] = useMemo(
    () => [
      {
        id: 'initiales',
        label: 'Demandes initiales',
        count: 247,
        avgTime: 2.1,
        targetTime: 2.5,
        isBottleneck: false,
        color: 'blue',
      },
      {
        id: 'validation-sp',
        label: 'Validation SP',
        count: 202,
        avgTime: 1.8,
        targetTime: 2.2,
        isBottleneck: false,
        color: 'orange',
      },
      {
        id: 'validation-si',
        label: 'Validation SI',
        count: 174,
        avgTime: 1.5,
        targetTime: 2,
        isBottleneck: true,
        color: 'purple',
      },
      {
        id: 'approbation-bmo',
        label: 'Approbation BMO',
        count: 151,
        avgTime: 1.2,
        targetTime: 1.8,
        isBottleneck: false,
        color: 'green',
      },
    ],
    []
  );

  return (
    <div className="relative">
      <MockDataIndicator message="Données mockées - Phase 1 (Backend en attente)" />
      <DashboardPageLayout maxWidth="xl" padding="md">
      {/* Section 1: KPIs Principaux */}
      <DashboardSection
        title="Indicateurs en temps réel"
        subtitle="Vue d'ensemble des KPIs principaux"
        icon={Activity}
      >
        <DashboardGrid columns={4} gap="md">
          {summaryKPIs.map((kpi) => (
            <KPICard
              key={kpi.id}
              kpi={{
                ...kpi,
                onClick: () => openModal('kpi-drilldown', { kpiId: kpi.id }),
              }}
              size="md"
            />
          ))}
        </DashboardGrid>
      </DashboardSection>

      {/* Phase P15: Tuiles KPI Alertes */}
      <DashboardSection
        title="Alertes actives"
        subtitle="Vue d'ensemble des alertes par gravité"
        icon={AlertTriangle}
      >
        <AlertKPITiles />
      </DashboardSection>

      {/* Section 2: Circuit de validation */}
      <DashboardSection
        title="Circuit de validation"
        subtitle="Flux de validation avec goulots d'étranglement"
        icon={Target}
        action={
          <button
            onClick={() => openModal('calendar')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir calendrier
          </button>
        }
      >
        <CircuitValidation stages={validationStages} />
      </DashboardSection>

      {/* Section 3: Actions prioritaires */}
      <DashboardSection
        title="Actions prioritaires"
        subtitle="Actions à traiter en urgence"
        icon={AlertTriangle}
        action={
          <button
            onClick={() => openModal('action-detail')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir tout
          </button>
        }
      >
        <DashboardGrid columns={3} gap="md">
          {priorityActions.map((action) => (
            <ActionItem
              key={action.id}
              action={action}
              onClick={() => openModal('action-detail', { actionId: action.id, action })}
            />
          ))}
        </DashboardGrid>
      </DashboardSection>

      {/* Section 4: Risques critiques */}
      <DashboardSection
        title="Risk Radar"
        subtitle="Suivi des risques, alertes et résolution"
        icon={AlertTriangle}
        action={
          <button
            onClick={() => openModal('risk-detail')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir tout
          </button>
        }
      >
        <DashboardGrid columns={3} gap="md">
          {topRisks.map((risk) => (
            <RiskScoreCard
              key={risk.id}
              risk={risk}
              onClick={() => openModal('risk-detail', { riskId: risk.id, risk })}
            />
          ))}
        </DashboardGrid>
      </DashboardSection>

      {/* Section 5: Agenda exécutif */}
      <DashboardSection
        title="Agenda exécutif"
        subtitle="Événements et échéances à venir"
        icon={Clock}
        action={
          <button
            onClick={() => openModal('calendar')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir calendrier
          </button>
        }
      >
        <DashboardGrid columns={3} gap="md">
          <div className="md:col-span-2">
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 min-h-[200px]">
              <h3 className="font-semibold text-slate-200 mb-3" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>
                Aujourd'hui ({todayAgenda.length} éléments)
              </h3>
              <div className="space-y-3">
                {todayAgenda.map((event) => (
                  <AgendaItem
                    key={event.id}
                    event={event}
                    onClick={() => openModal('agenda-details', { eventId: event.id })}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 min-h-[200px]">
              <h3 className="font-semibold text-slate-200 mb-3" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>
                Rappels prochaines
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                  <span className="text-sm font-semibold text-red-400">24</span>
                  <Badge variant="destructive" className="text-xs">urgent</Badge>
                  <span className="text-xs text-slate-300 flex-1">Deadline Contrat B2B</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                  <span className="text-sm font-semibold text-slate-400">24</span>
                  <span className="text-xs text-slate-300 flex-1">Suivi Facturation</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                  <span className="text-sm font-semibold text-red-400">25</span>
                  <Badge variant="destructive" className="text-xs">urgent</Badge>
                  <span className="text-xs text-slate-300 flex-1">Rapport mensuel BMO</span>
                </div>
              </div>
            </div>
          </div>
        </DashboardGrid>
      </DashboardSection>

      {/* Section 6: Décisions récentes */}
      <DashboardSection
        title="Décisions récentes"
        subtitle="Historique des décisions prises"
        icon={CheckCircle}
        action={
          <button
            onClick={() => openModal('decision-detail')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir l'historique
          </button>
        }
      >
        <DashboardGrid columns={3} gap="md">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
              <h4 className="font-semibold text-slate-200" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>Substitution</h4>
            </div>
            <p className="text-sm text-slate-400 mb-3" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
              Substitution de M. Dupont par Mme Martin pour validation BC-2026-B8Z7.
            </p>
            <button
              onClick={() => openModal('decision-detail')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
            >
              Voir détails <ArrowRight className="inline h-3 w-3 ml-1" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
              <h4 className="font-semibold text-slate-200" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>Délégation</h4>
            </div>
            <p className="text-sm text-slate-400 mb-3" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
              Délégation temporaire du pouvoir de signature pour contrats, 9763-RTU.
            </p>
            <button
              onClick={() => openModal('decision-detail')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
            >
              Voir détails <ArrowRight className="inline h-3 w-3 ml-1" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
              <h4 className="font-semibold text-slate-200" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>Arbitrage</h4>
            </div>
            <p className="text-sm text-slate-400 mb-3" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
              Décision sur l'allocation des ressources entre RDP et BP.
            </p>
            <button
              onClick={() => openModal('decision-detail')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
            >
              Voir détails <ArrowRight className="inline h-3 w-3 ml-1" />
            </button>
          </div>
        </DashboardGrid>
      </DashboardSection>
      </DashboardPageLayout>
    </div>
  );
}

export default OverviewPage;
