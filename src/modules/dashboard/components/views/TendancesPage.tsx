/**
 * Page Tendances
 * VERSION OPTIMISÉE - Graphiques et analyses de tendances organisés par période
 * Affiche les évolutions temporelles des indicateurs clés
 */

'use client';

import React, { useState, useMemo, memo } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3, LineChart, Activity, DollarSign, Users, FileCheck, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mapColorToTone } from '../../utils/colorMapping';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
} from '../shared';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  period: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
}

interface TrendIndicator {
  id: string;
  label: string;
  currentValue: string;
  trend: TrendData;
  icon: LucideIcon;
  color: 'blue' | 'orange' | 'red' | 'emerald' | 'purple' | 'cyan';
  category: 'activite' | 'risques' | 'budget' | 'decisions';
  sparklineData?: number[];
}

type TimeRange = '7d' | '30d' | '90d' | '1y';
type TrendType = 'mensuelles' | 'trimestrielles';

export const TendancesPage = memo(function TendancesPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [trendType, setTrendType] = useState<TrendType>('mensuelles');

  // Générer des données de tendances basées sur la période
  const generateTrendData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Générer des données réalistes avec variations
      const baseValidations = 5 + Math.sin(i / 10) * 2 + Math.random() * 2;
      const baseRisques = 9 - Math.sin(i / 8) * 1.5 + Math.random() * 1;
      const baseBudget = 64 + (i / days) * 2 + Math.sin(i / 15) * 1;
      const baseDecisions = 10 + Math.sin(i / 12) * 2 + Math.random() * 1.5;
      
      data.push({
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        validations: Math.round(baseValidations),
        risques: Math.round(baseRisques),
        budget: Math.round(baseBudget * 10) / 10,
        decisions: Math.round(baseDecisions),
      });
    }
    
    return data;
  }, [timeRange]);

  const trendIndicators: TrendIndicator[] = useMemo(() => [
    {
      id: 'validations',
      label: 'Validations',
      currentValue: '8',
      trend: {
        period: 'Mois en cours',
        value: 8,
        previousValue: 5,
        change: 3,
        changePercent: 60,
      },
      icon: FileCheck,
      color: 'blue',
      category: 'activite',
      sparklineData: generateTrendData.map(d => d.validations),
    },
    {
      id: 'risques',
      label: 'Risques identifiés',
      currentValue: '8',
      trend: {
        period: 'Mois en cours',
        value: 8,
        previousValue: 9,
        change: -1,
        changePercent: -11,
      },
      icon: AlertTriangle,
      color: 'red',
      category: 'risques',
      sparklineData: generateTrendData.map(d => d.risques),
    },
    {
      id: 'budget',
      label: 'Budget consommé',
      currentValue: '66%',
      trend: {
        period: 'Mois en cours',
        value: 66,
        previousValue: 64,
        change: 2,
        changePercent: 3,
      },
      icon: DollarSign,
      color: 'emerald',
      category: 'budget',
      sparklineData: generateTrendData.map(d => d.budget),
    },
    {
      id: 'decisions',
      label: 'Décisions prises',
      currentValue: '12',
      trend: {
        period: 'Mois en cours',
        value: 12,
        previousValue: 10,
        change: 2,
        changePercent: 20,
      },
      icon: Activity,
      color: 'purple',
      category: 'decisions',
      sparklineData: generateTrendData.map(d => d.decisions),
    },
  ], [generateTrendData]);

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: '1y', label: '1 an' },
  ];

  const renderTrendCard = (indicator: TrendIndicator) => {
    const dir =
      indicator.trend.change > 0 ? ('up' as const) : indicator.trend.change < 0 ? ('down' as const) : ('neutral' as const);

    const goodWhenDown = new Set(['risques', 'budget']);
    const goodWhenUp = new Set(['activite', 'decisions']);

    const sentiment =
      dir === 'neutral'
        ? ('neutral' as const)
        : goodWhenDown.has(indicator.category)
          ? dir === 'down'
            ? ('positive' as const)
            : ('negative' as const)
          : goodWhenUp.has(indicator.category)
            ? dir === 'up'
              ? ('positive' as const)
              : ('negative' as const)
            : ('neutral' as const);

    const trendLabel =
      dir === 'neutral'
        ? 'Stable'
        : `${indicator.trend.change > 0 ? '+' : ''}${indicator.trend.change} (${Math.abs(indicator.trend.changePercent)}%)`;

    // Mapper la couleur de manière sûre avec l'utilitaire partagé
    const color = mapColorToTone(indicator.color) as KPICardData['color'];

    return (
      <KPICard
        key={indicator.id}
        kpi={{
          id: indicator.id,
          label: indicator.label,
          value: indicator.currentValue,
          trend: indicator.trend.changePercent,
          trendType: dir,
          icon: indicator.icon,
          color,
          description: `${indicator.trend.period} • vs période précédente`,
        }}
        size="md"
      />
    );
  };

  const groupedIndicators = {
    activite: trendIndicators.filter((i) => i.category === 'activite'),
    risques: trendIndicators.filter((i) => i.category === 'risques'),
    budget: trendIndicators.filter((i) => i.category === 'budget'),
    decisions: trendIndicators.filter((i) => i.category === 'decisions'),
  };

  return (
    <DashboardPageLayout maxWidth="xl" padding="md">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
            Tendances
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Évolution temporelle des indicateurs clés
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Période :</span>
            <div className="flex gap-2">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(option.value)}
                  className={cn(
                    timeRange === option.value && 'bg-blue-600 hover:bg-blue-700',
                    timeRange !== option.value && 'border-slate-800/70 bg-slate-950/30 text-slate-300 hover:bg-slate-900/40'
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm">Type :</span>
            <div className="flex gap-2">
              <Button
                variant={trendType === 'mensuelles' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTrendType('mensuelles')}
                className={cn(
                  trendType === 'mensuelles' && 'bg-purple-600 hover:bg-purple-700',
                  trendType !== 'mensuelles' && 'border-slate-800/70 bg-slate-950/30 text-slate-300 hover:bg-slate-900/40'
                )}
              >
                Mensuelles
              </Button>
              <Button
                variant={trendType === 'trimestrielles' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTrendType('trimestrielles')}
                className={cn(
                  trendType === 'trimestrielles' && 'bg-purple-600 hover:bg-purple-700',
                  trendType !== 'trimestrielles' && 'border-slate-800/70 bg-slate-950/30 text-slate-300 hover:bg-slate-900/40'
                )}
              >
                Trimestrielles
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble des tendances */}
      <DashboardSection
        title="Vue d'ensemble"
        icon={TrendingUp}
      >
        <DashboardGrid columns={4} gap="md">
          {trendIndicators.map(renderTrendCard)}
        </DashboardGrid>
      </DashboardSection>

      {/* Graphique principal */}
      <DashboardSection
        title="Évolution temporelle"
        icon={BarChart3}
      >
        <DashboardPanel padding="lg" className="min-w-0 overflow-hidden">
          <div className="h-64 sm:h-96 min-h-[256px] sm:min-h-[384px] w-full min-w-0 overflow-hidden">
              {!generateTrendData?.length ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  Aucune donnée pour la période sélectionnée
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={384}>
                <AreaChart data={generateTrendData}>
                <defs>
                  <linearGradient id="colorValidations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRisques" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDecisions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8"
                  style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#cbd5e1', paddingTop: '20px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="validations" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorValidations)"
                  name="Validations"
                />
                <Area 
                  type="monotone" 
                  dataKey="risques" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorRisques)"
                  name="Risques"
                />
                <Area 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#22c55e" 
                  fillOpacity={1} 
                  fill="url(#colorBudget)"
                  name="Budget (%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="decisions" 
                  stroke="#a855f7" 
                  fillOpacity={1} 
                  fill="url(#colorDecisions)"
                  name="Décisions"
                />
              </AreaChart>
            </ResponsiveContainer>
              )}
          </div>
        </DashboardPanel>
      </DashboardSection>

      {/* Groupes par catégorie */}
      {Object.entries(groupedIndicators).map(([category, indicators]) => {
        if (indicators.length === 0) return null;

        const categoryLabels = {
          activite: 'Activité',
          risques: 'Risques & Blocages',
          budget: 'Budget & Conformité',
          decisions: 'Décisions',
        };

        const categoryIcons: Record<string, LucideIcon> = {
          activite: Activity,
          risques: AlertTriangle,
          budget: DollarSign,
          decisions: FileCheck,
        };

        const Icon = categoryIcons[category];

        return (
          <DashboardSection
            key={category}
            title={categoryLabels[category as keyof typeof categoryLabels]}
            icon={Icon}
          >
            <DashboardGrid columns={2} gap="md">
              {indicators.map(renderTrendCard)}
            </DashboardGrid>
          </DashboardSection>
        );
      })}

      {/* Section contexte */}
      <DashboardSection
        title="À propos des tendances"
        icon={Calendar}
      >
        <p className="text-slate-300 text-sm">
          Cette section présente l'évolution temporelle des indicateurs clés du système.
          Les tendances sont calculées sur différentes périodes pour permettre une analyse approfondie.
        </p>
        <DashboardGrid columns={2} gap="md" className="mt-4">
          <DashboardPanel padding="md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-emerald-400 h-4 w-4" />
              <h3 className="font-semibold text-white text-sm">Tendances positives</h3>
            </div>
            <p className="text-slate-400 text-xs">Indicateurs en amélioration sur la période sélectionnée</p>
          </DashboardPanel>
          <DashboardPanel padding="md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="text-rose-400 h-4 w-4" />
              <h3 className="font-semibold text-white text-sm">Tendances négatives</h3>
            </div>
            <p className="text-slate-300 text-xs">Indicateurs nécessitant une attention particulière</p>
          </DashboardPanel>
        </DashboardGrid>
      </DashboardSection>
    </DashboardPageLayout>
  );
});

export default TendancesPage;

