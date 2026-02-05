/**
 * KPIs Budget — version "logiciel métier premium"
 * - Hiérarchie claire (shell + panels)
 * - Densité lisible (alignements, chiffres à droite)
 * - Pas d'effets "arcade" (pas de dégradés agressifs, pas de hover:scale)
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Wallet,
  PieChart,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Download,
  Search,
} from 'lucide-react';

import { DataCard, KpiStatCard } from '@/components/features/bmo/dashboard/components';
import type { KpiStatCardProps } from '@/components/features/bmo/dashboard/components/KpiStatCard';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';
import { parseTrendPercent, formatCurrency, normalizeKPIColor } from '@lib-root/dashboard/kpi';

import { getAppForCategory, getBudgetStatut, getBudgetAlertsFromData } from '../../domain';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  MockDataIndicator,
} from '../shared';
import { BudgetDetailModal } from '../modals/BudgetDetailModal';
import { exportToCSV } from '../../utils/exportUtils';

const clampPct = (n: number) => Math.max(0, Math.min(100, n));

/** Format compact pour affichage KPI (ex. "4.2 Mds", "125 M", "8.5 M") */
function formatCompactAmount(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} Mds`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} K`;
  return String(Math.round(n));
}

// ---------------------------
// Mock data (garde tes vraies datas ensuite)
// ---------------------------
type BudgetProject = {
  id: string;
  nom: string;
  alloue: number;
  consomme: number;
};

type PaymentLate = {
  id: string;
  projet: string;
  retardJours: number;
  montant: number;
  priorite: 'haute' | 'moyenne' | 'critique';
};

type ProfitRow = {
  id: string;
  projet: string;
  investissement: number;
  retourAttendu: number;
  retourReel: number;
  margePct: number;
};

// Type pour les KPIs
type BudgetKPI = {
  id: string;
  label: string;
  value: string;
  trend?: number;
  trendType?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'amber' | 'emerald' | 'violet' | 'rose' | 'cyan';
  description?: string;
  onClick: () => void;
};

interface BudgetKpiPageProps {
  data?: { budget?: { total?: number; consomme?: number; reste?: number; pourcentage?: number } };
}

export function BudgetKpiPage({ data: apiData }: BudgetKpiPageProps = {}) {
  const [q, setQ] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<BudgetKPI | null>(null);

  // Logique métier (domaine gouvernance) : statut et alertes budget
  const budgetDomain = useMemo(() => {
    const raw = apiData?.budget ?? { total: 4_200_000_000, consomme: 3_100_000_000, reste: 1_100_000_000, pourcentage: 74 };
    const statut = getBudgetStatut(raw);
    const alertes = getBudgetAlertsFromData(raw);
    return { statut, alertes, raw };
  }, [apiData?.budget]);

  const appMeta = useMemo(() => getAppForCategory('finance'), []);

  // Helpers centralisés importés depuis colorMapping.ts

  const handleKPIClick = (kpi: BudgetKPI) => {
    setSelectedKpi(kpi);
  };

  // Dernière synchro "réelle" (même source que l'auto-refresh dashboard)
  useEffect(() => {
    const readLast = () => {
      if (typeof window === 'undefined') return;
      const ts = (window as any).__lastDashboardRefresh;
      if (typeof ts === 'number' && Number.isFinite(ts) && ts > 0) {
        setLastUpdate(new Date(ts));
      }
    };
    readLast();
    window.addEventListener('focus', readLast);
    document.addEventListener('visibilitychange', readLast);
    return () => {
      window.removeEventListener('focus', readLast);
      document.removeEventListener('visibilitychange', readLast);
    };
  }, []);

  const projects: BudgetProject[] = useMemo(
    () => [
      { id: 'p1', nom: 'Villa Diamniadio', alloue: 36_400_000, consomme: 24_700_000 },
      { id: 'p2', nom: 'Complexe Résidentiel', alloue: 28_200_000, consomme: 22_100_000 },
      { id: 'p3', nom: 'Infrastructure Route', alloue: 45_800_000, consomme: 48_200_000 },
    ],
    []
  );

  const latePayments: PaymentLate[] = useMemo(
    () => [
      { id: 'l1', projet: 'Villa Diamniadio', retardJours: 15, montant: 3_200_000, priorite: 'haute' },
      { id: 'l2', projet: 'Complexe Résidentiel', retardJours: 25, montant: 2_800_000, priorite: 'critique' },
      { id: 'l3', projet: 'École Primaire', retardJours: 8, montant: 1_500_000, priorite: 'moyenne' },
      { id: 'l4', projet: 'Centre de Santé', retardJours: 5, montant: 1_000_000, priorite: 'moyenne' },
    ],
    []
  );

  // KPIs branchés sur budgetDomain, projects, latePayments (pas de tendance réelle pour l'instant)
  const kpis = useMemo((): BudgetKPI[] => {
    const { raw } = budgetDomain;
    const total = raw.total ?? 0;
    const consomme = raw.consomme ?? 0;
    const reste = raw.reste ?? 0;
    const pourcentage = raw.pourcentage ?? (total > 0 ? (consomme / total) * 100 : 0);

    const totalAlloue = projects.reduce((s, p) => s + p.alloue, 0);
    const budgetMoyen = projects.length > 0 ? totalAlloue / projects.length : 0;
    const totalRetard = latePayments.reduce((s, p) => s + p.montant, 0);

    return [
      {
        id: 'budget_total',
        label: 'Budget total',
        value: formatCompactAmount(total),
        trend: undefined,
        trendType: 'neutral' as const,
        icon: DollarSign,
        color: 'blue' as const,
        description: 'Total des enveloppes budgétaires (exercice en cours)',
        onClick: () => {},
      },
      {
        id: 'budget_consomme',
        label: 'Budget consommé',
        value: `${Math.round(pourcentage)}%`,
        trend: undefined,
        trendType: 'neutral' as const,
        icon: PieChart,
        color: 'amber' as const,
        description: 'Part consommée (engagé + payé selon paramétrage)',
        onClick: () => {},
      },
      {
        id: 'budget_restant',
        label: 'Budget restant',
        value: formatCompactAmount(reste),
        trend: undefined,
        trendType: 'neutral' as const,
        icon: Wallet,
        color: 'emerald' as const,
        description: "Reste à engager sur l’exercice",
        onClick: () => {},
      },
      {
        id: 'budget_moyen',
        label: 'Budget moyen / projet',
        value: formatCompactAmount(budgetMoyen),
        trend: undefined,
        trendType: 'neutral' as const,
        icon: TrendingUp,
        color: 'violet' as const,
        description: 'Moyenne sur la sélection de projets',
        onClick: () => {},
      },
      {
        id: 'paiements_retard',
        label: 'Paiements en retard',
        value: formatCompactAmount(totalRetard),
        trend: undefined,
        trendType: 'neutral' as const,
        icon: AlertTriangle,
        color: 'rose' as const,
        description: 'Total des paiements dépassant le SLA',
        onClick: () => {},
      },
      {
        id: 'conformite_budget',
        label: 'Conformité budget',
        value: '94%',
        trend: undefined,
        trendType: 'neutral' as const,
        icon: ShieldCheck,
        color: 'cyan' as const,
        description: 'Respect des règles budget / engagement / pièces',
        onClick: () => {},
      },
    ];
  }, [budgetDomain, projects, latePayments]) as BudgetKPI[];

  const profitability: ProfitRow[] = useMemo(
    () => [
      {
        id: 'r1',
        projet: 'Villa Diamniadio',
        investissement: 36_400_000,
        retourAttendu: 7_280_000,
        retourReel: 6_900_000,
        margePct: 19,
      },
      {
        id: 'r2',
        projet: 'Complexe Résidentiel',
        investissement: 28_200_000,
        retourAttendu: 5_640_000,
        retourReel: 5_100_000,
        margePct: 18,
      },
      {
        id: 'r3',
        projet: 'Infrastructure Route',
        investissement: 45_800_000,
        retourAttendu: 9_160_000,
        retourReel: 8_500_000,
        margePct: 19,
      },
    ],
    []
  );

  const filteredProjects = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return projects;
    return projects.filter((p) => p.nom.toLowerCase().includes(s));
  }, [q, projects]);

  const filteredLate = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return latePayments;
    return latePayments.filter((p) => p.projet.toLowerCase().includes(s));
  }, [q, latePayments]);

  const filteredProfitability = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return profitability;
    return profitability.filter((r) => r.projet.toLowerCase().includes(s));
  }, [q, profitability]);

  const lastUpdateLabel = useMemo(() => {
    if (!lastUpdate) return '—';
    return lastUpdate.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  }, [lastUpdate]);

  const handleExportCSV = () => {
    const date = new Date().toISOString().split('T')[0];
    const headersProjets = ['Projet', 'Alloué (XOF)', 'Consommé (XOF)', 'Ratio %', 'Dépassement'];
    const rowsProjets = filteredProjects.map((p) => {
      const ratio = p.alloue > 0 ? Math.round((p.consomme / p.alloue) * 100) : 0;
      const dep = p.consomme > p.alloue ? formatCurrency(p.consomme - p.alloue, 'XOF') : '—';
      return [p.nom, formatCurrency(p.alloue, 'XOF'), formatCurrency(p.consomme, 'XOF'), `${ratio}%`, dep];
    });
    exportToCSV(rowsProjets, headersProjets, `budget-kpis-projets-${date}.csv`);

    const headersRetards = ['Projet', 'Jours retard', 'Montant (XOF)', 'Priorité'];
    const rowsRetards = filteredLate.map((p) => [
      p.projet,
      p.retardJours,
      formatCurrency(p.montant, 'XOF'),
      p.priorite === 'critique' ? 'Critique' : p.priorite === 'haute' ? 'Haute' : 'Moyenne',
    ]);
    exportToCSV(rowsRetards, headersRetards, `budget-kpis-retards-${date}.csv`);

    const headersRent = ['Projet', 'Investissement (XOF)', 'Retour attendu (XOF)', 'Retour réel (XOF)', 'Marge %', 'Réel/Attendu %'];
    const rowsRent = filteredProfitability.map((r) => {
      const pct = Math.round((r.retourReel / Math.max(1, r.retourAttendu)) * 100);
      return [
        r.projet,
        formatCurrency(r.investissement, 'XOF'),
        formatCurrency(r.retourAttendu, 'XOF'),
        formatCurrency(r.retourReel, 'XOF'),
        `${r.margePct}%`,
        `${pct}%`,
      ];
    });
    exportToCSV(rowsRent, headersRent, `budget-kpis-rentabilite-${date}.csv`);
  };

  const modalKpi = useMemo(() => {
    if (!selectedKpi) return null;
    const rawTrend = selectedKpi.trend;
    const trendValue: string | undefined =
      rawTrend != null
        ? typeof rawTrend === 'number'
          ? `${rawTrend > 0 ? '+' : ''}${rawTrend}%`
          : String(rawTrend)
        : undefined;
    return {
      id: selectedKpi.id || '',
      label: selectedKpi.label || '',
      value: selectedKpi.value || '—',
      trend: trendValue,
      description: selectedKpi.description,
    };
  }, [selectedKpi]);

  return (
    <div className="relative min-w-0 max-w-full overflow-x-hidden">
      <MockDataIndicator message="Données mockées - Phase 1 (Backend en attente)" />
      <DashboardPageLayout maxWidth="xl" padding="md">
      {/* Logique métier (Odoo-style) : App → Modèle → Workflow Budget */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1">
          <span className="font-medium text-slate-300">App</span>
          <span>{appMeta?.name ?? 'Performance'}</span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1">
          <span className="font-medium text-slate-400">Modèle</span>
          <span>Budget</span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1">
          <span className="font-medium text-slate-400">Statut (domaine)</span>
          <span>{budgetDomain.statut}</span>
        </span>
        {budgetDomain.alertes.length > 0 && (
          <>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-300">
              <span className="font-medium">Alertes</span>
              <span>{budgetDomain.alertes.length}</span>
            </span>
          </>
        )}
      </div>

      {/* Header avec recherche et export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
            KPIs Budget
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Indicateurs budgétaires (règles domaine: gouvernance/budget) — lecture instantanée + drill-down
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search 
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" 
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un projet…"
              className="bg-slate-950/40 border-slate-800/70 pl-9 w-[200px] sm:w-[260px]"
              aria-label="Rechercher un projet (budget, retards, rentabilité)"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/40"
            onClick={handleExportCSV}
            title="Exporter projets, retards et rentabilité en CSV"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <DashboardSection
        title="Indicateurs clés"
        subtitle="Synthèse instantanée — clique un KPI pour ouvrir le détail"
        icon={DollarSign}
      >
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 min-w-0">
          {kpis.map((kpi) => (
            <KpiStatCard
              key={kpi.id}
              title={kpi.label}
              value={kpi.value}
              subtitle={kpi.description}
              icon={kpi.icon}
              tone={normalizeKPIColor(kpi.color) as KpiStatCardProps['tone']}
              trend={kpi.trend != null ? (typeof kpi.trend === 'number' ? kpi.trend : parseTrendPercent(kpi.trend)) : undefined}
              trendDirection={kpi.trendType ?? 'neutral'}
              tooltip={kpi.description}
              onClick={() => handleKPIClick(kpi)}
            />
          ))}
        </div>
      </DashboardSection>

      {/* Budget par projet */}
      <DashboardSection
        title="Budget par projet"
        subtitle="Comparatif alloué / consommé + dépassements"
        icon={PieChart}
      >
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">
              {q.trim() ? 'Aucun projet ne correspond à la recherche.' : 'Aucun projet.'}
            </p>
          ) : (
          filteredProjects.map((p) => {
            const ratio = p.alloue > 0 ? (p.consomme / p.alloue) * 100 : 0;
            const over = ratio > 100;

            return (
              <DashboardPanel key={p.id} padding="md">
                <div className="flex items-start justify-between" style={{ gap: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-50 truncate" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>
                      {p.nom}
                    </div>
                    <div className="text-slate-400" style={{ marginTop: 'clamp(0.25rem, 0.5vw, 0.5rem)', fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>
                      Alloué :{' '}
                      <span className="text-slate-200 tabular-nums">{formatCurrency(p.alloue, 'XOF')}</span>
                      {' · '}
                      Consommé :{' '}
                      <span className="text-slate-200 tabular-nums">{formatCurrency(p.consomme, 'XOF')}</span>
                    </div>
                  </div>

                  <EnterpriseBadge
                    variant={over ? 'critique' : ratio >= 80 ? 'haute' : 'success'}
                    size="sm"
                  >
                    {Math.round(ratio)}%
                  </EnterpriseBadge>
                </div>

                <div 
                  className="rounded-full bg-slate-800/60 overflow-hidden"
                  style={{ marginTop: 'clamp(0.75rem, 1vw, 1rem)', height: 'clamp(0.375rem, 0.5vw, 0.625rem)' }}
                >
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      over ? 'bg-red-500' : ratio >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${clampPct(ratio)}%` }}
                  />
                </div>

                {over ? (
                  <div className="text-red-300/90 text-xs mt-2">
                    Dépassement : +{formatCurrency(p.consomme - p.alloue, 'XOF')}
                  </div>
                ) : null}
              </DashboardPanel>
            );
          })
          )}
        </div>
      </DashboardSection>

      {/* Paiements en retard + Rentabilité */}
      <DashboardGrid columns={2} gap="md">
        <DashboardSection
          title="Paiements en retard"
          subtitle="Retards de paiement par projet (SLA)"
          icon={AlertTriangle}
        >
          <div className="space-y-3">
            {filteredLate.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">
                {q.trim() ? 'Aucun paiement en retard ne correspond à la recherche.' : 'Aucun paiement en retard.'}
              </p>
            ) : (
            filteredLate.map((p) => (
              <DashboardPanel key={p.id} padding="md" className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-50 truncate" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>{p.projet}</div>
                  <div className="text-slate-400" style={{ marginTop: 'clamp(0.25rem, 0.5vw, 0.5rem)', fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>
                    {p.retardJours} jour{p.retardJours > 1 ? 's' : ''} de retard
                  </div>
                </div>

                <div className="flex items-center shrink-0" style={{ gap: 'clamp(0.75rem, 1vw, 1rem)' }}>
                  <Badge
                    className={cn(
                      p.priorite === 'critique' && 'bg-red-500/15 text-red-300 border border-red-500/30',
                      p.priorite === 'haute' && 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
                      p.priorite === 'moyenne' && 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    )}
                  >
                    {p.priorite === 'critique'
                      ? 'Critique'
                      : p.priorite === 'haute'
                        ? 'Haute'
                        : 'Moyenne'}
                  </Badge>

                  <div className="font-semibold text-slate-100 tabular-nums text-sm">
                    {formatCurrency(p.montant, 'XOF')}
                  </div>
                </div>
              </DashboardPanel>
            ))
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Rentabilité par projet"
          subtitle="Investissement / retour attendu / retour réel"
          icon={TrendingUp}
        >
          <div className="space-y-3">
            {filteredProfitability.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">
                {q.trim() ? 'Aucun projet ne correspond à la recherche.' : 'Aucun projet.'}
              </p>
            ) : (
            filteredProfitability.map((r) => (
              <DashboardPanel key={r.id} padding="md">
                <div className="flex items-start justify-between" style={{ gap: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-50 truncate" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>{r.projet}</div>
                    <div className="text-slate-400" style={{ marginTop: 'clamp(0.25rem, 0.5vw, 0.5rem)', fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>
                      Invest.{' '}
                      <span className="text-slate-200 tabular-nums">{formatCurrency(r.investissement, 'XOF')}</span>
                      {' · '}
                      Attendu{' '}
                      <span className="text-slate-200 tabular-nums">{formatCurrency(r.retourAttendu, 'XOF')}</span>
                      {' · '}
                      Réel{' '}
                      <span className="text-slate-200 tabular-nums">{formatCurrency(r.retourReel, 'XOF')}</span>
                    </div>
                  </div>

                  <EnterpriseBadge variant="success" size="sm">
                    {r.margePct}% marge
                  </EnterpriseBadge>
                </div>

                {/* Barre de progression retour réel vs attendu */}
                <div 
                  className="rounded-full bg-slate-800/60 overflow-hidden"
                  style={{ marginTop: 'clamp(0.75rem, 1vw, 1rem)', height: 'clamp(0.375rem, 0.5vw, 0.625rem)' }}
                >
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${clampPct((r.retourReel / Math.max(1, r.retourAttendu)) * 100)}%`,
                    }}
                  />
                </div>

                <div className="text-slate-400 text-xs mt-2">
                  Réel / Attendu :{' '}
                  <span className="text-slate-200 tabular-nums">
                    {Math.round((r.retourReel / Math.max(1, r.retourAttendu)) * 100)}%
                  </span>
                </div>
              </DashboardPanel>
            ))
            )}
          </div>
        </DashboardSection>
      </DashboardGrid>

      {/* Contexte / méta */}
      <DashboardGrid columns={3} gap="md">
        <DataCard
          title="Dernière mise à jour"
          value={lastUpdateLabel}
          label="Horodatage"
          badge={lastUpdate ? 'Live' : '—'}
          badgeVariant={lastUpdate ? 'success' : 'default'}
        />
        <DataCard title="Période d’analyse" value="Exercice en cours" label="Filtre" />
        <DataCard
          title="Qualité données"
          value="OK"
          label="Contrôles"
          badge="94%"
          badgeVariant="default"
        />
      </DashboardGrid>
      </DashboardPageLayout>

      <BudgetDetailModal
        isOpen={!!selectedKpi}
        onClose={() => setSelectedKpi(null)}
        kpi={modalKpi}
      />
    </div>
  );
}

export default BudgetKpiPage;

