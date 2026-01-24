/**
 * KPIs Budget — version "logiciel métier premium"
 * - Hiérarchie claire (shell + panels)
 * - Densité lisible (alignements, chiffres à droite)
 * - Pas d'effets "arcade" (pas de dégradés agressifs, pas de hover:scale)
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
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

import { KPICard, SectionTitle, DataCard } from '@/components/features/bmo/dashboard/components';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';

import { DashboardPageShell } from '../shared/DashboardPageShell';
import { DashboardPanel } from '../shared/DashboardPanel';

// ---------------------------
// Helpers formatters
// ---------------------------
const formatMoneyFCFA = (n: number): string => {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Md`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)} K`;
  return `${n}`;
};

const clampPct = (n: number) => Math.max(0, Math.min(100, n));

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

export function BudgetKpiPage() {
  const [q, setQ] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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

  // KPIs (tu pourras brancher tes vraies stats)
  const kpis = useMemo(() => {
    return [
      {
        id: 'budget_total',
        label: 'Budget total',
        value: '4.2 Mds',
        trend: 5,
        trendType: 'up' as const,
        icon: DollarSign,
        color: 'blue' as const,
        description: 'Total des enveloppes budgétaires (exercice en cours)',
        onClick: () => {},
      },
      {
        id: 'budget_consomme',
        label: 'Budget consommé',
        value: '67%',
        trend: -2,
        trendType: 'down' as const,
        icon: PieChart,
        color: 'amber' as const,
        description: 'Part consommée (engagé + payé selon paramétrage)',
        onClick: () => {},
      },
      {
        id: 'budget_restant',
        label: 'Budget restant',
        value: '1.4 Mds',
        trend: -2,
        trendType: 'down' as const,
        icon: Wallet,
        color: 'emerald' as const,
        description: "Reste à engager sur l’exercice",
        onClick: () => {},
      },
      {
        id: 'budget_moyen',
        label: 'Budget moyen / projet',
        value: '125 M',
        trend: 1,
        trendType: 'up' as const,
        icon: TrendingUp,
        color: 'purple' as const,
        description: 'Moyenne sur la sélection de projets',
        onClick: () => {},
      },
      {
        id: 'paiements_retard',
        label: 'Paiements en retard',
        value: '8.5 M',
        icon: AlertTriangle,
        color: 'rose' as const,
        description: 'Total des paiements dépassant le SLA',
        onClick: () => {},
      },
      {
        id: 'conformite_budget',
        label: 'Conformité budget',
        value: '94%',
        trend: 2,
        trendType: 'up' as const,
        icon: ShieldCheck,
        color: 'cyan' as const,
        description: 'Respect des règles budget / engagement / pièces',
        onClick: () => {},
      },
    ];
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

  const lastUpdateLabel = useMemo(() => {
    if (!lastUpdate) return '—';
    return lastUpdate.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  }, [lastUpdate]);

  return (
    <DashboardPageShell
      title="KPIs Budget"
      subtitle="Indicateurs budgétaires et financiers — lecture instantanée + drill-down"
      rightSlot={
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un projet…"
              className="pl-9 w-[260px] bg-slate-950/40 border-slate-800/70"
            />
          </div>

          <Button
            variant="outline"
            className="border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/40"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </>
      }
    >
      {/* KPI GRID */}
      <DashboardPanel className="p-4 sm:p-5">
        <SectionTitle
          title="Indicateurs clés"
          subtitle="Synthèse instantanée — clique un KPI pour ouvrir le détail"
          size="md"
        />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {kpis.map((k) => (
            <KPICard key={k.id} kpi={k} size="md" />
          ))}
        </div>
      </DashboardPanel>

      {/* Budget par projet */}
      <DashboardPanel className="p-4 sm:p-6">
        <SectionTitle
          title="Budget par projet"
          subtitle="Comparatif alloué / consommé + dépassements"
          size="md"
        />

        <div className="mt-4 space-y-3">
          {filteredProjects.map((p) => {
            const ratio = p.alloue > 0 ? (p.consomme / p.alloue) * 100 : 0;
            const over = ratio > 100;

            return (
              <div
                key={p.id}
                className={cn(
                  'rounded-xl border border-slate-800/60 bg-slate-950/30',
                  'px-4 py-4 sm:px-5 sm:py-5',
                  'transition-colors hover:bg-slate-950/45'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-50 truncate">
                      {p.nom}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Alloué :{' '}
                      <span className="text-slate-200 tabular-nums">{formatMoneyFCFA(p.alloue)} FCFA</span>
                      {' · '}
                      Consommé :{' '}
                      <span className="text-slate-200 tabular-nums">{formatMoneyFCFA(p.consomme)} FCFA</span>
                    </div>
                  </div>

                  <EnterpriseBadge
                    variant={over ? 'critique' : ratio >= 80 ? 'haute' : 'success'}
                    size="sm"
                  >
                    {Math.round(ratio)}%
                  </EnterpriseBadge>
                </div>

                <div className="mt-3 h-2.5 rounded-full bg-slate-800/60 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      over ? 'bg-red-500' : ratio >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${clampPct(ratio)}%` }}
                  />
                </div>

                {over ? (
                  <div className="mt-2 text-xs text-red-300/90">
                    Dépassement : +{formatMoneyFCFA(p.consomme - p.alloue)} FCFA
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </DashboardPanel>

      {/* Paiements en retard + Rentabilité */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DashboardPanel className="p-4 sm:p-6">
          <SectionTitle
            title="Paiements en retard"
            subtitle="Retards de paiement par projet (SLA)"
            size="md"
          />

          <div className="mt-4 space-y-3">
            {filteredLate.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'rounded-xl border border-slate-800/60 bg-slate-950/30',
                  'px-4 py-4',
                  'flex items-center justify-between gap-4',
                  'transition-colors hover:bg-slate-950/45'
                )}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-50 truncate">{p.projet}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {p.retardJours} jour{p.retardJours > 1 ? 's' : ''} de retard
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
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

                  <div className="text-sm font-semibold text-slate-100 tabular-nums">
                    {formatMoneyFCFA(p.montant)} FCFA
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel className="p-4 sm:p-6">
          <SectionTitle
            title="Rentabilité par projet"
            subtitle="Investissement / retour attendu / retour réel"
            size="md"
          />

          <div className="mt-4 space-y-3">
            {profitability.map((r) => (
              <div
                key={r.id}
                className={cn(
                  'rounded-xl border border-slate-800/60 bg-slate-950/30',
                  'px-4 py-4 sm:px-5 sm:py-5',
                  'transition-colors hover:bg-slate-950/45'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-50 truncate">{r.projet}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      Invest.{' '}
                      <span className="text-slate-200 tabular-nums">{formatMoneyFCFA(r.investissement)} FCFA</span>
                      {' · '}
                      Attendu{' '}
                      <span className="text-slate-200 tabular-nums">{formatMoneyFCFA(r.retourAttendu)} FCFA</span>
                      {' · '}
                      Réel{' '}
                      <span className="text-slate-200 tabular-nums">{formatMoneyFCFA(r.retourReel)} FCFA</span>
                    </div>
                  </div>

                  <EnterpriseBadge variant="success" size="sm">
                    {r.margePct}% marge
                  </EnterpriseBadge>
                </div>

                {/* Barre de progression retour réel vs attendu */}
                <div className="mt-3 h-2.5 rounded-full bg-slate-800/60 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${clampPct((r.retourReel / Math.max(1, r.retourAttendu)) * 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  Réel / Attendu :{' '}
                  <span className="text-slate-200 tabular-nums">
                    {Math.round((r.retourReel / Math.max(1, r.retourAttendu)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      {/* Contexte / méta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
      </div>
    </DashboardPageShell>
  );
}

export default BudgetKpiPage;

