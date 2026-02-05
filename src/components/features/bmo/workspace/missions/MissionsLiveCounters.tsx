'use client';

import { useState, useEffect } from 'react';
import { Plane, Clock, CheckCircle, PlayCircle, XCircle, DollarSign, MapPin, Receipt } from 'lucide-react';
import { cn } from '@/lib/cn';
import { missionsApiService, type MissionsStats } from '@/lib/services/missionsApiService';
import { logger } from '@/lib/utils/logger';

interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }

export function MissionsLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<MissionsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try { const data = await missionsApiService.getStats(); setStats(data); }
      catch (error) { logger.error('Missions stats failed', error as Error, { context: 'MissionsLiveCounters' }); }
      finally { setLoading(false); }
    };
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  const counters = [
    { key: 'total', label: 'Total missions', value: stats.total, icon: Plane, color: 'cyan', action: () => onOpenQueue('all', 'Toutes', '✈️') },
    { key: 'pending', label: 'En attente', value: stats.pending, icon: Clock, color: stats.pending > 0 ? 'amber' : 'slate', action: () => onOpenQueue('pending', 'En attente', '⏳') },
    { key: 'approved', label: 'Approuvées', value: stats.approved, icon: CheckCircle, color: 'blue', action: () => onOpenQueue('approved', 'Approuvées', '✅') },
    { key: 'in_progress', label: 'En cours', value: stats.in_progress, icon: PlayCircle, color: stats.in_progress > 0 ? 'cyan' : 'slate', action: () => onOpenQueue('in_progress', 'En cours', '🚀') },
    { key: 'completed', label: 'Terminées', value: stats.completed, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('completed', 'Terminées', '✅') },
    { key: 'budget', label: 'Budget prévu', value: missionsApiService.formatMontant(stats.budgetTotal), suffix: 'FCFA', icon: DollarSign, color: 'purple', action: () => {} },
    { key: 'frais', label: 'Frais réels', value: missionsApiService.formatMontant(stats.fraisTotal), suffix: 'FCFA', icon: Receipt, color: 'amber', action: () => {} },
    { key: 'destinations', label: 'Destinations', value: Object.keys(stats.byDestination).length, icon: MapPin, color: 'slate', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        return (
          <button key={counter.key} onClick={counter.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${counter.color}-500/10 border-${counter.color}-500/30`)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", counter.color === 'cyan' ? 'text-cyan-500' : counter.color === 'purple' ? 'text-purple-500' : counter.color === 'emerald' ? 'text-emerald-500' : counter.color === 'blue' ? 'text-blue-500' : counter.color === 'amber' ? 'text-amber-500' : counter.color === 'red' ? 'text-red-500' : 'text-slate-400')} />
              <span className="text-xs text-slate-400 font-medium truncate">{counter.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{counter.value}{counter.suffix && <span className="text-xs font-normal text-slate-400 ml-1">{counter.suffix}</span>}</p>
          </button>
        );
      })}
    </div>
  );
}

