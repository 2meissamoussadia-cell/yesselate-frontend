'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Award } from 'lucide-react';

interface Insight {
  type: 'trend' | 'strength' | 'risk' | 'opportunity';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'positive';
  title: string;
  description: string;
  recommendation?: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

interface IntelligentInsightsWidgetProps {
  totals: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  periodData: Array<{ month?: string; demandes: number; validations: number; rejets: number; budget: number }>;
  previousPeriod?: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  className?: string;
}

export function IntelligentInsightsWidget({
  totals,
  periodData,
  previousPeriod,
  className,
}: IntelligentInsightsWidgetProps) {
  const { darkMode } = useAppStore();

  const insights = useMemo(() => {
    const generated: Insight[] = [];

    // Calculs des métriques
    const validationRate = totals.demandes > 0 ? (totals.validations / totals.demandes) * 100 : 0;
    const rejectionRate = totals.demandes > 0 ? (totals.rejets / totals.demandes) * 100 : 0;

    // Calcul de la tendance
    if (periodData.length >= 3) {
      const recent = periodData.slice(-3);
      const previous = periodData.slice(-6, -3);
      
      if (previous.length > 0) {
        const recentAvg = {
          demandes: recent.reduce((sum, m) => sum + m.demandes, 0) / recent.length,
          validations: recent.reduce((sum, m) => sum + m.validations, 0) / recent.length,
        };
        const previousAvg = {
          demandes: previous.reduce((sum, m) => sum + m.demandes, 0) / previous.length,
          validations: previous.reduce((sum, m) => sum + m.validations, 0) / previous.length,
        };

        const demandesTrend = previousAvg.demandes > 0 
          ? ((recentAvg.demandes - previousAvg.demandes) / previousAvg.demandes) * 100 
          : 0;
        const validationsTrend = previousAvg.validations > 0
          ? ((recentAvg.validations - previousAvg.validations) / previousAvg.validations) * 100
          : 0;

        // Insight: Tendance des demandes
        if (Math.abs(demandesTrend) > 10) {
          generated.push({
            type: 'trend',
            severity: demandesTrend > 0 ? 'positive' : 'high',
            title: demandesTrend > 0 ? 'Hausse des demandes' : 'Baisse des demandes',
            description: `Variation de ${Math.abs(demandesTrend).toFixed(1)}% sur les 3 derniers mois`,
            recommendation: demandesTrend > 0 
              ? 'Anticiper la charge de travail accrue'
              : 'Analyser les causes de la baisse',
            icon: demandesTrend > 0 ? '📈' : '📉',
            trend: demandesTrend > 0 ? 'up' : 'down',
          });
        }

        // Insight: Tendance des validations
        if (Math.abs(validationsTrend) > 10) {
          generated.push({
            type: validationsTrend > 0 ? 'strength' : 'risk',
            severity: validationsTrend > 0 ? 'positive' : 'medium',
            title: validationsTrend > 0 ? 'Amélioration des validations' : 'Baisse des validations',
            description: `Variation de ${Math.abs(validationsTrend).toFixed(1)}% sur les 3 derniers mois`,
            recommendation: validationsTrend > 0
              ? 'Maintenir cette dynamique positive'
              : 'Identifier les causes de la baisse',
            icon: validationsTrend > 0 ? '✅' : '⚠️',
            trend: validationsTrend > 0 ? 'up' : 'down',
          });
        }
      }
    }

    // Insight: Taux de validation
    if (validationRate >= 85) {
      generated.push({
        type: 'strength',
        severity: 'positive',
        title: 'Excellent taux de validation',
        description: `Taux de ${validationRate.toFixed(1)}% - Performance au-dessus de la moyenne`,
        recommendation: 'Maintenir ce niveau de qualité',
        icon: '🏆',
        trend: 'up',
      });
    } else if (validationRate < 60) {
      generated.push({
        type: 'risk',
        severity: 'critical',
        title: 'Taux de validation à améliorer',
        description: `Taux de ${validationRate.toFixed(1)}% - En dessous du seuil acceptable`,
        recommendation: 'Analyser les causes de rejet et améliorer les processus',
        icon: '🚨',
        trend: 'down',
      });
    }

    // Insight: Taux de rejet
    if (rejectionRate > 20) {
      generated.push({
        type: 'risk',
        severity: 'high',
        title: 'Taux de rejet élevé',
        description: `Taux de ${rejectionRate.toFixed(1)}% - Action corrective nécessaire`,
        recommendation: 'Identifier les motifs de rejet récurrents',
        icon: '⚠️',
        trend: 'down',
      });
    }

    // Insight: Comparaison avec période précédente
    if (previousPeriod) {
      const demandesChange = previousPeriod.demandes > 0
        ? ((totals.demandes - previousPeriod.demandes) / previousPeriod.demandes) * 100
        : 0;
      
      if (Math.abs(demandesChange) > 15) {
        generated.push({
          type: demandesChange > 0 ? 'trend' : 'risk',
          severity: demandesChange > 0 ? 'positive' : 'medium',
          title: demandesChange > 0 ? 'Croissance significative' : 'Baisse significative',
          description: `Variation de ${Math.abs(demandesChange).toFixed(1)}% par rapport à la période précédente`,
          recommendation: demandesChange > 0
            ? 'Adapter les ressources à la croissance'
            : 'Analyser les causes de la baisse',
          icon: demandesChange > 0 ? '📊' : '📉',
          trend: demandesChange > 0 ? 'up' : 'down',
        });
      }
    }

    // Trier par sévérité
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, positive: 0 };
    return generated.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]).slice(0, 5);
  }, [totals, periodData, previousPeriod]);

  if (insights.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: Insight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-400/60 bg-red-400/5';
      case 'high':
        return 'border-amber-400/60 bg-amber-400/5';
      case 'medium':
        return 'border-blue-400/60 bg-blue-400/5';
      case 'positive':
        return 'border-emerald-400/60 bg-emerald-400/5';
      default:
        return 'border-slate-400/60 bg-slate-400/5';
    }
  };

  return (
    <DashboardCard
      title="🧠 Insights Intelligents"
      subtitle="Analyses automatiques et recommandations"
      icon="🧠"
      borderColor="#8B5CF6"
      className={className}
    >
      <div className="space-y-2">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={cn(
              'p-3 rounded-lg border-l-4 transition-colors',
              getSeverityColor(insight.severity)
            )}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-semibold">{insight.title}</h4>
                  <Badge
                    variant={
                      insight.severity === 'critical'
                        ? 'urgent'
                        : insight.severity === 'high'
                        ? 'warning'
                        : insight.severity === 'positive'
                        ? 'success'
                        : 'default'
                    }
                    className="text-[9px]"
                  >
                    {insight.severity}
                  </Badge>
                  {insight.trend && (
                    <span className="text-[10px]">
                      {insight.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : insight.trend === 'down' ? (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      ) : null}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mb-1">{insight.description}</p>
                {insight.recommendation && (
                  <p className="text-[10px] text-slate-400 italic">
                    💡 {insight.recommendation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

