'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getValidationStats } from '@/lib/services/validation-bc-api';

interface CounterData {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  anomalies: number;
  urgent: number;
}

export function ValidationBCLiveCounters() {
  const [stats, setStats] = useState<CounterData>({
    total: 0,
    pending: 0,
    validated: 0,
    rejected: 0,
    anomalies: 0,
    urgent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getValidationStats('auto');
        setStats({
          total: data.total,
          pending: data.pending,
          validated: data.validated,
          rejected: data.rejected,
          anomalies: data.anomalies,
          urgent: data.urgent,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  const counters = [
    {
      icon: FileText,
      label: 'Total documents',
      value: stats.total,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Clock,
      label: 'En attente',
      value: stats.pending,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: CheckCircle,
      label: 'Validés',
      value: stats.validated,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: XCircle,
      label: 'Rejetés',
      value: stats.rejected,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
    {
      icon: AlertTriangle,
      label: 'Anomalies',
      value: stats.anomalies,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Urgents',
      value: stats.urgent,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {counters.map((counter, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', counter.bgColor)}>
              <counter.icon className={cn('w-5 h-5', counter.color)} />
            </div>
            <div>
              <div className={cn('text-2xl font-bold', counter.color)}>{counter.value}</div>
              <div className="text-xs text-slate-400 dark:text-slate-400">{counter.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

