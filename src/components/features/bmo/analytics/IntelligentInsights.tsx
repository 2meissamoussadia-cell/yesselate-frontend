'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, Target, Zap, Award, AlertTriangle } from 'lucide-react';

interface IntelligentInsightsProps {
  yearlyTotals: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  enrichedData: any[];
  monthlyAverages: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: string;
  };
}

interface Insight {
  type: 'trend' | 'anomaly' | 'strength' | 'risk' | 'opportunity';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'positive';
  title: string;
  description: string;
  impact: string;
  recommendation?: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

export function IntelligentInsights({
  yearlyTotals,
  enrichedData,
  monthlyAverages,
}: IntelligentInsightsProps) {
  const { darkMode } = useAppStore();

  const insights = useMemo(() => {
    const generated: Insight[] = [];

    // Calculs des métriques
    const validationRate = (yearlyTotals.validations / yearlyTotals.demandes) * 100;
    const rejectionRate = (yearlyTotals.rejets / yearlyTotals.demandes) * 100;

    // Calcul de la tendance des 3 derniers mois
    const recentMonths = enrichedData.slice(-3);
    const previousMonths = enrichedData.slice(-6, -3);
    
    const recentAvg = {
      demandes: recentMonths.reduce((sum, m) => sum + m.demandes, 0) / recentMonths.length,
      validations: recentMonths.reduce((sum, m) => sum + m.validations, 0) / recentMonths.length,
      rejets: recentMonths.reduce((sum, m) => sum + m.rejets, 0) / recentMonths.length,
    };

    const previousAvg = {
      demandes: previousMonths.reduce((sum, m) => sum + m.demandes, 0) / previousMonths.length,
      validations: previousMonths.reduce((sum, m) => sum + m.validations, 0) / previousMonths.length,
      rejets: previousMonths.reduce((sum, m) => sum + m.rejets, 0) / previousMonths.length,
    };

    const demandesTrend = ((recentAvg.demandes - previousAvg.demandes) / previousAvg.demandes) * 100;
    const validationsTrend = ((recentAvg.validations - previousAvg.validations) / previousAvg.validations) * 100;
    const rejetsTrend = ((recentAvg.rejets - previousAvg.rejets) / previousAvg.rejets) * 100;

    // Insight 1: Taux de validation
    if (validationRate >= 85) {
      generated.push({
        type: 'strength',
        severity: 'positive',
        title: 'Excellent taux de validation',
        description: `Le taux de validation de ${validationRate.toFixed(1)}% est au-dessus des standards.`,
        impact: 'Performance exceptionnelle',
        recommendation: 'Maintenir ce niveau de qualité',
        icon: '🏆',
        trend: 'up',
      });
    } else if (validationRate < 60) {
      generated.push({
        type: 'risk',
        severity: 'critical',
        title: 'Taux de validation critique',
        description: `Le taux de validation de ${validationRate.toFixed(1)}% est en dessous du seuil acceptable (60%).`,
        impact: 'Impact majeur sur la productivité',
        recommendation: 'Analyser les causes de rejet et améliorer les processus',
        icon: '🚨',
        trend: 'down',
      });
    }

    // Insight 2: Tendance des validations
    if (validationsTrend > 10) {
      generated.push({
        type: 'trend',
        severity: 'positive',
        title: 'Accélération des validations',
        description: `Les validations ont augmenté de ${validationsTrend.toFixed(1)}% sur les 3 derniers mois.`,
        impact: 'Amélioration continue',
        recommendation: 'Capitaliser sur cette dynamique positive',
        icon: '📈',
        trend: 'up',
      });
    } else if (validationsTrend < -10) {
      generated.push({
        type: 'anomaly',
        severity: 'high',
        title: 'Décélération des validations',
        description: `Les validations ont diminué de ${Math.abs(validationsTrend).toFixed(1)}% sur les 3 derniers mois.`,
        impact: 'Ralentissement potentiel',
        recommendation: 'Identifier les facteurs de ralentissement',
        icon: '⚠️',
        trend: 'down',
      });
    }

    // Insight 3: Taux de rejet
    if (rejectionRate > 25) {
      generated.push({
        type: 'risk',
        severity: 'critical',
        title: 'Taux de rejet élevé',
        description: `Le taux de rejet de ${rejectionRate.toFixed(1)}% nécessite une attention immédiate.`,
        impact: 'Coûts et délais supplémentaires',
        recommendation: 'Mettre en place un plan d\'action correctif',
        icon: '🔴',
        trend: 'down',
      });
    } else if (rejectionRate < 10) {
      generated.push({
        type: 'strength',
        severity: 'positive',
        title: 'Faible taux de rejet',
        description: `Le taux de rejet de ${rejectionRate.toFixed(1)}% témoigne d'une bonne qualité.`,
        impact: 'Efficacité opérationnelle',
        recommendation: 'Maintenir ce niveau de qualité',
        icon: '✅',
        trend: 'up',
      });
    }

    // Insight 4: Volume de demandes
    if (demandesTrend > 20) {
      generated.push({
        type: 'opportunity',
        severity: 'medium',
        title: 'Croissance significative du volume',
        description: `Les demandes ont augmenté de ${demandesTrend.toFixed(1)}% - potentiel de surcharge.`,
        impact: 'Augmentation de la charge de travail',
        recommendation: 'Anticiper les besoins en ressources',
        icon: '📊',
        trend: 'up',
      });
    }

    // Insight 5: Stabilité
    const volumes = enrichedData.map(d => d.demandes);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const variance = volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length;
    const stability = 100 - (Math.sqrt(variance) / avgVolume) * 100;

    if (stability >= 85) {
      generated.push({
        type: 'strength',
        severity: 'positive',
        title: 'Excellente stabilité opérationnelle',
        description: `La variation des volumes est minimale (stabilité: ${stability.toFixed(0)}%).`,
        impact: 'Planification facilitée',
        recommendation: 'Maintenir cette régularité',
        icon: '⚖️',
        trend: 'stable',
      });
    }

    return generated.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, positive: 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [yearlyTotals, enrichedData, monthlyAverages]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-500/10';
      case 'high':
        return 'border-l-orange-500 bg-orange-500/10';
      case 'medium':
        return 'border-l-amber-500 bg-amber-500/10';
      case 'low':
        return 'border-l-blue-500 bg-blue-500/10';
      case 'positive':
        return 'border-l-emerald-500 bg-emerald-500/10';
      default:
        return 'border-l-slate-500 bg-slate-500/10';
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      'border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5',
      'border-slate-700'
    )}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          Insights intelligents
          <Badge variant="info" className="ml-auto">
            {insights.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={cn(
                'p-4 rounded-lg border-l-4 transition-all hover:shadow-lg hover:scale-[1.02]',
                getSeverityColor(insight.severity)
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge
                      variant={
                        insight.severity === 'critical' ? 'urgent' :
                        insight.severity === 'high' ? 'warning' :
                        insight.severity === 'positive' ? 'success' :
                        'info'
                      }
                      className="text-[9px]"
                    >
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{insight.description}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Target className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400">Impact:</span>
                      <span className="font-medium">{insight.impact}</span>
                    </div>
                    {insight.recommendation && (
                      <div className="flex items-start gap-2 text-xs">
                        <Zap className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-amber-400">{insight.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>
                {insight.trend === 'up' && (
                  <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {insight.trend === 'down' && (
                  <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                {insight.trend === 'stable' && (
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

