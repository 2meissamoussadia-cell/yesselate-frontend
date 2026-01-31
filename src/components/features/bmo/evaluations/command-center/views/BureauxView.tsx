/**
 * Vue par Bureaux - Évaluations groupées par bureau
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';
import type { Evaluation } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface BureauxViewProps {
  subCategory: string | null;
  onOpenEvaluation: (evaluation: Evaluation) => void;
}

export function BureauxView({ subCategory, onOpenEvaluation }: BureauxViewProps) {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: EvaluationsFilters = {};
      if (subCategory && subCategory !== 'all') {
        filters.bureau = subCategory;
      }
      const result = await evaluationsApiService.getAll(filters, { field: 'date', direction: 'desc' }, 1, 200);
      setData(result.data);
    } catch (error) {
      console.error('Error loading bureaux evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Grouper par bureau
  const byBureau = data.reduce((acc, evalItem) => {
    const bureau = evalItem.bureau;
    if (!acc[bureau]) {
      acc[bureau] = { evaluations: [], stats: { total: 0, completed: 0, avgScore: 0 } };
    }
    acc[bureau].evaluations.push(evalItem);
    acc[bureau].stats.total++;
    if (evalItem.status === 'completed') {
      acc[bureau].stats.completed++;
      acc[bureau].stats.avgScore = 
        (acc[bureau].stats.avgScore * (acc[bureau].stats.completed - 1) + (evalItem.scoreGlobal || 0)) / acc[bureau].stats.completed;
    }
    return acc;
  }, {} as Record<string, { evaluations: Evaluation[]; stats: { total: number; completed: number; avgScore: number } }>);

  const bureaux = Object.keys(byBureau).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-400" />
          Évaluations par Bureau
        </h2>
      </div>

      <div className="space-y-6">
        {bureaux.map((bureau) => {
          const bureauData = byBureau[bureau];
          return (
            <Card key={bureau} className="border-l-4 border-purple-500/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <BureauTag bureau={bureau} />
                    <div>
                      <p className="text-sm text-slate-400">
                        {bureauData.stats.total} évaluation(s) • {bureauData.stats.completed} complétée(s)
                      </p>
                      {bureauData.stats.completed > 0 && (
                        <p className="text-sm font-medium text-slate-200 mt-1">
                          Score moyen: <span className="text-blue-400">{Math.round(bureauData.stats.avgScore)}/100</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  {bureauData.evaluations.slice(0, 10).map((evalItem) => (
                    <div
                      key={evalItem.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 cursor-pointer transition-colors"
                      onClick={() => onOpenEvaluation(evalItem)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
                          {(evalItem.employeeName || '?')
                            .split(' ')
                            .filter(Boolean)
                            .map((n: string) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{evalItem.employeeName}</p>
                          <p className="text-xs text-slate-400">{evalItem.employeeRole}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {evalItem.status === 'completed' && evalItem.scoreGlobal && (
                          <Badge variant={evalItem.scoreGlobal >= 90 ? 'success' : evalItem.scoreGlobal >= 75 ? 'default' : 'warning'}>
                            {evalItem.scoreGlobal}/100
                          </Badge>
                        )}
                        <Badge variant={evalItem.status === 'completed' ? 'success' : evalItem.status === 'in_progress' ? 'default' : 'warning'}>
                          {evalItem.status === 'completed' ? 'Complétée' : evalItem.status === 'in_progress' ? 'En cours' : 'Planifiée'}
                        </Badge>
                        <Eye className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                  {bureauData.evaluations.length > 10 && (
                    <p className="text-xs text-slate-400 text-center pt-2">
                      + {bureauData.evaluations.length - 10} autre(s) évaluation(s)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bureaux.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">Aucune évaluation trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
