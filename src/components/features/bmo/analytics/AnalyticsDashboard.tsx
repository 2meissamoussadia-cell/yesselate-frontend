'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
  yearlyTotals: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  monthlyAverages: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: string;
  };
  previousPeriod?: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
}

export function AnalyticsDashboard({
  yearlyTotals,
  monthlyAverages,
  previousPeriod,
}: AnalyticsDashboardProps) {
  const { darkMode } = useAppStore();

  const insights = useMemo(() => {
    const validationRate = (yearlyTotals.validations / yearlyTotals.demandes) * 100;
    const rejectionRate = (yearlyTotals.rejets / yearlyTotals.demandes) * 100;
    
    const insightsList = [];

    // Insight: Taux de validation
    if (validationRate >= 80) {
      insightsList.push({
        type: 'success' as const,
        icon: '✅',
        title: 'Excellent taux de validation',
        description: `${validationRate.toFixed(1)}% - Performance au-dessus de la moyenne`,
        trend: 'up' as const,
      });
    } else if (validationRate < 60) {
      insightsList.push({
        type: 'warning' as const,
        icon: '⚠️',
        title: 'Taux de validation à améliorer',
        description: `${validationRate.toFixed(1)}% - Analyse des causes de rejet recommandée`,
        trend: 'down' as const,
      });
    }

    // Insight: Taux de rejet
    if (rejectionRate > 20) {
      insightsList.push({
        type: 'error' as const,
        icon: '🚨',
        title: 'Taux de rejet élevé',
        description: `${rejectionRate.toFixed(1)}% - Action corrective nécessaire`,
        trend: 'down' as const,
      });
    }

    // Insight: Volume de demandes
    if (monthlyAverages.demandes > 100) {
      insightsList.push({
        type: 'info' as const,
        icon: '📈',
        title: 'Volume élevé de demandes',
        description: `${monthlyAverages.demandes} demandes/mois - Charge importante`,
        trend: 'up' as const,
      });
    }

    return insightsList;
  }, [yearlyTotals, monthlyAverages]);

  const calculateTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down',
      isPositive: change >= 0,
    };
  };

  const trends = {
    demandes: calculateTrend(yearlyTotals.demandes, previousPeriod?.demandes),
    validations: calculateTrend(yearlyTotals.validations, previousPeriod?.validations),
    rejets: calculateTrend(yearlyTotals.rejets, previousPeriod?.rejets),
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principaux avec tendances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn(
          'border-l-4 border-l-blue-500 transition-all hover:shadow-lg',
          'bg-slate-800/50 border-slate-700'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Demandes
              </span>
              {trends.demandes && (
                <Badge variant={trends.demandes.isPositive ? 'success' : 'warning'} className="text-[9px]">
                  {trends.demandes.direction === 'up' ? '↑' : '↓'} {trends.demandes.value}%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-400 mb-1">{yearlyTotals.demandes.toLocaleString()}</p>
            <p className="text-xs text-slate-400">
              ~{monthlyAverages.demandes}/mois
            </p>
            {previousPeriod && (
              <p className="text-[10px] text-slate-400 mt-1">
                Période précédente: {previousPeriod.demandes.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={cn(
          'border-l-4 border-l-emerald-500 transition-all hover:shadow-lg',
          'bg-slate-800/50 border-slate-700'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Validations
              </span>
              {trends.validations && (
                <Badge variant={trends.validations.isPositive ? 'success' : 'warning'} className="text-[9px]">
                  {trends.validations.direction === 'up' ? '↑' : '↓'} {trends.validations.value}%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-400 mb-1">{yearlyTotals.validations.toLocaleString()}</p>
            <p className="text-xs text-slate-400">
              {((yearlyTotals.validations / yearlyTotals.demandes) * 100).toFixed(1)}% taux
            </p>
            {previousPeriod && (
              <p className="text-[10px] text-slate-400 mt-1">
                Période précédente: {previousPeriod.validations.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={cn(
          'border-l-4 border-l-red-500 transition-all hover:shadow-lg',
          'bg-slate-800/50 border-slate-700'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Rejets
              </span>
              {trends.rejets && (
                <Badge variant={trends.rejets.isPositive ? 'warning' : 'success'} className="text-[9px]">
                  {trends.rejets.direction === 'up' ? '↑' : '↓'} {trends.rejets.value}%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400 mb-1">{yearlyTotals.rejets.toLocaleString()}</p>
            <p className="text-xs text-slate-400">
              {((yearlyTotals.rejets / yearlyTotals.demandes) * 100).toFixed(1)}% taux
            </p>
            {previousPeriod && (
              <p className="text-[10px] text-slate-400 mt-1">
                Période précédente: {previousPeriod.rejets.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={cn(
          'border-l-4 border-l-amber-500 transition-all hover:shadow-lg',
          'bg-slate-800/50 border-slate-700'
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Budget traité
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-400 mb-1">
              {yearlyTotals.budget.toFixed(1)}
            </p>
            <p className="text-xs text-slate-400">
              {yearlyTotals.budget.toFixed(1)} Mds FCFA
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              ~{monthlyAverages.budget} Mds/mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights intelligents */}
      {insights.length > 0 && (
        <Card className={cn(
          'border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5',
          'border-slate-700'
        )}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Insights automatiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-3 rounded-lg border-l-4 flex items-start gap-3',
                    insight.type === 'success' && 'border-l-emerald-500 bg-emerald-500/10',
                    insight.type === 'warning' && 'border-l-amber-500 bg-amber-500/10',
                    insight.type === 'error' && 'border-l-red-500 bg-red-500/10',
                    insight.type === 'info' && 'border-l-blue-500 bg-blue-500/10',
                  )}
                >
                  <span className="text-xl flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">{insight.title}</p>
                    <p className="text-xs text-slate-400">{insight.description}</p>
                  </div>
                  {insight.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

