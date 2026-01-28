'use client';

import { useState, useEffect } from 'react';
import { Ticket, AlertTriangle, Clock, CheckCircle, XCircle, Zap, Timer, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ticketsApi, type TicketStats } from '@/lib/services/ticketsApiService';

interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }

export function TicketsLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try { const data = await ticketsApi.getStats(); setStats(data); }
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
    { key: 'total', label: 'Total', value: stats.total, icon: Ticket, color: 'purple', action: () => onOpenQueue('all', 'Tous', '🎫') },
    { key: 'critical', label: 'Critiques', value: stats.critical, icon: Zap, color: stats.critical > 0 ? 'red' : 'slate', action: () => onOpenQueue('critical', 'Critiques', '⚡') },
    { key: 'open', label: 'Ouverts', value: stats.open, icon: AlertTriangle, color: stats.open > 0 ? 'blue' : 'slate', action: () => onOpenQueue('open', 'Ouverts', '📬') },
    { key: 'inProgress', label: 'En cours', value: stats.inProgress, icon: Clock, color: stats.inProgress > 0 ? 'indigo' : 'slate', action: () => onOpenQueue('in_progress', 'En cours', '🔄') },
    { key: 'pending', label: 'En attente', value: stats.pending, icon: Timer, color: stats.pending > 0 ? 'amber' : 'slate', action: () => onOpenQueue('pending', 'En attente', '⏳') },
    { key: 'resolved', label: 'Résolus', value: stats.resolved, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('resolved', 'Résolus', '✅') },
    { key: 'slaBreached', label: 'SLA dépassé', value: stats.slaBreached, icon: XCircle, color: stats.slaBreached > 0 ? 'red' : 'slate', action: () => onOpenQueue('sla_breached', 'SLA dépassé', '🚨') },
    { key: 'avgTime', label: 'Temps moyen', value: `${stats.avgResolutionTime}h`, icon: BarChart3, color: 'slate', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        return (
          <button key={counter.key} onClick={counter.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${counter.color}-500/10 border-${counter.color}-500/30`)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", counter.color === 'purple' ? 'text-purple-500' : counter.color === 'red' ? 'text-red-500' : counter.color === 'blue' ? 'text-blue-500' : counter.color === 'amber' ? 'text-amber-500' : counter.color === 'emerald' ? 'text-emerald-500' : counter.color === 'indigo' ? 'text-indigo-500' : 'text-slate-400')} />
              <span className="text-xs text-slate-500 font-medium truncate">{counter.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{counter.value}</p>
          </button>
        );
      })}
    </div>
  );
}

