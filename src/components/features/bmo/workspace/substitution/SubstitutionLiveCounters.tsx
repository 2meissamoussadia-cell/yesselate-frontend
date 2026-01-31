'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, Clock, CheckCircle, XCircle, Users, Calendar, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { substitutionApiService, type SubstitutionStats } from '@/lib/services/substitutionApiService';

interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }

export function SubstitutionLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<SubstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try { const data = await substitutionApiService.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  const counters = [
    { key: 'total', label: 'Total', value: stats.total, icon: RefreshCw, color: 'indigo', action: () => onOpenQueue('all', 'Toutes', '🔄') },
    { key: 'critical', label: 'Critiques', value: stats.criticalCount, icon: Zap, color: stats.criticalCount > 0 ? 'red' : 'slate', action: () => onOpenQueue('critical', 'Critiques', '⚡') },
    { key: 'active', label: 'Actives', value: stats.active, icon: TrendingUp, color: stats.active > 0 ? 'blue' : 'slate', action: () => onOpenQueue('active', 'Actives', '🔵') },
    { key: 'pending', label: 'En attente', value: stats.pending, icon: Clock, color: stats.pending > 0 ? 'amber' : 'slate', action: () => onOpenQueue('pending', 'En attente', '⏳') },
    { key: 'completed', label: 'Terminées', value: stats.completed, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('completed', 'Terminées', '✅') },
    { key: 'absences', label: 'Absences', value: stats.absencesCount, icon: Calendar, color: 'purple', action: () => onOpenQueue('absences', 'Absences', '📅') },
    { key: 'delegations', label: 'Délégations', value: stats.delegationsCount, icon: Users, color: 'cyan', action: () => onOpenQueue('delegations', 'Délégations', '👥') },
    { key: 'avgDelay', label: 'Retard moyen', value: `${stats.avgDelay}j`, icon: AlertTriangle, color: stats.avgDelay > 5 ? 'red' : stats.avgDelay > 2 ? 'amber' : 'emerald', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        return (
          <button key={counter.key} onClick={counter.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${counter.color}-500/10 border-${counter.color}-500/30`)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", counter.color === 'indigo' ? 'text-indigo-500' : counter.color === 'red' ? 'text-red-500' : counter.color === 'blue' ? 'text-blue-500' : counter.color === 'amber' ? 'text-amber-500' : counter.color === 'emerald' ? 'text-emerald-500' : counter.color === 'purple' ? 'text-purple-500' : counter.color === 'cyan' ? 'text-cyan-500' : 'text-slate-400')} />
              <span className="text-xs text-slate-400 font-medium truncate">{counter.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{counter.value}</p>
          </button>
        );
      })}
    </div>
  );
}

