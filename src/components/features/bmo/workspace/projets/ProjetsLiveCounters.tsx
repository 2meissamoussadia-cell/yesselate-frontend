'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, Pause, TrendingUp, DollarSign, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { projetsApiService, type ProjetsStats } from '@/lib/services/projetsApiService';

interface Props {
  onOpenQueue: (queue: string, title: string, icon: string) => void;
}

export function ProjetsLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<ProjetsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await projetsApiService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-pulse">
        {[...Array(7)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}
      </div>
    );
  }

  const counters = [
    { key: 'active', label: 'En cours', value: stats.active, icon: Clock, color: stats.active > 0 ? 'amber' : 'slate', action: () => onOpenQueue('active', 'En cours', '🔄') },
    { key: 'blocked', label: 'Bloqués', value: stats.blocked, icon: AlertTriangle, color: stats.blocked > 0 ? 'red' : 'slate', action: () => onOpenQueue('blocked', 'Bloqués', '🚨') },
    { key: 'completed', label: 'Terminés', value: stats.completed, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('completed', 'Terminés', '✅') },
    { key: 'pending', label: 'En attente', value: stats.pending, icon: Pause, color: stats.pending > 0 ? 'blue' : 'slate', action: () => onOpenQueue('pending', 'En attente', '⏳') },
    { key: 'avgProgress', label: 'Avancement', value: `${stats.avgProgress}%`, icon: TrendingUp, color: stats.avgProgress >= 50 ? 'emerald' : 'orange', action: () => {} },
    { key: 'budget', label: 'Budget total', value: projetsApiService.formatMontant(stats.totalBudget), suffix: 'FCFA', icon: DollarSign, color: 'orange', action: () => {} },
    { key: 'team', label: 'Équipe totale', value: stats.totalTeam, suffix: 'agents', icon: Users, color: 'blue', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        const hasValue = typeof counter.value === 'number' ? counter.value > 0 : true;
        
        return (
          <button
            key={counter.key}
            onClick={counter.action}
            className={cn(
              "p-4 rounded-xl border text-left transition-all hover:shadow-md",
              hasValue && counter.color !== 'slate'
                ? `bg-${counter.color}-500/10 border-${counter.color}-500/30 hover:border-${counter.color}-500/50`
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn(
                "w-4 h-4",
                hasValue && counter.color !== 'slate'
                  ? counter.color === 'red' ? 'text-red-500' :
                    counter.color === 'amber' ? 'text-amber-500' :
                    counter.color === 'orange' ? 'text-orange-500' :
                    counter.color === 'blue' ? 'text-blue-500' :
                    counter.color === 'emerald' ? 'text-emerald-500' :
                    'text-slate-400'
                  : 'text-slate-400',
                counter.key === 'blocked' && stats.blocked > 0 && 'animate-pulse'
              )} />
              <span className="text-xs text-slate-400 font-medium">{counter.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {counter.value}
              {counter.suffix && <span className="text-xs font-normal text-slate-400 ml-1">{counter.suffix}</span>}
            </p>
          </button>
        );
      })}
    </div>
  );
}

