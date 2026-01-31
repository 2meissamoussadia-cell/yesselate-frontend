'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, AlertTriangle } from 'lucide-react';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';
import type { Evaluation } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface RecommendationsViewProps {
  subCategory: string | null;
  onOpenEvaluation: (evaluation: Evaluation) => void;
}

export function RecommendationsView({ subCategory, onOpenEvaluation }: RecommendationsViewProps) {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: EvaluationsFilters = { status: 'completed' };
      
      if (subCategory === 'pending') {
        filters.pendingRecommendations = true;
      }

      const result = await evaluationsApiService.getAll(filters, { field: 'date', direction: 'desc' }, 1, 100);
      setData(result.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
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

  // Filtrer les évaluations avec recommandations selon le sous-catégorie
  const filteredData = data.filter((evalItem) => {
    const recommendations = evalItem.recommendations || [];
    if (subCategory === 'pending') {
      return recommendations.some((r: any) => r.status === 'pending');
    }
    if (subCategory === 'approved') {
      return recommendations.some((r: any) => r.status === 'approved');
    }
    if (subCategory === 'implemented') {
      return recommendations.some((r: any) => r.status === 'implemented');
    }
    return recommendations.length > 0;
  });

  return (
    <div className="p-6 space-y-4 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          Recommandations
        </h2>
      </div>

      <div className="grid gap-4">
        {filteredData.map((evalItem) => {
          const recommendations = evalItem.recommendations || [];
          const pendingRecs = recommendations.filter((r: any) => r.status === 'pending');
          const approvedRecs = recommendations.filter((r: any) => r.status === 'approved');
          const implementedRecs = recommendations.filter((r: any) => r.status === 'implemented');

          return (
            <Card
              key={evalItem.id}
              className="cursor-pointer hover:border-amber-500/50 transition-all"
              onClick={() => onOpenEvaluation(evalItem)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white">
                      {(evalItem.employeeName || '?')
                        .split(' ')
                        .filter(Boolean)
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{evalItem.employeeName}</p>
                      <p className="text-sm text-slate-400">{evalItem.employeeRole}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <BureauTag bureau={evalItem.bureau} />
                        {pendingRecs.length > 0 && (
                          <Badge variant="warning">{pendingRecs.length} en attente</Badge>
                        )}
                        {approvedRecs.length > 0 && (
                          <Badge variant="success">{approvedRecs.length} approuvée(s)</Badge>
                        )}
                        {implementedRecs.length > 0 && (
                          <Badge variant="default">{implementedRecs.length} implémentée(s)</Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        {recommendations.slice(0, 2).map((rec: any) => (
                          <div key={rec.id} className="text-xs text-slate-400">
                            • {rec.title} <Badge variant="default" className="ml-1 text-xs">{rec.status}</Badge>
                          </div>
                        ))}
                        {recommendations.length > 2 && (
                          <div className="text-xs text-slate-400">+{recommendations.length - 2} autre(s)</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">Aucune recommandation trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

