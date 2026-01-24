/**
 * Vue d'ensemble du Dashboard - Version Réorganisée
 * Dashboard principal avec 10 sections organisées, KPIs harmonisés et UX améliorée
 * v4.0 - Réorganisation complète de l'UX et structure visuelle
 */

'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ArrowRight,
  BarChart3,
  Users,
  Wallet,
  FileCheck,
  Building2,
  DollarSign,
  User,
  AlertCircle,
  FileText,
  Scale,
  Eye,
  Calendar,
  GitBranch,
  Search,
  Activity,
  Shield,
  Target,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';
import { useLogger } from '@/lib/utils/logger';

// Composants réutilisables
import {
  KPICard,
  SectionTitle,
  TrendIndicator,
  DataCard,
  RiskScoreCard,
  AgendaItem,
  ActionItem,
  CircuitValidation,
} from '@/components/features/bmo/dashboard/components';
import type {
  KPICardData,
  RiskScoreCardData,
  AgendaItemData,
  ActionItemData,
} from '@/components/features/bmo/dashboard/components';
import type { WorkflowStage } from '@/components/features/bmo/dashboard/components/CircuitValidation';

// ============================================
// TYPES & INTERFACES
// ============================================

type BureauCode = 'BF' | 'BCG' | 'BJA' | 'BOP' | 'BCT' | 'BJ' | 'BMO';

interface Decision {
  id: string;
  code: string;
  type: 'substitution' | 'delegation' | 'arbitrage' | 'validation';
  titre: string;
  description: string;
  status: 'en_attente' | 'executee' | 'rejetee';
  demandeur: {
    nom: string;
    bureau: BureauCode;
  };
  impact: string;
  dateCreation: string;
  dateExecution?: string;
}

// ============================================
// DONNÉES MOCK
// ============================================

const mockKPIs: KPICardData[] = [
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
    value: '4.2 Mds FCFA', 
    trend: -2, 
    icon: Wallet, 
    color: 'amber',
    description: 'Montant total du budget traité',
  },
  { 
    id: 'bureaux', 
    label: 'Bureaux actifs', 
    value: 12, 
    trend: 0, 
    icon: Users, 
    color: 'purple',
    description: 'Nombre de bureaux actifs',
  },
];

const workflowStages: WorkflowStage[] = [
  {
    id: 'initiated',
    label: 'Demandes Initiées',
    count: 247,
    color: 'blue',
    avgTime: 0,
    targetTime: 0,
    isBottleneck: false,
  },
  {
    id: 'bf',
    label: 'Validation BF',
    count: 202,
    color: 'blue',
    bureau: 'BF',
    avgTime: 0.8,
    targetTime: 0.5,
    isBottleneck: true,
  },
  {
    id: 'bj',
    label: 'Validation BJ',
    count: 174,
    color: 'purple',
    bureau: 'BJ',
    avgTime: 0.6,
    targetTime: 0.5,
    isBottleneck: false,
  },
  {
    id: 'bmo',
    label: 'Approuvé BMO',
    count: 151,
    color: 'green',
    bureau: 'BMO',
    avgTime: 0.4,
    targetTime: 0.3,
    isBottleneck: false,
  },
];

const actionsPrioritaires: ActionItemData[] = [
  {
    id: 'AP-001',
    titre: 'Contrat sous-traitance électricité',
    type: 'contrat',
    bureau: 'BJA',
    code: 'J-5',
    priorite: 'critique',
    projet: {
      id: 'PRJ-0018',
      nom: 'Villa Diamniadio',
    },
    montant: 8200000,
    deadline: 'Aujourd\'hui 17h',
    responsable: {
      nom: 'N. FAYE',
      id: 'EMP-008',
    },
    contexte: 'Contrat béton SOCOCIM pour coulage dalle lundi. Validation urgente requise.',
    impact: 'Retard livraison 5 jours → Pénalités client 2M FCFA',
  },
  {
    id: 'AP-002',
    titre: 'Conflit ressources Lot 4',
    type: 'arbitrage',
    bureau: 'BOP',
    code: '5j',
    priorite: 'haute',
    projet: {
      id: 'PRJ-0018',
      nom: 'Villa Diamniadio',
    },
    deadline: 'Demain 12h',
    responsable: {
      nom: 'C. GUEYE',
      id: 'EMP-007',
    },
    contexte: 'Chevauchement équipes maçonnerie entre Lot 4 et chantier Almadies',
    impact: 'Blocage avancement Lot 4 → Retard 3 jours',
  },
  {
    id: 'AP-003',
    titre: 'Paiement fournisseur ACME',
    type: 'paiement',
    bureau: 'BCG',
    code: '3j retard',
    priorite: 'haute',
    projet: {
      id: 'PRJ-0017',
      nom: 'Route Zone B',
    },
    montant: 4500000,
    deadline: 'Échue il y a 3j',
    responsable: {
      nom: 'F. DIOP',
      id: 'EMP-004',
    },
    contexte: 'Facture ACME matériaux routiers échue. Risque suspension livraisons.',
    impact: 'Pénalités 150K FCFA + suspension fournisseur',
  },
];

const risksRadar: RiskScoreCardData[] = [
  {
    id: 'R-001',
    titre: 'BC bloqué depuis 5 jours',
    description: 'BC-2025-0041 (2.8M FCFA) bloqué au BF depuis 5 jours. Risque rupture stock chantier Diamniadio.',
    source: 'BF',
    score: 92,
    impact: 'majeur',
    probabilite: 'elevee',
    age: 5,
    projet: {
      id: 'PRJ-0018',
      nom: 'Villa Diamniadio',
    },
  },
  {
    id: 'R-002',
    titre: 'Retard paiement fournisseur',
    description: 'Facture ACME non réglée depuis 3 jours. Risque suspension livraisons.',
    source: 'BCG',
    score: 88,
    impact: 'majeur',
    probabilite: 'elevee',
    age: 3,
    projet: {
      id: 'PRJ-0017',
      nom: 'Route Zone B',
    },
  },
  {
    id: 'R-003',
    titre: 'Contrat expirant',
    description: 'Contrat sous-traitance BCT expirant dans 7 jours. Renouvellement non initié.',
    source: 'BJA',
    score: 72,
    impact: 'moyen',
    probabilite: 'moyenne',
    age: 0,
    projet: {
      id: 'PRJ-0018',
      nom: 'Villa Diamniadio',
    },
  },
];

const agendaJ7: AgendaItemData[] = [
  {
    id: 'EVT-001',
    date: '2025-12-24',
    time: '17:00',
    titre: 'Deadline Contrat BJA',
    description: 'Contrat sous-traitance électricité',
    type: 'deadline',
    priorite: 'critique',
    bureau: 'BJA',
    projet: 'PRJ-0018',
  },
  {
    id: 'EVT-002',
    date: '2025-12-24',
    time: '10:00',
    titre: 'Réunion coordination',
    description: 'Salle A - Tous bureaux',
    type: 'meeting',
    priorite: 'normal',
  },
  {
    id: 'EVT-003',
    date: '2025-12-25',
    time: '09:00',
    titre: 'Rapport mensuel BMO',
    description: 'À soumettre avant 12h',
    type: 'deadline',
    priorite: 'urgent',
    bureau: 'BMO',
  },
];

const decisions: Decision[] = [
  {
    id: 'DEC-001',
    code: 'DÉC-2024-001',
    type: 'substitution',
    titre: 'Substitution validation BC urgente',
    description: 'Substitution validation BC urgente',
    status: 'en_attente',
    demandeur: {
      nom: 'F. DIOP',
      bureau: 'BF',
    },
    impact: 'Déblocage sous 24h',
    dateCreation: '2026-01-18T17:18:23.433Z',
  },
  {
    id: 'DEC-002',
    code: 'DÉC-2024-002',
    type: 'delegation',
    titre: 'Délégation pouvoir signature',
    description: 'Délégation pouvoir signature',
    status: 'executee',
    demandeur: {
      nom: 'A. DIALLO',
      bureau: 'BMO',
    },
    impact: 'Délégation active',
    dateCreation: '2026-01-17T10:00:00.000Z',
    dateExecution: '2026-01-17T18:23:00.000Z',
  },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function OverviewView() {
  const log = useLogger('OverviewView');
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const mainCategory = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const subCategory = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const subSubCategory = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);

  // API Queries
  const { data: statsData, isLoading: statsLoading } = useApiQuery(
    async (_signal: AbortSignal) => dashboardAPI.getStats({ period: 'month' }),
    []
  );
  const { data: actionsData } = useApiQuery(
    async (_signal: AbortSignal) => dashboardAPI.getActions({ limit: 6 }),
    []
  );
  const { data: risksData } = useApiQuery(
    async (_signal: AbortSignal) => dashboardAPI.getRisks({ limit: 6 }),
    []
  );
  const { data: decisionsData } = useApiQuery(
    async (_signal: AbortSignal) => dashboardAPI.getDecisions({ limit: 3 }),
    []
  );

  // Normaliser la navigation
  const { activeMainMenu, activeSubMenu, activeFilter } = useMemo(() => {
    let mainMenu = mainCategory || 'overview';
    let subMenu = subCategory || null;
    let filter = subSubCategory || null;

    const validMainCategories = ['overview', 'performance', 'actions', 'risks', 'decisions', 'realtime'];
    if (mainMenu && !validMainCategories.includes(mainMenu as any)) {
      mainMenu = 'overview';
      subMenu = subMenu || 'summary';
      filter = filter || 'dashboard';
    }

    return {
      activeMainMenu: mainMenu as any,
      activeSubMenu: subMenu,
      activeFilter: filter,
    };
  }, [mainCategory, subCategory, subSubCategory]);

  // KPIs avec données API ou mock
  const kpis = useMemo(() => {
    if (!statsData?.kpis) return mockKPIs;
    return [
      {
        id: 'demandes',
        label: 'Demandes',
        value: Number(statsData.kpis.demandes?.value ?? 0),
        trend: Number(statsData.kpis.demandes?.trend ?? 0),
        icon: FileCheck,
        color: 'blue' as const,
        description: 'Nombre total de demandes en cours',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: `${statsData.kpis.validations?.value ?? 0}${statsData.kpis.validations?.unit ?? '%'}`,
        trend: Number(statsData.kpis.validations?.trend ?? 0),
        icon: CheckCircle,
        color: 'emerald' as const,
        description: 'Taux de validation global',
      },
      {
        id: 'budget',
        label: 'Budget traité',
        value: `${statsData.kpis.budget?.value ?? 0}${statsData.kpis.budget?.unit ? ` ${statsData.kpis.budget.unit}` : ''}`,
        trend: Number(statsData.kpis.budget?.trend ?? 0),
        icon: Wallet,
        color: 'amber' as const,
        description: 'Montant total du budget traité',
      },
      {
        id: 'bureaux',
        label: 'Bureaux actifs',
        value: statsData.bureaux?.length ?? 0,
        trend: 0,
        icon: Users,
        color: 'purple' as const,
        description: 'Nombre de bureaux actifs',
      },
    ];
  }, [statsData]);

  // Données avec fallback sur mock et normalisation
  const actions: ActionItemData[] = useMemo(() => {
    const rawActions = Array.isArray((actionsData as any)?.actions) && (actionsData as any).actions.length > 0
      ? (actionsData as any).actions
      : actionsPrioritaires;
    
    // Normaliser les actions pour garantir la cohérence des types
    return rawActions.map((action: any) => ({
      ...action,
      type: (['contrat', 'bc', 'paiement', 'arbitrage'].includes(action.type))
        ? action.type
        : 'contrat' as ActionItemData['type'],
      priorite: (['critique', 'haute', 'moyenne'].includes(action.priorite))
        ? action.priorite
        : 'moyenne' as ActionItemData['priorite'],
    }));
  }, [actionsData]);
  // Normaliser les risques pour garantir la cohérence des types
  const risks: RiskScoreCardData[] = useMemo(() => {
    const rawRisks = Array.isArray((risksData as any)?.risks) && (risksData as any).risks.length > 0
      ? (risksData as any).risks
      : risksRadar;
    
    // Normaliser les risques pour garantir la cohérence des types
    return rawRisks.map((risk: any) => ({
      ...risk,
      impact: (['mineur', 'moyen', 'majeur', 'critique'].includes(risk.impact))
        ? risk.impact
        : 'moyen' as RiskScoreCardData['impact'],
      probabilite: (['faible', 'moyenne', 'elevee', 'certaine'].includes(risk.probabilite))
        ? risk.probabilite
        : 'moyenne' as RiskScoreCardData['probabilite'],
    }));
  }, [risksData]);
  // Normaliser les décisions pour garantir la cohérence des types
  const decisionsList: Decision[] = useMemo(() => {
    const rawDecisions = Array.isArray((decisionsData as any)?.decisions) && (decisionsData as any).decisions.length > 0
      ? (decisionsData as any).decisions
      : decisions;
    
    // Normaliser les décisions pour garantir la cohérence des types
    return rawDecisions.map((decision: any) => ({
      ...decision,
      type: (['substitution', 'delegation', 'arbitrage', 'validation'].includes(decision.type))
        ? decision.type
        : 'validation' as Decision['type'],
      status: (['en_attente', 'executee', 'rejetee'].includes(decision.status))
        ? decision.status
        : 'en_attente' as Decision['status'],
      // S'assurer que demandeur existe avec des valeurs par défaut
      demandeur: decision.demandeur || {
        nom: 'Non spécifié',
        bureau: 'BMO' as BureauCode,
      },
    }));
  }, [decisionsData]);

  // Grouper les actions par type
  const actionsByType = useMemo(() => {
    return actions.reduce((acc, action) => {
      // Normaliser le type : s'assurer qu'il existe dans typeConfig
      const validTypes: ActionItemData['type'][] = ['contrat', 'bc', 'paiement', 'arbitrage'];
      const type = (action.type && validTypes.includes(action.type)) 
        ? action.type 
        : 'contrat'; // Fallback sur 'contrat'
      if (!acc[type]) acc[type] = [];
      acc[type].push(action);
      return acc;
    }, {} as Record<string, ActionItemData[]>);
  }, [actions]);

  // Grouper les événements par date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, AgendaItemData[]> = {};
    agendaJ7.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const todayEvents = eventsByDate[today] || [];
  const tomorrowEvents = eventsByDate[tomorrow] || [];
  const weekEvents = Object.entries(eventsByDate)
    .filter(([date]) => date !== today && date !== tomorrow)
    .slice(0, 3)
    .map(([date, events]) => ({ date, events }));

  // Recherche KPI
  const [kpiSearch, setKpiSearch] = React.useState('');

  const filteredKPIs = useMemo(() => {
    if (!kpiSearch.trim()) return kpis;
    const searchLower = kpiSearch.toLowerCase();
    return kpis.filter((kpi) =>
      kpi.label.toLowerCase().includes(searchLower) ||
      kpi.description?.toLowerCase().includes(searchLower)
    );
  }, [kpis, kpiSearch]);

  // Afficher le dashboard principal uniquement
  const showDashboard = activeMainMenu === 'overview' &&
    (!activeSubMenu || activeSubMenu === 'summary') &&
    (!activeFilter || activeFilter === 'dashboard');

  if (!showDashboard) {
    return null; // Les autres vues sont gérées par d'autres composants
  }

  return (
    <div className="p-6 space-y-8 max-w-[1920px] mx-auto">
      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 1 : INDICATEURS EN TEMPS RÉEL (KPI PRINCIPAUX) */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Indicateurs en temps réel">
        <SectionTitle
          icon={Activity}
          title="Indicateurs en temps réel"
          subtitle="Vue d'ensemble des KPIs principaux"
          size="lg"
        />

        {/* Recherche KPI */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher un indicateur..."
              value={kpiSearch}
              onChange={(e) => setKpiSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Grid KPIs harmonisés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredKPIs.map((kpi) => (
            <KPICard
              key={kpi.id}
              kpi={{
                ...kpi,
                onClick: () => openModal('kpi-drilldown', { kpiId: kpi.id }),
              }}
              size="md"
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 2 : ACTIVITÉ (Demandes, Validations) */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Activité">
        <SectionTitle
          icon={FileCheck}
          title="Activité"
          subtitle="Demandes et validations en cours"
          onAction={() => navigate('performance')}
          actionLabel="Voir tout"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataCard
            title="Demandes en cours"
            value={247}
            label="Total demandes actives"
            badge="+12"
            badgeVariant="success"
            icon={FileCheck}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
              <span>En attente: 31</span>
              <span>Urgentes: 14</span>
            </div>
          </DataCard>

          <DataCard
            title="Taux de validation"
            value="89%"
            label="Taux global de validation"
            badge="+3%"
            badgeVariant="success"
            icon={CheckCircle}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
              <span>Validées: 202</span>
              <span>En cours: 45</span>
            </div>
          </DataCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 3 : FINANCES (Budget traité) */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Finances">
        <SectionTitle
          icon={Wallet}
          title="Finances"
          subtitle="Budget traité et exécution"
          onAction={() => navigate('performance')}
          actionLabel="Détails"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DataCard
            title="Budget traité"
            value="4.2 Mds FCFA"
            label="Montant total traité"
            badge="-2%"
            badgeVariant="warning"
            icon={DollarSign}
          />
          <DataCard
            title="Taux d'exécution"
            value="67%"
            label="Pourcentage du budget exécuté"
            icon={Target}
          />
          <DataCard
            title="Reste à traiter"
            value="1.4 Mds FCFA"
            label="Montant restant"
            icon={Clock}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 4 : RISQUES (Risques critiques, juridique) */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Risques">
        <SectionTitle
          icon={Shield}
          title="Risques"
          subtitle="Risques critiques et juridiques"
          onAction={() => navigate('risks')}
          actionLabel="Voir tout"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {risks.slice(0, 3).map((risk) => (
            <RiskScoreCard
              key={risk.id}
              risk={risk}
              onClick={() => openModal('risk-details', { riskId: risk.id })}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 5 : PERFORMANCE GLOBALE */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Performance globale">
        <SectionTitle
          icon={BarChart3}
          title="Performance globale"
          subtitle="Indicateurs de performance agrégés"
          onAction={() => navigate('performance')}
          actionLabel="Voir tout"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KPICard
              key={kpi.id}
              kpi={{
                ...kpi,
                onClick: () => openModal('kpi-drilldown', { kpiId: kpi.id }),
              }}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 6 : CIRCUIT DE VALIDATION */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Circuit de validation">
        <SectionTitle
          icon={GitBranch}
          title="Circuit de validation"
          subtitle="Flow de validation avec goulots d'étranglement"
        />

        <CircuitValidation stages={workflowStages} />
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 7 : AGENDA EXÉCUTIF */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Agenda exécutif">
        <SectionTitle
          icon={Calendar}
          title="Agenda exécutif"
          subtitle="Événements J+7"
          onAction={() => openModal('calendar')}
          actionLabel="Calendrier complet"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Aujourd'hui */}
          <div className="bg-slate-950/30 rounded-xl border border-slate-800/60 p-4 ring-1 ring-orange-500/15">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-orange-400">
                  {new Date().getDate()}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Aujourd'hui</div>
                <div className="text-xs text-slate-400">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <AgendaItem
                  key={event.id}
                  event={event}
                  onClick={() => openModal('agenda-details', { eventId: event.id })}
                />
              ))}
            </div>
          </div>

          {/* Demain */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-300">
                  {new Date(Date.now() + 86400000).getDate()}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Demain</div>
                <div className="text-xs text-slate-400">
                  {new Date(Date.now() + 86400000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {tomorrowEvents.map((event) => (
                <AgendaItem
                  key={event.id}
                  event={event}
                  onClick={() => openModal('agenda-details', { eventId: event.id })}
                />
              ))}
            </div>
          </div>

          {/* Semaine prochaine */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div className="text-sm font-bold text-white">Semaine prochaine</div>
            </div>
            <div className="space-y-3">
              {weekEvents.map(({ date, events }) =>
                events.map((event) => (
                  <AgendaItem
                    key={event.id}
                    event={event}
                    onClick={() => openModal('agenda-details', { eventId: event.id })}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 8 : ACTIONS PRIORITAIRES */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Actions prioritaires">
        <SectionTitle
          icon={Zap}
          title="Actions prioritaires"
          subtitle="Actions à traiter en urgence"
          onAction={() => navigate('actions')}
          actionLabel="Voir tout"
        />

        {/* Regroupement par type */}
        <div className="space-y-6">
          {Object.entries(actionsByType).map(([type, typeActions]) => {
            const typeLabels: Record<string, string> = {
              contrat: 'Contrats',
              bc: 'Bons de Commande',
              paiement: 'Paiements',
              arbitrage: 'Arbitrages',
            };

            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-slate-200">
                    {typeLabels[type] || type}
                  </h3>
                  <Badge variant="default" className="text-xs">
                    {typeActions.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeActions.slice(0, 3).map((action) => (
                    <ActionItem
                      key={action.id}
                      action={action}
                      onClick={() => openModal('action-details', { actionId: action.id })}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 9 : RISK RADAR */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Risk Radar">
        <SectionTitle
          icon={AlertTriangle}
          title="Risk Radar"
          subtitle="Risques critiques avec scores et solutions"
          onAction={() => navigate('risks')}
          actionLabel="Voir tout"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {risks.map((risk) => (
            <RiskScoreCard
              key={risk.id}
              risk={risk}
              onClick={() => openModal('risk-details', { riskId: risk.id })}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* SECTION 10 : DÉCISIONS RÉCENTES */}
      {/* ════════════════════════════════════════════════ */}
      <section aria-label="Décisions récentes">
        <SectionTitle
          icon={Scale}
          title="Décisions récentes"
          subtitle="Substitutions, délégations et arbitrages"
          onAction={() => navigate('decisions')}
          actionLabel="Voir historique"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decisionsList.map((decision) => {
            const typeLabels: Record<string, string> = {
              substitution: 'Substitution',
              delegation: 'Délégation',
              arbitrage: 'Arbitrage',
              validation: 'Validation',
            };

            const statusColors = {
              executee: 'border-l-green-500',
              rejetee: 'border-l-red-500',
              en_attente: 'border-l-orange-500',
            };

            return (
              <div
                key={decision.id}
                className={cn(
                  'bg-slate-800 rounded-xl p-4 border-l-4',
                  statusColors[decision.status]
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="default"
                    className={cn(
                      'text-xs border',
                      decision.status === 'executee'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : decision.status === 'rejetee'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    )}
                  >
                    {typeLabels[decision.type] || decision.type}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{decision.code}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  {decision.titre}
                </h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {decision.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                  {decision.demandeur != null && (decision.demandeur.nom != null || decision.demandeur.bureau != null) && (
                    <span className="text-xs text-slate-500">
                      {decision.demandeur.nom ?? '—'} ({decision.demandeur.bureau ?? '—'})
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openModal('decision-details', { decisionId: decision.id })}
                    className="text-xs"
                  >
                    Voir détails
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
