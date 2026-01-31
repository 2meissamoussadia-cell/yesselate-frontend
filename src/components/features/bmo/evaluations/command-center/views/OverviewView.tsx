/**
 * Vue d'ensemble - Overview des évaluations
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, TrendingUp, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';
import type { Evaluation } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface OverviewViewProps {
  subCategory: string | null;
  onOpenEvaluation: (evaluation: Evaluation) => void;
}

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

const daysUntil = (dateStr?: string): number | null => {
  const ms = parseFRDateToMs(dateStr);
  if (!ms) return null;
  const now = Date.now();
  return Math.ceil((ms - now) / (1000 * 60 * 60 * 24));
};

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

export function OverviewView({ subCategory, onOpenEvaluation }: OverviewViewProps) {
  const [data, setData] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: EvaluationsFilters = {};
      
      if (subCategory === 'upcoming') {
        filters.dueSoon = true;
      }

      const [evaluationsResult, statsResult] = await Promise.all([
        evaluationsApiService.getAll(filters, { field: 'date', direction: 'desc' }, 1, 50),
        evaluationsApiService.getStats(filters),
      ]);

      setData(evaluationsResult.data);
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Évaluations à venir (scheduled + in_progress) triées par date
  const upcomingEvaluations = useMemo(() => {
    return data
      .filter(e => e.status === 'scheduled' || e.status === 'in_progress')
      .sort((a, b) => parseFRDateToMs(a.date) - parseFRDateToMs(b.date))
      .slice(0, 5);
  }, [data]);

  // Dernières évaluations complétées
  const recentCompleted = useMemo(() => {
    return data
      .filter(e => e.status === 'completed')
      .sort((a, b) => parseFRDateToMs(b.date) - parseFRDateToMs(a.date))
      .slice(0, 5);
  }, [data]);

  // Évaluations nécessitant une attention
  const needsAttention = useMemo(() => {
    return data.filter(e => {
      if (e.status === 'scheduled') {
        const ms = parseFRDateToMs(e.date);
        return ms > 0 && ms < Date.now(); // En retard
      }
      if (e.status === 'completed') {
        const pendingRecs = (e.recommendations || []).filter(r => r.status === 'pending').length;
        return pendingRecs > 0;
      }
      return false;
    }).slice(0, 5);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Alertes */}
      {needsAttention.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-400 mb-2">Attention requise</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {needsAttention.length} évaluation(s) nécessitent une action
                </p>
                <div className="space-y-2">
                  {needsAttention.slice(0, 3).map((evalItem) => {
                    const isOverdue = evalItem.status === 'scheduled' && parseFRDateToMs(evalItem.date) < Date.now();
                    const pendingRecs = (evalItem.recommendations || []).filter((r: any) => r.status === 'pending').length;

                    return (
                      <div
                        key={evalItem.id}
                        className="flex items-center justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
                        onClick={() => onOpenEvaluation(evalItem)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
                            {(evalItem.employeeName || '?')
                              .split(' ')
                              .filter(Boolean)
                              .map((n: string) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{evalItem.employeeName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <BureauTag bureau={evalItem.bureau} />
                              {isOverdue && <Badge variant="destructive" className="text-xs">En retard</Badge>}
                              {pendingRecs > 0 && (
                                <Badge variant="warning" className="text-xs">{pendingRecs} reco(s)</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Eye className="h-4 w-4 text-slate-400" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats rapides */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <p className={cn('text-3xl font-bold', getScoreColor(stats.avgScore))}>{stats.avgScore}</p>
              </div>
              <p className="text-xs text-slate-400">Score moyen</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
              </div>
              <p className="text-xs text-slate-400">Complétées</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <p className="text-2xl font-bold text-purple-400">{stats.scheduled}</p>
              </div>
              <p className="text-xs text-slate-400">Planifiées</p>
            </CardContent>
          </Card>

          <Card className={cn('border-amber-500/30', stats.pendingRecsTotal > 0 ? 'bg-amber-500/15' : 'bg-slate-500/10')}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <p className={cn('text-2xl font-bold', stats.pendingRecsTotal > 0 ? 'text-amber-400' : 'text-slate-400')}>
                  {stats.pendingRecsTotal}
                </p>
              </div>
              <p className="text-xs text-slate-400">Recos en attente</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Évaluations à venir */}
      {upcomingEvaluations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Prochaines évaluations
            </h3>
            <div className="space-y-3">
              {upcomingEvaluations.map((evalItem) => {
                const d = daysUntil(evalItem.date);
                const isOverdue = evalItem.status === 'scheduled' && parseFRDateToMs(evalItem.date) < Date.now();

                return (
                  <div
                    key={evalItem.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors border border-slate-700/50"
                    onClick={() => onOpenEvaluation(evalItem)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
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
                      <p className="text-sm text-slate-300 font-medium">{evalItem.date}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {typeof d === 'number' && d >= 0 && d <= 14 && (
                          <Badge variant="warning">Dans {d}j</Badge>
                        )}
                        {isOverdue && <Badge variant="destructive">En retard</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dernières évaluations complétées */}
      {recentCompleted.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Dernières évaluations complétées
            </h3>
            <div className="space-y-3">
              {recentCompleted.map((evalItem) => {
                const pendingRecs = (evalItem.recommendations || []).filter((r: any) => r.status === 'pending').length;

                return (
                  <div
                    key={evalItem.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors border border-slate-700/50"
                    onClick={() => onOpenEvaluation(evalItem)}
                  >
                    <div className="flex items-center gap-4">
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
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {data.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">Aucune évaluation trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

