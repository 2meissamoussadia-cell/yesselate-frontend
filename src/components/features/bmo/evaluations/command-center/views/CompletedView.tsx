'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';
import type { Evaluation } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface CompletedViewProps {
  subCategory: string | null;
  onOpenEvaluation: (evaluation: Evaluation) => void;
  selectedEvaluationIds?: Set<string>;
  onToggleEvaluationSelection?: (id: string) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-blue-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBg = (score: number) => {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

export function CompletedView({ 
  subCategory, 
  onOpenEvaluation,
  selectedEvaluationIds = new Set(),
  onToggleEvaluationSelection,
}: CompletedViewProps) {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: EvaluationsFilters = { status: 'completed' };
      
      if (subCategory === 'excellent') {
        filters.scoreMin = 90;
      } else if (subCategory === 'good') {
        filters.scoreMin = 75;
        filters.scoreMax = 89;
      } else if (subCategory === 'needs-improvement') {
        filters.scoreMax = 74;
      }

      const result = await evaluationsApiService.getAll(filters, { field: 'date', direction: 'desc' }, 1, 100);
      setData(result.data);
    } catch (error) {
      console.error('Error loading completed evaluations:', error);
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

  const hasSelection = selectedEvaluationIds.size > 0;
  const allSelected = data.length > 0 && data.every(e => selectedEvaluationIds.has(e.id));
  const someSelected = data.some(e => selectedEvaluationIds.has(e.id));

  const handleSelectAll = () => {
    if (!onToggleEvaluationSelection) return;
    if (allSelected) {
      data.forEach(e => {
        if (selectedEvaluationIds.has(e.id)) {
          onToggleEvaluationSelection(e.id);
        }
      });
    } else {
      data.forEach(e => {
        if (!selectedEvaluationIds.has(e.id)) {
          onToggleEvaluationSelection(e.id);
        }
      });
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          Évaluations complétées
        </h2>
        {onToggleEvaluationSelection && data.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
            >
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
              <span>{allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}</span>
            </button>
            {hasSelection && (
              <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {selectedEvaluationIds.size} sélectionnée{selectedEvaluationIds.size > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {data.map((evalItem) => {
          const pendingRecs = (evalItem.recommendations || []).filter((r: any) => r.status === 'pending').length;
          const isSelected = selectedEvaluationIds.has(evalItem.id);

          return (
            <Card
              key={evalItem.id}
              className={cn(
                "cursor-pointer hover:border-emerald-500/50 transition-all border-l-4",
                isSelected && "border-blue-500/50 bg-blue-500/5"
              )}
              style={{
                borderLeftColor: isSelected 
                  ? 'rgb(59 130 246)'
                  : evalItem.scoreGlobal >= 90
                  ? 'rgb(16 185 129)'
                  : evalItem.scoreGlobal >= 75
                  ? 'rgb(59 130 246)'
                  : evalItem.scoreGlobal >= 60
                  ? 'rgb(245 158 11)'
                  : 'rgb(239 68 68)',
              }}
              onClick={() => onOpenEvaluation(evalItem)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {onToggleEvaluationSelection && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleEvaluationSelection(evalItem.id)}
                        />
                      </div>
                    )}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                        {(evalItem.employeeName || '?')
                          .split(' ')
                          .filter(Boolean)
                          .map((n: string) => n[0])
                          .join('')}
                      </div>
                      {evalItem.scoreGlobal && (
                        <div
                          className={cn(
                            'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white',
                            getScoreBg(evalItem.scoreGlobal)
                          )}
                        >
                          {evalItem.scoreGlobal}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{evalItem.employeeName}</p>
                      <p className="text-sm text-slate-400">{evalItem.employeeRole}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <BureauTag bureau={evalItem.bureau} />
                        <span className={cn('text-xs font-bold', getScoreColor(evalItem.scoreGlobal || 0))}>
                          {evalItem.scoreGlobal}/100
                        </span>
                        {pendingRecs > 0 && (
                          <Badge variant="warning" className="text-xs">{pendingRecs} reco(s)</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{evalItem.date}</p>
                    <p className="text-xs text-slate-400">{evalItem.evaluatorName}</p>
                    <Eye className="h-4 w-4 text-slate-400 mt-2 ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">Aucune évaluation complétée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

