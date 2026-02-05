'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, Target, Zap } from 'lucide-react';

interface PredictionInsightsProps {
  performanceData: any[];
}

export function PredictionInsights({ performanceData }: PredictionInsightsProps) {
  const { darkMode } = useAppStore();

  const predictions = useMemo(() => {
    if (performanceData.length < 3) return [];

    // Calculer les tendances des 3 derniers mois
    const recentMonths = performanceData.slice(-3);
    const previousMonths = performanceData.slice(-6, -3);

    const recentAvg = {
      demandes: recentMonths.reduce((sum, m) => sum + m.demandes, 0) / recentMonths.length,
      validations: recentMonths.reduce((sum, m) => sum + m.validations, 0) / recentMonths.length,
      budget: recentMonths.reduce((sum, m) => sum + m.budget, 0) / recentMonths.length,
    };

    const previousAvg = {
      demandes: previousMonths.reduce((sum, m) => sum + m.demandes, 0) / previousMonths.length,
      validations: previousMonths.reduce((sum, m) => sum + m.validations, 0) / previousMonths.length,
      budget: previousMonths.reduce((sum, m) => sum + m.budget, 0) / previousMonths.length,
    };

    const predictionsList = [];

    // Prédiction: Demandes
    const demandesTrend = ((recentAvg.demandes - previousAvg.demandes) / previousAvg.demandes) * 100;
    if (Math.abs(demandesTrend) > 5) {
      const nextMonthDemandes = recentAvg.demandes + (recentAvg.demandes - previousAvg.demandes);
      predictionsList.push({
        type: demandesTrend > 0 ? 'growth' : 'decline',
        category: 'Demandes',
        current: recentAvg.demandes.toFixed(0),
        predicted: nextMonthDemandes.toFixed(0),
        change: Math.abs(demandesTrend).toFixed(1),
        confidence: demandesTrend > 10 || demandesTrend < -10 ? 'high' : 'medium',
      });
    }

    // Prédiction: Validations
    const validationsTrend = ((recentAvg.validations - previousAvg.validations) / previousAvg.validations) * 100;
    if (Math.abs(validationsTrend) > 5) {
      const nextMonthValidations = recentAvg.validations + (recentAvg.validations - previousAvg.validations);
      predictionsList.push({
        type: validationsTrend > 0 ? 'growth' : 'decline',
        category: 'Validations',
        current: recentAvg.validations.toFixed(0),
        predicted: nextMonthValidations.toFixed(0),
        change: Math.abs(validationsTrend).toFixed(1),
        confidence: validationsTrend > 10 || validationsTrend < -10 ? 'high' : 'medium',
      });
    }

    // Prédiction: Budget
    const budgetTrend = ((recentAvg.budget - previousAvg.budget) / previousAvg.budget) * 100;
    if (Math.abs(budgetTrend) > 3) {
      const nextMonthBudget = recentAvg.budget + (recentAvg.budget - previousAvg.budget);
      predictionsList.push({
        type: budgetTrend > 0 ? 'growth' : 'decline',
        category: 'Budget traité',
        current: recentAvg.budget.toFixed(1),
        predicted: nextMonthBudget.toFixed(1),
        change: Math.abs(budgetTrend).toFixed(1),
        confidence: budgetTrend > 5 || budgetTrend < -5 ? 'high' : 'medium',
      });
    }

    return predictionsList;
  }, [performanceData]);

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            🔮 Prédictions pour le mois prochain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-4">
            Données insuffisantes pour générer des prédictions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5',
      'border-slate-700'
    )}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          Prédictions pour le mois prochain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {predictions.map((pred, idx) => (
            <div
              key={idx}
              className={cn(
                'p-4 rounded-lg border-l-4',
                pred.type === 'growth'
                  ? 'border-l-emerald-500 bg-emerald-500/10'
                  : 'border-l-amber-500 bg-amber-500/10',
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {pred.type === 'growth' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="font-semibold text-sm">{pred.category}</span>
                </div>
                <Badge
                  variant={pred.confidence === 'high' ? 'default' : 'info'}
                  className="text-[9px]"
                >
                  {pred.confidence === 'high' ? 'Haute confiance' : 'Confiance moyenne'}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Actuel:</span>
                  <span className="font-semibold">{pred.current}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Prédit:</span>
                  <span className={cn(
                    'font-bold',
                    pred.type === 'growth' ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    {pred.predicted}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400">Évolution:</span>
                  <span className={cn(
                    'font-semibold',
                    pred.type === 'growth' ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    {pred.type === 'growth' ? '+' : '-'}{pred.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

