/**
 * Vue Performance du Dashboard
 * KPIs détaillés, tendances et comparaisons
 * Filtrage dynamique selon la navigation
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Wallet,
  RefreshCw,
  AlertTriangle,
  Target,
  Info,
  ChevronDown,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { TrendChart, DistributionChart } from '@/components/features/bmo/dashboard/charts';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';
import { validationsMock, type Validation } from '../data/validationsMock';
import { SectionTitle, DataCard, KPICard } from '@/components/features/bmo/dashboard/components';

import { BudgetKpiPage, DemandesKpiPage, ProjetKpiPage } from '@/modules/dashboard/components/views';

// Composant Badge Bureau réutilisable
function BureauBadge({ code, size = 'default' }: { code: string; size?: 'sm' | 'default' }) {
  return (
    <Badge
      variant="default"
      className={cn(
        'border-slate-700 text-slate-400',
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      )}
    >
      {code}
    </Badge>
  );
}

// Données de démo
const performanceMetrics = [
  {
    id: 'demandes',
    label: 'Demandes traitées',
    value: 247,
    previousValue: 220,
    target: 260,
    unit: '',
  },
  {
    id: 'validations',
    label: 'Taux de validation',
    value: 89,
    previousValue: 86,
    target: 92,
    unit: '%',
  },
  {
    id: 'delais',
    label: 'Délai moyen',
    value: 2.4,
    previousValue: 2.8,
    target: 2.0,
    unit: 'j',
    inversePositive: true,
  },
  {
    id: 'budget',
    label: 'Budget consommé',
    value: 4.2,
    previousValue: 3.8,
    target: 5.0,
    unit: 'Mds',
  },
  {
    id: 'rejets',
    label: 'Taux de rejet',
    value: 11,
    previousValue: 14,
    target: 8,
    unit: '%',
    inversePositive: true,
  },
  {
    id: 'sla',
    label: 'Conformité SLA',
    value: 94,
    previousValue: 92,
    target: 95,
    unit: '%',
  },
];

const bureauPerformance = [
  { code: 'BF', name: 'Bureau Finances', score: 94, trend: 'up', validations: 45, blocages: 1 },
  { code: 'BCG', name: 'Bureau Comptabilité', score: 87, trend: 'stable', validations: 38, blocages: 2 },
  { code: 'BJA', name: 'Bureau Juridique', score: 82, trend: 'up', validations: 29, blocages: 1 },
  { code: 'BOP', name: 'Bureau Opérations', score: 78, trend: 'down', validations: 52, blocages: 4 },
  { code: 'BRH', name: 'Bureau RH', score: 91, trend: 'up', validations: 33, blocages: 0 },
];



export function PerformanceView() {
  const openModal = useDashboardCommandCenterStore((s) => s.openModal);
  const subCategory = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const subSubCategory = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigation = { subCategory, subSubCategory } as const;

  const { data: statsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getStats({ period: 'year' }), []);

  // Fonction de filtrage des validations selon la navigation
  const getFilteredValidations = useCallback((): Validation[] => {
    let filtered = [...validationsMock];

    // Filtre selon subCategory et filter (niveau 3)
    if (navigation.subCategory === 'validation') {
      const filter = navigation.subSubCategory;
      
      if (filter === 'en-attente') {
        filtered = filtered.filter((v) => v.statut === 'en_attente');
      } else if (filter === 'validees') {
        filtered = filtered.filter((v) => v.statut === 'validee');
      } else if (filter === 'rejetees') {
        filtered = filtered.filter((v) => v.statut === 'rejetee');
      }
      // Si pas de filter, affiche toutes les validations
    }

    // Filtre pour les retards (peut être utilisé dans plusieurs sections)
    if (navigation.subCategory === 'delays' || navigation.subSubCategory === 'retards') {
      filtered = filtered.filter((v) => v.delai < 0);
    }

    // Tri par priorité et délai
    filtered.sort((a, b) => {
      // Critiques en premier
      if (a.priorite === 'critique' && b.priorite !== 'critique') return -1;
      if (a.priorite !== 'critique' && b.priorite === 'critique') return 1;
      
      // Puis par délai (retards en premier)
      return a.delai - b.delai;
    });

    return filtered;
  }, [navigation.subCategory, navigation.subSubCategory]);

  // Validations filtrées
  const filteredValidations = useMemo(() => getFilteredValidations(), [getFilteredValidations]);

  // Helper pour formater les montants
  const formatAmount = useCallback((amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`;
    }
    return `${amount} FCFA`;
  }, []);
  const trendData = useMemo(() => {
    const fallback = [
      { period: 'Juil', demandes: 180, validations: 160 },
      { period: 'Août', demandes: 195, validations: 172 },
      { period: 'Sept', demandes: 210, validations: 185 },
      { period: 'Oct', demandes: 225, validations: 198 },
      { period: 'Nov', demandes: 235, validations: 207 },
      { period: 'Déc', demandes: 247, validations: 220 },
    ];
    const t = (statsData as any)?.trends;
    if (!Array.isArray(t) || t.length === 0) return fallback;
    return t.map((x: any) => ({
      period: String(x.month ?? x.period ?? ''),
      demandes: Number(x.demandes ?? 0),
      validations: Number(x.validations ?? 0),
    }));
  }, [statsData]);

  const isBudgetView =
    navigation.subCategory === 'budget' ||
    (navigation.subCategory === 'indicators' && navigation.subSubCategory === 'budget');

  const isDemandesIndicatorsView =
    navigation.subCategory === 'indicators' && navigation.subSubCategory === 'demandes';

  const isProjetsIndicatorsView =
    navigation.subCategory === 'indicators' && navigation.subSubCategory === 'projets';

  if (isBudgetView) {
    return (
      <div className="p-6 space-y-8 max-w-[1920px] mx-auto">
        <BudgetKpiPage />
      </div>
    );
  }

  if (isDemandesIndicatorsView) {
    return <DemandesKpiPage />;
  }

  if (isProjetsIndicatorsView) {
    return <ProjetKpiPage />;
  }

  return (
    <div className="p-6 space-y-8 max-w-[1920px] mx-auto">
      {/* Header harmonisé */}
      <div className="flex items-center justify-between">
        <SectionTitle
          icon={BarChart3}
          title={
            navigation.subCategory === 'validation' && navigation.subSubCategory === 'en-attente' ? 'Validations en attente' :
            navigation.subCategory === 'validation' && navigation.subSubCategory === 'validees' ? 'Validations approuvées' :
            navigation.subCategory === 'validation' && navigation.subSubCategory === 'rejetees' ? 'Validations rejetées' :
            navigation.subCategory === 'validation' && !navigation.subSubCategory ? 'Toutes les validations' :
            'Performance & KPIs'
          }
          subtitle={
            navigation.subCategory === 'validation' 
              ? `${filteredValidations.length} résultat${filteredValidations.length > 1 ? 's' : ''}`
              : 'Suivi des indicateurs clés de performance'
          }
          size="lg"
        />
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800/70">
            <Calendar className="w-4 h-4 mr-2" />
            Ce mois
          </Button>
          <Button variant="default" size="sm" className="bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800/70">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Tableau des Validations - Affiché uniquement pour subCategory === 'validation' */}
      {navigation.subCategory === 'validation' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Fournisseur</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Projet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Bureau</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Priorité</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Délai</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredValidations.map((validation) => (
                  <tr key={validation.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-white">{validation.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                        {validation.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">{validation.fournisseur}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-white">
                        {formatAmount(validation.montant)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">{validation.projet}</span>
                    </td>
                    <td className="px-4 py-3">
                      <BureauBadge code={validation.bureau} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          validation.priorite === 'critique'
                            ? 'destructive'
                            : validation.priorite === 'haute'
                            ? 'warning'
                            : 'default'
                        }
                        className="text-xs"
                      >
                        {validation.priorite}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          validation.delai < 0
                            ? 'text-red-400'
                            : validation.delai === 0
                            ? 'text-orange-400'
                            : 'text-green-400'
                        )}
                      >
                        {validation.delai < 0
                          ? `${Math.abs(validation.delai)}j retard`
                          : validation.delai === 0
                          ? "Aujourd'hui"
                          : `J+${validation.delai}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {validation.statut === 'en_attente' && (
                        <Badge variant="warning" className="text-xs">
                          En attente
                        </Badge>
                      )}
                      {validation.statut === 'validee' && (
                        <Badge variant="success" className="text-xs bg-green-600">
                          Validée
                        </Badge>
                      )}
                      {validation.statut === 'rejetee' && (
                        <Badge variant="destructive" className="text-xs">
                          Rejetée
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => openModal('action-detail', { validation })}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {validation.statut === 'en_attente' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-green-400 hover:text-green-300"
                              onClick={() => openModal('action-detail', { validation, action: 'validate' })}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                              onClick={() => openModal('action-detail', { validation, action: 'reject' })}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Métriques principales - Masqué pour vue validations et budget */}
      {navigation.subCategory !== 'validation' && navigation.subCategory !== 'budget' && (
      <section aria-label="Métriques clés">
        <SectionTitle
          icon={BarChart3}
          title="Métriques clés"
          subtitle="Indicateurs de performance détaillés"
          size="md"
        />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {performanceMetrics.map((metric) => {
            const change = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
            const targetProgress = (metric.value / metric.target) * 100;

            return (
              <DataCard
                key={metric.id}
                title={metric.label}
                value={`${metric.value}${metric.unit}`}
                badge={`${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                badgeVariant={change > 0 ? 'success' : change < 0 ? 'critical' : 'default'}
                onClick={() => openModal('kpi-drilldown', { kpiId: metric.id })}
              >
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Objectif: {metric.target}{metric.unit}</span>
                    <span>{Math.min(100, targetProgress).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        targetProgress >= 100 ? 'bg-emerald-400' : targetProgress >= 80 ? 'bg-blue-400' : 'bg-amber-400'
                      )}
                      style={{ width: `${Math.min(100, targetProgress)}%` }}
                    />
                  </div>
                </div>
              </DataCard>
            );
          })}
        </div>
      </section>
      )}

      {/* Performance par bureau - Masqué pour vue validations */}
      {navigation.subCategory !== 'validation' && (
      <section aria-label="Performance par bureau" className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <SectionTitle
            icon={BarChart3}
            title="Performance par Bureau"
            subtitle="Comparaison des performances par bureau"
            size="md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Bureau</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Score</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Tendance</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Validations</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">Blocages</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {bureauPerformance.map((bureau) => (
                <tr key={bureau.code} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-300">
                        {bureau.code}
                      </div>
                      <span className="text-sm text-slate-200">{bureau.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'text-lg font-bold',
                        bureau.score >= 90
                          ? 'text-emerald-400'
                          : bureau.score >= 80
                          ? 'text-blue-400'
                          : bureau.score >= 70
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      )}
                    >
                      {bureau.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {bureau.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : bureau.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-rose-400 mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-slate-300">{bureau.validations}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={bureau.blocages === 0 ? 'success' : bureau.blocages <= 2 ? 'warning' : 'destructive'}
                    >
                      {bureau.blocages}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal('bureau-detail', { bureau })}
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {/* Graphiques réels - Masqués pour vue validations */}
      {navigation.subCategory !== 'validation' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-label="Évolution mensuelle" className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <SectionTitle
            icon={LineChart}
            title="Évolution mensuelle"
            subtitle="Tendances des demandes et validations"
            size="sm"
          />
          <TrendChart
            data={trendData}
            dataKeys={[
              { key: 'demandes', label: 'Demandes', color: '#3b82f6' },
              { key: 'validations', label: 'Validations', color: '#10b981' },
            ]}
            height={200}
          />
        </section>

        <section aria-label="Répartition par type" className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <SectionTitle
            icon={PieChart}
            title="Répartition par type"
            subtitle="Distribution des demandes par catégorie"
            size="sm"
          />
          <DistributionChart
            data={[
              { name: 'BC', value: 98, color: '#3b82f6' },
              { name: 'Paiements', value: 74, color: '#10b981' },
              { name: 'Contrats', value: 49, color: '#f59e0b' },
              { name: 'Autres', value: 26, color: '#8b5cf6' },
            ]}
            type="pie"
            height={200}
          />
        </section>
      </div>
      )}
    </div>
  );
}

