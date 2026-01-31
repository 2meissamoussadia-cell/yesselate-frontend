'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, PlayCircle } from 'lucide-react';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';
import type { Evaluation } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface InProgressViewProps {
  subCategory: string | null;
  onOpenEvaluation: (evaluation: Evaluation) => void;
}

export function InProgressView({ subCategory, onOpenEvaluation }: InProgressViewProps) {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: EvaluationsFilters = { status: 'in_progress' };
      const result = await evaluationsApiService.getAll(filters, { field: 'date', direction: 'desc' }, 1, 100);
      setData(result.data);
    } catch (error) {
      console.error('Error loading in-progress evaluations:', error);
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

  return (
    <div className="p-6 space-y-4 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-blue-400" />
          Évaluations en cours
        </h2>
      </div>

      <div className="grid gap-4">
        {data.map((evalItem) => (
          <Card
            key={evalItem.id}
            className="cursor-pointer hover:border-blue-500/50 transition-all"
            onClick={() => onOpenEvaluation(evalItem)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white">
                    {(evalItem.employeeName || '?')
                      .split(' ')
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{evalItem.employeeName}</p>
                    <p className="text-sm text-slate-400">{evalItem.employeeRole}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <BureauTag bureau={evalItem.bureau} />
                      <Badge variant="info">{evalItem.period}</Badge>
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
        ))}
      </div>

      {data.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">Aucune évaluation en cours</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

