/**
 * AnalyticsLiveCounters.tsx
 * ==========================
 * 
 * Compteurs live épurés pour le workspace Analytics
 * Affiche des métriques clés de manière subtile
 */

'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { demands } from '@/lib/data';
import type { Demand } from '@/lib/types/bmo.types';
import { cn } from '@/lib/utils';

const calcDelay = (dateStr: string) => {
  const [d, m, y] = (dateStr ?? '').split('/').map(Number);
  if (!d || !m || !y) return 0;
  const t = new Date(y, m - 1, d).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.ceil((Date.now() - t) / 86400000));
};

export function AnalyticsLiveCounters() {
  const stats = useMemo(() => {
    const allDemands = (demands as Demand[]).map((d) => ({
      ...d,
      delay: calcDelay(d.date),
      isOverdue: calcDelay(d.date) > 7 && d.status !== 'validated',
    }));

    const total = allDemands.length;
    const pending = allDemands.filter((d) => (d.status ?? 'pending') === 'pending').length;
    const validated = allDemands.filter((d) => d.status === 'validated').length;
    const overdue = allDemands.filter((d) => d.isOverdue).length;

    const validationRate = total > 0 ? Math.round((validated / total) * 100) : 0;
    const avgDelay = total > 0
      ? Math.round(allDemands.reduce((sum, d) => sum + d.delay, 0) / total)
      : 0;

    const trend = validationRate >= 80 ? 'up' : validationRate < 60 ? 'down' : 'stable';

    return {
      total,
      pending,
      validated,
      overdue,
      validationRate,
      avgDelay,
      trend,
    };
  }, []);

  return (
    <div className="flex items-center gap-4 text-sm">
      <Metric 
        label="Total" 
        value={stats.total} 
      />
      <Separator />
      <Metric 
        label="Validation" 
        value={`${stats.validationRate}%`}
        trend={stats.trend as 'up' | 'stable' | 'down' | undefined}
        status={stats.validationRate >= 75 ? 'good' : stats.validationRate >= 60 ? 'warning' : 'attention'}
      />
      <Separator />
      <Metric 
        label="En attente" 
        value={stats.pending}
        status={stats.pending > 10 ? 'warning' : 'neutral'}
      />
      {stats.overdue > 0 && (
        <>
          <Separator />
          <Metric 
            label="Retard" 
            value={stats.overdue}
            status="attention"
          />
        </>
      )}
      <Separator />
      <Metric 
        label="Délai moy." 
        value={`${stats.avgDelay}j`}
      />
    </div>
  );
}

function Metric({ 
  label, 
  value, 
  trend,
  status = 'neutral'
}: { 
  label: string; 
  value: string | number; 
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'attention' | 'neutral';
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 dark:text-slate-400">{label}</span>
      <span className={cn(
        'font-medium',
        status === 'good' && 'text-emerald-600 dark:text-emerald-400',
        status === 'warning' && 'text-amber-600 dark:text-amber-400',
        status === 'attention' && 'text-amber-600 dark:text-amber-400',
        status === 'neutral' && 'text-slate-700 dark:text-slate-300'
      )}>
        {value}
      </span>
      {trend && (
        <TrendIcon trend={trend} />
      )}
    </div>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-amber-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-300" />;
}

function Separator() {
  return <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />;
}
