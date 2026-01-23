/**
 * Vue Scores - Analyse des scores d'évaluations
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';
import type { Evaluation } from '@/lib/types/bmo.types';

interface ScoresViewProps {
  subCategory: string | null;
  onOpenEvaluation?: (evaluation: Evaluation) => void;
}

export function ScoresView({ subCategory }: ScoresViewProps) {
  const [data, setData] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: EvaluationsFilters = { status: 'completed' };
      const [result, statsResult] = await Promise.all([
        evaluationsApiService.getAll(filters, { field: 'score', direction: 'desc' }, 1, 100),
        evaluationsApiService.getStats(filters),
      ]);
      setData(result.data);
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const scoreRanges = [
    { label: 'Excellent (≥90)', min: 90, max: 100, color: 'emerald', count: stats?.excellent || 0 },
    { label: 'Bon (75-89)', min: 75, max: 89, color: 'blue', count: stats?.bon || 0 },
    { label: 'À améliorer (<75)', min: 0, max: 74, color: 'amber', count: stats?.ameliorer || 0 },
  ];

  const topScores = data.slice(0, 10);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Analyse des Scores
        </h2>
      </div>

      {/* Stats par range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scoreRanges.map((range) => (
          <Card key={range.label} className="border-l-4" style={{
            borderLeftColor: range.color === 'emerald' ? 'rgb(16 185 129)' : range.color === 'blue' ? 'rgb(59 130 246)' : 'rgb(245 158 11)'
          }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{range.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', 
                    range.color === 'emerald' ? 'text-emerald-400' : 
                    range.color === 'blue' ? 'text-blue-400' : 'text-amber-400'
                  )}>
                    {range.count}
                  </p>
                </div>
                <Target className={cn('h-8 w-8', 
                  range.color === 'emerald' ? 'text-emerald-400' : 
                  range.color === 'blue' ? 'text-blue-400' : 'text-amber-400'
                )} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top scores */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Top 10 Scores
          </h3>
          <div className="space-y-2">
            {topScores.map((evalItem, index) => (
              <div
                key={evalItem.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', 
                    evalItem.scoreGlobal >= 90 ? 'bg-emerald-500 text-white' :
                    evalItem.scoreGlobal >= 75 ? 'bg-blue-500 text-white' :
                    'bg-amber-500 text-white'
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{evalItem.employeeName}</p>
                    <p className="text-xs text-slate-400">{evalItem.employeeRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('text-lg font-bold',
                    evalItem.scoreGlobal >= 90 ? 'text-emerald-400' :
                    evalItem.scoreGlobal >= 75 ? 'text-blue-400' :
                    'text-amber-400'
                  )}>
                    {evalItem.scoreGlobal}/100
                  </p>
                  <p className="text-xs text-slate-500">{evalItem.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">Aucune évaluation avec score disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
