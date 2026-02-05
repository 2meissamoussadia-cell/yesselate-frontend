/**
 * Vue Archive - Évaluations archivées
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Archive, Eye, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';
import type { Evaluation } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface ArchiveViewProps {
  subCategory: string | null;
  onOpenEvaluation: (evaluation: Evaluation) => void;
}

export function ArchiveView({ subCategory, onOpenEvaluation }: ArchiveViewProps) {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Pour l'instant, on considère les évaluations complétées anciennes comme archivées
      const filters: EvaluationsFilters = { status: 'completed' };
      const result = await evaluationsApiService.getAll(filters, { field: 'date', direction: 'desc' }, 1, 200);
      // Filtrer les anciennes (par exemple, plus d'un an)
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      const parseFRDateToMs = (dateStr?: string): number => {
        if (!dateStr) return 0;
        const m = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!m) return 0;
        const dd = Number(m[1]);
        const mm = Number(m[2]);
        const yyyy = Number(m[3]);
        const d = new Date(yyyy, mm - 1, dd);
        return Number.isNaN(d.getTime()) ? 0 : d.getTime();
      };
      const archived = result.data.filter(e => {
        const ms = parseFRDateToMs(e.date);
        return ms > 0 && ms < oneYearAgo;
      });
      setData(archived);
    } catch (error) {
      console.error('Error loading archived evaluations:', error);
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
          <Archive className="h-5 w-5 text-slate-400" />
          Archives
        </h2>
      </div>

      <div className="grid gap-4">
        {data.map((evalItem) => (
          <Card
            key={evalItem.id}
            className="cursor-pointer hover:border-slate-600 transition-all border-l-4 border-slate-600/50"
            onClick={() => onOpenEvaluation(evalItem)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center font-bold text-white">
                    {(evalItem.employeeName || '?')
                      .split(' ')
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-300">{evalItem.employeeName}</p>
                    <p className="text-sm text-slate-400">{evalItem.employeeRole}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <BureauTag bureau={evalItem.bureau} />
                      {evalItem.scoreGlobal && (
                        <Badge variant="default" className="text-xs">
                          {evalItem.scoreGlobal}/100
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {evalItem.date}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="default" className="text-xs mb-2">Archivée</Badge>
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
            <Archive className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune évaluation archivée</p>
            <p className="text-xs text-slate-600 mt-2">Les évaluations complétées depuis plus d'un an apparaîtront ici</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
