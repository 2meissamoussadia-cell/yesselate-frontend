'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import {
  Building2, Users, TrendingUp, AlertTriangle, BarChart2, CheckCircle,
  Clock, RefreshCw, FileText, Target, Zap, Activity
} from 'lucide-react';

type BureauData = {
  code: string;
  name: string;
  head: string;
  agents: number;
  charge: number;
  completion: number;
  budget: string;
  budgetUsed: string;
  goulots: string[];
  projets?: {
    actifs: number;
    enRetard: number;
    total: number;
  };
  decisions?: {
    prises: number;
    enAttente: number;
  };
  kpis?: {
    label: string;
    value: number | string;
    trend?: 'up' | 'down' | 'neutral';
    unit?: string;
  }[];
  [key: string]: any;
};

export function BureauViewer({ bureauCode }: { bureauCode: string }) {
  const [data, setData] = useState<BureauData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bureaux/${encodeURIComponent(bureauCode)}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [bureauCode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Chargement...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Erreur de chargement</h3>
        <p className="text-sm text-slate-400 mb-4">{error || 'Bureau introuvable'}</p>
        <FluentButton onClick={loadData}>Réessayer</FluentButton>
      </div>
    );
  }

  const isSurcharge = data.charge > 85;
  const hasGoulots = (data.goulots?.length || 0) > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={cn(
        'rounded-2xl border p-6',
        isSurcharge
          ? 'border-rose-500/30 bg-rose-50/50 dark:bg-rose-900/10'
          : 'border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70'
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="info">{data.code}</Badge>
              {isSurcharge && <Badge variant="urgent">Surcharge</Badge>}
              {hasGoulots && <Badge variant="warning">{data.goulots.length} goulot(s)</Badge>}
            </div>

            <h2 className="text-2xl font-bold mb-2">{data.name}</h2>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {data.head}
              </span>
              <span>👥 {data.agents} agents</span>
              {data.budget && (
                <span className="text-purple-600">💰 Budget: {data.budget}</span>
              )}
            </div>
          </div>

          <Building2 className="w-12 h-12 text-blue-500 flex-none" />
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn(
          'rounded-xl border p-4',
          isSurcharge
            ? 'border-rose-500/30 bg-rose-50/50 dark:bg-rose-900/10'
            : 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Charge</span>
            <Activity className={cn('w-4 h-4', isSurcharge ? 'text-rose-500' : 'text-emerald-500')} />
          </div>
          <div className={cn(
            'text-3xl font-bold',
            isSurcharge ? 'text-rose-600' : 'text-emerald-600'
          )}>
            {data.charge}%
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                isSurcharge ? 'bg-rose-500' : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(data.charge, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Complétion</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {data.completion}%
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(data.completion, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Budget utilisé</span>
            <BarChart2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {data.budgetUsed}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            sur {data.budget}
          </div>
        </div>
      </div>

      {/* Goulots d'étranglement */}
      {hasGoulots && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-700 dark:text-amber-300">
              Goulots d'étranglement identifiés
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.goulots.map((goulot, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50"
              >
                ⚠️ {goulot}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projets */}
      {data.projets && (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-400" />
            Projets
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10">
              <div className="text-2xl font-bold text-blue-600">{data.projets.actifs}</div>
              <div className="text-xs text-slate-400 mt-1">Actifs</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10">
              <div className="text-2xl font-bold text-rose-600">{data.projets.enRetard}</div>
              <div className="text-xs text-slate-400 mt-1">En retard</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">{data.projets.total}</div>
              <div className="text-xs text-slate-400 mt-1">Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Décisions */}
      {data.decisions && (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-slate-400" />
            Décisions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
              <div className="text-2xl font-bold text-emerald-600">{data.decisions.prises}</div>
              <div className="text-xs text-slate-400 mt-1">Prises</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10">
              <div className="text-2xl font-bold text-amber-600">{data.decisions.enAttente}</div>
              <div className="text-xs text-slate-400 mt-1">En attente</div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs supplémentaires */}
      {data.kpis && data.kpis.length > 0 && (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            Indicateurs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.kpis.map((kpi, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                <div className="text-xs text-slate-400 mb-1">{kpi.label}</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {kpi.value}{kpi.unit}
                  </span>
                  {kpi.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                  {kpi.trend === 'down' && <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <FluentButton variant="secondary" onClick={loadData}>
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </FluentButton>
        <FluentButton variant="primary">
          <FileText className="w-4 h-4" />
          Rapport détaillé
        </FluentButton>
      </div>
    </div>
  );
}
