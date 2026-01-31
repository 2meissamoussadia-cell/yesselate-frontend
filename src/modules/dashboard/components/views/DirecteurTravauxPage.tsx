/**
 * Page Dashboard Directeur de Travaux
 * 
 * Vue dédiée pour les directeurs de travaux avec focus sur :
 * - Visualisation temps réel des retards
 * - Budgets consommés
 * - Conformités SLA
 * - Navigation simplifiée vers KPIs Projets / Demandes / Budget
 */

'use client';

import React, { useMemo } from 'react';
import { 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
  MockDataIndicator,
} from '../shared';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { mapColorToTone } from '../../utils/colorMapping';
import { parseTrendPercent } from '@lib-root/dashboard/kpi';

// ============================================
// TYPES
// ============================================

interface Retard {
  id: string;
  projet: string;
  bureau: string;
  retardJours: number;
  priorite: 'critique' | 'haute' | 'moyenne';
  responsable: string;
}

interface BudgetConsomme {
  id: string;
  projet: string;
  budgetAlloue: number;
  budgetConsomme: number;
  pourcentage: number;
  alerte: boolean;
}

interface ConformiteSLA {
  id: string;
  type: string;
  conformite: number;
  delaiMoyen: number;
  objectif: number;
}

// ============================================
// COMPOSANT
// ============================================

export function DirecteurTravauxPage() {
  const { go } = useDashboardCommandCenterStore();

  // ⚠️ DONNÉES MOCKÉES - Phase 1
  const retards: Retard[] = useMemo(() => [
    { id: 'R1', projet: 'PRJ-0018', bureau: 'BF', retardJours: 15, priorite: 'critique', responsable: 'A. DIALLO' },
    { id: 'R2', projet: 'PRJ-0017', bureau: 'BJ', retardJours: 8, priorite: 'haute', responsable: 'M. KANE' },
    { id: 'R3', projet: 'PRJ-0016', bureau: 'BCG', retardJours: 5, priorite: 'moyenne', responsable: 'S. FALL' },
  ], []);

  const budgets: BudgetConsomme[] = useMemo(() => [
    { id: 'B1', projet: 'PRJ-0018', budgetAlloue: 50000000, budgetConsomme: 42000000, pourcentage: 84, alerte: true },
    { id: 'B2', projet: 'PRJ-0017', budgetAlloue: 35000000, budgetConsomme: 21000000, pourcentage: 60, alerte: false },
    { id: 'B3', projet: 'PRJ-0016', budgetAlloue: 28000000, budgetConsomme: 16800000, pourcentage: 60, alerte: false },
  ], []);

  const conformites: ConformiteSLA[] = useMemo(() => [
    { id: 'C1', type: 'Validation BC', conformite: 0.94, delaiMoyen: 2.3, objectif: 0.95 },
    { id: 'C2', type: 'Décisions', conformite: 0.87, delaiMoyen: 3.5, objectif: 0.90 },
    { id: 'C3', type: 'Paiements', conformite: 0.92, delaiMoyen: 4.2, objectif: 0.95 },
  ], []);

  // KPIs principaux
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'retards',
      label: 'Retards critiques',
      value: retards.filter(r => r.priorite === 'critique').length,
      trend: -2,
      trendType: 'down',
      icon: AlertTriangle,
      color: mapColorToTone('red'),
      onClick: () => go({ main: 'performance', sub: 'delays', leaf: 'critiques' }),
    },
    {
      id: 'budget',
      label: 'Budget consommé moyen',
      value: `${Math.round(budgets.reduce((acc, b) => acc + b.pourcentage, 0) / budgets.length)}%`,
      trend: 3,
      trendType: 'up',
      icon: DollarSign,
      color: mapColorToTone('amber'),
      onClick: () => go({ main: 'performance', sub: 'budget', leaf: 'consommation' }),
    },
    {
      id: 'conformite',
      label: 'Conformité SLA',
      value: `${Math.round(conformites.reduce((acc, c) => acc + c.conformite, 0) / conformites.length * 100)}%`,
      trend: 2,
      trendType: 'up',
      icon: CheckCircle2,
      color: mapColorToTone('emerald'),
      onClick: () => go({ main: 'performance', sub: 'validations', leaf: 'global' }),
    },
    {
      id: 'delai',
      label: 'Délai moyen',
      value: `${(conformites.reduce((acc, c) => acc + c.delaiMoyen, 0) / conformites.length).toFixed(1)}j`,
      trend: -0.3,
      trendType: 'down',
      icon: Clock,
      color: mapColorToTone('blue'),
    },
  ], [retards, budgets, conformites, go]);

  return (
    <div className="relative">
      <MockDataIndicator message="Données mockées - Phase 1 (Backend en attente)" />
      
      <DashboardPageLayout>
        {/* Header */}
        <DashboardSection>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Directeur de Travaux</h1>
              <p className="text-slate-400 text-sm mt-1">
                Vue d'ensemble temps réel : retards, budgets, conformités SLA
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
              <span className="text-sm text-slate-300">Temps réel</span>
            </div>
          </div>
        </DashboardSection>

        {/* KPIs principaux */}
        <DashboardSection>
          <DashboardGrid columns={4}>
            {kpis.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} size="md" />
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Navigation rapide */}
        <DashboardSection>
          <DashboardPanel title="Navigation rapide" className="bg-slate-900/40">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => go({ main: 'overview', sub: 'summary', leaf: 'projets' })}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800/60 bg-slate-950/35 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-200">KPIs Projets</div>
                    <div className="text-xs text-slate-400">Vue détaillée</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => go({ main: 'overview', sub: 'kpis', leaf: 'demandes' })}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800/60 bg-slate-950/35 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-200">KPIs Demandes</div>
                    <div className="text-xs text-slate-400">Vue détaillée</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => go({ main: 'overview', sub: 'summary', leaf: 'budget' })}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800/60 bg-slate-950/35 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-200">KPIs Budget</div>
                    <div className="text-xs text-slate-400">Vue détaillée</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </DashboardPanel>
        </DashboardSection>

        {/* Retards critiques */}
        <DashboardSection>
          <DashboardPanel title="Retards critiques" className="bg-slate-900/40">
            <div className="space-y-2">
              {retards.map((retard) => (
                <div
                  key={retard.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    retard.priorite === 'critique' 
                      ? 'border-rose-500/40 bg-rose-500/5' 
                      : retard.priorite === 'haute'
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-slate-800/60 bg-slate-950/35'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={cn(
                      'h-5 w-5',
                      retard.priorite === 'critique' ? 'text-rose-400' : 'text-amber-400'
                    )} />
                    <div>
                      <div className="font-semibold text-slate-200">{retard.projet}</div>
                      <div className="text-xs text-slate-400">{retard.bureau} • {retard.responsable}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      'font-bold',
                      retard.priorite === 'critique' ? 'text-rose-400' : 'text-amber-400'
                    )}>
                      +{retard.retardJours}j
                    </div>
                    <div className="text-xs text-slate-400">Retard</div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </DashboardSection>

        {/* Budgets consommés */}
        <DashboardSection>
          <DashboardPanel title="Budgets consommés" className="bg-slate-900/40">
            <div className="space-y-2">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    budget.alerte 
                      ? 'border-amber-500/40 bg-amber-500/5' 
                      : 'border-slate-800/60 bg-slate-950/35'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-amber-400" />
                    <div>
                      <div className="font-semibold text-slate-200">{budget.projet}</div>
                      <div className="text-xs text-slate-400">
                        {(budget.budgetConsomme / 1000000).toFixed(1)}M / {(budget.budgetAlloue / 1000000).toFixed(1)}M FCFA
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      'font-bold',
                      budget.alerte ? 'text-amber-400' : 'text-slate-300'
                    )}>
                      {budget.pourcentage}%
                    </div>
                    <div className="text-xs text-slate-400">Consommé</div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </DashboardSection>

        {/* Conformités SLA */}
        <DashboardSection>
          <DashboardPanel title="Conformités SLA" className="bg-slate-900/40">
            <div className="space-y-2">
              {conformites.map((conformite) => {
                const isConforme = conformite.conformite >= conformite.objectif;
                return (
                  <div
                    key={conformite.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      isConforme 
                        ? 'border-emerald-500/40 bg-emerald-500/5' 
                        : 'border-amber-500/40 bg-amber-500/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={cn(
                        'h-5 w-5',
                        isConforme ? 'text-emerald-400' : 'text-amber-400'
                      )} />
                      <div>
                        <div className="font-semibold text-slate-200">{conformite.type}</div>
                        <div className="text-xs text-slate-400">
                          Délai moyen: {conformite.delaiMoyen}j (objectif: {conformite.objectif * 100}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        'font-bold',
                        isConforme ? 'text-emerald-400' : 'text-amber-400'
                      )}>
                        {(conformite.conformite * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-slate-400">Conformité</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardPanel>
        </DashboardSection>
      </DashboardPageLayout>
    </div>
  );
}
