'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';

interface PerformanceScoreWidgetProps {
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

interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  comment: string;
}

export function PerformanceScoreWidget({
  totals,
  periodData,
  previousPeriod,
  className,
}: PerformanceScoreWidgetProps) {
  const { darkMode } = useAppStore();

  const scores = useMemo(() => {
    const validationRate = totals.demandes > 0 ? (totals.validations / totals.demandes) * 100 : 0;
    const rejectionRate = totals.demandes > 0 ? (totals.rejets / totals.demandes) * 100 : 0;

    // Calculer la stabilité
    let stability = 100;
    if (periodData.length >= 2) {
      const volumes = periodData.map((d) => d.demandes);
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      if (avgVolume > 0) {
        const variance = volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length;
        stability = Math.max(0, 100 - (Math.sqrt(variance) / avgVolume) * 100);
      }
    }

    // Calculer la tendance
    let trend = 100;
    if (periodData.length >= 6) {
      const recent = periodData.slice(-3);
      const previous = periodData.slice(-6, -3);
      const recentAvg = recent.reduce((sum, m) => sum + (m.demandes > 0 ? (m.validations / m.demandes) * 100 : 0), 0) / recent.length;
      const previousAvg = previous.reduce((sum, m) => sum + (m.demandes > 0 ? (m.validations / m.demandes) * 100 : 0), 0) / previous.length;
      if (previousAvg > 0) {
        trend = recentAvg > previousAvg ? 100 : Math.max(0, 100 + ((recentAvg - previousAvg) / previousAvg) * 100);
      }
    }

    const breakdown: ScoreBreakdown[] = [
      {
        category: 'Taux de validation',
        score: Math.min(100, validationRate * 1.2),
        maxScore: 100,
        weight: 0.4,
        comment: validationRate >= 80 ? 'Excellent' : validationRate >= 60 ? 'Bon' : 'À améliorer',
      },
      {
        category: 'Taux de rejet',
        score: Math.max(0, 100 - rejectionRate * 2),
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

    const overallScore = breakdown.reduce((sum, item) => sum + item.score * item.weight, 0);

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
      previousScore: previousPeriod
        ? (() => {
            const prevValidationRate = previousPeriod.demandes > 0 ? (previousPeriod.validations / previousPeriod.demandes) * 100 : 0;
            const prevRejectionRate = previousPeriod.demandes > 0 ? (previousPeriod.rejets / previousPeriod.demandes) * 100 : 0;
            return (
              Math.min(100, prevValidationRate * 1.2) * 0.4 +
              Math.max(0, 100 - prevRejectionRate * 2) * 0.3 +
              100 * 0.15 +
              100 * 0.15
            );
          })()
        : undefined,
    };
  }, [totals, periodData, previousPeriod]);

  const scoreChange = scores.previousScore
    ? scores.overall - scores.previousScore
    : undefined;

  const Icon = scores.grade.icon;

  return (
    <DashboardCard
      title="🎯 Score de Performance"
      subtitle="Évaluation globale avec benchmarking"
      icon="🎯"
      borderColor="#F59E0B"
      className={className}
    >
      <div className="space-y-4">
        {/* Score principal */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={darkMode ? '#334155' : '#e2e8f0'}
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={
                    scores.grade.color === 'emerald'
                      ? '#10B981'
                      : scores.grade.color === 'blue'
                      ? '#3B82F6'
                      : scores.grade.color === 'amber'
                      ? '#F59E0B'
                      : '#EF4444'
                  }
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(scores.overall / 100) * 283} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{Math.round(scores.overall)}</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Icon
              className={cn(
                'w-5 h-5',
                scores.grade.color === 'emerald'
                  ? 'text-emerald-400'
                  : scores.grade.color === 'blue'
                  ? 'text-blue-400'
                  : scores.grade.color === 'amber'
                  ? 'text-amber-400'
                  : 'text-red-400'
              )}
            />
            <span className="text-sm font-semibold">{scores.grade.label}</span>
            {scoreChange !== undefined && (
              <Badge
                variant={scoreChange >= 0 ? 'success' : 'urgent'}
                className="text-[9px]"
              >
                {scoreChange >= 0 ? '+' : ''}
                {scoreChange.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Détail des composants */}
        <div className="space-y-2">
          {scores.breakdown.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{item.category}</span>
                <span className="text-slate-400">
                  {item.score.toFixed(0)}/{item.maxScore} ({item.comment})
                </span>
              </div>
              <Progress
                value={(item.score / item.maxScore) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

