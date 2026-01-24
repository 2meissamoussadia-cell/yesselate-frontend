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
import { KPICard } from '@/components/features/bmo/dashboard/components';
import { DashboardPageShell } from '../shared/DashboardPageShell';
import { DashboardPanel } from '../shared/DashboardPanel';
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

    const color =
      indicator.color === 'orange'
        ? ('amber' as const)
        : indicator.color === 'red'
          ? ('rose' as const)
          : (indicator.color as any);

    return (
      <KPICard
        key={indicator.id}
        kpi={{
          id: indicator.id,
          label: indicator.label,
          value: indicator.currentValue,
          delta: trendLabel,
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
    <DashboardPageShell
      title="Tendances"
      subtitle="Évolution temporelle des indicateurs clés"
      rightSlot={
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Période :</span>
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
            <span className="text-sm text-slate-300">Type :</span>
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
      }
    >
      <DashboardPanel className="p-4 sm:p-6">
        {/* Vue d'ensemble des tendances */}
        <section className="space-y-4 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 break-words">
            <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span className="min-w-0">Vue d'ensemble</span>
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 lg:gap-6 min-w-0">
            {trendIndicators.map(renderTrendCard)}
          </div>
        </section>
      </DashboardPanel>

      <DashboardPanel className="p-4 sm:p-6">
        {/* Graphique principal */}
        <section className="space-y-4 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 break-words">
            <BarChart3 className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <span className="min-w-0">Évolution temporelle</span>
          </h2>
          <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 sm:p-6 min-w-0 overflow-hidden">
            <div className="h-64 sm:h-96 min-h-[256px] sm:min-h-[384px] w-full min-w-0 overflow-hidden">
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
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
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
          </div>
        </div>
      </section>
      </DashboardPanel>

      {/* Groupes par catégorie */}
      {Object.entries(groupedIndicators).map(([category, indicators]) => {
        if (indicators.length === 0) return null;

        const categoryLabels = {
          activite: 'Activité',
          risques: 'Risques & Blocages',
          budget: 'Budget & Conformité',
          decisions: 'Décisions',
        };

        return (
          <DashboardPanel key={category} className="p-4 sm:p-6">
            <section className="space-y-4 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-white">{categoryLabels[category as keyof typeof categoryLabels]}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 min-w-0">
                {indicators.map(renderTrendCard)}
              </div>
            </section>
          </DashboardPanel>
        );
      })}

      {/* Section contexte */}
      <DashboardPanel className="p-4 sm:p-6">
        <div className="space-y-4 min-w-0 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 break-words">
            <Calendar className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="min-w-0">À propos des tendances</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base break-words">
            Cette section présente l'évolution temporelle des indicateurs clés du système.
            Les tendances sont calculées sur différentes périodes pour permettre une analyse approfondie.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Tendances positives</h3>
              </div>
              <p className="text-sm text-slate-400">Indicateurs en amélioration sur la période sélectionnée</p>
            </div>
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <h3 className="font-semibold text-white">Tendances négatives</h3>
              </div>
              <p className="text-sm text-slate-300">Indicateurs nécessitant une attention particulière</p>
            </div>
          </div>
        </div>
      </DashboardPanel>
    </DashboardPageShell>
  );
});

