'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';

interface PerformanceScoreProps {
  yearlyTotals: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  enrichedData: any[];
}

interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  comment: string;
}

export function PerformanceScore({ yearlyTotals, enrichedData }: PerformanceScoreProps) {
  const { darkMode } = useAppStore();

  const scores = useMemo(() => {
    const validationRate = (yearlyTotals.validations / yearlyTotals.demandes) * 100;
    const rejectionRate = (yearlyTotals.rejets / yearlyTotals.demandes) * 100;
    
    // Calculer la stabilité (variation des volumes)
    const volumes = enrichedData.map(d => d.demandes);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const variance = volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length;
    const stability = Math.max(0, 100 - (Math.sqrt(variance) / avgVolume) * 100);

    // Calculer la tendance (amélioration dans le temps)
    const recentMonths = enrichedData.slice(-3);
    const previousMonths = enrichedData.slice(-6, -3);
    const recentAvg = recentMonths.reduce((sum, m) => sum + (m.validations / m.demandes * 100), 0) / recentMonths.length;
    const previousAvg = previousMonths.reduce((sum, m) => sum + (m.validations / m.demandes * 100), 0) / previousMonths.length;
    const trend = recentAvg > previousAvg ? 100 : Math.max(0, 100 + ((recentAvg - previousAvg) / previousAvg) * 100);

    const breakdown: ScoreBreakdown[] = [
      {
        category: 'Taux de validation',
        score: Math.min(100, validationRate * 1.2), // Bonus si > 80%
        maxScore: 100,
        weight: 0.4,
        comment: validationRate >= 80 ? 'Excellent' : validationRate >= 60 ? 'Bon' : 'À améliorer',
      },
      {
        category: 'Taux de rejet',
        score: Math.max(0, 100 - rejectionRate * 2), // Pénalité si rejets élevés
        maxScore: 100,
        weight: 0.3,
        comment: rejectionRate < 10 ? 'Excellent' : rejectionRate < 20 ? 'Acceptable' : 'Critique',
      },
      {
        category: 'Stabilité',
        score: stability,
        maxScore: 100,
        weight: 0.15,
        comment: stability >= 80 ? 'Très stable' : stability >= 60 ? 'Stable' : 'Variable',
      },
      {
        category: 'Tendance',
        score: trend,
        maxScore: 100,
        weight: 0.15,
        comment: trend >= 100 ? 'En amélioration' : trend >= 95 ? 'Stable' : 'En baisse',
      },
    ];

    const overallScore = breakdown.reduce((sum, item) => 
      sum + (item.score * item.weight), 0
    );

    const getGrade = (score: number) => {
      if (score >= 90) return { label: 'Excellent', color: 'emerald', icon: Trophy };
      if (score >= 75) return { label: 'Très bon', color: 'blue', icon: Award };
      if (score >= 60) return { label: 'Bon', color: 'amber', icon: Target };
      return { label: 'À améliorer', color: 'red', icon: TrendingUp };
    };

    return {
      overall: overallScore,
      grade: getGrade(overallScore),
      breakdown,
    };
  }, [yearlyTotals, enrichedData]);

  return (
    <Card className={cn(
      'border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5',
      'border-slate-700'
    )}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-400" />
          Score de performance global
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score global */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4',
              scores.grade.color === 'emerald' && 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
              scores.grade.color === 'blue' && 'bg-blue-500/20 border-blue-500 text-blue-400',
              scores.grade.color === 'amber' && 'bg-amber-500/20 border-amber-500 text-amber-400',
              scores.grade.color === 'red' && 'bg-red-500/20 border-red-500 text-red-400',
            )}>
              {scores.overall.toFixed(0)}
            </div>
            <div className="text-left">
              <p className="text-lg font-bold">{scores.grade.label}</p>
              <Badge variant={scores.grade.color as any} className="mt-1">
                {scores.grade.icon && <scores.grade.icon className="w-3 h-3 mr-1" />}
                {scores.grade.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Détail par catégorie */}
        <div className="space-y-3">
          {scores.breakdown.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-bold',
                    item.score >= 80 ? 'text-emerald-400' :
                    item.score >= 60 ? 'text-amber-400' : 'text-red-400'
                  )}>
                    {item.score.toFixed(0)}/{item.maxScore}
                  </span>
                  <Badge variant="default" className="text-[9px]">
                    {item.comment}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={item.score} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Benchmarking */}
        <div className={cn(
          'p-3 rounded-lg mt-4',
          'bg-slate-700/30'
        )}>
          <p className="text-xs font-semibold mb-2">💡 Benchmarking</p>
          <div className="space-y-1 text-xs text-slate-400">
            <p>• Objectif optimal: Score ≥ 90</p>
            <p>• Performance moyenne du secteur: Score ~75</p>
            <p>• Score actuel: {scores.overall.toFixed(1)}/100</p>
            {scores.overall < 90 && (
              <p className="text-amber-400 font-semibold mt-2">
                🎯 Gain potentiel: {(90 - scores.overall).toFixed(1)} points
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

